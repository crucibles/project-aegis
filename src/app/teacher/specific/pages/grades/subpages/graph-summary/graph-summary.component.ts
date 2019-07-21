// Core Imports
import { 
	Component, 
	OnInit 
} from '@angular/core';

import {
	ActivatedRoute
} from '@angular/router';

// Application Imports
import {
    ExperienceService,
    PageService,
    QuestService,
    SectionService,
    UserService,
} from 'shared/services';

import {
    Section,
    User,
    Quest,
    Experience,
    QuestMap,
} from 'shared/models';

// Third-Party Imports
import {
	Chart
} from 'chart.js';

@Component({
	selector: 'app-graph-summary',
	templateUrl: './graph-summary.component.html',
	styleUrls: ['./graph-summary.component.css']
})
export class GraphSummaryComponent implements OnInit {
	// basic page info
	private currentSection: Section;

	// grades info
    private quests: Quest[];

	//student's grade
    private studentGrades: StudentGrades[];
    private sectionGrades: Experience[];
	
	//class summary graph
    chart: Chart;
    lineChartColors: Array<any>;
    lineChartData: Array<any> = [];
    lineChartLabels: Array<any> = ['Week 0', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12', 'Week 13', 'Week 14', 'Week 15', 'Week 16'];
    lineChartOptions: any;

	constructor(
        private experienceService: ExperienceService,
        private questService: QuestService,
        private pageService: PageService,
        private route: ActivatedRoute,
        private sectionService: SectionService,
        private userService: UserService
	) { }

	ngOnInit() {
		this.route.parent.paramMap.subscribe(params => {
			this.sectionService.searchSection(params.get('sectionId')).subscribe(res => {
                this.sectionService.setCurrentSection(new Section(res[0].section));
                this.setDefault();
                this.getCurrentSection();
                this.getSectionInformation();   
			});
		});
	}

    /**
	 * Obtains the user's navigated section
	 * @description Obtains the current section and stores it into 'currentSection' variable
	 */
    getCurrentSection() {
        this.currentSection = this.sectionService.getCurrentSection();
    }

    /**
     * Obtains the section information which includes the students' info (student number, name, and grades).
     * It also totals the student's grades (for the grade summary table).
     * 
     * @author Sumandang, AJ Ruth H.
     */
    getSectionInformation() {
        // obtain section quest
        this.questService.getSectionQuests(this.currentSection.getSectionId()).subscribe(quests => {
            //obtain section questmap (for flat one perc and max EXP for this section)
            this.questService.getSectionQuestMap(this.currentSection.getSectionId()).subscribe(questmap => {
                let questMap = new QuestMap(questmap);
                let max: number = questMap.getMaxEXP() ? questMap.getMaxEXP() : 10;
                let flatOnePerc: number = questMap.getFlatOnePercentage() ? questMap.getFlatOnePercentage() : 70;

                this.quests = quests.map(quest => new Quest(quest));

                //obtain section experiences
                this.experienceService.getSectionGrades(this.currentSection.getSectionId()).subscribe(experiences => {
                    if (experiences) {
                        this.sectionGrades = experiences.map(submission => new Experience(submission));

                        //obtain section's students
                        let sectionId = this.currentSection.getSectionId();
                        this.sectionService.getSectionStudents(sectionId).subscribe((students) => {
                            if (students) {
                                students.forEach(student => {
                                    //obtain student total EXP
                                    if (student && student.length > 1) {
                                        this.userService.getUser(student).subscribe((user) => {
                                            this.experienceService.getUserExpRecord(new User(user).getUserId(), sectionId).subscribe(res => {
                                                if (res) {
                                                    this.studentGrades.push({
                                                        student: new User(user),
                                                        total: new Experience(res).getTotalExperience(),
                                                        grades: new Experience(res).getWeeklyPercentageGrades(max)
                                                    });
                                                }

                                                this.lineChartData = [];

                                                this.studentGrades.forEach(student => {
                                                    this.lineChartColors = this.pageService.lineChartColors;
                                                    let rand: number = this.lineChartData && this.lineChartData.length ? this.lineChartData.length % this.lineChartColors.length : 0;
                                                    let color = this.lineChartColors[rand];
                                                    let dataLine: any = {
                                                        data: student.grades,
                                                        label: student.student.getUserSchoolId() + " - " + student.student.getUserFullName(),
                                                        backgroundColor: color.backgroundColor,
                                                        borderColor: color.borderColor,
                                                        pointBackgroundColor: color.pointBackgroundColor,
                                                        pointBorderColor: color.pointBorderColor,
                                                        pointHoverBackgroundColor: color.pointHoverBackgroundColor,
                                                        pointHoverBorderColor: color.pointHoverBorderColor
                                                    };

                                                    this.lineChartData.push(dataLine);
                                                });

                                                if (!this.chart || this.lineChartData.length == 0) {
                                                    let flatOneArr: any[] = [];
                                                    this.lineChartLabels.forEach(label => {
                                                        flatOneArr.push(flatOnePerc);
                                                    });

                                                    this.lineChartColors = this.pageService.lineChartColors;
                                                    let rand: number = this.lineChartData && this.lineChartData.length ? this.lineChartData.length % this.lineChartColors.length : 0;
                                                    let color = this.lineChartColors[rand];
                                                    let flatOneLine: any = {
                                                        data: flatOneArr,
                                                        label: "Flat One Line",
                                                        radius: 0,
                                                        fill: false,
                                                        borderWidth: 1,
                                                        datalabels: {
                                                            display: false
                                                        }
                                                    };
                                                    this.lineChartData.push(flatOneLine);
                                                    this.setSummaryGraph();
                                                } else {
                                                    this.chart.config.data.datasets = this.lineChartData;
                                                    this.chart.config.options.animation.duration = 0;
                                                    this.chart.update();
                                                }
                                            });


                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            });
        });
    }

    setSummaryGraph() {
        this.lineChartLabels = ['Week 0', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12', 'Week 13', 'Week 14', 'Week 15', 'Week 16'];
        this.lineChartOptions = {
            responsive: true,
            scales: {
                yAxes: [{ id: 'y-axis-1', type: 'linear', position: 'left', ticks: { min: 0, max: 100 } }]
            }
        };

        var data = {
            labels: this.lineChartLabels,
            datasets: this.lineChartData
        }

        var HTMLchart = document.getElementById("summary-graph");

        if((<HTMLCanvasElement>HTMLchart)) {
            var ctx = (<HTMLCanvasElement>HTMLchart).getContext("2d");

            this.chart = new Chart(ctx, {
                type: 'line',
                data: data,
                options: this.lineChartOptions
            });
        }
	}
	
	/**
     * Sets all the default less-related functions/properties of the component
     */
    setDefault() {
        this.pageService.isProfilePage(false);
        this.studentGrades = [];
    }
}

export interface StudentGrades {
    student: User,
    total: number,
    grades: number[]
}