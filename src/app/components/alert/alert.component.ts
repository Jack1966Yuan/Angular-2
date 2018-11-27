import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'alert-comp',
    templateUrl: './alert.component.html',
    styleUrls: ['./alert.component.css']    
})

export class AlertComponent {
    alertText: string;
    alertLevel: number;   //0: information; -1: warn

    constructor() {
        this.alertText = '';
        this.alertLevel = 0;
    }

    setAlert(text: string, level: number = 0): any {
        this.alertText = text;
        this.alertLevel = level;

        setTimeout(() => {
            this.alertText = '';
        }, 10000);
    }
}
