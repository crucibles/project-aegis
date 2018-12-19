//Core Imports
import {
    Component,
    OnInit
} from '@angular/core';

import {
	ActivatedRoute
} from '@angular/router';

// Application imports
import { 
	SectionService 
} from 'shared/services/section.service';

import {
	Section
} from 'shared/models/section';

@Component({
    selector: 'app-grades',
    templateUrl: './grades.component.html',
    styleUrls: ['./grades.component.css']
})
export class GradesComponent implements OnInit {
    constructor(
        private route: ActivatedRoute,
        private sectionService: SectionService
    ) {}

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
			this.sectionService.searchSection(params.get('sectionId')).subscribe(res => {
                this.sectionService.setCurrentSection(new Section(res[0].section));  
			});
		});
    }
}