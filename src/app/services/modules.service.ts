import { Injectable } from '@angular/core';
import {
    OwnerList, Models, DomainList, DomainDetailDisplay, ItemDisplay, EditDomain, UpdateItem, NewModuleItem,
    UtterRules, HotfixItem, Rules, ISItem, Hotfix, ShareWithItem, ErrorMessage, QASSearch, QASResult,
    BaseSuggestion, AnnotationValidateResult, DomainDetailResponse, PostOwners, Users, UhrsTaskInfo,
    SchemaSuggestionAnnotation, LuisSchemaSuggestion, UhrsTaskAnnotationContent, UHRSAnnotationReviewResult
} from '../models/objects';
import { Headers, Http, Request, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { HttpHelperService } from './HttpHeaderService';
import { environment } from '../../environments/environment';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

@Injectable()
export class AllModulesService {

    public isAdmin: boolean = false;

    private headers = new Headers({
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        //'Expires': 'Sat, 01 Jan 2000 00:00:00 GMT'
    });

    private url: string = environment.APIURL;
    constructor(private http: Http, private httpHelper: HttpHelperService) { }
    //get all schemas
    public getModules(): Observable<Models> {
        //let timestamp: string = '?t=' + ((new Date()).getTime());
        //let user: string = '?username=' + localStorage.getItem('USER');
        let options = this.httpHelper.createOauthHttpRequestOptions();
        return this.http.get(this.url + '/api/schema', options)
            .map(res => {
                return this.extractAllSchemasData(res);
            })
            .catch(this.handleError);
    }

    getNativeWindow() {
        return window;
    }

    public getOwnerList(id: string) : Observable<OwnerList> {
        let options = this.httpHelper.createOauthHttpRequestOptions();
        return this.http.get(this.url + '/api/user/' + id, options)
        .map(res => {
            return this.extractOwnerList(res);
        })
        .catch(this.handleError);
    }

    public postOwnerList(id: string, owners: OwnerList): any {
        let options = this.httpHelper.createOauthHttpRequestOptions();
        let obj: PostOwners = new PostOwners(id, owners);
        let objectToSend: string  = JSON.stringify(obj);
        return this.http.post(this.url + '/api/user', objectToSend, options)
            .map(res => {
                return;
            })
            .catch(this.handleError);
    }

    public getLFModules(): Observable<DomainList[]> {
        //let timestamp: string = '?t=' + ((new Date()).getTime());
        //let user: string = '?username=' + localStorage.getItem('USER');
        let options = this.httpHelper.createOauthHttpRequestOptions();

        return this.http.get(this.url + '/api/schema/languagefactory', options)
            .map(res => {
                return this.extractAllSchemasData(res);
            })
            .catch(this.handleError);
    }

    public getDomain(id: string): Observable<DomainDetailResponse> {

        let options = this.httpHelper.createOauthHttpRequestOptions();
        //let parameters: string = id + '?username=' + localStorage.getItem('USER');
        let parameters: string = id;
        return this.http.get(this.url + '/api/Schema/' + parameters, options)
            .map(res => {
                return this.extractSchemaDetailsData(res, id);
            })
            .catch(this.handleError);
    }

    public getSchemaByName(domainName: string): Observable<DomainDetailDisplay> {

        const options = this.httpHelper.createOauthHttpRequestOptions();
        return this.http.get(this.url + '/api/Schema/domainname/' + domainName, options)
            .map(res => {
                return this.extractSchemaDetailsFromNamedResponse(res);
            })
            .catch(this.handleError);
    }

    //get models from Product or int
    getModels(location: string, clientId: string, virtualService: string): Observable<any> {
        let options = this.httpHelper.createOauthHttpRequestOptions();

        return this.http.get(this.url + '/api/qas/' + location + '?clientId=' + clientId + '&virtualService=' + virtualService , options)
            .map(res => {
                return this.extractModel(res);
            })
            .catch(this.handleError);
    }

    //get models from Product or int
    getUHRSTasks(): Observable<any> {
        let options = this.httpHelper.createOauthHttpRequestOptions();

        return this.http.get(this.url + '/api/domainrouting/', options)
            .map(res => {
                return this.extractUHRSTasks(res);
            })
            .catch(this.handleError);
    }

    getUHRSTaskContent(taskID: string): Observable<UhrsTaskAnnotationContent> {
      let options = this.httpHelper.createOauthHttpRequestOptions();

      return this.http.get(this.url + '/api/domainrouting/' + taskID, options)
          .map(res => {
              return this.extractUHRSTaskContent(res);
          })
          .catch(this.handleError);
    }

    postUHRSReviewResultToService(result: UHRSAnnotationReviewResult, postObject: UhrsTaskAnnotationContent): Observable<string> {

      let options = this.httpHelper.createOauthHttpRequestOptions();
        return this.http.post(this.url + '/api/domainrouting/review/' + result, postObject, options)
        .map((res: Response) => {
          if (res == null) {
            return;
          } else {
            return res.json();
          }
        })
        .catch(this.handleError);
     }

    deleteSchema(id: any): Observable<any> {

        let options = this.httpHelper.createOauthHttpRequestOptions();
        //let parameters : string = id + '?username=' + localStorage.getItem('USER');
        let parameters: string = id;

        return this.http.delete(this.url + '/api/Schema/' + parameters, options)
            .map(res => { })
            .catch(this.handleError);
    }

    //update schema
    putSchema(editDomain: EditDomain): Observable<any> {
        let objectToSend = JSON.stringify(editDomain);
        let options = this.httpHelper.createOauthHttpRequestOptions();
        return this.http.put(this.url + '/api/schema', objectToSend, options)
            .map(res => {
            })
            .catch(this.handleError);
    }

    //add new schema
    postSchema(newDomain: NewModuleItem): Observable<any> {

        let options = this.httpHelper.createOauthHttpRequestOptions();
        let objectToSend: string  = JSON.stringify(newDomain);
        return this.http.post(this.url + '/api/schema', objectToSend, options)
            .map(res => {
                return null;
            })
            .catch(this.handleError);
    }
    ///api/update Intent/Slot
    putIS(editDomain: UpdateItem): Observable<any> {

        let options = this.httpHelper.createOauthHttpRequestOptions();
        let objectToSend = JSON.stringify(editDomain);

        return this.http.put(this.url + '/api/Update', objectToSend, options)
            .map(res => {
                return res.json;
            })
            .catch(this.handleError);
    }
    postIS(editDomain: UpdateItem): Observable<any> {

        let options = this.httpHelper.createOauthHttpRequestOptions();
        let objectToSend = JSON.stringify(editDomain);
        return this.http.post(this.url + '/api/Update', objectToSend, options)
            .map(res => {
                return res.json;
            })
            .catch(this.handleError);
    }
    deleteIS(item: UpdateItem): Observable<any> {
        let objectToSend = JSON.stringify(item);
        let options = this.httpHelper.createOauthHttpRequestOptions();
        return this.http.delete(this.url + '/api/Update', new RequestOptions({
            headers: options.headers,
            body: item
        }))
            .map((res: Response) => res.json())
            .catch(this.handleError);
    }
    getUtterance(id: string): Observable<UtterRules> {
        let parameters: string = id;
        let options = this.httpHelper.createOauthHttpRequestOptions();
        return this.http.get(this.url + '/api/schema/all/' + parameters, options)
            .map(res => {
                return this.extractHotfixData(res, id);
            })
            .catch(this.handleError);
    }
    updateRule(rule: Rules): Observable<any> {
        let objectToSend = JSON.stringify(rule);
        return this.http.put(this.url + '/api/rule', objectToSend, { headers: this.headers })
            .map(res => {
            })
            .catch(this.handleError);
    }
    deleteRule(id: string): Observable<any> {
        return this.http.delete(this.url + '/api/rule/' + id)
            .map(res => { })
            .catch(this.handleError);
    }
    ///api/update Intent/Slot
    putHotfix(item: Hotfix): Observable<any> {
        let objectToSend = JSON.stringify(item);
        let options = this.httpHelper.createOauthHttpRequestOptions();
        return this.http.put(this.url + '/api/hotfix', objectToSend, options)
            .map(res => {
            })
            .catch(this.handleError);
    }
    postHotfix(item: Hotfix): Observable<any> {
        let objectToSend = JSON.stringify(item);
        const options = this.httpHelper.createOauthHttpRequestOptions();
        return this.http.post(this.url + '/api/hotfix/single', objectToSend, options)
            .map(res => {
                return res.json;
            })
            .catch(this.handleError);
    }

    deleteHotfix(item: Hotfix): Observable<any> {
        //let objectToSend = JSON.stringify(item);
        let options = this.httpHelper.createOauthHttpRequestOptions();
        return this.http.delete(this.url + '/api/hotfix', new RequestOptions({
            headers: options.headers,
            body: item
        }))
            .map(res => { })
            .catch(this.handleError);
    }


    hotfixValidate(domainID, clientId): Observable<Array<AnnotationValidateResult>> {
      let options = this.httpHelper.createOauthHttpRequestOptions();
      return this.http.get(this.url + '/api/hotfix/validate?domainID=' + domainID + '&qasClientType=' + clientId, options)
        .map(res => {
          return this.extractAnnotationValidateResult(res);
        })
        .catch(this.handleError);
    }

    bvtValidate(domainID, clientId): Observable<Array<AnnotationValidateResult>> {
      let options = this.httpHelper.createOauthHttpRequestOptions();
      return this.http.get(this.url + '/api/bvt/validate?domainID=' + domainID + '&qasClientType=' + clientId, options)
        .map(res => {
          return this.extractAnnotationValidateResult(res);
        })
        .catch(this.handleError);
    }

    dowonloadSchema(domainIDs): Observable<string> {
        let options = this.httpHelper.createOauthHttpRequestOptions();
        let domainid = "";
        domainIDs.map(id => {
            if(domainid.length > 0) {
                domainid += '&domainList[]=' + id;
            } else
                domainid += 'domainList[]=' + id;
        })
        return this.http.get(this.url + '/api/schema/download?' + domainid, options)
            .map(res => {
                return this.processResponse(res);
            })
            .catch(this.handleError);
    }

    processResponse(res: any): string {
        return res._body;
    }

    exportSchema(domainIDs, fileName): Observable<any> {
        let options = this.httpHelper.createOauthHttpRequestOptions();
        let domainid = "";
        domainIDs.map(id => {
            if(domainid.length > 0) {
                domainid += '&domainList[]=' + id;
            } else
                domainid += 'domainList[]=' + id;
        })

        return this.http.get(this.url + '/api/schema/export?' + domainid + '&exportFile=' + fileName, options)
            .map(res => {
                return this.extractExportFiles(res);
            })
            .catch(this.handleError);
    }

    getBVT(id: string): Observable<UtterRules> {

        let options = this.httpHelper.createOauthHttpRequestOptions();
        let parameters: string = id;
        return this.http.get(this.url + '/api/schema/all/' + parameters, options)
            .map(res => {
                return this.extractBVTData(res, id);
            })
            .catch(this.handleError);
    }

    // api/update Intent/Slot
    putBVT(item: Hotfix): Observable<any> {
        let objectToSend = JSON.stringify(item);
        let options = this.httpHelper.createOauthHttpRequestOptions();
        return this.http.put(this.url + '/api/bvt', objectToSend, options)
            .map(res => {
            })
            .catch(this.handleError);
    }

    postBVT(item: Hotfix): Observable<any> {
        let objectToSend = JSON.stringify(item);
        let options = this.httpHelper.createOauthHttpRequestOptions();
        return this.http.post(this.url + '/api/bvt/single', objectToSend, options)
            .map(res => {
                return res.json;
            })
            .catch(this.handleError);
    }

    deleteBVT(item: Hotfix): Observable<any> {
        let objectToSend = JSON.stringify(item);
        let options = this.httpHelper.createOauthHttpRequestOptions();
        return this.http.delete(this.url + '/api/bvt', new RequestOptions({
            headers: options.headers,
            body: item
        }))
            .map(res => { })
            .catch(this.handleError);
    }

    sharewith(obj: ShareWithItem): Observable<any> {
        let objectToSend = JSON.stringify(obj);
        return this.http.post(this.url + '/api/user', objectToSend, { headers: this.headers })
            .map(res => {
                return res.json;
            })
            .catch(this.handleError);
    }

    deployModel(id: string): Observable<any> {
        let options = this.httpHelper.createOauthHttpRequestOptions();
        return this.http.post(this.url + '/api/deploy/?domainID=' + id, null, options)
            .map(res => {
                return res.json;
            })
            .catch(this.handleError);
    }

    QASsearch(obj: QASSearch): Observable<any> {
        let objectToSend = JSON.stringify(obj);
        return this.http.post(this.url + '/api/qas', objectToSend, { headers: this.headers })
            .map(res => {
                return this.extractQASResult(res);
            })
            .catch(this.handleError);
    }

    getQASGenericLUModelResults(model: string, query: string, prod: boolean = true): Observable<any> {
      const url: string = this.url + '/api/qas/genericlu/models/' + model + '/results?prod=' + prod.toString() + '&query=' + query;
      const options: RequestOptions = this.httpHelper.createDefaultHttpRequestOptionsAsync();
      return this.http.get(url, options)
        .map(results => {
          return this.extractQASResult(results);
        })
        .catch(this.handleError);
    }

    getGmsGenericLUModelResults(model: string, query: string): Observable<any> {
      let url: string = this.url + '/api/genericlu/gmsgenericluresolver?query='  + query + '&model=' + model;
      const options: RequestOptions = this.httpHelper.createDefaultHttpRequestOptionsAsync();
      return this.http.get(url, options)
        .map(results => {
          return JSON.parse(results.json());
        })
        .catch(err => this.handleError(err));
    }

    /***** */
    // api/suggest/{id}?tag=""
    // BaseSuggestion
    getReviewData(domainID: string, tag: string, field: string): Observable<BaseSuggestion> {
        let options = this.httpHelper.createOauthHttpRequestOptions();
        let type: string = field === 'Intent' ? '1' : '2';
        let parameters: string = domainID + '?tag=' + tag + '&UpdateType=' + type;
        return this.http.get(this.url + '/api/suggest/' + parameters, options)
            .map(res => {
                return this.extractSuggestion(res);
            })
            .catch(this.handleError);
    }

    postAdminReview(curSuggestion: BaseSuggestion): Observable<any> {

        let options = this.httpHelper.createOauthHttpRequestOptions();
        let objectToSend = JSON.stringify(curSuggestion);
        return this.http.post(this.url + '/api/suggest', objectToSend, options)
            .map(res => {
                console.log('success');
            })
            .catch(this.handleError);
    }

    //get all admins
    getAdmins() : Observable<Users> {
        let options = this.httpHelper.createOauthHttpRequestOptions();
        return this.http.get(this.url + '/api/admin', options)
            .map(res => { return this.extractAdmins(res)})
            .catch(this.handleError);
    }

    removeAdmin(alias: string): Observable<any> {
        let options = this.httpHelper.createOauthHttpRequestOptions();
        return this.http.delete(this.url + '/api/admin/' + alias, options)
            .map(() => {})
            .catch(this.handleError);
    }

    addAdmin(alias: string): Observable<any> {
        let options = this.httpHelper.createOauthHttpRequestOptions();
        return this.http.post(this.url + '/api/admin/?alias=' + alias, null, options)
            .map(() => {})
            .catch(this.handleError);
    }

    extractAdmins(res: any) : Users {
        let body : any = JSON.parse(res._body);
        let result: Array<string> = [];
        body.Admins.map((item) => {
            result.push(item.RowKey);
        })
        return { CurrentUser: body.CurrentUser, Admins: result };
    }

    // Call api/qas/suggestion
    getSchemaSuggestion(query: string): Observable<SchemaSuggestionAnnotation> {
        const options = this.httpHelper.createOauthHttpRequestOptions();
        return this.http.post(this.url + '/api/qas/suggestion', JSON.stringify(query), options)
        .map((response) => {
            return this.parseSchemaSuggestion(response);
        })
        .catch(this.handleError);
    }

    LuisValidateQueries(queryObject: LuisSchemaSuggestion): Observable<any> {
        const options = this.httpHelper.createOauthHttpRequestOptions();
        let objectToSend = JSON.stringify(queryObject);
        return this.http.post(this.url + '/api/LuResolver/query', objectToSend, { headers: this.headers })
        .map((response) => {
            return this.extractLuisResponse(response);
        })
        .catch(this.handleError);
    }

    private extractLuisResponse(res: any) {
        return JSON.parse(res._body);
    }

    private parseSchemaSuggestion(response: any): SchemaSuggestionAnnotation {
        return JSON.parse(response._body);
    }

    private extractSuggestion(res: any) {
        return JSON.parse(res._body);
    }
    /**** */
    private extractModel(res: any) {
        return JSON.parse(res._body);
    }

    private extractUHRSTasks(res: any) {
        let body: any = JSON.parse(res._body);
        let uhrsTaskList: Array<UhrsTaskInfo> = [];

        if(body != null){
            body.map((item) => {
                var domainList = JSON.parse( item.DomainList ).join(', ');
                uhrsTaskList.push({ TaskID: item.TaskID, TaskName: item.TaskName, CreateTime: item.CreateTime, DataOwner: item.DataOwner, DomainList: domainList, AnnotationStatus: item.AnnotatingStatus, TaskType: item.TaskType });
            });
        }
        return uhrsTaskList;
    }

    private extractUHRSTaskContent(res: any) {
      return JSON.parse(res._body);
    }

    private extractQASResult(res: any) {
        let body: Array<any> = JSON.parse(res._body);
        return body;
    }

    private extractSchemaDetailsData(res: any, id: string) {
        let body: any = JSON.parse(res._body);

        let intents: Array<ItemDisplay> = [];
        let slots: Array<ItemDisplay> = [];

        body.RequestedObject.IntentList && body.RequestedObject.IntentList.map(p => {
            intents.push({ Name: p.Name, Tag: p.Tag, Description: p.Description, Positive: p.PositiveList, Negative: p.NegativeList, DisplayFlag: true, ReviewStatus: p.ReviewStatus });
        });

        body.RequestedObject.SlotList && body.RequestedObject.SlotList.map(p => {
            slots.push({ Name: p.Name, Tag: p.Tag, Description: p.Description, Positive: p.PositiveList, Negative: p.NegativeList, DisplayFlag: true, ReviewStatus: p.ReviewStatus });
        });

        const _module: DomainDetailDisplay = {
            DomainID: id,
            Name: body.RequestedObject.DomainName,
            Description: body.RequestedObject.Description,
            Intent: intents,
            Slot: slots,
            DisplayFlag: true,
            UserType: body.RequestedObject.UserType,
            InPending: body.RequestedObject.InPending
        };

        return { IsAdmin: body.IsAdmin, RequestedObject: _module };
    }

    private extractExportFiles(res: any): any {
        let body: any = JSON.parse(res._body);
        return body;
    }

    private extractOwnerList(res: any): any {
        let body: any = JSON.parse(res._body);
        let dataOwners: Array<string> = [];
        let modelOwners: Array<string> = [];
        let skillOwners: Array<string> = [];

        if(!body)
            return new OwnerList(dataOwners, modelOwners, skillOwners);

        if(body.DataOwnerList)
        {
            body.DataOwnerList.map(o => {
                dataOwners.push(o.Alias)
            })
        }

        if(body.ModelOwnerList)
        {
            body.ModelOwnerList.map(o => {
                modelOwners.push(o.Alias)
            })
        }

        if(body.SkillOwnerList)
        {
            body.SkillOwnerList.map(o => {
                skillOwners.push(o.Alias)
            })
        }

        return new OwnerList(dataOwners, modelOwners, skillOwners);
    }

    private extractBVTData(res: any, id: string): UtterRules {
        let body: any = JSON.parse(res._body);
        let intents: Array<ISItem> = [];
        let slots: Array<ISItem> = [];
        let hotfix: Array<HotfixItem> = [];

        body.RequestedObject.Schema.IntentList && body.RequestedObject.Schema.IntentList.map(i => {
            intents.push({ Name: i.Name, Tag: i.Tag });
        });

        body.RequestedObject.Schema.SlotList && body.RequestedObject.Schema.SlotList.map(i => {
            slots.push({ Name: i.Name, Tag: i.Tag });
        });

        body.RequestedObject.bvt_list && body.RequestedObject.bvt_list.map(i => {
            hotfix.push({ DomainID: i.DomainID, Sentence: i.Sentence, Intent: i.Intent, SlotString: i.SlotString, DisplayFlag: true });
        })

        let result: UtterRules = { DomainID: id, DomainName: body.RequestedObject.Schema.DomainName, IntentList: intents, SlotList: slots, HotfixList: hotfix, Rules: body.RequestedObject.Rules || '', UserType: body.RequestedObject.Schema.UserType, Deployed: body.RequestedObject.Schema.InPending === 2 };
        return result;
    }

    private extractAnnotationValidateResult(res: any): any {
        let body: any = JSON.parse(res._body);
        return body;
    }

    private extractHotfixData(res: any, id: string): UtterRules {
        let body: any = JSON.parse(res._body);
        let intents: Array<ISItem> = [];
        let slots: Array<ISItem> = [];
        let hotfix: Array<HotfixItem> = [];

        body.RequestedObject.Schema.IntentList && body.RequestedObject.Schema.IntentList.map(i => {
            intents.push({ Name: i.Name, Tag: i.Tag });
        });

        body.RequestedObject.Schema.SlotList && body.RequestedObject.Schema.SlotList.map(i => {
            slots.push({ Name: i.Name, Tag: i.Tag });
        });

        body.RequestedObject.Hotfix_List && body.RequestedObject.Hotfix_List.map(i => {
            hotfix.push({ DomainID: i.DomainID, Sentence: i.Sentence, Intent: i.Intent, SlotString: i.SlotString, DisplayFlag: true });
        })

        let result: UtterRules = { DomainID: id, DomainName: body.RequestedObject.Schema.DomainName, IntentList: intents, SlotList: slots, HotfixList: hotfix, Rules: body.RequestedObject.Rules || '', UserType: body.RequestedObject.Schema.UserType, Deployed: body.RequestedObject.Schema.InPending === 2 };
        return result;
    }


    private convertOwner(obj : Array<any>) {
        let result: Array<string> = [];
        obj.map(o => {
            result.push(o.Alias);
        })
        return result;
    }

    private extractAllSchemasData(res: any) {
        let body: any = JSON.parse(res._body);
        let domains: Array<DomainList> = [];

        body.RequestedObject.map(item => {
            let owners: OwnerList = !item.Owners?  null : {DataOwnerList: {Alias: this.convertOwner(item.Owners.DataOwnerList)}, ModelOwnerList: {Alias: this.convertOwner(item.Owners.ModelOwnerList)}, SkillOwnerList: {Alias: this.convertOwner(item.Owners.SkillOwnerList)} };
            domains.push({
                Description: item.Description,
                DomainID: item.DomainID,
                DomainName: item.DomainName,
                InDevelopment: item.InDevelopment,
                InPending: item.InPending,
                IsOwner: item.IsOwner,
                Owners: owners,
                IsLFModel: item.IsLFModel
            })
        })

        /*
        let _allModule: Array<DomainList> = [];
        if (body != null) {
            body.ModelList.map(item => {
                let curStatus = '';
                switch (item..InPending) {
                    case 0: {
                        curStatus = 'Pending';
                        break;
                    }
                    case 1: {
                        curStatus = 'Approved';
                        break;
                    }
                    case 2: {
                        curStatus = 'Deployed';
                        break;
                    }
                }
                _allModule.push({
                    Description: item.Description,
                    DomainID: item.DomainID, Location: (item.InDevelopment ? 'Int' : 'Prod'),
                    DomainName: item.DomainName, Status: curStatus,
                    IsOwner: item.IsOwner,
                    //Owner: item.Owner && item.Owner.length > 0 ? item.Owner.replace(/@microsoft.com/g, '') : ''
                    Owner: item.OwnerList
                });
            });
        }
        */
        return {IsAdmin: body.IsAdmin, RequestedObject: domains};
    }

    extractSchemaDetailsFromNamedResponse(res: any): any {
        const body: any = JSON.parse(res._body);

        let intents: Array<ItemDisplay> = [];
        let slots: Array<ItemDisplay> = [];

        body.IntentList && body.IntentList.map(p => {
            intents.push({
                Name: p.Name,
                Tag: p.Tag,
                Description: p.Description,
                Positive: p.PositiveList,
                Negative: p.NegativeList,
                DisplayFlag: true,
                ReviewStatus: p.ReviewStatus
            });
        });

        body.SlotList && body.SlotList.map(p => {
            slots.push({
                Name: p.Name,
                Tag: p.Tag,
                Description: p.Description,
                Positive: p.PositiveList,
                Negative: p.NegativeList,
                DisplayFlag: true,
                ReviewStatus: p.ReviewStatus
            });
        });

        const _module: DomainDetailDisplay = {
            DomainID: 'unknown',
            Name: body.DomainName,
            Description: body.Description,
            Intent: intents,
            Slot: slots,
            DisplayFlag: true,
            UserType: body.UserType,
            InPending: body.InPending
        };

        return _module;
    }

    private handleError(error: any) {
        const errObj: ErrorMessage = {
            status: error.status, statusText: error.statusText, message: JSON.parse(error._body).Message
        };
        return Observable.throw(errObj);
    }
}
