//add isAdmin property
export class Models {
    IsAdmin: Boolean;
    RequestedObject: Array<DomainList>;
}

export class DomainDetailResponse {
    IsAdmin: Boolean;
    RequestedObject: DomainDetailDisplay;
}

export class PostOwners {
    DomainID: string;
    OwnerList: PostOwnerList;

    constructor(id: string, owners: OwnerList) {
        this.DomainID = id;
        let dataAls: Array<PostAlias> = []
        let modelAls: Array<PostAlias> = []
        let skillAls: Array<PostAlias> = []

        owners.DataOwnerList.Alias.map(item => {
            dataAls.push(new PostAlias(item))
        })
        owners.ModelOwnerList.Alias.map(item => {
            modelAls.push(new PostAlias(item))
        })
        owners.SkillOwnerList.Alias.map(item => {
            skillAls.push(new PostAlias(item))
        })

        this.OwnerList = new PostOwnerList(dataAls, modelAls, skillAls);
    }
}

export class Users {
    CurrentUser: string;
    Admins: Array<string>;
}

export class PostOwnerList {
    DataOwnerList: Array<PostAlias>;
    ModelOwnerList: Array<PostAlias>;
    SkillOwnerList: Array<PostAlias>;

    constructor(dataOwners: Array<PostAlias>, modelOwners: Array<PostAlias>, skillOwners: Array<PostAlias>) {
        this.DataOwnerList = dataOwners;
        this.ModelOwnerList = modelOwners;
        this.SkillOwnerList = skillOwners;
    }
}

export class PostAlias {
    Alias: string;
    constructor(al) {
        this.Alias = al;
    }
}

//{"DataOwnerList":[{"Alias":"guomei"}],"ModelOwnerList":[{"Alias":"guomei"}],"SkillOwnerList":[{"Alias":"guomei"}]}
export class OwnerList {
    DataOwnerList: Alias;
    ModelOwnerList: Alias;
    SkillOwnerList: Alias;

    constructor(dataOwnerList: Array<string>, modelOwnerList: Array<string>, skillOwnerList: Array<string>) {
        this.DataOwnerList = new Alias(dataOwnerList);
        this.ModelOwnerList = new Alias(modelOwnerList);
        this.SkillOwnerList = new Alias(skillOwnerList);
    }
}

export class Alias {
    Alias: Array<string>;
    constructor(data: Array<string>) {
        this.Alias = data;
    }
}

//Module for all modules List
export class DomainList {
    Description: string;
    DomainID: string;
    InDevelopment: Boolean;
    InPending: number;
    DomainName: string;
    IsOwner: boolean;
    Owners: OwnerList;
    IsLFModel: Boolean;
}

export class ShareWithItem
{
     domainID: string;
     userList: string;
}

//Item could be Intent, or Slot
export class Item {
    Name: string;
    Tag: string;
    Description: string;
    Positive: Array<string>;
    Negative: Array<string>;
    ReviewStatus: ReviewStatus;
}

//one module
export class DomainDetail {
    Name: string;
    Description: string;
    Intent: Array<Item>;
    Slot: Array<Item>;
}
//for display module details
export class ItemDisplay extends Item {
    DisplayFlag: boolean = false;
}

export enum UserType {
  Administrator = 0,
  Owner = 1,
  Reader = 2
}

// ------

export enum ReviewStatus
{
    NeedReview = 0,
    AdminReviewed = 1,
    Completed = 2
}

export enum SchemaUpdateType
{
    None = 0,
    Intent = 1,
    Slot = 2
}

export enum AdminRevision
{
    None = 0,
    Delete = 1,
    Rename = 2,
    Approve = 3,
    Add = 4
}

export enum OwnerAction
{
  NeedAction = 0,
  Accept = 1,
  Reject = 2,
  Add = 3,
  Rename = 4,
  Delete = 5
}

export class BaseSuggestion
{
    DomainID: string;
    SchemaUpdateType: SchemaUpdateType;
    Tag: string;
    NewTag: string;
    AdminRevision: AdminRevision;
    OwnerAction: OwnerAction;
    Comments: string;
    ReviewStatus: ReviewStatus;
    UserEmail: string;
    StatusMessage: string;
}

export class Suggestion {
    options: string;
    rename: string;
    comment: string;
}

// -----
// for display module details
export class DomainDetailDisplay {
    DomainID: string;
    Name: string;
    Description: string;
    Intent: Array<ItemDisplay>;
    Slot: Array<ItemDisplay>;
    DisplayFlag: boolean;
    UserType: UserType;
    InPending: number;
}
// update domain
export class EditDomain {
    DomainName: string;
    Description: string;
    DomainID: string;
    InDevelopment: boolean;
    InPending: number;
    IsOwner: boolean;
}

export class NewModuleItem {
    DomainName: string;
    Description: string;
    IntentList: Array<EditItem>;
    SlotList: Array<EditItem>;
    DomainID: string;
}

//update intent or slot
export class UpdateItem {
    DomainID: string;
    UpdateType: SchemaUpdateType;
    IDTag: string;
    myIntent: EditItem;
    mySlot: EditItem;
    Comments: string;
    NewTag: string;
    AdminRevision: AdminRevision;
    OwnerAction: OwnerAction;
}

