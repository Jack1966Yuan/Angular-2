import { Component, OnInit } from '@angular/core';
import { AllModulesService } from '../../services/modules.service';
import { DomainList, QASSearch, QASItem, QASResult } from '../../models/objects';

@Component({
  selector: 'app-qasgenericlu',
  templateUrl: './qasgenericlu.component.html',
  styleUrls: ['./qasgenericlu.component.css']
})
export class QASGenericLUComponent implements OnInit {

  environments: string[];
  models: string[];
  query: string;
  results: QASResult[];
  targetedEnvironment: string;
  targetedModel: string;

  constructor(private allModulesService: AllModulesService) {
    this.environments = ['PROD', 'INT'];
    this.models = ['Timex', 'Location', 'Number', 'Person Name'];
    this.results = [];
    this.targetedEnvironment = this.environments[0];
    this.targetedModel = this.models[0];
   }

  ngOnInit() {
  }

  onEnvironmentChange(environment: string): void {
    this.targetedEnvironment = environment;
  }

  onModelChange(model: string): void {
    this.targetedModel = model;
  }

  onKeyUp(event: any): void {
      this.query = event.target.value;
      if (event.keyCode === 13 && this.query.trim().length > 0) {
        this.fetchResults();
      }
  }

  fetchResults(): void {
    this.results = [];

    if (this.isModelServedByGms(this.targetedModel)) {
        const gmsModel: string = this.mapModelToGmsGenericLuDomain(this.targetedModel.toLowerCase());

        this.allModulesService.getGmsGenericLUModelResults(gmsModel, this.query).subscribe(results => {
          let domain: string;
          const infoList: any = [];

          const slots: any[] = [];
          results.Domains[0].Item.Slots.Item.map(item => {
            slots.push('<' + item.Name + '>' + item.Text + '</' + item.Name + '>');
          });
          infoList.push({'key': 'Slots', 'value': slots.join(',')});

          domain = results.Domains[0].Name;
          infoList.push({'key': 'Details', 'value': JSON.stringify(results)});

          this.results.push({ domainName: domain, valueList: infoList });
      });
    } else {
      const prod: boolean = this.targetedEnvironment.toLowerCase() === 'prod';

      this.allModulesService.getQASGenericLUModelResults(this.targetedModel.toLowerCase(), this.query, prod).subscribe(res => {
          let domain: string;
          let temp: QASItem[] = [];

          res.ResultList.map(item => {
              const t = item.split('::');
              if (t[0] === 'DomainName') {
                  if (!domain) {
                    domain = t[1];
                  } else {
                      this.results.push({domainName: domain, valueList: temp});
                      temp = [];
                      domain = t[1];
                  }
              } else {
                  temp.push({'key': t[0], 'value': t[1]});
              }
          });
          this.results.push({ domainName: domain, valueList: temp });
      });
    }
  }

  private isModelServedByGms(model: string): boolean {
    switch (model.toLowerCase()) {
      case 'number':
      case 'person name':
        return true;

      default:
        return false;
    }
  }

  private mapModelToGmsGenericLuDomain(model: string): string {
    switch (model.toLowerCase()) {
      case 'number':
        return 'numbertagger';

      case 'person name':
        return 'contactname';

      default:
        return null;
    }
  }
}
