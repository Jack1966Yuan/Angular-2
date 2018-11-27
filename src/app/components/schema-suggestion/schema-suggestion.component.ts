import { Component, OnInit, ViewChild } from '@angular/core';
import { QASSearch, SchemaSuggestionAnnotation, Annotation, DomainDetailDisplay, SchemaSuggestionItem, LuisSchemaSuggestion } from '../../models/objects';
import { AllModulesService } from '../../services/modules.service';
import { AlertComponent } from '../alert/alert.component';
import { noUndefined } from '@angular/compiler/src/util';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-schema-suggestion',
  templateUrl: './schema-suggestion.component.html',
  styleUrls: ['./schema-suggestion.component.css']
})
export class SchemaSuggestionComponent {

  private suggestedQueries;
  private unsuggestedQueries;
  private inputQuery: string;
  private localSuggestion: SchemaSuggestionAnnotation;
  private isDomainPicked: boolean;
  private currentSchema: DomainDetailDisplay;
  private schemaSuggestionList: Array<SchemaSuggestionItem>;
  private domainCount;
  private suggestedDomains;
  private currentIndex: number;
  //private isEditted = false;
  private isFirstPart: boolean;
  //private typeSelectItems: Array<string>;
  private type: string;
  //private addQueryhide: boolean;
  private query: string;
  private appId: string;
  private key: string;
  private height: string;
  private left: string;
  private isLuis: Boolean;
  //private luisStateChanged: Boolean;

  private testResults: Array<SchemaSuggestionAnnotation>;

  @ViewChild('myAlert') alertComponent: AlertComponent;

  constructor(private allModulesService: AllModulesService) {
    this.inputQuery = '';
    this.isDomainPicked = true;
    this.schemaSuggestionList = [];
    this.currentIndex = 0;
    this.domainCount = {};
    this.suggestedDomains = [];
    this.isFirstPart = true;
    //this.typeSelectItems = ['Prebuilt', 'Skill', 'Luis', 'Prebuilt and Luis', 'Prebuilt and Skill'];
    this.type = 'Prebuilt';
    //this.addQueryhide = true;
    this.query = '';
    this.appId = '';
    this.key = '';    
    this.testResults = [];
    this.isLuis = false;
    //this.luisStateChanged = false;
    this.height = (window.screen.height - 280) + 'px';
    this.left = (window.screen.width - 500) + 'px'
  }

  addQuery() {
    //console.log(this.inputQuery);
    // if (!(this.suggestedQueries[this.inputQuery] || this.unsuggestedQueries[this.inputQuery])) {
    if (!this.DoesQueryExist(this.inputQuery)) {
      this.allModulesService.getSchemaSuggestion(this.inputQuery).subscribe(
        (response) => {
          //this.isEditted = true;
          this.localSuggestion = response;
          // this.suggestedQueries[response.Query] = response;
          this.schemaSuggestionList.push(new SchemaSuggestionItem(this.localSuggestion, true));
          this.currentIndex = this.schemaSuggestionList.length - 1;
          this.isDomainPicked = true;
          if (this.domainCount[this.localSuggestion.DomainName]) {
            this.domainCount[this.localSuggestion.DomainName]++;
          } else {
            this.domainCount[this.localSuggestion.DomainName] = 1;
            if (this.suggestedDomains.indexOf(this.localSuggestion.DomainName) < 0)
              this.suggestedDomains.push(this.localSuggestion.DomainName);
          }

          this.allModulesService.getSchemaByName(this.localSuggestion.DomainName).subscribe(
            (schemaResponse) => {
              this.currentSchema = schemaResponse;
            },
            (error) => {
              this.currentSchema = null;
              this.alertComponent.setAlert(error.message, 1);
            },
          );
        },
        (error) => {
          this.alertComponent.setAlert(error, 1);
        }
      );
    } else {
      this.alertComponent.setAlert(this.inputQuery + ' has been added already; ignoring.', 0);
    }
  }

  onDomainPickerChanged() {
    this.schemaSuggestionList[this.currentIndex].Selected = this.isDomainPicked;
    if (this.isDomainPicked) {
      if (this.domainCount[this.localSuggestion.DomainName]) {
        this.domainCount[this.localSuggestion.DomainName]++;
      } else {
        this.domainCount[this.localSuggestion.DomainName] = 1;
        if (this.suggestedDomains.indexOf(this.localSuggestion.DomainName) < 0)
          this.suggestedDomains.push(this.localSuggestion.DomainName);
      }
    } else {
      if (this.domainCount[this.localSuggestion.DomainName] && this.domainCount[this.localSuggestion.DomainName] > 0) {
        this.domainCount[this.localSuggestion.DomainName] = this.domainCount[this.localSuggestion.DomainName] - 1;
        if(this.domainCount[this.localSuggestion.DomainName] === 0) {
          let index = this.suggestedDomains.indexOf(this.localSuggestion.DomainName);
          if(index >= 0)
          this.suggestedDomains.splice(index, 1);
        }
          //delete this.domainCount[this.localSuggestion.DomainName];
      }
    }
  }

