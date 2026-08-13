import { Injectable, Logger } from '@nestjs/common';
import * as tls from 'tls';
import * as net from 'net';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private host?: string;
  private port: number;
  private user?: string;
  private pass?: string;
  private from: string;
  private secure: boolean;

  constructor() {
    this.host = process.env.SMTP_HOST;
    this.port = parseInt(process.env.SMTP_PORT || '587', 10);
    this.user = process.env.SMTP_USER;
    this.pass = process.env.SMTP_PASS;
    this.from = process.env.SMTP_FROM || 'noreply@benefitos.gov.in';
    this.secure = process.env.SMTP_SECURE === 'true' || this.port === 465;

    if (this.isConfigured()) {
      this.logger.log(`EmailService initialized with SMTP host: ${this.host}:${this.port} (from: ${this.from})`);
    } else {
      this.logger.warn('EmailService running in UNCONFIGURED mode. Emails will not be delivered externally.');
    }
  }

  public isConfigured(): boolean {
    return Boolean(this.host && this.host.trim().length > 0 && this.user && this.pass);
  }

  public async sendPasswordResetEmail(toEmail: string, resetUrl: string): Promise<boolean> {
    const subject = 'BenefitOS — Password Reset Request';
    const text = `You requested a password reset for your BenefitOS account.\n\nUse the following link to reset your password within 15 minutes:\n${resetUrl}\n\nIf you did not request this change, please ignore this email.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1e3a8a; margin-top: 0;">BenefitOS Citizen Portal</h2>
        <p style="color: #334155; font-size: 16px;">You recently requested to reset your password for your BenefitOS account.</p>
        <div style="margin: 24px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #64748b; font-size: 14px;">This link is valid for <strong>15 minutes</strong> and can only be used once.</p>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px;">If you did not request a password reset, please disregard this notice.</p>
      </div>
    `;

    return await this.sendEmail({ to: toEmail, subject, html, text });
  }

  public async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isConfigured()) {
      this.logger.warn(`Email to <${options.to}> not dispatched (SMTP unconfigured in environment).`);
      return false;
    }

    try {
      this.logger.log(`Dispatching email "${options.subject}" to <${options.to}> via SMTP ${this.host}...`);
      await this.sendViaSmtp(options);
      this.logger.log(`Email successfully dispatched to <${options.to}>.`);
      return true;
    } catch (err: any) {
      this.logger.error(`Failed to send email to <${options.to}>: ${err.message}`);
      return false;
    }
  }

  private async sendViaSmtp(options: EmailOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      const socket = this.secure
        ? tls.connect({ host: this.host, port: this.port, rejectUnauthorized: false })
        : net.connect({ host: this.host!, port: this.port });

      socket.setTimeout(10000);
      let step = 0;

      socket.on('data', (data) => {
        const response = data.toString();
        
        try {
          if (step === 0 && response.startsWith('220')) {
            socket.write(`EHLO localhost\r\n`);
            step++;
          } else if (step === 1 && response.startsWith('250')) {
            if (this.user && this.pass) {
              socket.write('AUTH LOGIN\r\n');
              step++;
            } else {
              socket.write(`MAIL FROM:<${this.from}>\r\n`);
              step = 4;
            }
          } else if (step === 2 && response.startsWith('334')) {
            socket.write(`${Buffer.from(this.user!).toString('base64')}\r\n`);
            step++;
          } else if (step === 3 && response.startsWith('334')) {
            socket.write(`${Buffer.from(this.pass!).toString('base64')}\r\n`);
            step++;
          } else if (step === 4 && response.startsWith('235')) {
            socket.write(`MAIL FROM:<${this.from}>\r\n`);
            step++;
          } else if (step === 5 && response.startsWith('250')) {
            socket.write(`RCPT TO:<${options.to}>\r\n`);
            step++;
          } else if (step === 6 && response.startsWith('250')) {
            socket.write('DATA\r\n');
            step++;
          } else if (step === 7 && response.startsWith('354')) {
            const rawMessage = [
              `From: ${this.from}`,
              `To: ${options.to}`,
              `Subject: ${options.subject}`,
              'MIME-Version: 1.0',
              'Content-Type: text/html; charset=UTF-8',
              '',
              options.html,
              '\r\n.\r\n',
            ].join('\r\n');
            socket.write(rawMessage);
            step++;
          } else if (step === 8 && response.startsWith('250')) {
            socket.write('QUIT\r\n');
            socket.end();
            resolve();
          } else if (response.startsWith('4') || response.startsWith('5')) {
            socket.destroy();
            reject(new Error(`SMTP server rejected command: ${response.trim()}`));
          }
        } catch (e) {
          socket.destroy();
          reject(e);
        }
      });

      socket.on('error', (err) => {
        reject(err);
      });

      socket.on('timeout', () => {
        socket.destroy();
        reject(new Error('SMTP socket connection timed out after 10s'));
      });
    });
  }
}
