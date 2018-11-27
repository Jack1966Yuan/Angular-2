import { JsonArray } from '@angular-devkit/core/src';
import { Component, OnInit } from '@angular/core';
import { TreeModule } from 'angular-tree-component';
import { ActivatedRoute, Router } from '@angular/router';

import { AllModulesService } from '../../services/modules.service';
import { HttpHelperService } from '../../services/HttpHeaderService';
import { SecretService } from '../../services/secret.service';
import { AdalService } from 'ng2-adal/dist/core';
import { UserInfoService } from '../../services/userInfo';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/authService';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    providers: [AllModulesService, HttpHelperService, SecretService, UserInfoService, AuthService]
})

export class AppComponent implements OnInit {
  url: string;

  nodes;
  options = {};

  constructor(
    private adalService: AdalService,
    private secretService: SecretService,
    private user: UserInfoService,
    private httpService: HttpHelperService,
    private router: Router,
    private Auth: AuthService
  ) {
    this.nodes = environment.mainMenu;
    this.adalService.init(this.secretService.adalConfig);
    //this.url = this.router.snapshot.url[0];
  }
  ngOnInit(): void {
    this.adalService.handleWindowCallback();
    this.adalService.getUser();
    this.Auth.resolve();
    this.httpService.watchdog();
  }


  onEvent($event) {
    //console.log('Active: ' + $event.node.data.name);
    let name = $event.node.data.name.toLowerCase();
    let url = "";

    if (name === 'model')
      url = 'module';
    else if(name === 'generic lu')
      url = "qasgenericlu";
    else if(name === 'schema suggestion')
      url = 'suggestion';
    else if(name === 'prebuilt lg')
      url = 'prebuiltlg';
    else
      url = name;

    this.router.navigate([url]);
  }

  onBlur($event) {
    //console.log('onBlur: ' + $event.node.data.name);
    let name = $event.node.data.name.toLowerCase();
    let url = "";

    if(name === 'model')
      url = "module";
    else
      url = name;

    this.router.navigate([url]);
  }
}
