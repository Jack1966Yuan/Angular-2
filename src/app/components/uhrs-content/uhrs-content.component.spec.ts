import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UhrsContentComponent } from './uhrs-content.component';

describe('UhrsContentComponent', () => {
  let component: UhrsContentComponent;
  let fixture: ComponentFixture<UhrsContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UhrsContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UhrsContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
