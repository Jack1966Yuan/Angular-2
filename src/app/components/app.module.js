"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require("@angular/core");
var platform_browser_1 = require("@angular/platform-browser");
var router_1 = require("@angular/router");
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var application_1 = require("./application/application");
var navbar_1 = require("./navbar/navbar");
var footer_1 = require("./footer/footer");
var stars_1 = require("./stars/stars");
var carousel_1 = require("./carousel/carousel");
var home_1 = require("./home/home");
var search_1 = require("./search/search");
var product_detail_1 = require("./product-detail/product-detail");
var product_item_1 = require("./product-item/product-item");
var filter_pipe_1 = require("./pipes/filter-pipe");
var AppModule = (function () {
    function AppModule() {
    }
    return AppModule;
}());
AppModule = __decorate([
    core_1.NgModule({
        imports: [platform_browser_1.BrowserModule, forms_1.FormsModule, forms_1.ReactiveFormsModule,
            router_1.RouterModule.forRoot([
                { path: '', component: home_1.HomeComponent },
                { path: 'products/:productId', component: product_detail_1.ProductDetailComponent }
            ])],
        declarations: [application_1.ApplicationComponent,
            navbar_1.NavbarComponent,
            footer_1.FooterComponent,
            carousel_1.CarouselComponent,
            home_1.HomeComponent,
            product_detail_1.ProductDetailComponent,
            product_item_1.ProductItemComponent,
            search_1.SearchComponent,
            filter_pipe_1.FilterPipe,
            stars_1.StarsComponent],
        providers: [{ provide: common_1.LocationStrategy, useClass: common_1.HashLocationStrategy }],
        bootstrap: [application_1.ApplicationComponent]
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map