import { Component, Input } from '@angular/core';
import { AnnotationValidateResult} from '../../models/objects';


@Component({
    selector: 'unit-com',
    templateUrl: './validateunit.component.html',   
})

export class UnitComponent {

    @Input() annotation:AnnotationValidateResult;
}
