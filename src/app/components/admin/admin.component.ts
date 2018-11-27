import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { AllModulesService } from '../../services/modules.service';
import { environment } from '../../../environments/environment';
import { AlertComponent } from '../alert/alert.component';
import { Users, ErrorMessage } from '../../models/objects';

@Component({
    selector: 'admin-comp',
    templateUrl: './admin.component.html',    
})

export class AdminComponent implements OnInit {
    isSuperAdm: Boolean;
    admins: Users;
    twoDimensionAdm: Array<any>;
    newAdmin: string;
    newAdminInputActive: Boolean;
    @ViewChild('myAlert') alertComponent: AlertComponent;

    constructor(@Inject(AllModulesService) private allModulesService: AllModulesService) {
        this.twoDimensionAdm = [];
        this.newAdmin = "";
        this.newAdminInputActive = false;

    }

    ngOnInit(): any {
        this.allModulesService.getAdmins().subscribe( (result) => {
            this.admins = result;
            this.isSuperAdm = environment.superAdm.toLowerCase().indexOf(this.admins.CurrentUser.toLowerCase()) >= 0;           
            this.distribution();
        }, error => {})
    }

    private distribution() {
        let temp: any;
        let num: number;
        this.twoDimensionAdm = [];
        this.admins.Admins.map((item, index) => {
            num = index;
            if(index % 3 == 0) {
                temp = {adm1: item, adm2: '', adm3: '' };
            }
            else if(index % 3 == 1) {
                temp.adm2 = item;
            } else {
                temp.adm3 = item;
                this.twoDimensionAdm.push(temp);
            }
        });

        if(num % 3 != 2) {
            this.twoDimensionAdm.push(temp);
        }
    }

    removeAdmin(alias) {
        let index = this.admins.Admins.indexOf(alias);
        if(index >= 0) {
            this.allModulesService.removeAdmin(alias).subscribe(() => {
                this.admins.Admins.splice(index, 1);
                this.distribution();
                this.alertComponent.setAlert(alias + ' was removed', 0);
            }, error => { this.handleError(error); });
        }
    }

    addAdmin(key) {
        if(key.which === 13 && this.newAdmin.length > 0) {
            this.allModulesService.addAdmin(this.newAdmin).subscribe(() => {
              this.admins.Admins.push(this.newAdmin);
              this.distribution();
              this.alertComponent.setAlert(this.newAdmin + ' was added as one of admins', 0);
              this.newAdminInputActive = false;
              this.newAdmin = "";
            }, error => { this.handleError(error) });
        }
    }

    activeAddAdmin() {
        if(this.newAdminInputActive) {
            if(this.newAdmin && this.newAdmin.length > 0)
            {
                this.allModulesService.addAdmin(this.newAdmin).subscribe(() => {
                    this.admins.Admins.push(this.newAdmin);
                    this.distribution();
                    this.newAdmin = "";
                }, error => { this.handleError(error); });
            }
        } else {
            this.newAdminInputActive = true;
            this.newAdmin = "";
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
  }
