import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AdalService } from 'ng2-adal/dist/core';
import { SecretService } from './secret.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

@Injectable()
export class UserInfoService {
    constructor(
        private adalService: AdalService,
        private secretService: SecretService,
        private router: Router
    ) { }

    resolver() {
        if (this.adalService.userInfo.isAuthenticated) {
            this.adalService.acquireToken(this.secretService.adalConfig.clientId)
                .subscribe(tokenOut => {
                    //console.log('route change token request complete');
                    sessionStorage.setItem('access_token', tokenOut);
                });
        } else {
            this.adalService.login();
            while(!sessionStorage.getItemItem('access_token'));
        }      
    }
}
