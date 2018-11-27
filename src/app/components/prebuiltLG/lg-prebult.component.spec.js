"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testing_1 = require("@angular/core/testing");
var lg_prebuilt_component_1 = require("./lg-prebuilt.component");
describe('LgDemoComponent', function () {
    var component;
    var fixture;
    beforeEach(testing_1.async(function () {
        testing_1.TestBed.configureTestingModule({
            declarations: [lg_prebuilt_component_1.LgDemoComponent]
        })
            .compileComponents();
    }));
    beforeEach(function () {
        fixture = testing_1.TestBed.createComponent(lg_prebuilt_component_1.LgDemoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    xit('should create', function () {
        expect(component).toBeTruthy();
    });
});
//# sourceMappingURL=lg-prebult.component.spec.js.map