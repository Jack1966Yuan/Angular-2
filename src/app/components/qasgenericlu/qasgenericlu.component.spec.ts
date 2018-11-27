import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QASGenericLUComponent } from './qasgenericlu.component';

describe('QasgenericluComponent', () => {
  let component: QASGenericLUComponent;
  let fixture: ComponentFixture<QASGenericLUComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QASGenericLUComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QASGenericLUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
