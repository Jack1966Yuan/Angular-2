import { Component, ViewChild } from '@angular/core';
import * as FileSaver from 'file-saver';
import { AllModulesService } from '../../services/modules.service';
import { UtterRules, HotfixItem, Annotation, SlotAction, Rules, Hotfix, ErrorMessage, UserType } from '../../models/objects';
import { ReactiveFormsModule, FormControl, FormGroup, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { QueryComponent } from '../query/query.component';
import { AlertComponent } from '../alert/alert.component';
import { UploadComponent } from '../upload/upload.component';

@Component({
    selector: 'utter-comp',
    templateUrl: './utterance.component.html',
    styleUrls: ['./utterance.component.css']
})

export class Utterance {

    domainID: string;
    utterRule: UtterRules;
    ruleChanged: boolean;
    isRuleActive: boolean;
    isLexiconActive: boolean;
    isPatternActive: boolean;
    isIntentActive: boolean;
    isSlotActive: boolean;

    isNewUtteranceActive: boolean;
    isnew: boolean;
    lexiconTip: string;
    patternTip: string;
    intentTip: string;
    slotTip: string;

    formLexicon: FormGroup;
    formPattern: FormGroup;
    formIntent: FormGroup;
    formSlot: FormGroup;

    readOnly: boolean;
    uploadActive: boolean;

    @ViewChild('myQueryComponent') queryComponent: QueryComponent;
    @ViewChild('myAlert') alertComponent: AlertComponent;

    constructor(private router: ActivatedRoute, private myrouter: Router, private allModulesService: AllModulesService) {
        this.domainID = this.router.snapshot.params['id'];
        this.ruleChanged = false;
        this.isNewUtteranceActive = true;

        this.isRuleActive = false;
        this.isLexiconActive = false;
        this.isPatternActive = false;
        this.isIntentActive = false;
        this.isSlotActive = false;

        this.lexiconTip = "Lexicon Variable is being used to group a bunch of words serving same purpose together. Please create Lexicon First before the rest of three. Click see more details";
        this.patternTip = "Pattern Variable is being using to defined a Sentence Pattern, please create Pattern first before defining intnet and slot. Click see more details";
        this.intentTip = "Intent Variable defines the Intent your Model needs to identify. It consists of a sentence Pattern. Click see more details";
        this.slotTip = "Slot Variable defines the slot your model needs to tag. Click see more details";

        this.closeAllForm();
        this.readOnly = false;
        this.uploadActive = false;
    }

    ngOnInit(): any {
        //console.log('ngOnInit');
        this.allModulesService.getUtterance(this.domainID).subscribe(modules => {
            this.utterRule = modules;
            this.utterRule.SlotList.unshift({ Name: "UnTag", Tag: "UnTag" });
            if (this.utterRule.UserType === UserType.Reader) {
              this.readOnly = true;
            }
        }, error => { this.handleError(error); });
    }

    textAreaChange(): any {
        //console.log(this.utterRule.Rules);
        this.ruleChanged = true;
    }

    returnModuleDetail(): any {
        if (this.ruleChanged) {
            if (this.utterRule.Rules.trim().length == 0) {
                this.allModulesService.deleteRule(this.domainID).subscribe(() => {
                    this.myrouter.navigate(['detail', this.domainID]);
                }, error => { this.handleError(error) });
            }
            else {
                let obj: Rules = { DomainID: this.domainID, Content: this.utterRule.Rules.trim() }
                this.allModulesService.updateRule(obj).subscribe(() => {
                    this.myrouter.navigate(['detail', this.domainID]);
                }, error => { this.handleError(error) });
            }
            this.ruleChanged = false;
        }
        else
            this.myrouter.navigate(['detail', this.domainID]);
    }

    createUtterance(): any {
        this.isnew = true;
        this.isNewUtteranceActive = false;
	}

    deleteUtteranceClick(index: number): any {

        var answer = confirm("Are you sure to delete this hotfix item?")
        if (!answer) {
            let element: string  = "delete_hotfix_" + index;
            document.getElementById(element).blur();
            return;
        }

        let hot: Hotfix = { Intent: '', DomainID: this.domainID, Sentence: this.utterRule.HotfixList[index].Sentence, SlotString: "" };
        this.utterRule.HotfixList.splice(index, 1);

        this.allModulesService.deleteHotfix(hot).subscribe(it => {
        });
    }

    editUtteranceClick(index: number): any {
        this.queryComponent.editUtteranceClick(index);
        this.isnew = false;
        this.isNewUtteranceActive = false;
    }

    importHotfix() {
        this.uploadActive = true;
    }

    exportHotfix() {

        document.getElementById("ExportButton").blur();
        var today = new Date();
        //var date = today.toLocaleDateString('en-US').replace(/\//g, "_");
        var date = today.getFullYear() + '_' + (today.getMonth() + 1) + '_' + today.getDate(); 
        //console.log(date);
        let filename = this.utterRule.DomainName +'.hotfix.' + date + '.tsv';
        let blob = new Blob(this.getHotfix(), { type: 'text/plain;charset=utf-8' });
        FileSaver.saveAs(blob, filename);
    }

    uploadEvent(result: any) {
        let resultArray = <Array<string>>result;
        if(resultArray && resultArray.length > 0){
            alert('there are queries not submitted due to data error, please check the downloaded file');
            let filename = this.utterRule.DomainName +'.hotfix.fail.tsv';
            let blob = new Blob(resultArray, { type: 'text/plain;charset=utf-8' });
            FileSaver.saveAs(blob, filename);
        }
        window.location.reload();
    }

    cancelEvent() {
        this.uploadActive = false;
    }

    validateHotfix() {
        let url = '/validate?type=hotfix&domainID=' + this.domainID + '&domain=' + this.utterRule.DomainName;
        let win = window.open(url);
    }

    getHotfix(): Array<string> {
        let result = [];
        this.utterRule.HotfixList.map(item => {
            result.push('0\t'+ item.Sentence + '\t'+ item.Intent + '\t' + this.utterRule.DomainName + '\t' + item.SlotString + '\r\n');
        })
        return result;
    }

    handleError(error: ErrorMessage) {
      if (error.status === 401) {
        this.alertComponent.setAlert('Authorization has been denied, please refresh the page to re-new your session.', -1);
      }else {
        this.alertComponent.setAlert(error.message, -1);
      }
    }

    reminder(message: string) {
        this.alertComponent.setAlert(message);        
    }

    utteranceHandler(event: CustomEvent) {
        this.isNewUtteranceActive = true;
    }

    closeWindow() {
        this.isNewUtteranceActive = true;
    }
    status: number;
    statusText: string;
    message: string;
    addLexicon() {
        if (this.formLexicon.value.lexiconName == null || this.formLexicon.value.lexiconName.length == 0) {
            //alert("Please input valid name");
            this.reminder( 'Please input valid name');
            return;
        } else if (this.formLexicon.value.lexiconContent == null || this.formLexicon.value.lexiconContent.length == 0) {
            this.reminder("Please input valid lexicon content");
            return;
        }

        let name : string = this.formLexicon.value.lexiconName;
        let content : string = this.formLexicon.value.lexiconContent;

        let result : string = "Lexicon " + name + ' : ' + content;
        if (this.utterRule.Rules.length > 0) this.utterRule.Rules += '\n';
        this.utterRule.Rules += result;
        this.ruleChanged = true;
        this.closeLexiconForm();
        this.closeAllRule();
    }

    addPattern() {
        if (this.formPattern.value.patternName == null || this.formPattern.value.patternName.length == 0) {
            this.reminder("Please input valid pattern name");
            return;
        } else if (this.formPattern.value.patternContent == null || this.formPattern.value.patternContent.length == 0) {
            this.reminder("Please input valid pattern content");
            return;
        }

        let name: string = this.formPattern.value.patternName;
        let content: string = this.formPattern.value.patternContent;

        let result : string = "Pattern " + name + ' : ' + content;
        if (this.utterRule.Rules.length > 0) this.utterRule.Rules += '\n';
        this.utterRule.Rules += result;
        this.ruleChanged = true;
        this.closePatternForm();
        this.closeAllRule();
    }


    addIntent() {
        if (this.formIntent.value.intentName == null || this.formIntent.value.intentName.length == 0) {
            this.reminder("Please input valid Intent name");
            return;
        } else if (this.formIntent.value.intentContent == null || this.formIntent.value.intentContent.length == 0) {
            this.reminder("Please input valid Intent content");
            return;
        }

        let name: string = this.formIntent.value.intentName;
        let content: string = this.formIntent.value.intentContent;

        let result: string = "Intent " + name + ' : ' + content;
        if (this.utterRule.Rules.length > 0) this.utterRule.Rules += '\n';
        this.utterRule.Rules += result;
        this.ruleChanged = true;
        this.closeIntentForm();
        this.closeAllRule();
    }

    addSlot() {
        if (this.formSlot.value.slotName == null || this.formSlot.value.slotName.length == 0) {
            this.reminder("Please input valid Slot name");
            return;
        } else if (this.formSlot.value.slotContent == null || this.formSlot.value.slotContent.length == 0) {
            this.reminder("Please input valid Slot content");
            return;
        }

        let name: string = this.formSlot.value.slotName;
        let content: string = this.formSlot.value.slotContent;

        let result: string = "Slot " + name + ' ' + content;
        if (this.utterRule.Rules.length > 0) this.utterRule.Rules += '\n';
        this.utterRule.Rules += result;
        this.ruleChanged = true;
        this.closeSlotForm();
        this.closeAllRule();

    }

    openLexicon() {
        this.isRuleActive = true;
        this.isLexiconActive = true;
    }

    closeLexicon() {
        this.isRuleActive = false;
        this.isLexiconActive = false;
        this.closeLexiconForm();
    }

    openPattern() {
        this.isRuleActive = true;
        this.isPatternActive = true;
    }

    closePattern() {
        this.isRuleActive = false;
        this.isPatternActive = false;
        this.closePatternForm();
    }

    openIntent() {
        this.isRuleActive = true;
        this.isIntentActive = true;
    }

    closeIntent() {
        this.isRuleActive = false;
        this.isIntentActive = false;
        this.closeIntentForm();
    }

    openSlot() {
        this.isRuleActive = true;
        this.isSlotActive = true;
    }

    closeSlot() {
        this.isRuleActive = false;
        this.isSlotActive = false;
        this.closeSlotForm();
    }

    closeAllRule() {
        this.isRuleActive = false;
        this.isLexiconActive = false;
        this.isPatternActive = false;
        this.isIntentActive = false;
        this.isSlotActive = false;
        this.closeAllForm();
    }

    closeLexiconForm() {
        this.formLexicon = new FormGroup({
            'lexiconName': new FormControl(),
            'lexiconContent': new FormControl(),
        });
    }

    closePatternForm() {
        this.formPattern = new FormGroup({
            'patternName': new FormControl(),
            'patternContent': new FormControl(),
        });
    }

    closeIntentForm() {
        this.formIntent = new FormGroup({
            'intentName': new FormControl(),
            'intentContent': new FormControl(),
        });
    }

    closeSlotForm() {
        this.formIntent = new FormGroup({
            'slotName': new FormControl(),
            'slotContent': new FormControl(),
        });
    }

    closeAllForm() {
        this.formLexicon = new FormGroup({
            'lexiconName': new FormControl(),
            'lexiconContent': new FormControl(),
        });

        this.formPattern = new FormGroup({
            'patternName': new FormControl(),
            'patternContent': new FormControl(),
        });

        this.formIntent = new FormGroup({
            'intentName': new FormControl(),
            'intentContent': new FormControl(),
        });

        this.formSlot = new FormGroup({
            'slotName': new FormControl(),
            'slotContent': new FormControl(),
        });
    }
}
