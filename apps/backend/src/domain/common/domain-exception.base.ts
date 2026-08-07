export abstract class DomainException extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details: any[];

  constructor(message: string, code: string, statusCode = 400, details: any[] = []) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundDomainException extends DomainException {
  constructor(entityName: string, id: string) {
    super(`${entityName} with ID '${id}' was not found.`, 'RESOURCE_NOT_FOUND', 404);
  }
}

export class UnauthorizedDomainException extends DomainException {
  constructor(message = 'Unauthorized access.') {
    super(message, 'UNAUTHORIZED_ACCESS', 401);
  }
}

export class ForbiddenDomainException extends DomainException {
  constructor(message = 'Access forbidden.') {
    super(message, 'FORBIDDEN_ACCESS', 403);
  }
}

export class ValidationDomainException extends DomainException {
  constructor(message: string, details: any[] = []) {
    super(message, 'VALIDATION_FAILED', 422, details);
  }
}

export class ConflictDomainException extends DomainException {
  constructor(message: string) {
    super(message, 'RESOURCE_CONFLICT', 409);
  }
}

export class InternalServerDomainException extends DomainException {
  constructor(message = 'An unexpected internal error occurred.') {
    super(message, 'INTERNAL_SERVER_ERROR', 500);
  }
}
