import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import { ModuleComponent } from './models.component';
import { AllModulesService } from '../../services/modules.service';
import { RouterLinkStubDirective } from '../../../testing/routerLinkStubDirective';

describe('Model Component (Models)', () => {

  let fixture: ComponentFixture<ModuleComponent>;
  let comp: ModuleComponent;
  let moduleService: AllModulesService;
  let spy: jasmine.Spy;

  beforeEach(async(() => {
    const mockModulessService = {
      getModules: () => {
       return Observable.of([{ Description: 'AAA CCC', DomainID: 1, Location: 'Int', DomainName: 'AAA', Status: 'Pending', IsOwner: false },
        { Description: 'BBB BBB', DomainID: 2, Location: 'Prod', DomainName: 'BBB', Status: 'Approved', IsOwner: false },
        { Description: 'CCC AAA', DomainID: 3, Location: 'Prod', DomainName: 'CCC', Status: 'Approved', IsOwner: false }]);
      }
    }

    spy = spyOn(mockModulessService, 'getModules').and.callThrough();

    TestBed.configureTestingModule({
      declarations: [ModuleComponent, RouterLinkStubDirective], // declare the test component
      providers: [{ provide: AllModulesService, useValue: mockModulessService }],
      imports: [RouterTestingModule]
    })
      .compileComponents()  // compile template and css
      .then(() => {
        
        fixture = TestBed.createComponent(ModuleComponent);
        comp = fixture.componentInstance;
        //debugElement = fixture.debugElement;
        //fixture.detectChanges();
        //fixture = TestBed.createComponent(ModuleComponent);
        //comp = fixture.componentInstance;
      });
  }));

  xit('Should component created.', () => {
    expect(comp).toBeTruthy();
  })

  xit('Should onClickSaveBtn() trigger correct actions.', () => {
    //expect(spy.calls.count()).toBe(0);

    //component.onClickSaveBtn();
    //expect(spy.calls.count()).toBe(1);
  })



});


