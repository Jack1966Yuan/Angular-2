import { Component, ViewChild, OnInit } from '@angular/core';
import { AllModulesService } from '../../services/modules.service';
import { environment } from '../../../environments/environment';
import { AlertComponent } from '../alert/alert.component';
import { LuisSchemaSuggestion, SchemaSuggestionAnnotation, Models, ErrorMessage } from '../../models/objects';


@Component({
    selector: 'app-resolver',
    templateUrl: './luResolver.component.html',
    styleUrls: ['./luResolver.component.css']
  })
  export class LuResolverComponent implements OnInit {
    typeSelectItems: Array<any>;
    appId: string;
    key: string;
    selectedType: string;
    queries: Array<string>
    query: string;
    private testResults: Array<SchemaSuggestionAnnotation>;
    domainModelsList: Array<string>;
    domainDropdownSettings: any;
    prebuiltDropdownList: Array<any>;
    prebuiltSelectedItems: Array<any>;
    skillDropdownList: Array<any>;
    skillSelectedItems: Array<any>;
    
    @ViewChild('myAlert') alertComponent: AlertComponent;
    constructor(private allModulesService: AllModulesService) {
        this.typeSelectItems = [{id: 1, name: 'Prebuilt'}, {id : 2, name: 'Skill'}, {id: 3, name: 'Luis'}, {id: 4, name: 'Prebuilt + Luis'}, {id: 5, name: 'Prebuilt + Skill'}];
        //this.appId = environment.applicationId;
        //this.key = environment.subscriptionKey;
        this.appId = '';
        this.key = '';        
        this.selectedType = 'Prebuilt';
        this.queries = [];
        this.query = '';
        this.testResults = [];
        this.domainDropdownSettings = {
            singleSelection: false,
            text:"Select Domains",
            selectAllText:'Select All',
            unSelectAllText:'UnSelect All',
            enableSearchFilter: true,
            classes:"myclass custom-class"
        };
        this.prebuiltDropdownList = [];
        this.prebuiltSelectedItems = [];
        this.skillDropdownList = [];
        this.skillSelectedItems = [];
        this.domainModelsList = []; 
    }

    ngOnInit(): any {
        //console.log('call ngOninit');
        let index = 0;
        this.allModulesService.getModels("PROD", "prebuilt", 'DoradoSkills')
        .subscribe(modules => {
            this.domainModelsList = modules;
            this.domainModelsList.map(model => {
                this.prebuiltDropdownList.push({ id: ++index, itemName: model });
            })
        },error => { this.handleError(error); });

        this.allModulesService.getModels("PROD", "default", 'DoradoSkills')
        .subscribe(modules => {
                    let index = 0;
                    this.domainModelsList = modules;
                    this.domainModelsList.map(model => {
                        this.skillDropdownList.push({ id: ++index, itemName: model });
                    })

        }, error => {this.handleError(error);} )
    }

    handleError(error: ErrorMessage) {
        if (error.status === 401) {
          this.alertComponent.setAlert('Authorization has been denied, please refresh the page to re-new your session.', -1);
        }else {
          this.alertComponent.setAlert(error.message, -1);
        }
    }
  
    addquery() {
        if(this.queries.indexOf(this.query) >= 0) {
            this.alertComponent.setAlert(this.query + ' has been added already; ignoring.', 0);
            return;            
        }

        //this.queries.push(this.query);
        this.doSearch();
        this.query = '';
    }

    //type changed
    onChange(name) {
        this.selectedType = name;
        this.queries = [];
        this.testResults = [];
        //this.doSearch();
    }

    //domain changed
    onMultiSelectChange(event: any) {
        //this.doSearch();
    }

    //add query
    doSearch() {
        if (!this.query || this.query.length == 0) 
        {
            this.alertComponent.setAlert('Please input query.', 0);
            return;
        }
        //let dic: any = { subscriptionkey: this.key, appid: this.appId, action: 'PrebuiltAndLuis' };
        console.log(this.selectedType);
        let prebuildDomainsArray: Array<string> = [];
        let skillDomainsArray: Array<string> = [];
        let dic: any;

        //validation
        if(this.selectedType == 'Prebuilt') {
            if(this.prebuiltSelectedItems.length == 0) {
                this.alertComponent.setAlert('Please choose prebuilt domains.', 0);
                return;
            }
            this.prebuiltSelectedItems.map((item) => {
                prebuildDomainsArray.push(item.itemName);
            })
            dic = { prebuiltdomainlist: prebuildDomainsArray.join(' '), action: 'prebuilt' };
                
        } else if(this.selectedType == 'Skill') {
            if(this.skillSelectedItems.length == 0) {
                this.alertComponent.setAlert('Please choose skill domains.', 0);
                return;                
            }
            this.skillSelectedItems.map((item) => {
                skillDomainsArray.push(item.itemName);
            })
            dic = { skillsdomainlist: skillDomainsArray.join(' '), action: 'skills' };
                
        } else if(this.selectedType == 'Luis') {
            if(!this.key || this.key.length == 0) {
                this.alertComponent.setAlert('Please provide subscription key.', 0);
                return;
            }
            if(!this.appId || this.appId.length == 0)
            {
                this.alertComponent.setAlert('Please provide application ID.', 0);
                return;
            }
            dic = { subscriptionkey: this.key, appid: this.appId, action: 'luis' };

        } else if(this.selectedType == 'Prebuilt + Luis') {
            if(!this.key || this.key.length == 0) {
                this.alertComponent.setAlert('Please provide subscription key.', 0);
                return;
            }
            if(!this.appId || this.appId.length == 0)
            {
                this.alertComponent.setAlert('Please provide application ID.', 0);
                return;
            }
            if(this.prebuiltSelectedItems.length == 0) {
                this.alertComponent.setAlert('Please choose prebuilt domains.', 0);
                return;
            }
            this.prebuiltSelectedItems.map((item) => {
                prebuildDomainsArray.push(item.itemName);
            })
            dic = { subscriptionkey: this.key, appid: this.appId, prebuiltdomainlist: prebuildDomainsArray.join(' '), action: 'prebuiltandluis' };
        } else if(this.selectedType == 'Prebuilt + Skill') {
            if(this.prebuiltSelectedItems.length == 0) {
                this.alertComponent.setAlert('Please choose prebuilt domains.', 0);
                return;
            }
            this.prebuiltSelectedItems.map((item) => {
                prebuildDomainsArray.push(item.itemName);
            })
            if(this.skillSelectedItems.length == 0) {
                this.alertComponent.setAlert('Please choose skill domains.', 0);
                return;                
            }
            this.skillSelectedItems.map((item) => {
                skillDomainsArray.push(item.itemName);
            })            
            dic = { prebuiltdomainlist: prebuildDomainsArray.join(' '), skillsdomainlist: skillDomainsArray.join(' '), action: 'prebuiltandskills' }
        }
        let q: Array<string> = [];
        q.push(this.query);

        this.allModulesService.LuisValidateQueries(new LuisSchemaSuggestion(q, dic))
        .subscribe((res) => {
            res.map((item) => {
                this.testResults.push(item);    
            })
        },
        (error) => {
            this.alertComponent.setAlert(error.message, 1);
        });
        this.queries.push(this.query);        
        this.query = '';        
    }
  }
