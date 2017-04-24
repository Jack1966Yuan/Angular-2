import {Component, Input} from '@angular/core';
import {Product} from '../../services/product';

@Component({
  selector: 'auction-product-item',
  styleUrls: ['app/components/product-item/product-item.css'],
  templateUrl: 'app/components/product-item/product-item.html'
})
export class ProductItemComponent {
  @Input() product: Product;
}