export class EditItem {
    Name: string;
    Tag: string;
    Description: string;
    DomainID: string;
    PositiveList: Array<string>;
    NegativeList: Array<string>;
    ReviewStatus: ReviewStatus;
}

//----------------------------------------------

export class ISItem {
    Name: string;
    Tag: string;
}

export class UtterRules {
    DomainID: string;
    DomainName: string;
    IntentList: Array<ISItem>;
    SlotList: Array<ISItem>;
    HotfixList: Array<HotfixItem>;
    Rules: string;
    UserType: UserType;
    Deployed: Boolean
}

export class Hotfix {
    Intent: string;
    DomainID: string;
    Sentence: string;
    SlotString: string;
}

export class HotfixItem {
    Intent: string;
    DomainID: string;
    Sentence: string;
    SlotString: string;
    DisplayFlag: boolean;
}


//for utterance
export class Annotation {
    sentence: string;
    domain: string;
    intent: string;
    slots: Array<SlotAction>;
    slotString: string;
    displayFlag: boolean;
}

//for utterance
export class SlotAction {
    slot: string;
    slottedfrom: number;
    slottedto: number;
    status: boolean;
}


//for rules
export class Rules {
    DomainID: string;
    Content: string;
}

export class ErrorMessage {
    status: number;
    statusText: string;
    message: string;
}



export type EventType =
'discovery_document_loaded'
| 'received_first_token'
| 'jwks_load_error'
| 'invalid_nonce_in_state'
| 'discovery_document_load_error'
| 'discovery_document_validation_error'
| 'user_profile_loaded'
| 'user_profile_load_error'
| 'token_received'
| 'token_error'
| 'token_refreshed'
| 'token_refresh_error'
| 'silent_refresh_error'
| 'silently_refreshed'
| 'silent_refresh_timeout'
| 'token_validation_error'
| 'token_expires'
| 'session_changed'
| 'session_error'
| 'session_terminated';

export abstract class OAuthEvent {
    constructor(
        readonly type: EventType) {
    }
}

export class OAuthInfoEvent extends OAuthEvent {
  constructor(
      type: EventType,
      readonly info: any = null
  ) {
      super(type);
  }
}

//for QAS
export class QASSearch {
    Query: string;
    DomainList: Array<string>;
    Location: string;
    ClientId: string;
    VirtualService: string;
}

export class QASItem {
    key: string;
    value: string;
}

export class QASResult {
    domainName: string;
    valueList: Array<QASItem>;
}

export enum QASClientType {
  Skills = 0,
  Prebuilt = 1,
}
//hotfix, bvt validate result

export class AnnotationValidateResult {
    Intent: string;
    QASIntent: string;
    DomainID: string;
    Sentence: string;
    HotfixAnnotation: string; // golden Annotation stored in table
    QASAnnotation: string; // expected Annotation get from QAS
    AreAnnotationEqual: Boolean; // whether two Annotations are equal
}


// upload schema response object
export class UploadSchemaResponse {
    Subject: string;
    ResultMessage: string;
    Succeeded: Boolean;
}

// UHRS objects

// AnnotationStatus
export enum UHRSAnnotationStatus {
  Annotating = 1,
  Annotated = 2,
  Reviewed = 3
}

export enum UHRSTaskType {
  Normal = 0,
  Gold = 1,
  Review = 2,
  RTA = 3,
}

// UHRSTask
export class UhrsTaskInfo {
    TaskName: string;
    TaskID: string;
    CreateTime: string;
    DataOwner: string;
    DomainList: string;
    AnnotationStatus: UHRSAnnotationStatus;
    TaskType: UHRSTaskType;
}

export enum UHRSAnnotationReviewResult {
   Pending = 0,
   Reject = 1,
   Approve = 2,
}

export class UHRSAnnotationEntry {
  Query: string;
  SelectedDomain: string;
  ReviewResult: UHRSAnnotationReviewResult;
  MultiSelectArray: Array<MultiSelectItem>;
}

export class UhrsTaskAnnotationContent {
    TaskID: string;
    DomainList: string;
    ReviewResult: UHRSAnnotationReviewResult;
    AnnotationList: Array<UHRSAnnotationEntry>;
    LSDStringList: Array<string>;
}

export class MultiSelectItem {
  id: number;
  itemName: string;
}

// !---UHRS objects---

// SchemaSuggestionAnnotation for schema suggestion
export class SchemaSuggestionAnnotation {
      DomainName: string;
      Query: string;
      Intent: string;
      SlotStringXml: string;
}

export class SchemaSuggestionItem {
    Detail: SchemaSuggestionAnnotation;
    Selected: boolean;

    public constructor(detail: SchemaSuggestionAnnotation, selected: boolean) {
        this.Detail = detail;
        this.Selected = selected;
    }
}

export class LuisSchemaSuggestion {
    QueryList: Array<string>;
    Dictionary: any;

    public constructor(queries: Array<string>, dic: any) {
        this.QueryList = queries;
        this.Dictionary = dic;
    }
}

export class LuisSchemaSuggestionResponse {
    DomainName: string;
    Query: string;
    Intent: string;
    SlotStringXml: string;
}


