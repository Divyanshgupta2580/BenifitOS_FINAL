"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationSeverity = exports.NotificationType = exports.ChannelType = void 0;
var ChannelType;
(function (ChannelType) {
    ChannelType["EMAIL"] = "EMAIL";
    ChannelType["SMS"] = "SMS";
    ChannelType["WHATSAPP"] = "WHATSAPP";
    ChannelType["IN_APP"] = "IN_APP";
    ChannelType["WEBSOCKET"] = "WEBSOCKET";
})(ChannelType || (exports.ChannelType = ChannelType = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["SCHEME_ELIGIBILITY"] = "SCHEME_ELIGIBILITY";
    NotificationType["NEW_SCHEME_ELIGIBLE"] = "NEW_SCHEME_ELIGIBLE";
    NotificationType["BECAME_ELIGIBLE"] = "BECAME_ELIGIBLE";
    NotificationType["AGE_ELIGIBILITY_REACHED"] = "AGE_ELIGIBILITY_REACHED";
    NotificationType["DOCUMENT_REQUIRED"] = "DOCUMENT_REQUIRED";
    NotificationType["DOCUMENT_VERIFIED"] = "DOCUMENT_VERIFIED";
    NotificationType["DOCUMENT_REJECTED"] = "DOCUMENT_REJECTED";
    NotificationType["APPLICATION_READY"] = "APPLICATION_READY";
    NotificationType["APPLICATION_SUBMITTED"] = "APPLICATION_SUBMITTED";
    NotificationType["APPLICATION_STATUS_CHANGED"] = "APPLICATION_STATUS_CHANGED";
    NotificationType["PROFILE_INCOMPLETE"] = "PROFILE_INCOMPLETE";
    NotificationType["AI_GUIDANCE"] = "AI_GUIDANCE";
    NotificationType["SYSTEM"] = "SYSTEM";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var NotificationSeverity;
(function (NotificationSeverity) {
    NotificationSeverity["INFO"] = "INFO";
    NotificationSeverity["SUCCESS"] = "SUCCESS";
    NotificationSeverity["WARNING"] = "WARNING";
    NotificationSeverity["ERROR"] = "ERROR";
})(NotificationSeverity || (exports.NotificationSeverity = NotificationSeverity = {}));
//# sourceMappingURL=notification-repository.interface.js.map