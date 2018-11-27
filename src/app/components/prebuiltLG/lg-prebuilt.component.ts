import { Component, OnInit, ViewChild } from '@angular/core';
import { LgService } from './lg-prebuilt.service';
import { AllModulesService } from '../../services/modules.service';
import { ErrorMessage, 
         SchemaSuggestionAnnotation, 
         LuisSchemaSuggestion, 
         DomainDetailDisplay,
         ItemDisplay,
       } from '../../models/objects';
import { AlertComponent } from '../alert/alert.component';
import { ConditionSlots, LgResolverRequestObject, SlotString } from './lg-prebuilt.model';

@Component({
  selector: 'app-lg-demo',
  templateUrl: './lg-prebuilt.component.html',
  styleUrls: ['./lg-prebuilt.component.css']
})
export class LgDemoComponent implements OnInit {

  private lgModels: Array<string>;
  private luModels: Array<string>;
  private selectedLGModel: string;
  private selectedLUModel: string;
  private query: string;
  private luResult: Array<SchemaSuggestionAnnotation>;
  private lgIntentList: Array<string>;
  private selectedLGIntent: string;
  private conditionSlotsList: Array<ConditionSlots>;
  private conditionSlotAndLuSlotList: Array<ConditionSlots>;
  private entity: string;
  private result: string;

  @ViewChild('myAlert') alertComponent: AlertComponent;
  constructor(private lgService: LgService, private allModulesService: AllModulesService) {
    this.lgModels = [];
    this.luModels = [];
    this.selectedLGModel = '';
    this.selectedLUModel = '';
    this.query = '';
    this.entity = '[]';
    this.myOnInit();
  }

  ngOnInit() {
    this.lgService.getLGDomainName()
    .subscribe(modelNames => {
      this.lgModels = modelNames;
      this.lgModels.sort();
    }
    ,error => { this.handleError(error); 
    });

    this.allModulesService.getModels("PROD", "prebuilt", 'DoradoSkills')
    .subscribe(prebuild => {
        this.luModels = prebuild;
        this.luModels.sort();
    }
    ,error => { this.handleError(error); 
    });
  }


  myOnInit() {
    this.luResult = [];
    this.lgIntentList = [];
    this.selectedLGIntent = '';
    this.conditionSlotsList = [];
    this.conditionSlotAndLuSlotList = [];    
    this.result = '';
    this.entity = '[]';   
  }

  onLUSelectChange(domainName: string) {
    this.myOnInit();
  }
  onLGSelectChange(domainName: string) {
    this.myOnInit();
  }

  onSlotConditionChange(slotCondition) {
      this.result = '';
  }
  onLGIntentSelectChange(lgIntent: string) {
    this.result = '';
    let n: number = lgIntent.indexOf(': ');
    if(n >= 0) n+= 2;
    let intent: string = lgIntent.substring(n, lgIntent.length);
    this.lgService.getConditionalSlots(this.selectedLGModel, intent, this.luResult[0].Intent)
    .subscribe((res) => {
      //console.log(res);
      //this.conditionSlotsList = [];
      //res.map(item => {
        //this.conditionSlotsList.push(new ConditionSlots(item.Name, item.PossibleValues, !item.SelectedValue ? '': item.SelectedValue));
      //})
      this.conditionSlotsList = res;
      this.conditionSlotsList.map( (item) => {
        if(!item.SelectedValue) item.SelectedValue = '';
      })

      this.addConditionSlotFromSLOTString();
    },
    (error) => {
      this.alertComponent.setAlert(error.message, 1);
    });

    this.lgService.getLGEntity(this.selectedLGModel)
    .subscribe((res) => {
      this.entity = res;
      //console.log(res);
    },
    (error) => {
      this.alertComponent.setAlert(error.message, 1);
      this.entity = '[]';
    });
  }

  extractSlotObject(xml: string): Array<SlotString> {
    let matches: Array<SlotString> = [];
    let tagPattern = /<(.*?)>(.*?)<\/(.*?)>/g;
    var match;
    while (match = tagPattern.exec(xml)) {
      matches.push({ Tag: match[1], Value: match[2] });
    }
    return matches;
  }

