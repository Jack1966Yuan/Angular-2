import { Component, Inject, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup, FormArray } from '@angular/forms';
import { AllModulesService } from '../../services/modules.service';
import {
    AdminRevision,
    BaseSuggestion,
    DomainDetailDisplay,
    EditDomain,
    EditItem,
    ErrorMessage,
    ItemDisplay,
    OwnerAction,
    ReviewStatus,
    SchemaUpdateType,
    ShareWithItem,
    Suggestion,
    UpdateItem,
    UserType,
    DomainDetailResponse,
    OwnerList,
} from '../../models/objects';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertComponent } from '../alert/alert.component';
import { HttpHelperService } from '../../services/HttpHeaderService';

@Component({
    selector: 'detail',
    templateUrl: './modelDetail.component.html',
    styleUrls: ['./modelDetail.component.css']
})
export class DomainDetailComponent {
    domain: DomainDetailResponse;
    formModel: FormGroup;
    formDomain: FormGroup;
    isntNewItemActive: boolean;
    isntEditItemActive: boolean;
    //isntUtteranceActive: boolean;
    item: string;
    action: string;
    //setences: Array<Annotation>;
    editUtIndex: number;
    domainId: string;
    inputName: string;
    inputTag: string;
    domain_name: string;
    readOnly: boolean;
    isAdmin: boolean;
    isOwner: boolean;
    shareText: string;
    //shareWith: string;
    shareInputVisible: boolean;
    baseSuggestion: BaseSuggestion;

    suggestion: Suggestion;
    adminReviewDisplay: string;
    adminResult: AdminRevision;
    ownerResult: OwnerAction;

    reviewStatus: number;
    ownerChoice: String;
    isAdminAdd: Boolean;
    reviewerEmail: string;
    statusMessage: string;

    nameDescriptionReadOnly: boolean;
    adminChoiceDesplay: boolean;
    completeDesplay: boolean;
    ownerInfoDesplay: boolean;

    proceedNext: Boolean;
    owners: OwnerList;
    ownersPresent: any;

    @ViewChild('myAlert') alertComponent: AlertComponent;

    constructor(
      private router: ActivatedRoute,
      private myrouter: Router,
      private httpService: HttpHelperService,
      @Inject(AllModulesService) private allModulesService: AllModulesService) {
        this.domainId = this.router.snapshot.params['id'];
        this.domain_name = '';
        this.shareText = 'Share With User';
        //this.shareWith = '';
        this.shareInputVisible = false;
        this.isntNewItemActive = true;
        this.isntEditItemActive = true;
        //this.isntUtteranceActive = true;
        this.formModel = new FormGroup({
            'name': new FormControl(),
            'tag': new FormControl(),
            'description': new FormControl(),
            'positive': new FormArray([
                new FormControl()
            ]),
            'negative': new FormArray([
              new FormControl()
          ])
        });

        this.formDomain = new FormGroup({
            'name': new FormControl(),
            'description': new FormControl()
        });

        this.editUtIndex = -1;
        this.inputName = '';
        this.readOnly = false;
        this.isAdmin = false;
        this.isOwner = false;
        this.adminReviewDisplay = '';
        this.suggestion = { options: "3", rename:'', comment: ''};
        this.baseSuggestion = new BaseSuggestion();
        this.adminResult = 0;
        this.reviewStatus = 0;
        this.ownerChoice = '1';
        this.isAdminAdd = false;
        this.reviewerEmail = '';
        this.statusMessage = '';

        this.nameDescriptionReadOnly = false;
        this.adminChoiceDesplay = false;
        this.completeDesplay = false;
        this.ownerInfoDesplay = false;
        this.proceedNext = true;
        this.owners = null;
        this.ownersPresent = { DataOwner: { display: false, text: "" }, ModelOwner: { display: false, text: "" }, SkillOwner: { display: false, text: "" }}
    }

    ngOnInit(): any {
        this.allModulesService.getDomain(this.domainId)
        .subscribe(modules => {
            this.domain = modules;
            if (this.domain.RequestedObject.UserType === UserType.Reader) {
              this.readOnly = true;
              //this.isOwner = true;
            }else if (this.domain.RequestedObject.UserType === UserType.Administrator) {
              //this.isOwner = true;
              this.isAdmin = true;
            }else {
              //this.isAdmin = true;
              this.isOwner = true;

            }
        }, error => { this.handleError(error); });
        this.httpService.watchdog();
    }

    sharewithCancel(): any {
      this.shareInputVisible = false;
      this.ownersPresent = { DataOwner: { display: false, text: "" }, ModelOwner: { display: false, text: "" }, SkillOwner: { display: false, text: "" }}
      //this.shareText = 'Share With User';
    }

    sharewithClick(): any {
        if (this.shareInputVisible === false) {
            this.shareInputVisible = true;
            /*owners data bind*/
            this.allModulesService.getOwnerList(this.domainId).subscribe(owners => {
               this.owners = owners;
            }, error => { this.handleError(error) });
        } else {
            /*Here is submit*/
            if(this.ownersPresent.DataOwner.display && this.ownersPresent.DataOwner.text.length > 0) {
                this.owners.DataOwnerList.Alias.push(this.ownersPresent.DataOwner.text);
            }

            if(this.ownersPresent.ModelOwner.display && this.ownersPresent.ModelOwner.text.length > 0) {
              this.owners.ModelOwnerList.Alias.push(this.ownersPresent.ModelOwner.text);
            }

            if(this.ownersPresent.SkillOwner.display && this.ownersPresent.SkillOwner.text.length > 0) {
              this.owners.SkillOwnerList.Alias.push(this.ownersPresent.SkillOwner.text);
            }

            this.allModulesService.postOwnerList(this.domainId, this.owners).subscribe(
              () => {
                this.alertComponent.setAlert('Update success, owner change is now reflected on all models page', 0);
              },
              error => { this.handleError(error) });
            this.shareInputVisible = false;
            this.ownersPresent = { DataOwner: { display: false, text: "" }, ModelOwner: { display: false, text: "" }, SkillOwner: { display: false, text: "" }}
        }
    }

    addDataOwner() {
      if(this.ownersPresent.DataOwner.display && this.ownersPresent.DataOwner.text.length) {
        let temp = this.ownersPresent.DataOwner.text;
        this.owners.DataOwnerList.Alias.push(temp);
        this.ownersPresent.DataOwner.text = "";
        this.allModulesService.postOwnerList(this.domainId, this.owners).subscribe(() => {
          this.alertComponent.setAlert(temp + ' was added as one of data owner', 0);
        }, error => { this.handleError(error) });
      }
      this.ownersPresent.DataOwner.display = true;
    }

