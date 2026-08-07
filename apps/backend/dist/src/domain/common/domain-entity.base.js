"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseDomainEntity = void 0;
class BaseDomainEntity {
    _id;
    _createdAt;
    _updatedAt;
    constructor(id, createdAt, updatedAt) {
        this._id = id;
        this._createdAt = createdAt || new Date();
        this._updatedAt = updatedAt || new Date();
    }
    get id() {
        return this._id;
    }
    get createdAt() {
        return this._createdAt;
    }
    get updatedAt() {
        return this._updatedAt;
    }
}
exports.BaseDomainEntity = BaseDomainEntity;
//# sourceMappingURL=domain-entity.base.js.map