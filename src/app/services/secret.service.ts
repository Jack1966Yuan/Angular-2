import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable()
export class SecretService {
    public get adalConfig(): any {
        return {
            tenant: '72f988bf-86f1-41af-91ab-2d7cd011db47',
            clientId: environment.clientId, //lfportalwithauthdev
            redirectUri: window.location.origin + '/',
            // postLogoutRedirectUri: 'https://login.microsoftonline.com/72f988bf-86f1-41af-91ab-2d7cd011db47/oauth2/logout',
            //resourceId: '659ed2cb-4a03-48bf-ada9-1f20aef8ca77',
            //resourceId: '993f8836-ce5a-41c7-8ba5-9a483c4a35d3',
            postLogoutRedirectUri: window.location.origin + '/',
            expireOffsetSeconds: '1800',
        };
    }
}