  updateQuery() {
    if (!this.DoesQueryExist(this.inputQuery)) {
      this.allModulesService.getSchemaSuggestion(this.inputQuery).subscribe(
        (response) => {
          //this.isEditted = true;
          this.localSuggestion = response;
          let domain = this.schemaSuggestionList[this.currentIndex].Detail.DomainName;
          // this.suggestedQueries[response.Query] = response;
          this.schemaSuggestionList[this.currentIndex] = new SchemaSuggestionItem(this.localSuggestion, true);
          //this.currentIndex = this.schemaSuggestionList.length - 1;
          this.isDomainPicked = true;
          if (domain !== this.localSuggestion.DomainName) {
            this.domainCount[domain] = this.domainCount[domain] - 1;
            if (this.domainCount[this.localSuggestion.DomainName]) {
              this.domainCount[this.localSuggestion.DomainName]++;
            } else {
              this.domainCount[this.localSuggestion.DomainName] = 1;
              if (this.suggestedDomains.indexOf(this.localSuggestion.DomainName) < 0)
                this.suggestedDomains.push(this.localSuggestion.DomainName);
            }
          }
          this.allModulesService.getSchemaByName(this.localSuggestion.DomainName).subscribe(
            (schemaResponse) => {
              this.currentSchema = schemaResponse;
            },
            (error) => {
              this.alertComponent.setAlert(error.message, 1);
              this.currentSchema = null;
            },
          );
        },
        (error) => {
          this.alertComponent.setAlert(error, 1);
        }
      );
    } else {
      this.alertComponent.setAlert(this.inputQuery + ' has been added already; ignoring.', 0);
    }
  }

  onQueryChanged() {
    this.localSuggestion = undefined;
  }

  activeRemoveQuery(i) {
    if(this.currentIndex == i) {
      this.currentIndex = 0;
    } else if(this.currentIndex > i) {
      this.currentIndex--;
    }

    let domainName = this.schemaSuggestionList[i].Detail.DomainName;
    let isSelected = this.schemaSuggestionList[i].Selected;

    this.schemaSuggestionList.splice(i, 1);
    if(isSelected) {
      this.domainCount[domainName]--;
      if(this.domainCount[domainName] == 0) {
        let ind = this.suggestedDomains.indexOf(domainName);
        this.suggestedDomains.splice(ind, 1);
      }
    }

    if(this.schemaSuggestionList.length == 0) {
      this.currentSchema = null;
      this.localSuggestion = null;
      this.inputQuery = '';
      this.isDomainPicked = true;
      this.schemaSuggestionList = [];
      this.currentIndex = 0;
      this.domainCount = {};
      this.suggestedDomains = [];
      this.isFirstPart = true;
      //this.addQueryhide = true;
      this.query = '';
    } else {
      this.editQuery(this.currentIndex);
    }
  }

  editQuery(index) {
    this.currentIndex = index;
    this.isDomainPicked = this.schemaSuggestionList[this.currentIndex].Selected;
    this.localSuggestion = this.schemaSuggestionList[this.currentIndex].Detail;
    this.inputQuery = this.schemaSuggestionList[this.currentIndex].Detail.Query;

    this.allModulesService.getSchemaByName(this.localSuggestion.DomainName).subscribe(
      (schemaResponse) => {
        this.currentSchema = schemaResponse;
      },
      (error) => {
        this.alertComponent.setAlert(error.message, 1);
        this.currentSchema = null;
      },
    );
  }

  private DoesQueryExist(newQuery: string): boolean {
    return this.schemaSuggestionList.find(item => item.Detail.Query === newQuery) !== undefined;
  }

  addqueryNoSchema() {
    //this.addQueryhide = true;
    if (!this.DoesQueryExist(this.query)) {
      this.allModulesService.getSchemaSuggestion(this.query).subscribe(
        (response) => {
          this.schemaSuggestionList.push(new SchemaSuggestionItem(response, false));
          this.validateQueries();
        },
        (error) => {
          this.alertComponent.setAlert(error, 1);
        }
      );
    } else {
      this.alertComponent.setAlert(this.query + ' has been added already; ignoring.', 0);
    }
  }

  modifyLuisStates() {
    this.isLuis = !this.isLuis;
  }

  onTypeChange(value) {
    this.type = value;
  }

  onclickNext() {
    this.isFirstPart = !this.isFirstPart;
    if(!this.isFirstPart) {
      this.validateQueries();
      this.height = (window.screen.height - 280) + 'px';
      this.left = (window.screen.width - 600) + 'px'      
    } else {
      this.height = (window.screen.height - 280) + 'px';
      this.left = (window.screen.width - 500) + 'px'      
    }
  }

  validateQueries(): Boolean {
    let selectedDomains: string = '';
    let queries: Array<string> = [];

    if(this.isLuis) {
      if (!this.appId || this.appId.length == 0) {
        this.alertComponent.setAlert('Please provide application ID', 0)
        return false;          
      }
      if (!this.key || this.key.length == 0) {
        this.alertComponent.setAlert('Please provide subscription key', 0)
        return false;          
      }
    }

    if (this.suggestedDomains.length == 0) {
      this.alertComponent.setAlert('Please provide query', 0)
      return false;
    }

    this.suggestedDomains.map(item => {
      if (this.domainCount[item] > 0)
        // selectedDomains.push(item);
        selectedDomains = selectedDomains + ' ' + item;
    })

    if (this.schemaSuggestionList.length == 0) {
      this.alertComponent.setAlert('Please provide query', 0)
      return false;
    }

    this.schemaSuggestionList.map(item => {
      queries.push(item.Detail.Query);
    })

    if (queries.length == 0) {
      this.alertComponent.setAlert('Please provide query', 0)
      return false;
    }

    let dic: any;

    if(this.isLuis) {
      dic = { subscriptionkey: this.key, prebuiltdomainlist: selectedDomains, appid: this.appId, action: 'PrebuiltAndLuis' };
    } else {
      dic = { prebuiltdomainlist: selectedDomains, action: 'Prebuilt' };
    }
    this.allModulesService.LuisValidateQueries(new LuisSchemaSuggestion(queries, dic))
    .subscribe((req) => {
      this.testResults = req;
      this.query = '';
    },
    (error) => {
      this.alertComponent.setAlert(error.message, 1);
    });

    return true;
  }

}
