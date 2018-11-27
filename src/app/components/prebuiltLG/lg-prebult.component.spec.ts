import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LgDemoComponent } from './lg-prebuilt.component';

describe('LgDemoComponent', () => {
  let component: LgDemoComponent;
  let fixture: ComponentFixture<LgDemoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LgDemoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LgDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
