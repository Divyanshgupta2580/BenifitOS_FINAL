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
        const redacted = JSON.parse(JSON.stringify(context));
        const maskString = (str, keepLast = 4) => {
            if (!str || str.length <= keepLast)
                return '****';
            return '*'.repeat(str.length - keepLast) + str.slice(-keepLast);
        };
        if (redacted.aadhaarNumber)
            redacted.aadhaarNumber = maskString(String(redacted.aadhaarNumber));
        if (redacted.aadhaarHash)
            redacted.aadhaarHash = maskString(String(redacted.aadhaarHash));
        if (redacted.panHash)
            redacted.panHash = maskString(String(redacted.panHash));
        if (redacted.bplCardNumber)
            redacted.bplCardNumber = maskString(String(redacted.bplCardNumber));
        if (redacted.phone)
            redacted.phone = maskString(String(redacted.phone));
        return redacted;
    }
};
exports.AiSafetyService = AiSafetyService;
exports.AiSafetyService = AiSafetyService = __decorate([
    (0, common_1.Injectable)()
], AiSafetyService);
//# sourceMappingURL=ai-safety.service.js.map