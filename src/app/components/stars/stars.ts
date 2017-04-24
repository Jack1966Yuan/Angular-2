import {Component,  Input, Output, EventEmitter} from '@angular/core'; // <1>

@Component({
  selector: 'auction-stars',
  templateUrl: 'app/components/stars/stars.html',
  styles: [` .starrating { color: #d17581; }`]
})
export class StarsComponent {
  private _rating: number = 5; // <1>
  private stars: boolean[]; // <2>
  private maxStars: number = 5; // <3>

  @Input() readonly: boolean = true;

  @Input() get rating(): number {
    return this._rating;
  }
  
  set rating(value: number)
  {
    this._rating = value || 0;
    this.stars = Array(this.maxStars).fill(true, 0, this.rating);
  }
  @Output() ratingChange: EventEmitter<number> = new EventEmitter();

  fillStarsWithColor(index: number) { // <4>
    if(!this.readonly) {
        this.rating = index + 1;
        this.ratingChange.emit(this.rating);
    }
  }
}

