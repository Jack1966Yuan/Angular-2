import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { AllModulesService } from '../../services/modules.service';
import { OwnerList, Models, DomainList, ErrorMessage, UploadSchemaResponse, UhrsTaskInfo, UHRSAnnotationStatus, UHRSTaskType} from '../../models/objects';
import { HttpHelperService } from '../../services/HttpHeaderService';
import { AlertComponent } from '../alert/alert.component';
import { UploadComponent } from '../upload/upload.component';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
    selector: 'uhrs',
    templateUrl: './task.component.html',
    styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {
    moduleName: Array<string>;
    domainDropdownSettings;
    domainSelectedItems;
    dicDomains;
    domainDropdownList;
    selectedDomainID;
    taskName: string;
    isAdmin: Boolean;
    type: string;
    UhrsTaskList: Array<UhrsTaskInfo>;

    @ViewChild('myAlert') alertComponent: AlertComponent;
    constructor(
        private allModulesService: AllModulesService,
        private httpService: HttpHelperService,
        private myrouter: Router) {
            this.moduleName = [];
            this.domainSelectedItems = [];
            this.dicDomains = {};
            this.domainDropdownList = [];
            this.selectedDomainID = '';
            this.taskName = "";
            this.isAdmin = false;
            this.type = 'Normal';
            this.UhrsTaskList = [];

            this.domainDropdownSettings = {
                singleSelection: false,
                text:"Select Domains",
                selectAllText:'Select All',
                unSelectAllText:'UnSelect All',
                enableSearchFilter: true,
                classes:"myclass custom-class"
            };
    }

    ngOnInit(): any {
        this.allModulesService.getModules()
        .subscribe(modules => {
            this.isAdmin = modules.IsAdmin;
            let index : number = 0;
            modules.RequestedObject.map(item => {
                this.moduleName.push(item.DomainName);
                this.dicDomains[index] = item.DomainID;
                this.domainDropdownList.push({ id: index, itemName: item.DomainName });
                index++;
            });
        }, error => { this.handleError(error); });

        this.allModulesService.getUHRSTasks().subscribe(
            taskList => {
               this.UhrsTaskList = taskList;
            }, error => { this.handleError(error); });
    }

    onMultiSelectChange(event: any) {
        if(!this.domainSelectedItems || this.domainSelectedItems.length == 0) {
            this.selectedDomainID = '';
            return;
        }
        let result = [];
        this.domainSelectedItems.map(item => {
            result.push(this.dicDomains[item.id]);
        })
        this.selectedDomainID = JSON.stringify(result);
    }

    //upload finished event
    uploadEvent(result: any) {
        this.alertComponent.setAlert(result);
        setTimeout(() =>
        {
            window.location.reload(true);
        },
        3000);
    }

    loadAnnotationDetailPage(taskID: string, taskName: string) {
      console.log(taskID);
      sessionStorage.setItem('TaskName', taskName);
      let windows = this.allModulesService.getNativeWindow();
      windows.open('/uhrscontent/' + taskID);
    }

    checkAnnotationComplete(curValue: UHRSAnnotationStatus): boolean {
      return curValue === UHRSAnnotationStatus.Annotated;
   }

    retrieveEnumValue(curValue: UHRSAnnotationStatus): string {
       return UHRSAnnotationStatus[curValue];
    }

    isLinkClickable(uhrsTask: UhrsTaskInfo): boolean {
      return this.isAdmin && (uhrsTask.AnnotationStatus === UHRSAnnotationStatus.Annotated && uhrsTask.TaskType === UHRSTaskType.Normal);
    }

    cancelEvent(error: string) {
        this.alertComponent.setAlert(error, -1);
    }

    onTypeChange(type: string) {
        this.type = type;
    }

    handleError(error: ErrorMessage) {
        if (error.status === 401) {
          this.alertComponent.setAlert('Authorization has been denied, please refresh the page to re-new your session.', -1);
        } else {
          this.alertComponent.setAlert(error.message, -1);
        }
    }

}
