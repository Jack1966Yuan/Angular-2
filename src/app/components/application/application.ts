import {Component, ViewEncapsulation} from '@angular/core';
import { RouterModule } from '@angular/router'

@Component({
  selector: 'my-app', // <1>
  templateUrl: 'app/components/application/application.html', // <3>
  styleUrls: ['app/components/application/application.css'], // <4>
  encapsulation:ViewEncapsulation.None
})

export class ApplicationComponent {
}


