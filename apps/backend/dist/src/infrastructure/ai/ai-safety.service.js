"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiSafetyService = void 0;
const common_1 = require("@nestjs/common");
let AiSafetyService = class AiSafetyService {
    sanitizePromptInput(input) {
        if (!input)
            return '';
        return input
            .replace(/ignore\s+previous\s+instructions/gi, '[REDACTED_PROMPT_INJECTION]')
            .replace(/system\s+prompt\s+override/gi, '[REDACTED_PROMPT_INJECTION]')
            .trim();
    }
    redactPiiFromContext(context) {
        if (!context || typeof context !== 'object')
            return {};
        const redacted = {};
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
            }
            else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                redacted[key] = this.redactPiiFromContext(value);
            }
            else {
                redacted[key] = value;
            }
        }
        return redacted;
    }
};
exports.AiSafetyService = AiSafetyService;
exports.AiSafetyService = AiSafetyService = __decorate([
    (0, common_1.Injectable)()
], AiSafetyService);
//# sourceMappingURL=ai-safety.service.js.map