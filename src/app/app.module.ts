import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { TreeModule } from 'angular-tree-component';
//import { FileSelectDirective, FileDropDirective } from 'ng2-file-upload';
//import { Ng2UploaderModule } from 'ng2-uploader';

import { AppComponent } from './components/main/app.component';
import { NavMenuComponent } from './components/navmenu/navmenu.component';
import { HomeComponent } from './components/home/home.component';
import { AllModulesService } from './services/modules.service';
import { HttpHelperService } from './services/HttpHeaderService';
import { SecretService } from './services/secret.service';
import { UserInfoService } from './services/userInfo';
import { ModuleComponent } from './components/models/models.component';
import { DomainDetailComponent } from './components/modelDetail/modelDetail.component';
import { NewModule } from './components/newModule/new.component';
import { Utterance } from './components/utterance/utterance.component';
import { QueryComponent } from './components/query/query.component';
import { BVT } from './components/bvt/bvt.component';
import { routing } from './app.routes';
import { QASComponent } from './components/qas/qas.component';
import { AlertComponent } from './components/alert/alert.component';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown/angular2-multiselect-dropdown';
import { AdalService } from "ng2-adal/dist/core";
import { FocusDirective } from './directive/focus.directive';
import { UploadComponent } from './components/upload/upload.component';
import { ValidateComponent } from './components/validate/validate.component'
import { UnitComponent } from './components/validateunit/validateunit.component';
import { QASGenericLUComponent } from './components/qasgenericlu/qasgenericlu.component';
import { AdminComponent } from './components/admin/admin.component';
import { ToolComponent } from './components/tools/tools.component';
import { TaskComponent } from './components/uhrs/task.component';
import { SpinnerModule } from 'angular2-spinner/dist';
import { SchemaSuggestionComponent } from './components/schema-suggestion/schema-suggestion.component';
import { LuResolverComponent } from './components/resolver/luResolver.component';
import { UhrsContentComponent } from './components/uhrs-content/uhrs-content.component';
import { AuthResolver } from './services/routeResolver';
import { AuthService } from './services/authService';
import { LgDemoComponent } from './components/prebuiltLG/lg-prebuilt.component';
import { QASVSComponent } from './components/qasvs/qsavs.component';
import { LgService } from './components/prebuiltLG/lg-prebuilt.service';

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    ModuleComponent,
    DomainDetailComponent,
    NewModule,
    Utterance,
    QueryComponent,
    BVT,
    QASComponent,
    AlertComponent,
    FocusDirective,
    UploadComponent,
    ValidateComponent,
    UnitComponent,
    QASGenericLUComponent,
    AdminComponent,
    ToolComponent,
    TaskComponent,
    SchemaSuggestionComponent,
    LuResolverComponent,
    LgDemoComponent,
    UhrsContentComponent,
    QASVSComponent,
  ],
  imports: [
    HttpModule,
      BrowserModule,
      routing,
      FormsModule,
      ReactiveFormsModule,
      AngularMultiSelectModule,
      TreeModule,
      SpinnerModule
  ],
  providers: [
    AllModulesService,
    HttpHelperService,
    SecretService,
    UserInfoService,
    AdalService,
    AuthResolver,
    AuthService,
    LgService
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
