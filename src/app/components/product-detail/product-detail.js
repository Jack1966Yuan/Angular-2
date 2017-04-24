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
var router_1 = require("@angular/router");
var review_1 = require("../../services/review");
var product_service_1 = require("../../services/product-service");
var ProductDetailComponent = (function () {
    function ProductDetailComponent(route, productService) {
        this.isReviewHidden = true;
        var prodId = parseInt(route.snapshot.params['productId']);
        this.product = productService.getProductById(prodId);
        this.reviews = productService.getReviewsForProduct(this.product.id);
    }
    ProductDetailComponent.prototype.addReview = function () {
        var review = new review_1.Review(0, this.product.id, new Date(), 'Anonymous', this.newRating, this.newComment);
        console.log("Adding review " + JSON.stringify(review));
        this.reviews = this.reviews.concat([review]);
        this.product.rating = this.averageRating(this.reviews);
        this.resetForm();
    };
    ProductDetailComponent.prototype.averageRating = function (reviews) {
        var sum = reviews.reduce(function (average, review) { return average + review.rating; }, 0);
        return sum / reviews.length;
    };
    ProductDetailComponent.prototype.resetForm = function () {
        this.newRating = 0;
        this.newComment = null;
        this.isReviewHidden = true;
    };
    return ProductDetailComponent;
}());
ProductDetailComponent = __decorate([
    core_1.Component({
        selector: 'auction-product-page',
        styles: ["auction-stars.large {font-size: 24px;}"],
        templateUrl: 'app/components/product-detail/product-detail.html',
        providers: [product_service_1.ProductService]
    }),
    __metadata("design:paramtypes", [router_1.ActivatedRoute, product_service_1.ProductService])
], ProductDetailComponent);
exports.ProductDetailComponent = ProductDetailComponent;
//# sourceMappingURL=product-detail.js.map