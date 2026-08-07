import { BaseDomainEntity } from '../common/domain-entity.base';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  OFFICER = 'OFFICER',
  AUDITOR = 'AUDITOR',
  CITIZEN = 'CITIZEN',
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

export class UserEntity extends BaseDomainEntity<UserProps> {
  private _email: string;
  private _phone?: string | null;
  private _passwordHash: string;
  private _role: UserRole;
  private _isEmailVerified: boolean;
  private _isPhoneVerified: boolean;
  private _mfaEnabled: boolean;
  private _mfaSecret?: string | null;
  private _googleId?: string | null;
  private _deletedAt?: Date | null;

  constructor(props: UserProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this._email = props.email;
    this._phone = props.phone;
    this._passwordHash = props.passwordHash;
    this._role = props.role;
    this._isEmailVerified = props.isEmailVerified;
    this._isPhoneVerified = props.isPhoneVerified;
    this._mfaEnabled = props.mfaEnabled;
    this._mfaSecret = props.mfaSecret;
    this._googleId = props.googleId;
    this._deletedAt = props.deletedAt;
  }

  public get email(): string { return this._email; }
  public get phone(): string | null | undefined { return this._phone; }
  public get passwordHash(): string { return this._passwordHash; }
  public get role(): UserRole { return this._role; }
  public get isEmailVerified(): boolean { return this._isEmailVerified; }
  public get isPhoneVerified(): boolean { return this._isPhoneVerified; }
  public get mfaEnabled(): boolean { return this._mfaEnabled; }
  public get mfaSecret(): string | null | undefined { return this._mfaSecret; }
  public get googleId(): string | null | undefined { return this._googleId; }
  public get deletedAt(): Date | null | undefined { return this._deletedAt; }

  public updatePassword(newHash: string): void {
    this._passwordHash = newHash;
    this._updatedAt = new Date();
  }

  public enableMfa(secret: string): void {
    this._mfaEnabled = true;
    this._mfaSecret = secret;
    this._updatedAt = new Date();
  }

  public verifyEmail(): void {
    this._isEmailVerified = true;
    this._updatedAt = new Date();
  }

  public softDelete(): void {
    this._deletedAt = new Date();
    this._updatedAt = new Date();
  }
}
