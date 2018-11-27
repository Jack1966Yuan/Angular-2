import { Component, Inject, OnInit } from '@angular/core';
import { AllModulesService } from '../../services/modules.service';
import { DomainList, QASSearch, QASItem, QASResult } from '../../models/objects';

@Component({
    selector: 'module',
    templateUrl: './qas.component.html',
    styleUrls: ['./qas.component.css']
})
export class QASComponent implements OnInit {
    allModuleName: Array<string>;
    environment: Array<string>;
    clientId: Array<string>;
    selectedClientId: string;

    domainDropdownList = [];
    domainSelectedItems = [];
    domainDropdownSettings = {};
    location: string;
    query: string;
    result: Array<QASResult>;

    constructor(private allModulesService: AllModulesService) {
        this.environment = ['PROD', 'INT'];
        this.clientId = ['default', 'prebuilt']
        this.location = 'PROD';
        this.selectedClientId = 'default';
        this.query = '';
        this.result = [];
    }
    ngOnInit(): any {
        this.domainDropdownSettings = {
                singleSelection: false,
                text:"Select Domains",
                selectAllText:'Select All',
                unSelectAllText:'UnSelect All',
                enableSearchFilter: true,
                classes:"myclass custom-class"
        };
        if (!this.allModuleName) {
            //this.allModulesService.getModels(this.location == 'int' ? '5': '2')
            this.allModulesService.getModels(this.location, this.selectedClientId, 'DoradoSkills')
            .subscribe(modules => {
                this.allModuleName = modules;
                let index : number = 0;

                this.allModuleName.map(model => {
                    this.domainDropdownList.push({ id: ++index, itemName: model });
                    //this.domainSelectedItems.push({ id: ++index, itemName: item.DomainName });
                })
            });
        }
    }

    onClentIdChange(id) {
        this.selectedClientId = id;
        this.allModulesService.getModels(this.location, this.selectedClientId, 'DoradoSkills')
        .subscribe(modules => {
            this.allModuleName = modules;
            this.domainDropdownList = [];
            this.domainSelectedItems = [];
            this.result = [];
            let index : number = 0;
            this.allModuleName.map(model => {
                this.domainDropdownList.push({ id: ++index, itemName: model });
                //this.domainSelectedItems.push({ id: ++index, itemName: item.DomainName });
            })
        });        
    }

    onChange(deviceValue) {
        /*
        if(this.query.trim().length > 0 && this.domainSelectedItems.length > 0)
        {
            this.search();
        }*/
        //console.log(this.location);
        this.location = deviceValue;
        this.allModulesService.getModels(this.location, this.selectedClientId, 'DoradoSkills')
        .subscribe(modules => {
            this.allModuleName = modules;
            this.domainDropdownList = [];
            this.domainSelectedItems = [];
            this.result = [];
            let index : number = 0;
            this.allModuleName.map(model => {
                this.domainDropdownList.push({ id: ++index, itemName: model });
                //this.domainSelectedItems.push({ id: ++index, itemName: item.DomainName });
            })
        });

    }
    onMultiSelectChange(event: any) {

        if(this.domainSelectedItems.length == 0)
            this.result = [];
        else if(this.query.trim().length > 0 && this.domainSelectedItems.length > 0) {
            this.search();
        }
    }

    onKey(event: any) {
        this.query = event.target.value;
        if(event.keyCode == 13 && this.domainSelectedItems.length > 0 && this.query.trim().length > 0) {
            this.search();
        }
    }

    search() {
        this.result = [];
        let domainList: Array<string> = [];
        this.domainSelectedItems.map(item => {
            domainList.push(item.itemName);
        })
        let obj : QASSearch = { Query: this.query.trim(), DomainList: domainList, Location: this.location, ClientId: this.selectedClientId, VirtualService: null  };

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