  addConditionSlotFromSLOTString() {
    let slotObject: Array<SlotString> = this.extractSlotObject(this.luResult[0].SlotStringXml);

    //clone conditionSlotAndList
    this.conditionSlotAndLuSlotList = [];
    this.conditionSlotsList.map((item) => {
       let valuesList: Array<string> = [];
       item.PossibleValues.map(value => {
         valuesList.push(value);
       })
       this.conditionSlotAndLuSlotList.push(new ConditionSlots(item.Name, valuesList, item.SelectedValue));
    })
    //clone conditionSlotAndList

    //for loop slotObject to add to conditional slot
    slotObject.map((obj) => {
      let found: Boolean = false;
      this.conditionSlotAndLuSlotList.map((item) => {
        if (item.Name == obj.Tag) {
          found = true;
          let foundValue: boolean = false;
          item.PossibleValues.map((v) => {
            if (v === obj.Value.trim()) {
              foundValue = true;
              item.SelectedValue = obj.Value.trim();
            }
          })

          if (!foundValue) {
            item.PossibleValues.push(obj.Value.trim());
            item.SelectedValue = obj.Value.trim();
          }
        }
      })
      if (!found) {
        let possibleValues: Array<string> = []
        possibleValues.push(obj.Value.trim());
        let addConditionSlot: ConditionSlots = new ConditionSlots(obj.Tag, possibleValues, obj.Value.trim());
        this.conditionSlotAndLuSlotList.push(addConditionSlot);
      }
    })  
  }


  onInputQueryClick() {
    if(!this.selectedLUModel || this.selectedLUModel.length === 0)
    {
      this.alertComponent.setAlert('Please choose LU domain', 0)
    }

    if(!this.query || this.query.length === 0)
    {
      this.alertComponent.setAlert('Please provide query', 0)
    }

    this.myOnInit();
    let queries = [];
    queries.push(this.query);
    let dic = { prebuiltdomainlist: this.selectedLUModel, action: 'Prebuilt' };

    this.allModulesService.LuisValidateQueries(new LuisSchemaSuggestion(queries, dic))
    .subscribe((req) => {
      this.luResult = req;
      if(!this.luResult || this.luResult.length === 0) {
        this.alertComponent.setAlert('could not findd the related lu intent', 1);
        return;
      }
      //from lu to LG
      this.lgService.getLGIntent(this.selectedLGModel, this.luResult[0].Intent)
      .subscribe((res) => {
        this.lgIntentList = res;
        //console.log(res);
      },
      (error) => {
        this.alertComponent.setAlert(error.message, 1);
      }
    )},
    (error) => {
      this.alertComponent.setAlert(error.message, 1);
    });
  }

  onSubmitClick() {
    let localConditionSlotAndLuSlotList = this.conditionSlotAndLuSlotList;
    let localConditionSlotsList = this.conditionSlotsList;

    localConditionSlotAndLuSlotList.map((item, index) => {
      if (index < localConditionSlotsList.length && localConditionSlotsList[index].Name == localConditionSlotAndLuSlotList[index].Name) {
        localConditionSlotAndLuSlotList[index].SelectedValue = localConditionSlotsList[index].SelectedValue;
      }
    })

    let lgResolver: LgResolverRequestObject = new LgResolverRequestObject(this.selectedLGModel, this.selectedLGIntent, this.luResult[0].Intent, this.conditionSlotAndLuSlotList, this.entity);
    this.lgService.lgResult(lgResolver)
    .subscribe((res) => {
      //console.log(res);
      this.result = res;
    },
    (error) => {
      this.alertComponent.setAlert(error.message, 1);
    });
  }

  handleError(error: ErrorMessage) {
    if (error.status === 401) {
      this.alertComponent.setAlert('Authorization has been denied, please refresh the page to re-new your session.', -1);
    }else {
      this.alertComponent.setAlert(error.message, -1);
    }
  }

}