    addAliasToDataOwner(key) {
      if(key.which === 13 && this.ownersPresent.DataOwner.text.length > 0) {
        let temp = this.ownersPresent.DataOwner.text;
        this.owners.DataOwnerList.Alias.push(temp);
        this.ownersPresent.DataOwner.display = false;
        this.ownersPresent.DataOwner.text = "";
        this.allModulesService.postOwnerList(this.domainId, this.owners).subscribe(() => {
          this.alertComponent.setAlert(temp + ' was added as one of data owner', 0);
        }, error => { this.handleError(error) });
      }
    }

    addModelOwner() {
      if(this.ownersPresent.ModelOwner.display && this.ownersPresent.ModelOwner.text.length) {
        let temp = this.ownersPresent.ModelOwner.text
        this.owners.ModelOwnerList.Alias.push(temp);
        this.ownersPresent.ModelOwner.text = "";
        this.allModulesService.postOwnerList(this.domainId, this.owners).subscribe(() => {
          this.alertComponent.setAlert(temp + ' was added as one of model owner', 0);
        }, error => { this.handleError(error) });
      }
      this.ownersPresent.ModelOwner.display = true;
    }

    addAliasToModelOwner(key) {
      if(key.which === 13 && this.ownersPresent.ModelOwner.text.length > 0) {
        let temp = this.ownersPresent.ModelOwner.text;
        this.owners.ModelOwnerList.Alias.push(temp);
        this.ownersPresent.ModelOwner.display = false;
        this.ownersPresent.ModelOwner.text = "";
        this.allModulesService.postOwnerList(this.domainId, this.owners).subscribe(() => {
          this.alertComponent.setAlert(temp + ' was added as one of model owner', 0);
        }, error => { this.handleError(error) });
      }
    }

    addSkillOwner() {
      if(this.ownersPresent.SkillOwner.display && this.ownersPresent.SkillOwner.text.length) {
        let temp = this.ownersPresent.SkillOwner.text;
        this.owners.SkillOwnerList.Alias.push(temp);
        this.ownersPresent.SkillOwner.text = "";
        this.allModulesService.postOwnerList(this.domainId, this.owners).subscribe(() => {
          this.alertComponent.setAlert(temp + ' was added as one of skill owner', 0);
        }, error => { this.handleError(error) });
      }
      this.ownersPresent.SkillOwner.display = true;
    }

    addAliasToSkillOwner(key) {
      if(key.which === 13 && this.ownersPresent.SkillOwner.text.length > 0) {
        let temp = this.ownersPresent.SkillOwner.text;
        this.owners.SkillOwnerList.Alias.push(temp);
        this.ownersPresent.SkillOwner.display = false;
        this.ownersPresent.SkillOwner.text = "";
        this.allModulesService.postOwnerList(this.domainId, this.owners).subscribe(() => {
          this.alertComponent.setAlert(temp + ' was added as one of skill owner', 0);
        }, error => { this.handleError(error) });
      }
    }

    deleteDataOwner(index: number) {
      let temp = this.owners.DataOwnerList.Alias[index];
      this.owners.DataOwnerList.Alias.splice(index, 1);
      this.allModulesService.postOwnerList(this.domainId, this.owners).subscribe(() => {
        this.alertComponent.setAlert(temp + ' was removed from data owners', 0);
      }, error => { this.handleError(error) });
    }

    deleteModelOwner(index: number) {
      let temp = this.owners.ModelOwnerList.Alias[index];
      this.owners.ModelOwnerList.Alias.splice(index, 1);
      this.allModulesService.postOwnerList(this.domainId, this.owners).subscribe(() => {
        this.alertComponent.setAlert(temp + ' was removed from model owners', 0);
      }, error => { this.handleError(error) });
    }

    deleteSkillOwner(index: number) {
      let temp = this.owners.SkillOwnerList.Alias;
      this.owners.SkillOwnerList.Alias.splice(index, 1);
      this.allModulesService.postOwnerList(this.domainId, this.owners).subscribe(() => {
        this.alertComponent.setAlert(temp + ' was removed from skill owners', 0);
      }, error => { this.handleError(error) });
    }


    deploy(): any {
        this.allModulesService.deployModel(this.domainId).subscribe((res) => {
            //alert('Deploy this model completed')
            this.alertComponent.setAlert('Your request has been submitted, we will notify the owner once model is deployed to QAS', 0);
        }, error => { this.handleError(error) });
    }

    addPositive(): any {
        const positive = this.formModel.get('positive') as FormArray;
        positive.push(new FormControl());
    }

    removePositive(i): any {
        const positive = this.formModel.get('positive') as FormArray;
        positive.removeAt(i);
    }

    addNegative(): any {
      const negative = this.formModel.get('negative') as FormArray;
      negative.push(new FormControl());
   }

   removeNegative(i): any {
      const negative = this.formModel.get('negative') as FormArray;
      negative.removeAt(i);
   }

    createNewItem(field: string): any {
        this.isntNewItemActive = !this.isntNewItemActive;
        this.nameDescriptionReadOnly = false;
        this.item = field;
        this.action = 'New';
    }

