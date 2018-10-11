//Core Imports
import {
    Component,
    OnInit
} from '@angular/core';

//Application Imports
import {
    Section,
    User,
    Experience,
    Badge,
    QuestMap
} from 'shared/models';

import {
    ExperienceService,
    PageService,
    SectionService,
    UserService,
    BadgeService,
    QuestService
} from 'shared/services';

@Component({
    selector: 'app-specific-profile',
    templateUrl: './specific-profile.component.html',
    styleUrls: ['./specific-profile.component.css']
})
export class SpecificProfileComponent implements OnInit {
    //basic info
    currentSection: Section;
    currentUser: User;

    //performance graph data
    userSubmission: Experience;

    badges: Badge[];


    // lineChart
    isChartReady: boolean = false;
    lineChartColors: Array<any>;
    lineChartData: Array<any> = [];
    lineChartLabels: Array<any> = ['Week 0', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12', 'Week 13', 'Week 14', 'Week 15', 'Week 16'];
    lineChartOptions: any = {
        plugins: {
            datalabels: {
                display: false,
            }
        },
        responsive: true,
        scales: {
            yAxes: [{ id: 'y-axis-1', type: 'linear', position: 'left', ticks: { min: 0, max: 100 } }]
        }
    };

    /**
     * @constructor
     * 
     * @param userService uses the UserService to obtains data needed for user
     */
    constructor(
        private badgeService: BadgeService,
        private experienceService: ExperienceService,
        private pageService: PageService,
        private questService: QuestService,
        private sectionService: SectionService,
        private userService: UserService,
    ) {
    }

    ngOnInit() {
        this.setDefault();
        this.getGrades();
        this.setPerformanceGraph();
        this.initBadges();
    }

    initBadges() {
        this.badges = [];
        this.badgeService.getSectionBadges(this.sectionService.getCurrentSection().getSectionId()).subscribe(bs => {
            bs.map(badge => {
                let x = new Badge(badge);
                x.getBadgeAttainers().filter(user => {
                    if (this.currentUser.getUserId() == user) {
                        this.badges.push(x);
                    }
                });
            });
        });
    }

    getCurrentSection() {
        this.currentSection = this.sectionService.getCurrentSection();
    }

    setDefault() {
        this.pageService.isProfilePage(true);
        this.lineChartData = [];
        this.isChartReady = false;
        this.getUser();
        this.getCurrentSection();
    }

    /**
     * Stores the current user
     * @description Stores the current user to the 'user' variable from the user.service function
     */
    getUser(): void {
        this.currentUser = this.userService.getCurrentUser();
    }

    /**
     * Stores the user's grades
     */
    getGrades(): void {
        let dataGrade: number[] = [];

        // Obtaining max EXP & flat-one grade percentage
        this.questService.getSectionQuestMap(this.currentSection.getSectionId())
            .subscribe(questmap => {
                let questMap = new QuestMap(questmap, []);
                console.log(questMap);
                let max: number = questMap.getMaxEXP() ? questMap.getMaxEXP() : 10;
                let flatOnePerc: number = questMap.getFlatOnePercentage() ? questMap.getFlatOnePercentage() : 70;

                // Obtaining student's section grades 
                this.experienceService.getSectionGrades(this.currentSection.getSectionId(), this.currentUser.getUserId())
                    .subscribe(submissions => {
                        if (submissions.length > 0) {
                            this.userSubmission = submissions.map(submission => new Experience(submission))[0];

                            dataGrade = this.userSubmission.getWeeklyPercentageGrades(max);
                            
                            // flat one array (just filling flat one array with percentage-grade values)
                            let flatOneArr: number[] = [];
                            this.lineChartLabels.forEach(label => {
                                flatOneArr.push(flatOnePerc);
                            });

                            //setting student's data for the graph
                            let dataLine: any = {
                                data: dataGrade,
                                label: this.sectionService.getCurrentCourse().getCourseName() + " - " + this.currentSection.getSectionName()
                            };

                            // flat one line properties in the performance graph
                            let flatOneLine: any = {
                                data: flatOneArr,
                                label: "Flat One Line",
                                radius: 0,
                                fill: false,
                                borderWidth: 1
                            }

                            //IMPORTANT ORDER: dataline must be pushed first before the flat-one line; 
                            // reason: indexing changes the line chart properties 
                            this.lineChartData.push(dataLine);
                            this.lineChartData.push(flatOneLine);
                            this.isChartReady = true;
                        }
                    });

            });

    }

    /* Below are the helper functions */

    /**
    * Sets the performance graph's display and design in the profile page
    */
    setPerformanceGraph() {
        this.lineChartColors = this.pageService.lineChartColors;
        this.lineChartLabels = ['Week 0', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12', 'Week 13', 'Week 14', 'Week 15', 'Week 16'];
        this.lineChartOptions = {
            responsive: true,
            scales: {
                yAxes: [{ id: 'y-axis-1', type: 'linear', position: 'left', ticks: { min: 0, max: 100 } }]
            }
        };
    }

    /**
     * @public
     * 
     * @summary Triggers when chart is clicked
     * @param e 
     */
    public chartClicked(e: any): void {
    }

    /**
     * @public
     * 
     * @summary Triggers when chart is hovered
     * @param e 
     */
    public chartHovered(e: any): void {
    }
}
