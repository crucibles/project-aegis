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
	SpecificQuestMapComponent,
	GradesComponent
} from 'teacher/specific/pages';

import {
	SpecificComponent
} from 'teacher/specific/specific.component';

import {
	SpecificRoutingModule
} from 'teacher/specific/specific-routing.module';

import {
	SpecificSidetabComponent,
	SpecificTopnavbarComponent
} from 'app/teacher/specific';

import {
	GeneralRoutingModule
} from 'teacher/general/general-routing.module';

import {
	GeneralModule
} from 'teacher/general/general.module';

import { 
	SpecificQuestMapNavbarComponent,
	MapChartComponent, 
	SettingsComponent,
	SummaryComponent
} from 'teacher/specific/pages/specific-quest-map';

import { 
	CreateQuestComponent 
} from './pages/specific-quest-map/subpages/create-quest/create-quest.component';

@NgModule({
	imports: [
		SharedModule,
		SpecificRoutingModule,
		GeneralRoutingModule,
		GeneralModule
	],
	declarations: [
		GradesComponent,
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
		SettingsComponent,
		SummaryComponent,
		CreateQuestComponent
	]
})

export class SpecificModule { }