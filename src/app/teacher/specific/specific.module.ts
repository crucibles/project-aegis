//Core Imports 
import {
	NgModule
} from '@angular/core';

//Application Imports
import {
	SharedModule
} from 'shared/shared.module';

import {
	SpecificMyCourseComponent,
	SpecificNewsComponent,
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

import { 
	GradesNavbarComponent 
} from './pages/grades/grades-navbar/grades-navbar.component';

import {
	GradesSummaryComponent,
	GraphSummaryComponent,
	SubmittedQuestsComponent
} from './pages/grades';

@NgModule({
	imports: [
		SharedModule,
		SpecificRoutingModule,
		GeneralRoutingModule,
		GeneralModule
	],
	declarations: [
		GradesComponent,
		SpecificComponent,
		SpecificMyCourseComponent,
		SpecificNewsComponent,
		SpecificQuestMapComponent,
		SpecificSidetabComponent,
		SpecificTopnavbarComponent,
		SpecificQuestMapNavbarComponent,
		MapChartComponent,
		SettingsComponent,
		SummaryComponent,
		CreateQuestComponent,
		GradesNavbarComponent,
		SubmittedQuestsComponent,
		GradesSummaryComponent,
		GraphSummaryComponent
	]
})

export class SpecificModule { }