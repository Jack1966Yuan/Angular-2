"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var product_service_1 = require("../../services/product-service");
require("rxjs/add/operator/debounceTime");
var HomeComponent = (function () {
    function HomeComponent(productService) {
        var _this = this;
        this.productService = productService;
        this.products = [];
        this.titleFilter = new forms_1.FormControl();
        this.products = this.productService.getProducts();
        this.titleFilter.valueChanges
            .debounceTime(100)
            .subscribe(function (value) { return _this.filterCriteria = value; }, function (error) { return console.error(error); });
    }
    return HomeComponent;
}());
HomeComponent = __decorate([
    core_1.Component({
        selector: 'auction-home-page',
        styleUrls: ['/home.css'],
        template: "\n    <div class=\"row carousel-holder\">\n      <div class=\"col-md-12\">\n        <auction-carousel></auction-carousel>\n      </div>\n    </div>\n    <div class=\"row\">\n      <div class=\"col-md-12\">\n        <div class=\"form-group\">\n          <input placeholder=\"Filter products by title\"\n          class=\"form-control\" type=\"text\" [formControl]=\"titleFilter\">\n        </div>\n      </div>\n    </div>\n    <div class=\"row\">\n      <div *ngFor=\"let product of products | filter: 'title':filterCriteria\" class=\"col-sm-4 col-lg-4 col-md-4\">\n        <auction-product-item [product]=\"product\"></auction-product-item>\n      </div>\n    </div>\n  ",
        providers: [product_service_1.ProductService]
    }),
    __metadata("design:paramtypes", [product_service_1.ProductService])
], HomeComponent);
exports.HomeComponent = HomeComponent;
//# sourceMappingURL=home.js.map