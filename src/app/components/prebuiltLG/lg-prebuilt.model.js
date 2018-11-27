"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ConditionSlots = /** @class */ (function () {
    function ConditionSlots(name, possibleValues, selectedValue) {
        this.Name = name;
        this.PossibleValues = possibleValues;
        this.SelectedValue = selectedValue;
    }
    return ConditionSlots;
}());
exports.ConditionSlots = ConditionSlots;
var LgResolverRequestObject = /** @class */ (function () {
    function LgResolverRequestObject(lgDomain, lgIntent, luIntent, slots, entity) {
        this.Domain = lgDomain;
        this.LgIntent = lgIntent;
        this.LuIntent = luIntent;
        this.Slots = slots;
        this.EntityDescription = entity;
    }
    return LgResolverRequestObject;
}());
exports.LgResolverRequestObject = LgResolverRequestObject;
var SlotString = /** @class */ (function () {
    function SlotString() {
    }
    return SlotString;
}());
exports.SlotString = SlotString;
//# sourceMappingURL=lg-prebuilt.model.js.map