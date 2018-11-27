﻿import { Component, OnDestroy, OnInit } from '@angular/core';
import { query } from '@angular/core/src/animation/dsl';
import { Injectable } from '@angular/core';
import { Headers, RequestOptions } from '@angular/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AdalService } from 'ng2-adal/dist/core';
import { SecretService } from './secret.service';
import { Observable, Subscription } from 'rxjs/Rx';

@Injectable()
export class HttpHelperService implements OnDestroy {

    // private headers = new Headers({
    //     'Content-Type': 'application/json',
    //     'Cache-Control': 'no-cache',
    //     'Pragma': 'no-cache',
    //     //'Expires': 'Sat, 01 Jan 2000 00:00:00 GMT'
    // });
    currSub: Subscription;
    constructor(private router: Router,
      private adalService: AdalService,
      private secretService: SecretService,
    ) {  this.currSub = null; }


    public createOauthHttpRequestOptions(): RequestOptions {
      let headers = new Headers();
      headers.append('Accept', 'application/json,text/html,application/xhtml+xml,application/xml');
      headers.append('Cache-Control', 'no-cache');
      headers.append('Content-Type', 'application/json');
      let token = sessionStorage.getItem('access_token');
      //console.log(token);
      headers.append('Authorization', 'bearer ' + token);
      return new RequestOptions({ headers: headers });
  }

    public createDefaultHttpRequestOptionsAsync(): RequestOptions {
      let headers = new Headers();
      headers.append('Accept', 'application/json,text/html,application/xhtml+xml,application/xml');
      headers.append('Cache-Control', 'no-cache');
      headers.append('Content-Type', 'application/json');
      return new RequestOptions({ headers: headers });
  }

    public watchdog() {

      let timer = Observable.timer(1000 * 60 * 20, 1000 * 60 * 20);
      if (this.currSub == null) {
        console.log('subscribe');
        this.currSub = timer.subscribe(
          t => {
            //console.log('refresh token at: ' + t);
            this.getToken();
          }
        );
      }
      // if (sessionStorage.getItem('start_token') === null || sessionStorage.getItem('start_token') !== 'true') {
      //   sessionStorage.setItem('start_token', 'true');
      //   console.log('subscribe');
      //   setInterval( () => {
      //     console.log('refresh token');
      //     this.getToken();
      //   },  1000 * 60);
      // }
    }

    public getToken() {
      this.adalService.acquireToken(this.secretService.adalConfig.clientId).subscribe(
          (tokenout) => {
            //console.log('get token: ' + tokenout);
            sessionStorage.setItem('access_token', tokenout);
          }
      );
   }

  ngOnDestroy() {
    this.currSub = null;
  }

}
