import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import * as FileSaver from 'file-saver';
import { AllModulesService } from '../../services/modules.service';
import { OwnerList, Models, DomainList, ErrorMessage, UploadSchemaResponse } from '../../models/objects';
import { HttpHelperService } from '../../services/HttpHeaderService';
import { AlertComponent } from '../alert/alert.component';
import { UploadComponent } from '../upload/upload.component';
import { reset } from '@angular-devkit/core/src/terminal';

@Component({
    selector: 'module',
    templateUrl: './models.component.html',
    styleUrls: ['./models.component.css']
})
export class ModuleComponent implements OnInit {
    allModuleName: Models;
    allModuleWhithoutPrebuilt: Array<DomainList>;

    disort: boolean;
    prebuiltSort: boolean;

    importActive: Boolean;
    exportActive: Boolean;
    downloadActive: boolean;
    //currentModelId: string;
    dicDomains: any;

    domainDropdownList = [];
    domainSelectedItems = [];
    domainDropdownSettings = {};
    prebuiltModelsList: string[];
    prebuiltModelsObjList: any[];
    dicProbuilt = {};
    exportFileName: string;

    @ViewChild('myAlert') alertComponent: AlertComponent;
    constructor(
      private allModulesService: AllModulesService,
      private httpService: HttpHelperService) {
        this.disort = false;
        this.prebuiltSort = false;

        this.importActive = false;
        this.exportActive = false;
        this.downloadActive = false;
        //this.currentModelId = "";
        this.domainDropdownSettings = {
            singleSelection: false,
            text:"Select Domains",
            selectAllText:'Select All',
            unSelectAllText:'UnSelect All',
            enableSearchFilter: true,
            classes:"myclass custom-class"
        };

        this.prebuiltModelsList = [];
        this.prebuiltModelsObjList = [];
        this.exportFileName = '';
    }

    ngOnInit(): any {
        //console.log('call ngOninit');
        if (!this.allModuleName) {

            this.allModulesService.getModels("PROD", "prebuilt", 'DoradoSkills')
            .subscribe(modules => {
                this.prebuiltModelsList = modules;
                this.allModulesService.getModules()
                .subscribe(modules => {
                    this.allModuleName = modules;
                    this.dicDomains = {};
                    let index : number = 0;
                    let dicDomainName = {};

                    this.sort('Name');
                    this.allModuleName.RequestedObject.map(item => {
                        this.dicDomains[index] = item.DomainID;
                        this.domainDropdownList.push({ id: index, itemName: item.DomainName });
                        dicDomainName[item.DomainName] = item;
                        ++index;
                    });

                    this.prebuiltModelsList.map(name => {
                        this.dicProbuilt[name] = true;
                        if(dicDomainName[name]) {
                            this.prebuiltModelsObjList.push(dicDomainName[name]);
                        } else {
                            this.prebuiltModelsObjList.push({
                                Description: "",
                                DomainID: "",
                                InDevelopment: true,
                                InPendinding: 2,
                                DomainName: name,
                                IsOwner: false,
                                Owners: null,
                                IsLFModel: true
                            });
                        }
                    })

                    sessionStorage.setItem('PrebuiltList', JSON.stringify(this.prebuiltModelsList));
                    this.sortProbuilt('Name');

                }, error => { this.handleError(error); });
            }, error => {this.handleError(error);} )
        }
        this.httpService.watchdog();
        //this.allModuleName = this.allModulesService.getModules();
    }

    importClick() {
        this.importActive = !this.importActive;
        document.getElementById("import").blur();
        if(this.importActive) {
            this.exportActive = false;
            this.downloadActive = false;
        }
    }

    getModelID() {
        let ids = [];
        let domainName = "";
        this.domainSelectedItems.map(item => {
            ids.push(this.dicDomains[item.id]);
            if(domainName.length > 0) {
                domainName += '_' + item.itemName;
            } else {
                domainName = item.itemName;
            }
        })
        return { Id: ids,
                Name: this.exportActive && this.exportFileName && this.exportFileName.length > 0 ?
                (this.exportFileName.slice(-5).toLowerCase() === '.json' ? this.exportFileName : this.exportFileName + '.json') : domainName + '.json'
               };
    }

