export declare abstract class DomainException extends Error {
    readonly code: string;
    readonly statusCode: number;
    readonly details: any[];
    constructor(message: string, code: string, statusCode?: number, details?: any[]);
}
export declare class NotFoundDomainException extends DomainException {
    constructor(entityName: string, id: string);
}
export declare class UnauthorizedDomainException extends DomainException {
    constructor(message?: string);
}
export declare class ForbiddenDomainException extends DomainException {
    constructor(message?: string);
}
export declare class ValidationDomainException extends DomainException {
    constructor(message: string, details?: any[]);
}
export declare class ConflictDomainException extends DomainException {
    constructor(message: string);
}
export declare class InternalServerDomainException extends DomainException {
    constructor(message?: string);
}