    newItemSubmit(): any {
        if(this.isAdmin === true && this.action === 'Edit' && this.reviewStatus % 2 !== 0) {
          if(!this.checkAdminInputValid()) {
            return;
          }
        }

        this.inputName = this.formModel.value.name;
        this.inputTag = this.formModel.value.tag;

        if (this.inputTag == null || this.inputTag.length === 0) {
            //alert("Please define a valid name");
            this.alertComponent.setAlert('Please define a valid name', -1);
            this.proceedNext = false;
            return;
        }

        if(!this.valideTag()) {
          alert("Tag " + this.inputTag + " is invalid");
          this.proceedNext = false;
          return;
        }

        this.proceedNext = true;
        this.isntNewItemActive = true;
        let obj: UpdateItem;
        switch (this.item) {
            case 'Intent':

                if (this.action === 'Edit')
                {
                    if (this.domain.RequestedObject.Intent.length > 0 && this.validateTagExists(this.domain.RequestedObject.Intent, this.inputTag, this.editUtIndex)) {
                        //alert('The tag name: ' + this.inputTag + ' already exists.');
                        this.alertComponent.setAlert('The tag name: ' + this.inputTag + ' already exists.', -1);
                        this.isntNewItemActive = false;
                        return;
                    }

                    let oldTag: string = this.domain.RequestedObject.Intent[this.editUtIndex].Tag;
                    let newTag: string = this.inputTag;
                    let usingTagInput : boolean = true;

                    // for fixing lost review status issue during next, previous click
                    if(this.reviewStatus == 0 && this.domain.RequestedObject.Intent[this.editUtIndex].ReviewStatus != 0){
                      this.reviewStatus = this.domain.RequestedObject.Intent[this.editUtIndex].ReviewStatus;
                    }

                    if(this.isAdmin) {
                      this.adminResult = Number(this.suggestion.options);
                      if(this.reviewStatus % 3 == 2){
                        this.adminResult = AdminRevision.None;
                      }
                      else if(this.reviewStatus == 1 && this.isAdminAdd == true){
                        this.adminResult = AdminRevision.Add;
                      }

                      if(this.adminResult == AdminRevision.Rename) {
                        let re_space = /\s+/g;
                        this.suggestion.rename = this.suggestion.rename.trim().replace(re_space, '_');
                      }
                      if(this.adminResult == AdminRevision.Approve && this.ownerResult == OwnerAction.Delete){
                        var answer = confirm("Please confirm, as this will delete this Intent item");
                        if (!answer) {
                            return;
                        }
                      }
                      if(this.reviewStatus >= 2){
                        usingTagInput = false;
                      }

                    }else if(this.isOwner) {
                      this.ownerResult = Number(this.ownerChoice);
                      if(this.reviewStatus % 3 == 2) this.ownerResult = 0;
                      if (this.ownerResult == OwnerAction.Accept && this.adminResult == AdminRevision.Delete) {
                        var answer = confirm("Please confirm, as this will delete this Intent item");
                        if (!answer) {
                            return;
                        }
                      }
                      if(this.reviewStatus >= 2){
                        usingTagInput = false;
                      }
                    }

                    if(usingTagInput){
                      this.domain.RequestedObject.Intent[this.editUtIndex].Name = this.inputName;
                      this.domain.RequestedObject.Intent[this.editUtIndex].Tag = this.inputTag;
                    }
                    this.domain.RequestedObject.Intent[this.editUtIndex].ReviewStatus = this.reviewStatus;
                    this.domain.RequestedObject.Intent[this.editUtIndex].Description = this.formModel.value.description;
                    this.domain.RequestedObject.Intent[this.editUtIndex].Positive = this.formModel.value.positive;
                    this.domain.RequestedObject.Intent[this.editUtIndex].Negative = this.formModel.value.negative;
                    this.domain.RequestedObject.Intent[this.editUtIndex].DisplayFlag = true;

                    let ei: EditItem = { Name: this.inputName, Tag: this.inputTag, DomainID: "", Description: this.formModel.value.description, PositiveList: this.formModel.value.positive, NegativeList: this.formModel.value.negative, ReviewStatus: this.reviewStatus };
                    obj = { DomainID: this.domainId, UpdateType: SchemaUpdateType.Intent, IDTag: oldTag, myIntent: ei, mySlot: null, Comments: this.suggestion.comment, NewTag: this.suggestion.rename, AdminRevision: this.adminResult, OwnerAction: this.ownerResult};

                    this.allModulesService.putIS(obj).subscribe(res => {
                          this.performUpdateIntent(oldTag, newTag);
                    }, error => { this.handleError(error) });
                }
                else {
                    if (this.domain.RequestedObject.Intent.length > 0 && this.validateTagExists(this.domain.RequestedObject.Intent, this.inputTag, -1)) {
                        //alert('The tag name: ' + this.inputTag + ' already exists.');
                        this.alertComponent.setAlert('The tag name: ' + this.inputTag + ' already exists.', -1);
                        this.isntNewItemActive = false;
                        return;
                    }
                    let curStatus: number = 0;
                    if(this.isAdmin){
                      //curStatus = 1;
                      curStatus = 2;
                    }
                    let im: ItemDisplay = { Name: this.inputName, Tag: this.inputTag, Description: this.formModel.value.description, Positive: this.formModel.value.positive, Negative: this.formModel.value.negative, DisplayFlag: true, ReviewStatus: curStatus };
                    this.domain.RequestedObject.Intent.push(im);
                    let ei: EditItem = { Name: this.inputName, Tag: this.inputTag, DomainID: "", Description: this.formModel.value.description, PositiveList: this.formModel.value.positive, NegativeList: this.formModel.value.negative, ReviewStatus: curStatus};

                    obj = { DomainID: this.domainId, UpdateType: SchemaUpdateType.Intent, IDTag: "", myIntent: ei, mySlot: null, Comments: '',NewTag:'', AdminRevision: 0, OwnerAction: 0 };
                    this.allModulesService.postIS(obj).subscribe(schedules => {
                    }, error => { this.handleError(error) });
                }
                break;
            case 'Slot':
                //let st: ItemDisplay = { Name: this.formModel.value.name, Tag: this.formModel.value.tag, Description: this.formModel.value.description, Positive: this.formModel.value.positive, Negative: this.formModel.value.negative, DisplayFlag: true };
                //this.domain.Slot.push(st);


                if (this.action == 'Edit')
                {

                    if (this.domain.RequestedObject.Slot.length > 0 && this.validateTagExists(this.domain.RequestedObject.Slot, this.inputTag, this.editUtIndex)) {
                        //alert('The tag name: ' + this.inputTag + ' already exists.');
                        this.alertComponent.setAlert('The tag name: ' + this.inputTag + ' already exists.', -1);
                        this.isntNewItemActive = false;
                        return;
                    }

                    let oldTag: string = this.domain.RequestedObject.Slot[this.editUtIndex].Tag;
                    let newTag: string = this.inputTag;
                    let usingTagInput : boolean = true;

                    // for fixing lost review status issue during next, previous click
                    if(this.reviewStatus == 0 && this.domain.RequestedObject.Slot[this.editUtIndex].ReviewStatus != 0){
                      this.reviewStatus = this.domain.RequestedObject.Slot[this.editUtIndex].ReviewStatus;
                    }

                    if(this.isAdmin) {
                      this.adminResult = Number(this.suggestion.options);
                      if(this.reviewStatus % 3 == 2){
                        this.adminResult = AdminRevision.None;
                      }
                      else if(this.reviewStatus == 1 && this.isAdminAdd == true){
                        this.adminResult = AdminRevision.Add;
                      }


                      if(this.adminResult == AdminRevision.Rename) {
                        let re_space = /\s+/g;
                        this.suggestion.rename = this.suggestion.rename.trim().replace(re_space, '_');
                      }
                      if(this.adminResult == AdminRevision.Approve && this.ownerResult == OwnerAction.Delete){
                        var answer = confirm("Please confirm, as this will delete this slot item");
                        if (!answer) {
                            return;
                        }
                      }
                      if(this.reviewStatus >= 2){
                        usingTagInput = false;
                      }

                    }else if(this.isOwner) {
                      this.ownerResult = Number(this.ownerChoice);
                      if (this.ownerResult == OwnerAction.Accept && this.adminResult == AdminRevision.Delete) {
                        var answer = confirm("Please confirm, as this will delete this slot item");
                        if (!answer) {
                            return;
                        }
                      }
                      if(this.reviewStatus >= 2){
                        usingTagInput = false;
                      }
                    }

                    if(usingTagInput){
                      this.domain.RequestedObject.Slot[this.editUtIndex].Name = this.inputName;
                      this.domain.RequestedObject.Slot[this.editUtIndex].Tag = this.inputTag;
                    }
                    this.domain.RequestedObject.Slot[this.editUtIndex].Description = this.formModel.value.description;
                    this.domain.RequestedObject.Slot[this.editUtIndex].Positive = this.formModel.value.positive;
                    this.domain.RequestedObject.Slot[this.editUtIndex].Negative = this.formModel.value.negative;
                    this.domain.RequestedObject.Slot[this.editUtIndex].DisplayFlag = true;
                    let ei: EditItem = { Name: this.inputName, Tag: this.inputTag, DomainID: "", Description: this.formModel.value.description, PositiveList: this.formModel.value.positive, NegativeList: this.formModel.value.negative, ReviewStatus: this.reviewStatus };

                    if(this.isAdmin) {
                      this.adminResult = Number(this.suggestion.options);
                      if(this.suggestion.options === '2') {
                        let re_space = /\s+/g;
                        this.suggestion.rename = this.suggestion.rename.trim().replace(re_space, '_');
                      }
                    }else if(this.isOwner) {
                      this.ownerResult = Number(this.ownerChoice);
                      if (this.ownerResult === 1 && this.adminResult === 1) {
                        var answer = confirm("Please confirm, as this will delete this Slot item");
                        if (!answer) {
                            return;
                        }
                      }
                    }

                    obj = { DomainID: this.domainId, UpdateType: SchemaUpdateType.Slot, IDTag: oldTag, myIntent: null, mySlot: ei, Comments: '' ,NewTag: this.suggestion.rename, AdminRevision: this.adminResult, OwnerAction: this.ownerResult };
                    this.allModulesService.putIS(obj).subscribe(res => {
                          this.performUpdateSlot(oldTag, newTag);


                    }, error => { this.handleError(error) });
                }
                else
                {
                    if (this.domain.RequestedObject.Slot.length > 0 && this.validateTagExists(this.domain.RequestedObject.Slot, this.inputTag, -1)) {
                        //alert('The tag name: ' + this.inputTag + ' already exists.');
                        this.alertComponent.setAlert('The tag name: ' + this.inputTag + ' already exists.', -1);
                        this.isntNewItemActive = false;
                        return;
                    }
                    let curStatus: number = 0;
                    if(this.isAdmin){
                      //curStatus = 1;
                      curStatus = 2;
                    }
                    let im: ItemDisplay = { Name: this.inputName, Tag: this.inputTag, Description: this.formModel.value.description, Positive: this.formModel.value.positive, Negative: this.formModel.value.negative, DisplayFlag: true, ReviewStatus: curStatus };
                    this.domain.RequestedObject.Slot.push(im);
                    let ei: EditItem = { Name: this.inputName, Tag: this.inputTag, DomainID: "", Description: this.formModel.value.description, PositiveList: this.formModel.value.positive, NegativeList: this.formModel.value.negative, ReviewStatus: curStatus };

                    obj = { DomainID: this.domainId, UpdateType: SchemaUpdateType.Slot, IDTag: "", myIntent: null, mySlot: ei, Comments: '', NewTag:'', AdminRevision: 0, OwnerAction: 0 };
                    this.allModulesService.postIS(obj).subscribe(schedules => {
                    }, error => { this.handleError(error) });
                }
                //break;
        }
        this.adminReviewDisplay = '';
        this.isAdminAdd = false;
        this.proceedNext = true;
        this.isntNewItemActive = true;
        this.suggestion.comment = '';
        this.suggestion.rename = '';
        this.suggestion.options = '3';
        this.clearIntentSlotForm();
    }

