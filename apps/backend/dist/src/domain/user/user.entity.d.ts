import { BaseDomainEntity } from '../common/domain-entity.base';
export declare enum UserRole {
    SUPER_ADMIN = "SUPER_ADMIN",
    ADMIN = "ADMIN",
    OFFICER = "OFFICER",
    AUDITOR = "AUDITOR",
    CITIZEN = "CITIZEN"
}
export interface UserProps {
    id: string;
    email: string;
    phone?: string | null;
    passwordHash: string;
    role: UserRole;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    mfaEnabled: boolean;
    mfaSecret?: string | null;
    googleId?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}
export declare class UserEntity extends BaseDomainEntity<UserProps> {
    private _email;
    private _phone?;
    private _passwordHash;
    private _role;
    private _isEmailVerified;
    private _isPhoneVerified;
    private _mfaEnabled;
    private _mfaSecret?;
    private _googleId?;
    private _deletedAt?;
    constructor(props: UserProps);
    get email(): string;
    get phone(): string | null | undefined;
    get passwordHash(): string;
    get role(): UserRole;
    get isEmailVerified(): boolean;
    get isPhoneVerified(): boolean;
    get mfaEnabled(): boolean;
    get mfaSecret(): string | null | undefined;
    get googleId(): string | null | undefined;
    get deletedAt(): Date | null | undefined;
    updatePassword(newHash: string): void;
    enableMfa(secret: string): void;
    verifyEmail(): void;
    softDelete(): void;
}
