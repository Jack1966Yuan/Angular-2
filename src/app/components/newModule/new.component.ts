import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, FormArray } from '@angular/forms';
import { AllModulesService } from '../../services/modules.service';
import { DomainDetail, Item, ItemDisplay, DomainDetailDisplay, EditDomain,
          EditItem, UpdateItem, NewModuleItem, ErrorMessage, UserType } from '../../models/objects';
import { Router } from '@angular/router';
import { AlertComponent } from '../alert/alert.component';
import { FocusDirective } from '../../directive/focus.directive';

@Component({
    selector: 'new-comp',
    templateUrl: './new.component.html',
    styleUrls: ['./new.component.css']
})

export class NewModule {
    isntNewItemActive: boolean;
    isntEditItemActive: boolean;
    //isntUtteranceActive: boolean;
    //mycurrentEditItem: currentEditItem;
    item: string;
    action: string;

    formModel: FormGroup;
    formDomain: FormGroup;

    newSkill: DomainDetailDisplay;
    domainID: number;
    editIndex: number;
    domain_name: string;
    domain_description: string;
    intent_name: string;
    intent_tag: string;
    intent_description: string;
    inputName: string;
    inputTag: string;
    //positive_intents: string[] = [];
    @ViewChild('myAlert') alertComponent: AlertComponent;
    @ViewChild('domainFocus') domainFocus: FocusDirective;
    @ViewChild('intentFocus') intentFocus: FocusDirective;

    constructor(private router: Router, private allModulesService: AllModulesService) {
        this.isntNewItemActive = true;
        this.isntEditItemActive = true;
        this.inputName = '';
        this.inputTag = '';

        this.formModel = new FormGroup({
            'name': new FormControl(),
            //'tag': new FormControl(),
            'description': new FormControl(),
            positive: new FormArray([
                new FormControl()
            ])
            // negative: new FormArray([
            //     new FormControl()
            // ])
        });

        this.formDomain = new FormGroup({
            'name': new FormControl(),
            'description': new FormControl()
        });
    }

    addPositive(): any {
        const positive = this.formModel.get('positive') as FormArray;
        positive.push(new FormControl());
    }

    removePositive(i): any {
        const positive = this.formModel.get('positive') as FormArray;
        positive.removeAt(i);
    }

    /*
    removeNegative(i): any {
        const negative = this.formModel.get('negative') as FormArray;
        negative.removeAt(i);
    }

    addNegative(): any {
        const negative = this.formModel.get('negative') as FormArray;
        negative.push(new FormControl());
    }
    */

    createNewItem(field: string): any {
        this.isntNewItemActive = !this.isntNewItemActive;
        this.item = field;
        this.action = 'New';

        if (field == 'Domain') {
          this.domainFocus.setFocus();
        }else {
          this.intentFocus.setFocus();
        }
    }