    private checkAdminInputValid(): boolean {

      if(this.suggestion.options === '2') {
        if(this.suggestion.rename === null || this.suggestion.rename === '') {
          this.alertComponent.setAlert('please input a valid new name', -1);
          this.proceedNext = false;
          return false;
        }else if(this.item === 'Intent' && this.validateTagExists(this.domain.RequestedObject.Intent, this.suggestion.rename, this.editUtIndex)){
          this.alertComponent.setAlert('The new Intent name already exists', -1);
          this.proceedNext = false;
          return false;
        }else if(this.item === 'Slot' && this.validateTagExists(this.domain.RequestedObject.Slot, this.suggestion.rename, this.editUtIndex)){
          this.alertComponent.setAlert('The new Slot name already exists', -1);
          this.proceedNext = false;
          return false;
        }
      }
      return true;
    }

    private uploadAdminRevision(): void {

      if(this.suggestion.options === '2') {
        if(this.suggestion.rename === null || this.suggestion.rename === '') {
          this.alertComponent.setAlert('please input a valid new name', -1);
          this.proceedNext = false;
          return;
        }else if(this.item === 'Intent' && this.validateTagExists(this.domain.RequestedObject.Intent, this.suggestion.rename, -1)){
          this.alertComponent.setAlert('The new Intent name already exists', -1);
          this.proceedNext = false;
          return;
        }else if(this.item === 'Slot' && this.validateTagExists(this.domain.RequestedObject.Slot, this.suggestion.rename, -1)){
          this.alertComponent.setAlert('The new Slot name already exists', -1);
          this.proceedNext = false;
          return;
        }
      }
    let curSuggestion: BaseSuggestion = new BaseSuggestion();
    curSuggestion.DomainID = this.domainId;
    curSuggestion.SchemaUpdateType = this.item === 'Intent' ? 1 : 2;
    curSuggestion.AdminRevision = 0;

    curSuggestion.AdminRevision = Number(this.suggestion.options);
    if(this.suggestion.options === '2'){
      let re_space = /\s+/g;
      this.suggestion.rename = this.suggestion.rename.trim().replace(re_space, '_');
    }
    curSuggestion.Tag = this.inputTag;
    curSuggestion.NewTag = this.suggestion.rename;
    curSuggestion.Comments = this.suggestion.comment;
    curSuggestion.UserEmail = '';

    this.allModulesService.postAdminReview(curSuggestion).subscribe((res) => {
        //alert('The review has been submitted, thank you.');
        this.alertComponent.setAlert('The review has been submitted, thank you.', 0);
    }, error => { this.handleError(error) });

    this.isntNewItemActive = true;
    this.proceedNext = true;
    this.clearIntentSlotForm();
    }

