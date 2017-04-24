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
var core_1 = require("@angular/core"); // <1>
var StarsComponent = (function () {
    function StarsComponent() {
        this._rating = 5; // <1>
        this.maxStars = 5; // <3>
        this.readonly = true;
        this.ratingChange = new core_1.EventEmitter();
    }
    Object.defineProperty(StarsComponent.prototype, "rating", {
        get: function () {
            return this._rating;
        },
        set: function (value) {
            this._rating = value || 0;
            this.stars = Array(this.maxStars).fill(true, 0, this.rating);
        },
        enumerable: true,
        configurable: true
    });
    StarsComponent.prototype.fillStarsWithColor = function (index) {
        if (!this.readonly) {
            this.rating = index + 1;
            this.ratingChange.emit(this.rating);
        }
    };
    return StarsComponent;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", Boolean)
], StarsComponent.prototype, "readonly", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [Number])
], StarsComponent.prototype, "rating", null);
__decorate([
    core_1.Output(),
    __metadata("design:type", core_1.EventEmitter)
], StarsComponent.prototype, "ratingChange", void 0);
StarsComponent = __decorate([
    core_1.Component({
        selector: 'auction-stars',
        templateUrl: 'app/components/stars/stars.html',
        styles: [" .starrating { color: #d17581; }"]
    })
], StarsComponent);
exports.StarsComponent = StarsComponent;
//# sourceMappingURL=stars.js.map