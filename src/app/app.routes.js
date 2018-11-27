"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var router_1 = require("@angular/router");
var home_component_1 = require("./components/home/home.component");
var modelDetail_component_1 = require("./components/modelDetail/modelDetail.component");
var new_component_1 = require("./components/newModule/new.component");
var utterance_component_1 = require("./components/utterance/utterance.component");
var lfmodel_component_1 = require("./components/lfmodel/lfmodel.component");
var models_component_1 = require("./components/models/models.component");
var bvt_component_1 = require("./components/bvt/bvt.component");
var qas_component_1 = require("./components/qas/qas.component");
var userInfo_1 = require("./services/userInfo");
var routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: home_component_1.HomeComponent, canActivate: [userInfo_1.UserInfoService] },
    { path: 'detail/:id', component: modelDetail_component_1.DomainDetailComponent, canActivate: [userInfo_1.UserInfoService] },
    { path: 'module', component: models_component_1.ModuleComponent, canActivate: [userInfo_1.UserInfoService] },
    { path: 'new', component: new_component_1.NewModule, canActivate: [userInfo_1.UserInfoService] },
    { path: 'utterance/:id', component: utterance_component_1.Utterance },
    { path: 'lfmodel', component: lfmodel_component_1.lfmodel },
    { path: 'bvt/:id', component: bvt_component_1.BVT },
    { path: 'qas', component: qas_component_1.QASComponent },
    { path: '**', redirectTo: 'home' }
];
exports.routing = router_1.RouterModule.forRoot(routes);
//# sourceMappingURL=app.routes.js.map