    private performUpdateIntent(oldTag: string, newTag: string): void {

      if(this.isAdmin){
          if(this.reviewStatus % 3 === 0) {
          // situation: admin has posted a suggestion Per owner's propose
          // act: if approve, increase the status by 2, else by 1, also if approve, act per Owner's action
          let statusMessage: string = 'Review received, currently waiting for owner to accept.';

             if(this.adminResult == AdminRevision.Approve) {
              this.domain.RequestedObject.Intent[this.editUtIndex].ReviewStatus = this.reviewStatus + 2;
              statusMessage = 'Approve request send, thank you';
             }else {
               this.domain.RequestedObject.Intent[this.editUtIndex].ReviewStatus = this.reviewStatus + 1;
             }
            if (this.reviewStatus !== 0 && this.adminResult == AdminRevision.Approve) {
              this.actPerAdminRevision(SchemaUpdateType.Intent);
              statusMessage = 'Approve request sent, we will now update the data.';
            }
            this.alertComponent.setAlert(statusMessage, 0);
        }else if(this.reviewStatus % 3 === 1) {
          // situation: admin has posted a suggestion Per owner's propose
          // act: if approve, increase the status by 2, else by 1, also if approve, act per Owner's action
          let statusMessage: string = 'Update or Review received, currently waiting for owner to accept.';

          if(this.adminResult == AdminRevision.Approve) {
            this.domain.RequestedObject.Intent[this.editUtIndex].ReviewStatus = this.reviewStatus + 1;
            statusMessage = 'Approve request send, thank you';
          }else{
            this.domain.RequestedObject.Intent[this.editUtIndex].ReviewStatus = this.reviewStatus
          }

          if (this.reviewStatus !== 1 && this.adminResult == AdminRevision.Approve) {
            this.actPerAdminRevision(SchemaUpdateType.Intent);
            statusMessage = 'Approve request sent, we will now update the data.';

          }
          this.alertComponent.setAlert(statusMessage, 0);
        }else if(this.reviewStatus % 3 == 2) {
          // situation: admin has changed the intent after complete
          // act: change the status to be reviewed, and waiting for owner approval
          // change implementation: directly update for admin

          // if(newTag !== oldTag){
          //   this.alertComponent.setAlert('Modification request sent, currently waiting for owner to review.', 0);
          //   this.domain.Intent[this.editUtIndex].ReviewStatus = this.reviewStatus + 2;
          // }
          if(newTag !== oldTag){
            this.alertComponent.setAlert('The intent item has been changed', 0);
            this.domain.RequestedObject.Intent[this.editUtIndex].ReviewStatus = this.reviewStatus + 3;
            this.domain.RequestedObject.Intent[this.editUtIndex].Tag = newTag;
            this.domain.RequestedObject.Intent[this.editUtIndex].Name = this.domain.RequestedObject.Intent[this.editUtIndex].Name;
          }

        }

      }
      else if(this.isOwner){
        if(this.reviewStatus % 3 === 0) {
          // situation: owner repost the change
          // act: do not change the review status
          this.domain.RequestedObject.Intent[this.editUtIndex].ReviewStatus = this.reviewStatus;
          if(this.reviewStatus > 0){
            this.alertComponent.setAlert('Intent update request sent, currently waiting for admin to review.', 0);
          }

        }else if(this.reviewStatus % 3 === 1) {

          this.domain.RequestedObject.Intent[this.editUtIndex].ReviewStatus = this.reviewStatus + 1;
          if(this.ownerResult == OwnerAction.Accept) {
            if(this.adminResult == AdminRevision.Delete) { //delete
              this.domain.RequestedObject.Intent.splice(this.editUtIndex, 1);

            }else if(this.adminResult == AdminRevision.Rename) { // rename
              this.domain.RequestedObject.Intent[this.editUtIndex].Tag = this.baseSuggestion.NewTag;
              this.domain.RequestedObject.Intent[this.editUtIndex].Name = this.domain.RequestedObject.Intent[this.editUtIndex].Tag.replace('_', ' ');
            }
          }else if(this.ownerResult == OwnerAction.Reject && this.adminResult == AdminRevision.Add){
            this.domain.RequestedObject.Intent.splice(this.editUtIndex, 1);
          }

        }else if(this.reviewStatus % 3 === 2) {
          // situation: after review complete, owner changed the slot, for the second time.
          // act: 1. if no tag name is not changed, directly modify.
          //      2. else if tag is changed, propose for admin's approval
          if(oldTag === newTag){
            this.domain.RequestedObject.Intent[this.editUtIndex].ReviewStatus = this.reviewStatus
          }else{
            this.domain.RequestedObject.Intent[this.editUtIndex].ReviewStatus = this.reviewStatus + 1;
          }
          if(newTag !== oldTag){
            this.alertComponent.setAlert('Intent update request sent, currently waiting for admin to review.', 0);
          }
        }
      }
      this.ownerChoice = '1';
      this.adminResult = 0;
      this.reviewStatus = 0;
      this.ownerResult = 0;
    }

