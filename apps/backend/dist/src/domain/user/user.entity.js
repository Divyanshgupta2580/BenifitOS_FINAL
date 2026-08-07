"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserEntity = exports.UserRole = void 0;
const domain_entity_base_1 = require("../common/domain-entity.base");
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["OFFICER"] = "OFFICER";
    UserRole["AUDITOR"] = "AUDITOR";
    UserRole["CITIZEN"] = "CITIZEN";
})(UserRole || (exports.UserRole = UserRole = {}));
class UserEntity extends domain_entity_base_1.BaseDomainEntity {
    _email;
    _phone;
    _passwordHash;
    _role;
    _isEmailVerified;
    _isPhoneVerified;
    _mfaEnabled;
    _mfaSecret;
    _googleId;
    _deletedAt;
    constructor(props) {
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
    get email() { return this._email; }
    get phone() { return this._phone; }
    get passwordHash() { return this._passwordHash; }
    get role() { return this._role; }
    get isEmailVerified() { return this._isEmailVerified; }
    get isPhoneVerified() { return this._isPhoneVerified; }
    get mfaEnabled() { return this._mfaEnabled; }
    get mfaSecret() { return this._mfaSecret; }
    get googleId() { return this._googleId; }
    get deletedAt() { return this._deletedAt; }
    updatePassword(newHash) {
        this._passwordHash = newHash;
        this._updatedAt = new Date();
    }
    enableMfa(secret) {
        this._mfaEnabled = true;
        this._mfaSecret = secret;
        this._updatedAt = new Date();
    }
    verifyEmail() {
        this._isEmailVerified = true;
        this._updatedAt = new Date();
    }
    softDelete() {
        this._deletedAt = new Date();
        this._updatedAt = new Date();
    }
}
exports.UserEntity = UserEntity;
//# sourceMappingURL=user.entity.js.map