    okClick() {
        let selectedModel = this.getModelID();
        if(this.downloadActive) {
            var today = new Date();
            //var date = today.toLocaleDateString('en-US').replace(/\//g, "_");
            var date = today.getFullYear() + '_' + (today.getMonth() + 1) + '_' + today.getDate();
            let filename = selectedModel.Name + '_' + date + '.xml';
            this.allModulesService.dowonloadSchema(selectedModel.Id).subscribe(res => {
                let result: Array<string> = [];
                result.push(res);
                let blob = new Blob(result, { type: 'text/plain;charset=utf-8' });
                FileSaver.saveAs(blob, filename);
                this.downloadActive = false;
            }, error => { this.handleError(error); });
        }
        else {
            this.allModulesService.exportSchema(selectedModel.Id, selectedModel.Name).subscribe((files) => {
                this.alertComponent.setAlert('Export ' + files +  ' completed successfully.');
                this.exportActive = false;
            }, error => { this.handleError(error); });
        }
    }

    exportClick() {
        this.exportActive = !this.exportActive;
        document.getElementById("export").blur();
        if(this.exportActive) {
            this.importActive = false;
            this.downloadActive = false;
            this.domainSelectedItems = [];
            //this.currentModelId = "";
        }
    }

    downloadClick() {
        this.downloadActive = !this.downloadActive;
        document.getElementById("download").blur();
        if(this.downloadActive) {
            this.importActive = false;
            this.exportActive = false;
            //this.currentModelId = "";
            this.domainSelectedItems = [];
        }
    }

    onMultiSelectChange(event: any) {
    }

    //upload finished event
    uploadEvent(result: any) {
        let resultArray = <Array<UploadSchemaResponse>>result;
        if(resultArray && resultArray.length > 0){
            let alertStr: string = 'Schema Import Result:\n\n';
            let hasSuccessfullyImported : Boolean = false;
            for (var i = 0; i < resultArray.length; i++) {
                alertStr += resultArray[i].Subject + (resultArray[i].Succeeded ? ": Succeeded!" : ": Failed: " + resultArray[i].ResultMessage) + "\n";
                hasSuccessfullyImported = hasSuccessfullyImported || resultArray[i].Succeeded;
            }

            if(hasSuccessfullyImported){
               alert(alertStr + "\nClick OK will reload the page with newly imported domain(s).");
                window.location.reload();
            }
            else{
                alert(alertStr);
            }
        }
    }

    cancelEvent() {
        this.importActive = false;
    }


    sortProbuilt(name: string): any {
        //prebuiltModelsObjList
        this.prebuiltSort = !this.prebuiltSort;
        switch (name) {
            case 'ID':
                this.prebuiltModelsObjList.sort((a, b) => {
                    var x = +a.DomainID, y = +b.DomainID;
                    if (x == y)
                        return 0;
                    else if (x < y)
                        return this.prebuiltSort ? -1 : 1;
                    else
                        return this.prebuiltSort ? 1 : -1;
                });
                break;
            case 'Name':
                this.prebuiltModelsObjList.sort((a, b) => {
                    if (a.DomainName.toLowerCase() == b.DomainName.toLowerCase())
                        return 0;
                    else if (a.DomainName.toLowerCase() < b.DomainName.toLowerCase())
                        return this.prebuiltSort ? -1 : 1;
                    else
                        return this.prebuiltSort ? 1 : -1;
                });
                break;
            case 'Int/Prod':
                this.prebuiltModelsObjList.sort((a, b) => {
                    if (a.InDevelopment == null || a.InDevelopment == undefined) {
                        if (b.InDevelopment == null || b.InDevelopment == undefined)
                            return 0;
                        else
                            return this.prebuiltSort ? -1 : 1;
                    }
                    else if (b.InDevelopment == null || b.InDevelopment == undefined)
                        return this.prebuiltSort ? 1 : -1;
                    else if (a.InDevelopment == b.InDevelopment)
                        return 0;
                    else if (a.InDevelopment < b.InDevelopment)
                        return this.prebuiltSort ? -1 : 1;
                    else
                        return this.prebuiltSort ? 1 : -1;
                });
                break;
        }
    }


