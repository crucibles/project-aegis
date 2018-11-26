import {
	Component,
	OnInit,
	Input
} from '@angular/core';

import { SectionService } from 'shared/services/section.service';

import { ActivatedRoute } from '@angular/router';
import { Section } from 'shared/models/section';

@Component({
	selector: 'app-specific-quest-map-navbar',
	templateUrl: './specific-quest-map-navbar.component.html',
	styleUrls: ['./specific-quest-map-navbar.component.css']
})
export class SpecificQuestMapNavbarComponent implements OnInit {
	constructor() {}

	ngOnInit() {}
}
