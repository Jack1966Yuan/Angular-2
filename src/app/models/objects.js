"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
//Module for all modules List
var DomainList = (function () {
    function DomainList() {
    }
    return DomainList;
}());
exports.DomainList = DomainList;
var ShareWithItem = (function () {
    function ShareWithItem() {
    }
    return ShareWithItem;
}());
exports.ShareWithItem = ShareWithItem;
//Item could be Intent, or Slot
var Item = (function () {
    function Item() {
    }
    return Item;
}());
exports.Item = Item;
//ReviewStatus : 
//one module
var DomainDetail = (function () {
    function DomainDetail() {
    }
    return DomainDetail;
}());
exports.DomainDetail = DomainDetail;
//for display module details
var ItemDisplay = (function (_super) {
    __extends(ItemDisplay, _super);
    function ItemDisplay() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.DisplayFlag = false;
        return _this;
    }
    return ItemDisplay;
}(Item));
exports.ItemDisplay = ItemDisplay;
var UserType;
(function (UserType) {
    UserType[UserType["Administrator"] = 0] = "Administrator";
    UserType[UserType["Owner"] = 1] = "Owner";
    UserType[UserType["Reader"] = 2] = "Reader";
})(UserType = exports.UserType || (exports.UserType = {}));
var ReviewStatus;
(function (ReviewStatus) {
    ReviewStatus[ReviewStatus["NeedReview"] = 0] = "NeedReview";
    ReviewStatus[ReviewStatus["AdminReviewed"] = 1] = "AdminReviewed";
    ReviewStatus[ReviewStatus["Completed"] = 2] = "Completed";
})(ReviewStatus = exports.ReviewStatus || (exports.ReviewStatus = {}));
//for display module details
var DomainDetailDisplay = (function () {
    function DomainDetailDisplay() {
    }
    return DomainDetailDisplay;
}());
exports.DomainDetailDisplay = DomainDetailDisplay;
//update domain
var EditDomain = (function () {
    function EditDomain() {
    }
    return EditDomain;
}());
exports.EditDomain = EditDomain;
var NewModuleItem = (function () {
    function NewModuleItem() {
    }
    return NewModuleItem;
}());
exports.NewModuleItem = NewModuleItem;
//update intent or slot
var UpdateItem = (function () {
    function UpdateItem() {
    }
    return UpdateItem;
}());
exports.UpdateItem = UpdateItem;
var EditItem = (function () {
    function EditItem() {
    }
    return EditItem;
}());
exports.EditItem = EditItem;
//----------------------------------------------
var ISItem = (function () {
    function ISItem() {
    }
    return ISItem;
}());
exports.ISItem = ISItem;
var UtterRules = (function () {
    function UtterRules() {
    }
    return UtterRules;
}());
exports.UtterRules = UtterRules;
var Hotfix = (function () {
    function Hotfix() {
    }
    return Hotfix;
}());
exports.Hotfix = Hotfix;
var HotfixItem = (function () {
    function HotfixItem() {
    }
    return HotfixItem;
}());
exports.HotfixItem = HotfixItem;
//for utterance
var Annotation = (function () {
    function Annotation() {
    }
    return Annotation;
}());
exports.Annotation = Annotation;
//for utterance
var SlotAction = (function () {
    function SlotAction() {
    }
    return SlotAction;
}());
exports.SlotAction = SlotAction;
//for rules
var Rules = (function () {
    function Rules() {
    }
    return Rules;
}());
exports.Rules = Rules;
var ErrorMessage = (function () {
    function ErrorMessage() {
    }
    return ErrorMessage;
}());
exports.ErrorMessage = ErrorMessage;
var OAuthEvent = (function () {
    function OAuthEvent(type) {
        this.type = type;
    }
    return OAuthEvent;
}());
exports.OAuthEvent = OAuthEvent;
var OAuthInfoEvent = (function (_super) {
    __extends(OAuthInfoEvent, _super);
    function OAuthInfoEvent(type, info) {
        if (info === void 0) { info = null; }
        var _this = _super.call(this, type) || this;
        _this.info = info;
        return _this;
    }
    return OAuthInfoEvent;
}(OAuthEvent));
exports.OAuthInfoEvent = OAuthInfoEvent;
//for QAS
var QASSearch = (function () {
    function QASSearch() {
    }
    return QASSearch;
}());
exports.QASSearch = QASSearch;
var QASItem = (function () {
    function QASItem() {
    }
    return QASItem;
}());
exports.QASItem = QASItem;
var QASResult = (function () {
    function QASResult() {
    }
    return QASResult;
}());
exports.QASResult = QASResult;
//# sourceMappingURL=objects.js.map