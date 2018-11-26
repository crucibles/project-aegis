//Core Imports
import {
	Component,
	OnInit
} from '@angular/core';

import {
	ActivatedRoute
} from '@angular/router';

import { 
	SectionService 
} from 'shared/services/section.service';

import {
	Section
} from 'shared/models/section';

@Component({
	selector: 'app-specific-quest-map',
	templateUrl: './specific-quest-map.component.html',
	styleUrls: ['./specific-quest-map.component.css']
})
export class SpecificQuestMapComponent implements OnInit {
	private sectionId: string;

	constructor(
        private route: ActivatedRoute,
        private sectionService: SectionService
    ) {}
	
	ngOnInit() {
		this.route.paramMap.subscribe(params => {
			this.sectionId = params.get('sectionId');
			this.sectionService.searchSection(this.sectionId).subscribe(res => {
                this.sectionService.setCurrentSection(new Section(res[0].section));  
			});
		})
	}
}
