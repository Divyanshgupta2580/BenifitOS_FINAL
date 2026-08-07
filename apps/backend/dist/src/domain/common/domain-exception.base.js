"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerDomainException = exports.ConflictDomainException = exports.ValidationDomainException = exports.ForbiddenDomainException = exports.UnauthorizedDomainException = exports.NotFoundDomainException = exports.DomainException = void 0;
class DomainException extends Error {
    code;
    statusCode;
    details;
    constructor(message, code, statusCode = 400, details = []) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.DomainException = DomainException;
class NotFoundDomainException extends DomainException {
    constructor(entityName, id) {
        super(`${entityName} with ID '${id}' was not found.`, 'RESOURCE_NOT_FOUND', 404);
    }
}
exports.NotFoundDomainException = NotFoundDomainException;
class UnauthorizedDomainException extends DomainException {
    constructor(message = 'Unauthorized access.') {
        super(message, 'UNAUTHORIZED_ACCESS', 401);
    }
}
exports.UnauthorizedDomainException = UnauthorizedDomainException;
class ForbiddenDomainException extends DomainException {
    constructor(message = 'Access forbidden.') {
        super(message, 'FORBIDDEN_ACCESS', 403);
    }
}
exports.ForbiddenDomainException = ForbiddenDomainException;
class ValidationDomainException extends DomainException {
    constructor(message, details = []) {
        super(message, 'VALIDATION_FAILED', 422, details);
    }
}
exports.ValidationDomainException = ValidationDomainException;
class ConflictDomainException extends DomainException {
    constructor(message) {
        super(message, 'RESOURCE_CONFLICT', 409);
    }
}
exports.ConflictDomainException = ConflictDomainException;
class InternalServerDomainException extends DomainException {
    constructor(message = 'An unexpected internal error occurred.') {
        super(message, 'INTERNAL_SERVER_ERROR', 500);
    }
}
exports.InternalServerDomainException = InternalServerDomainException;
//# sourceMappingURL=domain-exception.base.js.map