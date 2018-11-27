import { Component, OnInit, OnDestroy } from '@angular/core';
import { AdminComponent } from '../admin/admin.component';

@Component({
    selector: 'home',
    templateUrl: './home.component.html'
})
export class HomeComponent {
  // ngOnInit() {
  //   let timer = Observable.timer(1000 * 60 * 15, 1000 * 60 * 15);
  //   this.currentSub = timer.subscribe(t => {
  //     console.log('getting new token at: ' + t);
  //     this.getToken();
  //   });
  // }

  // ngOnDestroy() {
  //   this.currentSub.unsubscribe();
  // }

  // public getToken() {
  //   this.adalService.acquireToken(this.secretService.adalConfig.clientId).subscribe(
  //       (tokenout) => {
  //         console.log(tokenout);
  //         localStorage.setItem('access_token', tokenout);
  //       }
  //   );
  // }
}


