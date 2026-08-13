"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationEntity = exports.ApplicationStatus = void 0;
const domain_entity_base_1 = require("../common/domain-entity.base");
var ApplicationStatus;
(function (ApplicationStatus) {
    ApplicationStatus["DRAFT"] = "DRAFT";
    ApplicationStatus["SUBMITTED"] = "SUBMITTED";
    ApplicationStatus["UNDER_REVIEW"] = "UNDER_REVIEW";
    ApplicationStatus["ACTION_REQUIRED"] = "ACTION_REQUIRED";
    ApplicationStatus["APPROVED"] = "APPROVED";
    ApplicationStatus["REJECTED"] = "REJECTED";
    ApplicationStatus["WITHDRAWN"] = "WITHDRAWN";
})(ApplicationStatus || (exports.ApplicationStatus = ApplicationStatus = {}));
class ApplicationEntity extends domain_entity_base_1.BaseDomainEntity {
    _applicationNo;
    _userId;
    _schemeId;
    _status;
    _formData;
    _remarks;
    _documentIds;
    _history;
    _submittedAt;
    constructor(props) {
        super(props.id, props.createdAt, props.updatedAt);
        this._applicationNo = props.applicationNo;
        this._userId = props.userId;
        this._schemeId = props.schemeId;
        this._status = props.status;
        this._formData = props.formData;
        this._remarks = props.remarks;
        this._documentIds = props.documentIds || [];
        this._history = props.history || [];
        this._submittedAt = props.submittedAt;
    }
    get applicationNo() { return this._applicationNo; }
    get userId() { return this._userId; }
    get schemeId() { return this._schemeId; }
    get status() { return this._status; }
    get formData() { return this._formData; }
    get remarks() { return this._remarks; }
    get documentIds() { return this._documentIds; }
    get history() { return this._history; }
    get submittedAt() { return this._submittedAt; }
    submit() {
        if (this._status !== ApplicationStatus.DRAFT) {
            throw new Error('Only DRAFT applications can be submitted.');
        }
        this._status = ApplicationStatus.SUBMITTED;
        this._submittedAt = new Date();
        this._updatedAt = new Date();
    }
    updateFormData(newData) {
        this._formData = { ...this._formData, ...newData };
        this._updatedAt = new Date();
    }
    transitionTo(newStatus, changedById, note) {
        const oldStatus = this._status;
        this._status = newStatus;
        this._history.push({
            id: `hist-${Date.now()}`,
            applicationId: this.id,
            fromStatus: oldStatus,
            toStatus: newStatus,
            changedById,
            note,
            changedAt: new Date(),
        });
        this._updatedAt = new Date();
    }
}
exports.ApplicationEntity = ApplicationEntity;
//# sourceMappingURL=application.entity.js.map