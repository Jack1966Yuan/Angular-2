import { Component, Inject } from '@angular/core';
import { AllModulesService } from '../../services/modules.service';

@Component({
    selector: 'app-tool',
    templateUrl: './tools.component.html',
    styleUrls: ['./tools.component.css'],
})

export class ToolComponent {

    constructor( @Inject(AllModulesService) private allModulesService: AllModulesService) {
    }

    
    linkme(link: string): any {
        let windows = this.allModulesService.getNativeWindow();
        windows.open(link);
    }

}
