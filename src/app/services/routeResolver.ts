import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/delay';

import { UserInfoService } from './userInfo';



@Injectable()
export class AuthResolver implements Resolve<Observable<string>> {
  constructor(private auth: UserInfoService) {}

  resolve() {
    this.auth.resolver();
    if(sessionStorage.getItem('access_token'))
        return Observable.of('success')
    else
        while(!sessionStorage.getItem('access_token'));
        return Observable.of('failed');
  }
}
