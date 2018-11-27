import { Component } from '@angular/core';
import { AdalService } from "ng2-adal/dist/core";

@Component({
    selector: 'nav-menu',
    templateUrl: './navmenu.component.html',
    styleUrls: ['./navmenu.component.css']
})
export class NavMenuComponent {
    constructor(private adalService: AdalService) {

    }

    private processLogout(): void {
        localStorage.removeItem('USER');
        sessionStorage.clear();
        this.adalService.logOut();
    }

}
