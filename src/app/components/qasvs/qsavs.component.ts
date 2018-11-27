import { Component, Inject, OnInit } from '@angular/core';
import { AllModulesService } from '../../services/modules.service';
import { DomainList, QASSearch, QASItem, QASResult } from '../../models/objects';

@Component({
    selector: 'module',
    templateUrl: './qasvs.component.html',
    styleUrls: ['./qasvs.component.css']
})
export class QASVSComponent implements OnInit {
    environment: Array<string>;
    clientId: Array<string>;
    selectedClientId: string;

    virtualService: string;
    location: string;
    query: string;
    result: Array<QASResult>;

    constructor(private allModulesService: AllModulesService) {
        this.environment = ['PROD', 'INT'];
        this.clientId = ['default', 'prebuilt'];
        this.virtualService = 'DoradoSkills';
        this.location = 'PROD';
        this.selectedClientId = 'default';
        this.query = '';
        this.result = [];
    }
    ngOnInit(): any {
    }

    onClentIdChange(event) {
        this.selectedClientId = event.target.value;
    }

    onVirtualServiceChange(event) {
        this.virtualService = event.target.value;
    }

    onChange(deviceValue) {
        this.location = deviceValue;
    }

    onKey(event: any) {
        this.query = event.target.value;
        if(event.keyCode == 13) {
            this.search();
        }
    }

    search() {
        this.result = [];
        let domainList: Array<string> = [];
        let obj : QASSearch = { Query: this.query.trim(), DomainList: domainList, Location: this.location, ClientId: this.selectedClientId, VirtualService: this.virtualService  };

        this.allModulesService.QASsearch(obj).subscribe(res => {
            //console.log(res);
            let domain: string;
            let temp: Array<QASItem> = [];

            res.ResultList.map(item => {
                let t = item.split('::');
                if(t[0] === 'DomainName') {
                    if(domain === null || domain === undefined)
                        domain = t[1];
                    else {
                        this.result.push( { domainName: domain, valueList: temp});
                        temp = [];
                        domain = t[1];
                    }
                }
                else {
                    temp.push({"key": t[0], "value": t[1]});
                }
            } )
            this.result.push({ domainName: domain, valueList: temp })
        })
    }
}
