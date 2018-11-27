import { Directive, Inject, Input, ElementRef } from '@angular/core';

@Directive({
    selector: '[appFocus]',
    exportAs: 'customAppFocus'
})
export class FocusDirective {

    constructor( @Inject(ElementRef) private element: ElementRef) {}

    setFocus() {
      setTimeout( () => { this.element.nativeElement.focus(); },  1);
    }
}
