import { Injectable } from '@angular/core';
import { Headers, Http, Request, RequestOptions, Response } from '@angular/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { ErrorMessage } from '../models/objects';

@Injectable()
export class BaseService {

    protected headers = new Headers({
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
    });

    protected constructor() { }

    protected extractData(res: any) {
        return JSON.parse(res._body);
    }

    protected handleError(error: any) {
        const errObj: ErrorMessage = {
            status: error.status, statusText: error.statusText, message: JSON.parse(error._body).Message
        };
        return Observable.throw(errObj);
    }
}