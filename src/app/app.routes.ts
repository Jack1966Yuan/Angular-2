import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './components/home/home.component';
import { DomainDetailComponent } from './components/modelDetail/modelDetail.component';
import { NewModule } from './components/newModule/new.component';
import { Utterance } from './components/utterance/utterance.component';
import { QueryComponent } from './components/query/query.component';
import { ModuleComponent } from './components/models/models.component';
import { BVT } from './components/bvt/bvt.component';
import { QASComponent } from './components/qas/qas.component';
import { UserInfoService } from './services/userInfo';
import { ValidateComponent } from './components/validate/validate.component';
import { QASGenericLUComponent } from './components/qasgenericlu/qasgenericlu.component';
import { ToolComponent } from './components/tools/tools.component';
import { TaskComponent } from './components/uhrs/task.component';
import { SchemaSuggestionComponent } from './components/schema-suggestion/schema-suggestion.component';
import { LuResolverComponent } from './components/resolver/luResolver.component';
import { UhrsContentComponent } from './components/uhrs-content/uhrs-content.component';
import { AuthResolver } from './services/routeResolver';
import { LgDemoComponent } from './components/prebuiltLG/lg-prebuilt.component';
import { QASVSComponent } from './components/qasvs/qsavs.component';

const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full',  resolve: { message: AuthResolver } },
    { path: 'home', component: HomeComponent,  resolve: { message: AuthResolver } },
    { path: 'detail/:id', component: DomainDetailComponent,  resolve: { message: AuthResolver } },
    { path: 'module', component: ModuleComponent,  resolve: { message: AuthResolver } },
    { path: 'new model', component: NewModule,  resolve: { message: AuthResolver } },
    { path: 'utterance/:id', component: Utterance,  resolve: { message: AuthResolver } },
    { path: 'validate', component: ValidateComponent,  resolve: { message: AuthResolver } },
    { path: 'bvt/:id', component: BVT,  resolve: { message: AuthResolver } },
    { path: 'qas', component: QASComponent, resolve: { message: AuthResolver } },
    { path: 'tools', component: ToolComponent,  resolve: { message: AuthResolver } },
    { path: 'qasgenericlu', component: QASGenericLUComponent,  resolve: { message: AuthResolver } },
    { path: 'uhrs', component: TaskComponent,  resolve: { message: AuthResolver } },
    { path: 'uhrscontent/:id', component: UhrsContentComponent },
    { path: 'suggestion', component: SchemaSuggestionComponent,  resolve: { message: AuthResolver } },
    { path: 'luresolver', component: LuResolverComponent,  resolve: { message: AuthResolver } },
    { path: 'prebuiltlg', component: LgDemoComponent,  resolve: { message: AuthResolver } },
    { path: 'vs_clientid', component: QASVSComponent,  resolve: { message: AuthResolver } },
    { path: '**', redirectTo: 'home' }
];

export const routing = RouterModule.forRoot(routes);
