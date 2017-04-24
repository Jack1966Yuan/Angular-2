import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule} from '@angular/router';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';

import { ApplicationComponent }  from './application/application';
import { NavbarComponent } from './navbar/navbar';
import { FooterComponent } from './footer/footer';
import { StarsComponent } from './stars/stars';
import { CarouselComponent } from './carousel/carousel';
import { HomeComponent } from './home/home';
import { SearchComponent } from './search/search';
import { ProductDetailComponent } from './product-detail/product-detail';
import { ProductItemComponent } from './product-item/product-item';
import { FilterPipe } from './pipes/filter-pipe';

import {ProductService} from "../services/product-service";

@NgModule({
    imports:      [ BrowserModule, FormsModule, ReactiveFormsModule,
                    RouterModule.forRoot([
                        {path: '',                    component: HomeComponent},
                        {path: 'products/:productId', component: ProductDetailComponent}
    ]) ],
  declarations: [ ApplicationComponent,
                  NavbarComponent,
                  FooterComponent,
                  CarouselComponent,
                  HomeComponent,
                  ProductDetailComponent,
                  ProductItemComponent,
                  SearchComponent,
                  FilterPipe,                 
                  StarsComponent],
  providers:    [{provide: LocationStrategy, useClass: HashLocationStrategy}],                
  bootstrap:    [ ApplicationComponent ]
})
export class AppModule { }


