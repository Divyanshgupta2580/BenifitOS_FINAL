export declare abstract class BaseDomainEntity<T> {
    protected readonly _id: string;
    protected readonly _createdAt: Date;
    protected _updatedAt: Date;
    constructor(id: string, createdAt?: Date, updatedAt?: Date);
    get id(): string;
    get createdAt(): Date;
    get updatedAt(): Date;
}
