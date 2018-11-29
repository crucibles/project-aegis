import {
    NgModule
} from '@angular/core';

import {
    Routes,
    RouterModule
} from '@angular/router';

//Application Imports
import {
    PageNotFoundComponent
} from 'shared/pages';

import {
    SpecificComponent
} from 'teacher/specific/specific.component';

import {
    SpecificCharacterComponent,
    SpecificMyCourseComponent,
    SpecificNewsComponent,
    SpecificProfileComponent,
    SpecificQuestMapComponent,
    GradesComponent
} from 'teacher/specific/pages';

import {
    AuthGuardService
} from 'shared/services/auth-guard.service';

import {
    GeneralComponent
} from 'teacher/general/general.component';

import {
    GenSelcourseComponent
} from 'teacher/general/pages';

import { 
    MapChartComponent,
    SettingsComponent, 
    SummaryComponent,
    CreateQuestComponent
} from 'teacher/specific/pages/specific-quest-map';

const specificRoutes: Routes = [

    {
        path: '',
        component: SpecificComponent,
        children: [
            {
                path: 'specific-news/',
                component: SpecificNewsComponent,
                canActivate: [AuthGuardService]
            },
            {
                path: 'specific-my-course/',
                component: SpecificMyCourseComponent,
                canActivate: [AuthGuardService]
            },
            {
                path: 'specific-character/:sectionId',
                component: SpecificCharacterComponent,
                canActivate: [AuthGuardService]
            },
            {
                path: 'specific-news/:sectionId',
                component: SpecificNewsComponent,
                canActivate: [AuthGuardService]
            },
            {
                path: 'specific-my-course/:sectionId',
                component: SpecificMyCourseComponent,
                canActivate: [AuthGuardService]
            },
            {
                path: 'specific-profile/:sectionId',
                component: SpecificProfileComponent,
                canActivate: [AuthGuardService]
            },
            {
                path: 'specific-quest-map/:sectionId',
                component: SpecificQuestMapComponent,
                canActivate: [AuthGuardService],
                children: [
                    {
                        path: '',
                        redirectTo: 'subpages/map-chart'
                    },
                    {
                        path: 'subpages/map-chart',
                        component: MapChartComponent,
                        canActivate: [AuthGuardService]
                    },
                    {
                        path: 'subpages/summary',
                        component: SummaryComponent,
                        canActivate: [AuthGuardService]
                    },
                    {
                        path: 'subpages/settings',
                        component: SettingsComponent,
                        canActivate: [AuthGuardService]
                    },
                    {
                        path: 'subpages/create-quest/:x/:y',
                        component: CreateQuestComponent,
                        canActivate: [AuthGuardService]
                    }
                ]
            },
            {
                path: 'grades/:sectionId',
                component: GradesComponent,
                canActivate: [AuthGuardService]
            },
            {
                path: '**',
                component: PageNotFoundComponent
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(specificRoutes)],
    exports: [RouterModule]
})

export class SpecificRoutingModule { }