    private performUpdateSlot(oldTag: string, newTag: string): void {

      if(this.isAdmin){
        if(this.reviewStatus % 3 === 0) {
     // situation: admin has posted a suggestion Per owner's propose
     // act: if approve, increase the status by 2, else by 1, also if approve, act per Owner's action
        let statusMessage: string = 'Review received, currently waiting for owner to accept.';

        if(this.adminResult == AdminRevision.Approve) {
         this.domain.RequestedObject.Slot[this.editUtIndex].ReviewStatus = this.reviewStatus + 2;
         statusMessage = 'Approve request send, thank you';
        }else {
          this.domain.RequestedObject.Slot[this.editUtIndex].ReviewStatus = this.reviewStatus + 1;
        }

        if (this.reviewStatus !== 0 && this.adminResult === 3) {
          this.actPerAdminRevision(SchemaUpdateType.Slot);
          statusMessage = 'Approve request sent, we will now update the data.';
        }
        this.alertComponent.setAlert(statusMessage, 0);
        }else if(this.reviewStatus % 3 === 1) {
          // situation: admin has posted a suggestion Per owner's propose
          // act: if approve, increase the status by 2, else by 1, also if approve, act per Owner's action
          let statusMessage: string = 'Review received, currently waiting for owner to accept.';

          if(this.adminResult == AdminRevision.Approve) {
            this.domain.RequestedObject.Slot[this.editUtIndex].ReviewStatus = this.reviewStatus + 1;
            statusMessage = 'Approve request send, thank you';
          }else{
            this.domain.RequestedObject.Slot[this.editUtIndex].ReviewStatus = this.reviewStatus
          }

          if (this.reviewStatus !== 1 && this.adminResult === 3) {
            this.actPerAdminRevision(SchemaUpdateType.Slot);
            statusMessage = 'Approve request sent, we will now update the data.';
          }
          this.alertComponent.setAlert(statusMessage, 0);
        }else if(this.reviewStatus % 3 === 2) {
          // situation: admin has changed the slot after complete
          // act: change the status to be reviewed, and waiting for owner approval
          if(newTag !== oldTag){
            this.alertComponent.setAlert('The slot item has been changed', 0);
            this.domain.RequestedObject.Slot[this.editUtIndex].ReviewStatus = this.reviewStatus + 3;
            this.domain.RequestedObject.Slot[this.editUtIndex].Tag = newTag;
            this.domain.RequestedObject.Slot[this.editUtIndex].Name = this.domain.RequestedObject.Slot[this.editUtIndex].Tag.replace('_', ' ');
          }

        }
      }
      else if(this.isOwner){
        if(this.reviewStatus % 3 === 0) {
          // situation: owner repost the change
          // act: do not change the review status
          this.domain.RequestedObject.Slot[this.editUtIndex].ReviewStatus = this.reviewStatus;
          if(this.reviewStatus > 0){
            this.alertComponent.setAlert('Intent update request sent, currently waiting for admin to review.', 0);
          }

        }else if(this.reviewStatus % 3 === 1) {

          this.domain.RequestedObject.Slot[this.editUtIndex].ReviewStatus = this.reviewStatus + 1;
          if(this.ownerResult === 1) {
            if(this.adminResult === 1) { //delete
              this.domain.RequestedObject.Slot.splice(this.editUtIndex, 1);

            }else if(this.adminResult === 2) { // rename
              this.domain.RequestedObject.Slot[this.editUtIndex].Tag = this.baseSuggestion.NewTag;
              this.domain.RequestedObject.Slot[this.editUtIndex].Name = this.domain.RequestedObject.Slot[this.editUtIndex].Tag.replace('_', ' ');
            }
          }else if(this.ownerResult === 2 && this.adminResult === 4){
            this.domain.RequestedObject.Slot.splice(this.editUtIndex, 1);
          }

        }else if(this.reviewStatus % 3 === 2) {
          // situation: after review complete, owner changed the slot, for the second time.
          // act: 1. if no tag name is not changed, directly modify.
          //      2. else if tag is changed, propose for admin's approval
          if(oldTag === newTag){
            this.domain.RequestedObject.Slot[this.editUtIndex].ReviewStatus = this.reviewStatus
          }else{
            this.domain.RequestedObject.Slot[this.editUtIndex].ReviewStatus = this.reviewStatus + 1;
          }
          if(newTag !== oldTag){
            this.alertComponent.setAlert('Slot update request sent, currently waiting for admin to review.', 0);
          }
        }
      }
      this.ownerChoice = '1';
      this.adminResult = 0;
      this.reviewStatus = 0;
      this.ownerResult = 0;
    }

    private actPerAdminRevision(updateType: SchemaUpdateType): void {
      if(updateType === SchemaUpdateType.Intent){
        if( this.ownerResult == OwnerAction.Delete) {
          this.domain.RequestedObject.Intent.splice(this.editUtIndex, 1);
        }else if (this.ownerResult == OwnerAction.Rename) {
          this.domain.RequestedObject.Intent[this.editUtIndex].Tag = this.baseSuggestion.NewTag;
          this.domain.RequestedObject.Intent[this.editUtIndex].Name = this.domain.RequestedObject.Intent[this.editUtIndex].Tag.replace('_', ' ');
        }
      }else if(updateType === SchemaUpdateType.Slot){
        if( this.ownerResult == OwnerAction.Delete) {
          this.domain.RequestedObject.Slot.splice(this.editUtIndex, 1);
        }else if (this.ownerResult == OwnerAction.Rename) {
          this.domain.RequestedObject.Slot[this.editUtIndex].Tag = this.baseSuggestion.NewTag;
          this.domain.RequestedObject.Slot[this.editUtIndex].Name = this.domain.RequestedObject.Slot[this.editUtIndex].Tag.replace('_', ' ');
        }
      }
    }


    previousClick() {
        if (!this.readOnly) {
          this.newItemSubmit();
        }
        if (!this.proceedNext) {
          //this.proceedNext = true;
          return;
        }
        this.clearIntentSlotForm();
        this.editUtIndex = this.editUtIndex - 1;
        this.editClick(this.item, this.editUtIndex);
    }

    nextClick() {
        if (!this.readOnly) {
          this.newItemSubmit();
        }
        if (!this.proceedNext) {
          //this.proceedNext = true;
          return;
        }
        this.clearIntentSlotForm();
        if (this.action === 'Edit') {
          this.editUtIndex = this.editUtIndex + 1;
          this.editClick(this.item, this.editUtIndex);
        }else {
            this.createNewItem(this.item);
        }
    }

