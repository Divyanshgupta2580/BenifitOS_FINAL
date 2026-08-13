"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GlobalExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const domain_exception_base_1 = require("../../domain/common/domain-exception.base");
let GlobalExceptionFilter = GlobalExceptionFilter_1 = class GlobalExceptionFilter {
    logger = new common_1.Logger(GlobalExceptionFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let statusCode = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let errorCode = 'INTERNAL_SERVER_ERROR';
        let message = 'An unexpected internal server error occurred.';
        let details = [];
        if (exception instanceof domain_exception_base_1.DomainException) {
            statusCode = exception.statusCode;
            errorCode = exception.code;
            message = exception.message;
            details = exception.details;
        }
        else if (exception instanceof common_1.HttpException) {
            statusCode = exception.getStatus();
            const resp = exception.getResponse();
            if (typeof resp === 'object' && resp !== null) {
                errorCode = resp.error || exception.name;
                message = resp.message || exception.message;
                if (Array.isArray(resp.message)) {
                    details = resp.message;
                    message = details.length > 0 ? details.join('; ') : 'Request validation failed.';
                }
            }
            else {
                message = resp;
            }
        }
        else if (exception instanceof Error) {
            message = exception.message;
            this.logger.error(`Unhandled exception: ${exception.message}`, exception.stack);
        }
        const correlationId = request.headers['x-correlation-id'] || 'N/A';
        response.status(statusCode).json({
            success: false,
            error: {
                code: errorCode,
                message,
                details,
                timestamp: new Date().toISOString(),
                path: request.url,
                correlationId,
            },
        });
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = GlobalExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], GlobalExceptionFilter);
//# sourceMappingURL=global-exception.filter.js.map