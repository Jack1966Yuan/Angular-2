import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { AllModulesService } from '../../services/modules.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertComponent } from '../alert/alert.component';
import { ErrorMessage, AnnotationValidateResult, QASClientType} from '../../models/objects';
//http://localhost:4200/validate?type=Hotfix&domainID=12

@Component({
    selector: 'val-com',
    templateUrl: './validate.component.html',
    styleUrls: ['./validate.component.css']
})
export class ValidateComponent implements OnInit {
    domainId: string;
    type: string;
    domain: string;
    annotation: Array<AnnotationValidateResult>;
    Loading: string;
    starting: number;
    direction: boolean;
    timer: any;
    prebuiltDomainList: Array<string>;

    @ViewChild('myAlert') alertComponent: AlertComponent;
    constructor(private allModulesService: AllModulesService, private router: ActivatedRoute) {
        this.domainId = this.router.snapshot.queryParams['domainID'];
        this.type = this.router.snapshot.queryParams['type'];
        this.domain = this.router.snapshot.queryParams['domain'];
        this.annotation = null;
        this.Loading = 'Querying ';
        this.starting = 0;
        this.direction = true;
        this.prebuiltDomainList = new Array<string>();
        //console.log(this.domainId);
        //console.log(this.type);
        this.timer = setInterval( () => {
            let t: string = '.'.repeat(this.starting);
            this.Loading = 'Querying ' + t;
            if(this.direction) {
                if(++this.starting == 5)
                    this.direction = !this.direction;
            }
            else {
                if(--this.starting == 0)
                    this.direction = !this.direction;
            }
        }, 100);
    }
    ngOnInit(): any {
        //this.render.setElementClass(document.body, 'busy-cursor', true);
        this.loadPrebuiltDomainList();
        const clientID = this.prebuiltDomainList.includes(this.domain) ? QASClientType.Prebuilt : QASClientType.Skills;

        if(this.type.toLowerCase() == 'hotfix') {
            this.allModulesService.hotfixValidate(this.domainId, clientID).subscribe((res) => {
                this.annotation = res;
                clearInterval(this.timer);
                //this.render.setElementClass(document.body, 'busy-cursor', false);
            }, error => { this.handleError(error); })
        } else {
            this.allModulesService.bvtValidate(this.domainId, clientID).subscribe((res) => {
                this.annotation = res;
                //this.render.setElementClass(document.body, 'busy-cursor', false);
            }, error => { this.handleError(error); })
        }
    }

    loadPrebuiltDomainList(): void {
      const prebuiltListString = sessionStorage.getItem('PrebuiltList');

      // if prebuilt list is not in cache, call service to retrieve it
      if (prebuiltListString == null || prebuiltListString.length === 0) {
        this.allModulesService.getModels('PROD', 'prebuilt', 'DoradoSkills').subscribe(modules => {
              this.prebuiltDomainList = modules;
        }, error => {
          this.handleError(error);
        });
      }else {
        this.prebuiltDomainList = JSON.parse(prebuiltListString);
      }
  }

    handleError(error: ErrorMessage) {
        if (error.status === 401) {
            this.alertComponent.setAlert('Authorization has been denied, please refresh the page to re-new your session.', -1);
          } else {
            this.alertComponent.setAlert(error.message, -1);
          }
    }
}
