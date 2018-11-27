import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { AdalService } from "ng2-adal/dist/core";
import { RouterTestingModule } from '@angular/router/testing';

import { AppComponent } from './app.component';
import { NavMenuComponent } from '../navmenu/navmenu.component';
import { RouterLinkStubDirective } from '../../../testing/routerLinkStubDirective';

describe('AppComponent (home app)', () => {

  let fixture: ComponentFixture<AppComponent>;
  let comp: AppComponent;
  let links: RouterLinkStubDirective[];
  let linkDes: DebugElement[];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent, NavMenuComponent, RouterLinkStubDirective], // declare the test component
      providers: [AdalService],
      imports: [RouterTestingModule],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents()  // compile template and css
    .then(() => {
      fixture = TestBed.createComponent(AppComponent);
      comp = fixture.componentInstance;
    });
  }));

  beforeEach(() => {
    // trigger initial data binding
    fixture.detectChanges();

    // find DebugElements with an attached RouterLinkStubDirective
    linkDes = fixture.debugElement
      .queryAll(By.directive(RouterLinkStubDirective));

    // get the attached link directive instances using the DebugElement injectors
    links = linkDes
      .map(de => de.injector.get(RouterLinkStubDirective) as RouterLinkStubDirective);
  });

  xit('can get RouterLinks from template', () => {
    expect(links.length).toBe(5, 'should have 4 links');

    console.log(links[0].linkParams);
    console.log(links[1].linkParams);
    console.log(links[2].linkParams);
    console.log(links[3].linkParams);
    console.log(links[4].linkParams);
    expect(links[0].linkParams).toMatch('/home', '1st link should go to home');
    expect(links[1].linkParams).toMatch('/home', '2nd link should go to modules');
    expect(links[2].linkParams).toMatch('/module', '3nd link should go to modules');
    expect(links[3].linkParams).toMatch('/new', '4nd link should go to new');
    expect(links[4].linkParams).toMatch('/qas', '5nd link should go to qas');
  });

  xit('Get link in template', () => {
    const homeLinkDe = linkDes[1];
    const homeLink = links[1];

    expect(homeLink.navigatedTo).toBeNull('link should not have navigated yet');

    homeLinkDe.triggerEventHandler('click', () => {});
    fixture.detectChanges();
    //console.log()
    expect(homeLink.navigatedTo).toMatch('/home');
  });
});
