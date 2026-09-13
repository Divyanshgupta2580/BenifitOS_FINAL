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
    if (!context || typeof context !== 'object') return {};
    const redacted: Record<string, any> = {};

    const sensitiveKeyPatterns = [
      /token/i,
      /secret/i,
      /password/i,
      /auth/i,
      /jwt/i,
      /session/i,
      /cookie/i,
      /key/i,
      /credential/i,
      /phone/i,
      /email/i,
      /aadhaar/i,
      /pan/i,
      /bpl/i,
      /passcode/i,
      /pin/i,
      /cvv/i,
    ];

    for (const [key, value] of Object.entries(context)) {
      const isSensitive = sensitiveKeyPatterns.some((pattern) => pattern.test(key));
      if (isSensitive) {
        redacted[key] = '[REDACTED_SECURITY_DATA]';
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        redacted[key] = this.redactPiiFromContext(value);
      } else {
        redacted[key] = value;
      }
    }

    return redacted;
  }
}
