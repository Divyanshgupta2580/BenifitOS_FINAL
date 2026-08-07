import { Injectable } from '@nestjs/common';

@Injectable()
export class AiSafetyService {
  public sanitizePromptInput(input: string): string {
    if (!input) return '';
    // Strip malicious prompt injection patterns
    return input
      .replace(/ignore\s+previous\s+instructions/gi, '[REDACTED_PROMPT_INJECTION]')
      .replace(/system\s+prompt\s+override/gi, '[REDACTED_PROMPT_INJECTION]')
      .trim();
  }

  public redactPiiFromContext(context: Record<string, any>): Record<string, any> {
    const redacted = JSON.parse(JSON.stringify(context));
    const maskString = (str: string, keepLast = 4) => {
      if (!str || str.length <= keepLast) return '****';
      return '*'.repeat(str.length - keepLast) + str.slice(-keepLast);
    };

    if (redacted.aadhaarNumber) redacted.aadhaarNumber = maskString(String(redacted.aadhaarNumber));
    if (redacted.aadhaarHash) redacted.aadhaarHash = maskString(String(redacted.aadhaarHash));
    if (redacted.panHash) redacted.panHash = maskString(String(redacted.panHash));
    if (redacted.bplCardNumber) redacted.bplCardNumber = maskString(String(redacted.bplCardNumber));
    if (redacted.phone) redacted.phone = maskString(String(redacted.phone));

    return redacted;
  }
}
