import { Component, OnInit, ViewChild } from '@angular/core';
import * as FileSaver from 'file-saver';
import { AllModulesService } from '../../services/modules.service';
import { UtterRules, HotfixItem, Annotation, SlotAction, Rules, Hotfix, ErrorMessage, UserType } from '../../models/objects';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { QueryComponent } from '../query/query.component';
import { AlertComponent } from '../alert/alert.component';
import { UploadComponent } from '../upload/upload.component';

@Component({
    selector: 'bvt-comp',
    templateUrl: './bvt.component.html',
    styleUrls: ['../utterance/utterance.component.css']
})

export class BVT implements OnInit {

    domainID: string;
    utterRule: UtterRules;
    ruleChanged: boolean;
    isNewUtteranceActive: boolean;
    isnew: boolean;
    readOnly: boolean;

    uploadActive: boolean;

    @ViewChild('myQueryComponent') queryComponent: QueryComponent;
    @ViewChild('myAlert') alertComponent: AlertComponent;

    constructor(private router: ActivatedRoute, private myrouter: Router, private allModulesService: AllModulesService) {
        this.domainID = this.router.snapshot.params['id'];
        this.ruleChanged = false;
        this.isNewUtteranceActive = true;
        this.readOnly = false;
        this.uploadActive = false;
    }

    ngOnInit(): any {
        //console.log('ngOnInit');
        this.allModulesService.getBVT(this.domainID).subscribe(modules => {
            this.utterRule = modules;
            this.utterRule.SlotList.unshift({ Name: "UnTag", Tag: "UnTag" });
            if (this.utterRule.UserType === UserType.Reader) {
              this.readOnly = true;
            }
        }, error => { this.handleError(error) })
    }

    editbvtClick(index: number): any {
        this.queryComponent.editUtteranceClick(index);
        this.isnew = false;
        this.isNewUtteranceActive = false;
    }

    textAreaChange(): any {
        //console.log(this.utterRule.Rules);
        this.ruleChanged = true;
    }

    returnModuleDetail(): any {
        this.myrouter.navigate(['detail', this.domainID]);
    }

    createbvt(): any {
        this.isnew = true;
        this.isNewUtteranceActive = false;
    }

    deletebvtClick(index: number): any {

        var answer = confirm("Are you sure to delete this bvt item?")
        if (!answer) {
            let element: string = "delete_bvt_" + index;
            document.getElementById(element).blur();
            return;
        }

        let hot: Hotfix = { Intent: '', DomainID: this.domainID, Sentence: this.utterRule.HotfixList[index].Sentence, SlotString: "" };
        this.utterRule.HotfixList.splice(index, 1);

        this.allModulesService.deleteBVT(hot).subscribe(it => {
        });
    }


    importBVT() {
        this.uploadActive = true;
    }

    exportBVT() {
        document.getElementById("ExportButton").blur();
        var today = new Date();
        //var date = today.toLocaleDateString('en-US').replace(/\//g, "_");
        var date = today.getFullYear() + '_' + (today.getMonth() + 1) + '_' + today.getDate(); 
        //console.log(date);
        let filename = this.utterRule.DomainName +'.bvt.' + date + '.tsv';
        let blob = new Blob(this.getBVT(), { type: 'text/plain;charset=utf-8' });
        FileSaver.saveAs(blob, filename);
    }

    uploadEvent(result: any) {
        let resultArray = <Array<string>>result;
        if(resultArray && resultArray.length > 0){
            alert('there are queries not submitted due to data error, please check the downloaded file');
            let filename = this.utterRule.DomainName +'.bvt.fail.tsv';
            let blob = new Blob(resultArray, { type: 'text/plain;charset=utf-8' });
            FileSaver.saveAs(blob, filename);
        }
        window.location.reload();
    }

    cancelEvent() {
        this.uploadActive = false;
    }

    validateBVT() {
        let url = '/validate?type=bvt&domainID=' + this.domainID + '&domain=' + this.utterRule.DomainName;;
        //var newWindow = this.nativeWindow.open(url);
        let win = window.open(url);        
    }

    getBVT(): Array<string> {
        let result = [];
        this.utterRule.HotfixList.map(item => {
            result.push('0\t'+ item.Sentence + '\t'+ item.Intent + '\t' + this.utterRule.DomainName + '\t' + item.SlotString + '\r\n');
        })
        return result;        
    }

    closeWindow() {
        this.isNewUtteranceActive = true;
        //this.intent = '';
        //this.text = '';
    }

    utteranceHandler(event: CustomEvent) {
        //this.setences = event.detail;
        this.isNewUtteranceActive = true;
    }

    handleError(error: ErrorMessage) {
      if (error.status === 401) {
        this.alertComponent.setAlert('Authorization has been denied, please refresh the page to re-new your session.', -1);
      }else {
        this.alertComponent.setAlert(error.message, -1);
      }
    }

}
