//Core Imports
import {
    Component,
    ElementRef,
    Input,
    OnInit
} from '@angular/core';

//Application Imports
import {
    UserService
} from 'shared/services';

@Component({
    selector: 'specific-topnavbar',
    templateUrl: './specific-topnavbar.component.html',
    styleUrls: ['./specific-topnavbar.component.css'],
    host: {
        '(document:click)': 'handleClick($event)',
    }
})
export class SpecificTopnavbarComponent implements OnInit {
    @Input('sectionId') sectionId: string;

    isCollapsed: boolean;

    constructor(
        private elementRef: ElementRef,
        private userService: UserService
    ) { }

    ngOnInit() {
        this.isCollapsed = true;
    }

    /**
     * Logs out the current user
     */
    logOut() {
        this.userService.logOut();
    }

    /* Helper function */
    handleClick(event) {
        var clickedComponent = event.target;
        var inside = false;
        do {
            if (clickedComponent === this.elementRef.nativeElement) {
                inside = true;
            }
            clickedComponent = clickedComponent.parentNode;
        } while (clickedComponent);
        if (!inside) {
            this.isCollapsed = true;
        }
    }
}