    deleteDomainClick(): any {
        var answer = confirm("Do you want to delete the domain?");
        if (!answer)
        {
            document.getElementById('DeleteButton').blur();
            return;
        }
        //console.log('delete Domain');
        this.allModulesService.deleteSchema(this.domain.RequestedObject.DomainID).subscribe(() => {
            this.myrouter.navigate(['module']);
        }, error => { this.handleError(error) },
            () => alert("Your Domain has been deleted, now redirect you to the dashboard")
            //() => this.alertComponent.setAlert('Your Domain has been deleted, now redirect you to the dashboard', 0)
        );
        //window.location.reload(true);
    }

    reviewUtter(): any {
        this.myrouter.navigate(['utterance']);
    }

    newDomainSubmit(): any {

        this.domain.RequestedObject.Name = this.domain_name;
        this.domain.RequestedObject.Description = this.formDomain.value.description;

        if (this.domain.RequestedObject.Name == null || this.domain.RequestedObject.Name.length == 0) {
            //alert("Please input valid Model Name");
            this.alertComponent.setAlert('Please input valid Model Name', -1);
            return;
        } else if (this.domain.RequestedObject.Description == null || this.domain.RequestedObject.Description.length == 0) {
            //alert("Please input valid Model Description");
            this.alertComponent.setAlert('Please input valid Model Description.', -1);
            return;
        }
        this.isntNewItemActive = true;

        // call serveice
        if (this.action === 'Edit') {
            const obj: EditDomain = {
                DomainName: this.domain.RequestedObject.Name,
                Description: this.domain.RequestedObject.Description,
                DomainID: this.domain.RequestedObject.DomainID,
                InDevelopment: true,
                InPending: this.domain.RequestedObject.InPending,
                IsOwner: this.isOwner
            };

            this.allModulesService.putSchema(obj).subscribe(module => {


            }, error => { this.handleError(error) });
        }
    }

    editDomainClick(): any {
        this.formDomain = new FormGroup({
            'name': new FormControl(this.domain.RequestedObject.Name),
            'description': new FormControl(this.domain.RequestedObject.Description)
        });

        /*
        if(!this.isOwner){
            this.formDomain.controls['name'].disable();
            this.formDomain.controls['description'].disable();
        }
        */
        this.domain_name = this.domain.RequestedObject.Name;

        this.isntNewItemActive = false;
        this.item = 'Domain';
        this.action = 'Edit';
    }


    copyValueToFormArray(array): FormArray {
        let result: FormArray = null;

        let i: number;
        for (i = 0; i < array.length; i++) {
            if (i == 0)
                result = new FormArray([new FormControl(array[0])]);
            else
                result.push(new FormControl(array[i]));
        }

        return result || new FormArray([new FormControl('')]);
    }

    editClick(field: string, index) {

        let tag: string = field === 'Intent' ? this.domain.RequestedObject.Intent[index].Tag : this.domain.RequestedObject.Slot[index].Tag;
        this.allModulesService.getReviewData(this.domainId, tag, field)
        .subscribe((data) => {

            // assign info for desplay

            this.baseSuggestion = data;
            this.adminResult = data.AdminRevision;
            this.ownerResult = data.OwnerAction;
            this.reviewStatus = data.ReviewStatus;
            this.reviewerEmail = data.UserEmail;
            this.statusMessage = data.StatusMessage;
            this.nameDescriptionReadOnly = false;

            if (field === 'Intent') {
              this.domain.RequestedObject.Intent[index].ReviewStatus = this.reviewStatus;
            }else {
              this.domain.RequestedObject.Slot[index].ReviewStatus = this.reviewStatus;
            }
            if(this.isAdmin) {
              if (this.reviewStatus % 3 != 2) {
                  if( this.reviewStatus % 3 == 1 && this.baseSuggestion.AdminRevision === AdminRevision.Add ) {
                    this.isAdminAdd = true;
                    this.adminReviewDisplay = 'You have add this ' + field;
                  }else {
                    this.isAdminAdd = false;
                    this.suggestion.options = this.baseSuggestion.AdminRevision.toString() == '0' ? '3': this.baseSuggestion.AdminRevision.toString() ;
                    this.suggestion.rename = this.reviewStatus === 0 ? tag : this.baseSuggestion.NewTag;
                    this.suggestion.comment = this.baseSuggestion.Comments;
                    this.nameDescriptionReadOnly = true;
                  }
              }else { //review completed
                 this.adminReviewDisplay = 'Review complete';
              }

              if(this.reviewStatus % 3 != 2 && !this.isAdminAdd) {
                this.adminChoiceDesplay = true;
              }else if(this.reviewStatus % 3 == 2){
                this.completeDesplay = true;
              }

            }else if (this.isOwner) {
                if (this.reviewStatus % 3 == 1) {

                  this.ownerInfoDesplay = true;
                  this.nameDescriptionReadOnly = true;
                  switch (this.baseSuggestion.AdminRevision) {
                    case AdminRevision.Delete: {
                      this.adminReviewDisplay = 'Please delete this intent';
                       break;
                    }
                    case AdminRevision.Rename: {
                       this.adminReviewDisplay = 'Please rename to ' + this.baseSuggestion.NewTag;
                       break;
                    }
                    case AdminRevision.Add: {
                       this.adminReviewDisplay = 'Admin added this ' + field + ', please review';
                       break;
                    }
                    default: {
                       console.log('invalid choice');
                       break;
                    }
                  }
                  this.suggestion.comment = this.baseSuggestion.Comments;
                  this.suggestion.rename = (this.baseSuggestion.NewTag || '');
                }else if(this.reviewStatus % 3 == 2) { //review completed
                  this.adminReviewDisplay = 'Review complete';
                  this.completeDesplay = true;
                }
            }

        },
        error => { this.handleError(error);
                    this.isntNewItemActive = !this.isntNewItemActive;
                    return; }
      );

        if (field == 'Intent') {
            this.formModel = new FormGroup({
                'name': new FormControl(this.domain.RequestedObject.Intent[index].Name),
                'tag': new FormControl(this.domain.RequestedObject.Intent[index].Tag),
                'description': new FormControl(this.domain.RequestedObject.Intent[index].Description),
                'positive': this.copyValueToFormArray(this.domain.RequestedObject.Intent[index].Positive),
                'negative': this.copyValueToFormArray(this.domain.RequestedObject.Intent[index].Negative)
            });
            this.inputName = this.domain.RequestedObject.Intent[index].Name;
            this.inputTag = this.domain.RequestedObject.Intent[index].Tag;
            this.suggestion.rename = this.domain.RequestedObject.Intent[index].Tag;
            this.parseInputName();
        }
        else {
            this.formModel = new FormGroup({
                'name': new FormControl(this.domain.RequestedObject.Slot[index].Name),
                'tag': new FormControl(this.domain.RequestedObject.Slot[index].Tag),
                'description': new FormControl(this.domain.RequestedObject.Slot[index].Description),
                'positive': this.copyValueToFormArray(this.domain.RequestedObject.Slot[index].Positive),
                'negative': this.copyValueToFormArray(this.domain.RequestedObject.Slot[index].Negative)
            });
            this.inputName = this.domain.RequestedObject.Slot[index].Name;
            this.inputTag = this.domain.RequestedObject.Slot[index].Tag;
            this.suggestion.rename = this.domain.RequestedObject.Slot[index].Tag;
            this.parseInputName();
        }
        this.isntNewItemActive = false;
        this.item = field;
        this.action = 'Edit';
        this.editUtIndex = index;
    }

