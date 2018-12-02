//Core Imports 
import {
	NgModule
} from '@angular/core';

//Application Imports
import {
	SharedModule
} from 'shared/shared.module';

import {
	SpecificCharacterComponent,
	SpecificMyCourseComponent,
	SpecificNewsComponent,
	SpecificProfileComponent,
	SpecificQuestMapComponent
} from 'student/specific/pages';

import {
	SpecificComponent
} from 'student/specific/specific.component';

import {
	SpecificRoutingModule
} from 'student/specific/specific-routing.module';

import {
	SpecificSidetabComponent,
	SpecificTopnavbarComponent
} from 'app/student/specific';

import {
	GeneralRoutingModule
} from 'student/general/general-routing.module';

import {
	GeneralModule
} from 'student/general/general.module';

import { 
	SpecificQuestMapNavbarComponent 
} from './pages/specific-quest-map/specific-quest-map-navbar/specific-quest-map-navbar.component';

import { 
	MapChartComponent 
} from './pages/specific-quest-map/subpages/map-chart/map-chart.component';

import { 
	SummaryComponent 
} from './pages/specific-quest-map/subpages/summary/summary.component';

@NgModule({
	imports: [
		SharedModule,
		SpecificRoutingModule,
		GeneralRoutingModule,
		GeneralModule
	],
	declarations: [
		SpecificCharacterComponent,
		SpecificComponent,
		SpecificMyCourseComponent,
		SpecificNewsComponent,
		SpecificProfileComponent,
		SpecificQuestMapComponent,
		SpecificSidetabComponent,
		SpecificTopnavbarComponent,
		SpecificQuestMapNavbarComponent,
		MapChartComponent,
		SummaryComponent
	]
})
export class SpecificModule { }
