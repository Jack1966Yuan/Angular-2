import { Injectable } from '@angular/core';
import { Headers, Http, Request, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { HttpHelperService } from '../../services/HttpHeaderService';
import { BaseService } from '../../services/baseService';
import { environment } from '../../../environments/environment';
import { LgResolverRequestObject } from './lg-prebuilt.model';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

@Injectable()
export class LgService extends BaseService {

    constructor(private http: Http, private httpHelper: HttpHelperService) { super(); }

    public getLGEntity(lgDomain: string): Observable<any> {
        let options = this.httpHelper.createOauthHttpRequestOptions();
        return this.http.get(environment.APIURL + '/api/lg/sample?domain=' + lgDomain, options)
            .map(res => {
                return super.extractData(res);
            })
            .catch(super.handleError);
    }

    public getLGDomainName(): Observable<any> {
        //let timestamp: string = '?t=' + ((new Date()).getTime());
        //let user: string = '?username=' + localStorage.getItem('USER');
        let options = this.httpHelper.createOauthHttpRequestOptions();

        return this.http.get(environment.APIURL + '/api/lg/domains', options)
            .map(res => {
                return super.extractData(res);
            })
            .catch(super.handleError);
    }

    public getLGIntent(domain: string, luIntent: string) : Observable<any> {
        let options = this.httpHelper.createOauthHttpRequestOptions();        
        return this.http.get(environment.APIURL + '/api/lg/' + 'lgintent?domain=' + domain + '&luIntent=' + luIntent, options)
            .map(res => {
                return super.extractData(res);
            })
            .catch(super.handleError);        
    }

    public getConditionalSlots(domain: string, lgIntent: string, luIntent: string): Observable<any> {
        let options = this.httpHelper.createOauthHttpRequestOptions();        
        return this.http.get(environment.APIURL + '/api/lg/slots' + '?domain=' + domain + '&lgIntent=' + lgIntent + '&luIntent=' + luIntent, options)
            .map(res => {
                return super.extractData(res);
            })
            .catch(super.handleError);   
    }

    public lgResult(item: LgResolverRequestObject): Observable<any> {
        let objectToSend = JSON.stringify(item);
        let options = this.httpHelper.createOauthHttpRequestOptions();
        return this.http.post(environment.APIURL + '/api/lg/lgresult', objectToSend, options)
            .map(res => {
                return super.extractData(res);
            })
            .catch(this.handleError);
    }
}