export class ConditionSlots {
    Name: string;
    PossibleValues: Array<string>;
    SelectedValue: string;

    constructor(name: string, possibleValues: Array<string>, selectedValue: string) {
        this.Name = name;
        this.PossibleValues = possibleValues;
        this.SelectedValue = selectedValue;
    }
}

export class LgResolverRequestObject {
    Domain: string;
    LgIntent: string;
    LuIntent: string;
    Slots: Array<ConditionSlots>;
    EntityDescription: string;

    constructor(lgDomain: string, lgIntent: string, luIntent: string, slots: Array<ConditionSlots>, entity: string) {
        this.Domain = lgDomain;
        this.LgIntent = lgIntent;
        this.LuIntent = luIntent;
        this.Slots = slots;
        this.EntityDescription = entity;
    }
}

export class SlotString {
  Tag: string;
  Value: string;
}