    submit(): any {

        var element = <HTMLInputElement>document.getElementById('submitButton');

        let obj: NewModuleItem = { DomainName: this.newSkill.Name, Description: this.newSkill.Description, IntentList: [], SlotList: [], DomainID: '' };

        if ((this.newSkill.Intent == null || this.newSkill.Intent.length == 0) && (this.newSkill.Slot == null || this.newSkill.Slot.length == 0))
        {
            this.alertComponent.setAlert('Please add at least one intent or slot', -1);
            //alert("Please add at least one intent or slot");
            return;
        }

        this.newSkill.Intent.map(item => {
            obj.IntentList.push({
                Name: item.Name, Tag: item.Tag, Description: item.Description, PositiveList: item.Positive, NegativeList: [], DomainID: '', ReviewStatus: 0,
            });
        });
        this.newSkill.Slot.map(item => {
            obj.SlotList.push({
                Name: item.Name, Tag: item.Tag, Description: item.Description, PositiveList: item.Positive, NegativeList: [], DomainID: '', ReviewStatus: 0
            });
        });

        element.disabled = true;
        this.allModulesService.postSchema(obj).subscribe(schedules => {
            this.router.navigate(['module']);
        },
            error => { 
                this.handleError(error);
                element.disabled = false;
            },
             //() => this.alertComponent.setAlert("The Domain has been successfully submitted, you can view it in the dashboard now"),
            () => { alert("The Domain has been successfully submitted, you can view it in the dashboard now") }
        );

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

    newItemSubmit(): any {
        if (this.inputTag == null || this.inputTag.length == 0) {
            this.alertComponent.setAlert('Please define a valid name', -1);
            //alert("Please define a valid name");
            return;
        }

        let obj: UpdateItem;
        switch (this.item) {
            case 'Intent':

                if (this.action == 'New') {

                    if (this.newSkill.Intent.length > 0 && this.validateTagExists(this.newSkill.Intent, this.inputTag, -1)) {
                        this.alertComponent.setAlert('The tag name: ' + this.inputTag + ' already exists.', -1);
                        //alert('The tag name: ' + this.inputTag + ' already exists.');
                        this.isntNewItemActive = false;
                        return;
                    }

                    let im: ItemDisplay = { Name: this.inputName, Tag: this.inputTag, Description: this.formModel.value.description, Positive: this.formModel.value.positive, Negative: [], DisplayFlag: true, ReviewStatus: 0 };
                    this.newSkill.Intent.push(im);

                } else {

                    if (this.newSkill.Intent.length > 0 && this.validateTagExists(this.newSkill.Intent, this.inputTag, this.editIndex)) {
                        //alert('The tag name: ' + this.inputTag + ' already exists.');
                        this.alertComponent.setAlert('The tag name: ' + this.inputTag + ' already exists.', -1);
                        this.isntNewItemActive = false;
                        return;
                    }

                    let oldTag: string = this.newSkill.Intent[this.editIndex].Tag;
                    this.newSkill.Intent[this.editIndex].Name = this.inputName;
                    this.newSkill.Intent[this.editIndex].Tag = this.inputTag;
                    this.newSkill.Intent[this.editIndex].Description = this.formModel.value.description;
                    this.newSkill.Intent[this.editIndex].Positive = this.formModel.value.positive;
                    this.newSkill.Intent[this.editIndex].Negative = this.formModel.value.negative;
                    this.newSkill.Intent[this.editIndex].DisplayFlag = true;
                }
                break;
            case 'Slot':

                if (this.action === 'New') {

                    if (this.newSkill.Slot.length > 0 && this.validateTagExists(this.newSkill.Slot, this.inputTag, -1)) {
                        //alert('The tag name: ' + this.inputTag + ' already exists.');
                        this.alertComponent.setAlert('The tag name: ' + this.inputTag + ' already exists.', -1);
                        this.isntNewItemActive = false;
                        return;
                    }

                    let st: ItemDisplay = { Name: this.inputName, Tag: this.inputTag, Description: this.formModel.value.description, Positive: this.formModel.value.positive, Negative: [], DisplayFlag: true, ReviewStatus: 0 };
                    this.newSkill.Slot.push(st);
                } else {

                    if (this.newSkill.Slot.length > 0 && this.validateTagExists(this.newSkill.Slot, this.inputTag, this.editIndex)) {
                        //alert('The tag name: ' + this.inputTag + ' already exists.');
                        this.alertComponent.setAlert('The tag name: ' + this.inputTag + ' already exists.', -1);
                        this.isntNewItemActive = false;
                        return;
                    }

                    let oldTag: string = this.newSkill.Slot[this.editIndex].Tag;
                    this.newSkill.Slot[this.editIndex].Name = this.inputName;
                    this.newSkill.Slot[this.editIndex].Tag = this.inputTag;
                    this.newSkill.Slot[this.editIndex].Description = this.formModel.value.description;
                    this.newSkill.Slot[this.editIndex].Positive = this.formModel.value.positive;
                    this.newSkill.Slot[this.editIndex].Negative = this.formModel.value.negative;
                    this.newSkill.Slot[this.editIndex].DisplayFlag = true;

                    let im: ItemDisplay = { Name: this.inputName, Tag: this.inputTag, Description: this.formModel.value.description, Positive: this.formModel.value.positive, Negative: [], DisplayFlag: true, ReviewStatus: 0 };
                }
                break;
        }
        this.isntNewItemActive = true;
        this.clearIntentSlotForm();
    }

    newDomainSubmit(): any {

        if (this.domain_name == null || this.domain_name.length == 0) {
            this.alertComponent.setAlert('Please input valid Model Name', -1);
            //alert("Please input valid Model Name");
            return;
        } else if (this.formDomain.value.description == null || this.formDomain.value.description.length == 0){
            //alert("Please input valid Model Description");
            this.alertComponent.setAlert('Please input valid Model Description', -1);
            return;
        }
        if (this.action === 'New') {
            this.newSkill = {
                DomainID: '',
                Name: this.domain_name,
                Description: this.formDomain.value.description,
                DisplayFlag: true,
                Intent: [],
                Slot: [],
                UserType: 1,
                InPending: 0
            };

        } else {
            this.newSkill.Name = this.domain_name;
            this.newSkill.Description = this.formDomain.value.description;
            this.newSkill.DisplayFlag = true;
            this.newSkill.InPending = 0;
        }

        this.isntNewItemActive = true;
    }

    editDomainClick(): any {

        this.formDomain = new FormGroup({
            'name': new FormControl(this.newSkill.Name),
            'description': new FormControl(this.newSkill.Description)
        });
        this.isntNewItemActive = false;
        this.item = 'Domain';
        this.action = 'Edit';
    }


    copyValueToFormArray(array): FormArray {
        let result: FormArray = null;

        if (!array) return new FormArray([new FormControl()]);

        let i: number;
        for (i = 0; i < array.length; i++) {
            if (i == 0)
                result = new FormArray([new FormControl(array[0])]);
            else
                result.push(new FormControl(array[i]));
        }

        return result;
    }

    previousClick() {
        this.newItemSubmit();
        this.editClick(this.item, --this.editIndex);
    }

    nextClick() {
        if (this.inputTag == null || this.inputTag.length == 0) {
          this.alertComponent.setAlert('Please define a valid name', -1);
          //alert("Please define a valid name");
          return;
        }
        this.newItemSubmit();
        if (this.action == 'Edit')
        this.editClick(this.item, ++this.editIndex);
        else {
            this.createNewItem(this.item);
        }
    }

    editClick(field, index) {
        if (field == 'Intent') {
            this.formModel = new FormGroup({
                'name': new FormControl(this.newSkill.Intent[index].Name),
                //'tag': new FormControl(this.newSkill.Intent[index].Tag),
                'description': new FormControl(this.newSkill.Intent[index].Description),
                'positive': this.copyValueToFormArray(this.newSkill.Intent[index].Positive),
                'negative': this.copyValueToFormArray(this.newSkill.Intent[index].Negative)
            });
            this.inputName = this.newSkill.Intent[index].Name;
            this.parseInputName();
        }
        else {
            this.formModel = new FormGroup({
                'name': new FormControl(this.newSkill.Slot[index].Name),
                //'tag': new FormControl(this.newSkill.Slot[index].Tag),
                'description': new FormControl(this.newSkill.Slot[index].Description),
                'positive': this.copyValueToFormArray(this.newSkill.Slot[index].Positive),
                'negative': this.copyValueToFormArray(this.newSkill.Slot[index].Negative)
            });
            this.inputName = this.newSkill.Slot[index].Name;
            this.parseInputName();
        }
        this.isntNewItemActive = false;
        this.item = field;
        this.action = 'Edit';
        this.editIndex = index;
    }

    deleteClick(field, index) {

        var answer = confirm("Are you sure to delete this item?")
        if (!answer) {
            let element: string = (field == "Intent") ? "delete_intent_" + index : "delete_slot_" + index;
            //console.log(element);
            document.getElementById(element).blur();
            return;
        }

        if (field == 'Intent') {
            this.newSkill.Intent.splice(index, 1);
        }
        else {
            this.newSkill.Slot.splice(index, 1);
        }
    }

    handleError(error: ErrorMessage) {
        if (error.status === 401) {
            this.alertComponent.setAlert('Authorization has been denied, please refresh the page to re-new your session.', -1);
          }else {
            this.alertComponent.setAlert(error.message, -1);
          }
    }

    closeWindow() {
        this.isntNewItemActive = true;
        this.clearDomainForm();
        this.clearIntentSlotForm();
    }

    clearDomainForm() {
        this.formDomain = new FormGroup({
            'name': new FormControl(),
            'description': new FormControl()
        });
    }

    clearIntentSlotForm() {
        this.inputName = "";
        this.inputTag = "";
        this.formModel = new FormGroup({
            'name': new FormControl(),
            //'tag': new FormControl(),
            'description': new FormControl(),
            positive: new FormArray([
                new FormControl()
            ])
        });
    }

    parseInputName() {
        let re_space = /\s+/g;
        this.inputTag = this.inputName.replace(re_space, "_");
    }

    parseDomainName() {
        let re_letter_only = /[^a-zA-Z0-9_]/g;
        this.domain_name = this.domain_name.replace(re_letter_only, "");
    }
}