    sort(name: string): any {
        this.disort = !this.disort;
        switch (name) {
            case 'ID':
                this.allModuleName.RequestedObject.sort((a, b) => {
                    var x = +a.DomainID, y = +b.DomainID;
                    if (x == y)
                        return 0;
                    else if (x < y)
                        return this.disort ? -1 : 1;
                    else
                        return this.disort ? 1 : -1;
                });
                break;
            case 'Name':
                this.allModuleName.RequestedObject.sort((a, b) => {
                    if (a.DomainName.toLowerCase() == b.DomainName.toLowerCase())
                        return 0;
                    else if (a.DomainName.toLowerCase() < b.DomainName.toLowerCase())
                        return this.disort ? -1 : 1;
                    else
                        return this.disort ? 1 : -1;
                });
                break;
            case 'Int/Prod':
                this.allModuleName.RequestedObject.sort((a, b) => {
                    if (a.InDevelopment == null || a.InDevelopment == undefined) {
                        if (b.InDevelopment == null || b.InDevelopment == undefined)
                            return 0;
                        else
                            return this.disort ? -1 : 1;
                    }
                    else if (b.InDevelopment == null || b.InDevelopment == undefined)
                        return this.disort ? 1 : -1;
                    else if (a.InDevelopment == b.InDevelopment)
                        return 0;
                    else if (a.InDevelopment < b.InDevelopment)
                        return this.disort ? -1 : 1;
                    else
                        return this.disort ? 1 : -1;
                });
                break;
            case 'Owner':
            this.allModuleName.RequestedObject.sort((a, b) => {
                if ( !a.Owners.ModelOwnerList.Alias || a.Owners.ModelOwnerList.Alias.length == 0 ) {
                    if(!b.Owners.ModelOwnerList.Alias || b.Owners.ModelOwnerList.Alias.length  == 0)
                        return 0;
                    else
                        return this.disort ? -1 : 1;
                }
                else if (!b.Owners.ModelOwnerList.Alias || b.Owners.ModelOwnerList.Alias.length  == 0)
                    return this.disort ? 1 : -1;
                else if (a.Owners.ModelOwnerList.Alias[0].toLowerCase() == b.Owners.ModelOwnerList.Alias[0].toLowerCase()){
                    return 0;
                }
                else if (a.Owners.ModelOwnerList.Alias[0].toLowerCase() < b.Owners.ModelOwnerList.Alias[0].toLowerCase())
                    return this.disort ? -1 : 1;
                else
                    return this.disort ? 1 : -1;
            });
            break;
            default:
                this.allModuleName.RequestedObject.sort((a, b) => {
                    if (a.InPending == null || a.InPending == undefined) {
                        if (b.InPending == null || b.InPending == undefined)
                            return 0;
                        else
                            return this.disort ? -1 : 1;
                    }
                    else if (b.InPending == null || b.InPending == undefined)
                        return this.disort ? 1 : -1;
                    else if (a.InPending == b.InPending)
                        return 0;
                    else if (a.InPending < b.InPending)
                        return this.disort ? -1 : 1;
                    else
                        return this.disort ? 1 : -1;
                });
                break;
        }
    }

    handleError(error: ErrorMessage) {
      if (error.status === 401) {
        this.alertComponent.setAlert('Authorization has been denied, please refresh the page to re-new your session.', -1);
      }else {
        this.alertComponent.setAlert(error.message, -1);
      }
    }
}