    deleteClick(field: string, index) {

        var answer = confirm("Are you sure to delete this item?")
        if (!answer) {
            let element: string = (field == "Intent") ? "delete_intent_" + index : "delete_slot_" + index;
            document.getElementById(element).blur();
            return;
        }
        if(this.isAdmin) {
          this.adminResult = AdminRevision.Delete;
        }else if(this.isOwner) {
          this.ownerResult = OwnerAction.Delete;
        }

        let obj: UpdateItem;
        if (field == 'Intent') {
            obj = { DomainID: this.domain.RequestedObject.DomainID, UpdateType: SchemaUpdateType.Intent, IDTag: this.domain.RequestedObject.Intent[index].Tag, myIntent: null, mySlot: null, Comments: '' , NewTag:'', AdminRevision: this.adminResult, OwnerAction: this.ownerResult };
            //if(deleteItem) this.domain.Intent.splice(index, 1);
        }
        else {
            obj = { DomainID: this.domainId, UpdateType: SchemaUpdateType.Slot, IDTag: this.domain.RequestedObject.Slot[index].Tag, myIntent: null, mySlot: null, Comments: '' ,NewTag:'', AdminRevision: 0, OwnerAction: 0 };
            //if(deleteItem) this.domain.Slot.splice(index, 1);
        }
        this.allModulesService.deleteIS(obj).subscribe((res) => {
            console.log(res);
            let statusMessage = 'The item has been deleted';
            if(res === 'false'){
              statusMessage = "The delete propose has been sent, waiting for admin's review";
              let element: string = (field == "Intent") ? "delete_intent_" + index : "delete_slot_" + index;
              document.getElementById(element).blur();
              this.updateStatusAfterDelete(field, index);
            }else{
              if (field == 'Intent') {
                this.domain.RequestedObject.Intent.splice(index, 1);
              }else{
                this.domain.RequestedObject.Slot.splice(index, 1);
              }
            }
            this.alertComponent.setAlert(statusMessage, 0);
        }, error => {
          this.handleError(error);
          let element: string = (field == "Intent") ? "delete_intent_" + index : "delete_slot_" + index;
          document.getElementById(element).blur();
        });
    }
    updateStatusAfterDelete(field: string, index: number): void{
      if (field === 'Intent') {
        if(this.domain.RequestedObject.Intent[index].ReviewStatus % 3 == 2){
          if(this.isAdmin){
            this.domain.RequestedObject.Intent[index].ReviewStatus += 2;
          }else{
            this.domain.RequestedObject.Intent[index].ReviewStatus += 1;
          }
        }
      }else {
        if(this.domain.RequestedObject.Slot[index].ReviewStatus % 3 == 2){
          if(this.isAdmin){
            this.domain.RequestedObject.Slot[index].ReviewStatus += 2;
          }else{
            this.domain.RequestedObject.Slot[index].ReviewStatus += 1;
          }
        }
      }
    }
    handleError(error: ErrorMessage) {
      if (error.status === 401) {
        this.alertComponent.setAlert('Authorization has been denied, please refresh the page to re-new your session.', -1);
      }else {
        this.alertComponent.setAlert(error.message, -1);
      }
        //alert(error.message);
    }

    validateTagExists(obj: Array<ItemDisplay>, tag: string, index: number): boolean {
        let result: boolean = false;
        let i: number;

        for (i = 0; i < obj.length; i++) {
            if (i == index) continue;
            if (obj[i].Tag.toLowerCase().trim() === tag.toLowerCase().trim()) {
                result = true;
                break;
            }
        }

        return result;
    }

    closeWindow() {
        this.isntNewItemActive = true;
        this.clearDomainForm();
        this.clearIntentSlotForm();
    }

    clearDomainForm() {
        this.formDomain = new FormGroup({
            'name': new FormControl(),
            'tag': new FormControl(),
            'description': new FormControl()
        });
    }

    clearIntentSlotForm() {
        this.inputName = '';
        this.inputTag = '';
        this.completeDesplay = false;
        this.adminChoiceDesplay = false;
        this.ownerInfoDesplay = false;
        this.formModel = new FormGroup({
            'name': new FormControl(),
            'tag': new FormControl(),
            'description': new FormControl(),
            positive: new FormArray([
                new FormControl()
            ]),
            negative: new FormArray([
              new FormControl()
          ])
        });
    }

    parseInputName() {
        var re_space = /\s+/g;
        this.inputTag = this.inputName.replace(re_space, "_");
    }

    valideTag() {
      var letters = /^[A-Za-z0-9_]+$/g;

      if(!this.inputTag.match(letters))
      {
        //this.alertComponent.setAlert('Tag name ' + this.inputTag + ' is invalid', -1);
        return false;
      }
      return true;
    }

    parseDomainName() {
        let re_letter_only = /[^a-zA-Z0-9_]/g;
        this.domain_name = this.domain_name.replace(re_letter_only, "");
    }

    getTagColor(field: string, index) {
      let curStatus = 0;
      if (field === 'Intent') {
        curStatus = this.domain.RequestedObject.Intent[index].ReviewStatus;
      }else {
        curStatus = this.domain.RequestedObject.Slot[index].ReviewStatus;
      }
      if (curStatus % 3 === 0) {
        return 'red';
      } else if (curStatus % 3 === 1) {
        return 'green';
      } else {
        return 'black';
      }
    }

    returnToModelsPage() {
      // if (Number(this.domainId) < 500) {
      //   this.myrouter.navigate(['lfmodel']);
      // }else {
      //   this.myrouter.navigate(['module']);
      // }
      this.myrouter.navigate(['module']);
    }

}
