//Core Imports
import {
    Component,
    OnInit
} from '@angular/core';

import {
    ActivatedRoute,
    Router
} from '@angular/router';


//Application Imports
import {
    ExperienceService,
    PageService,
    QuestService,
    SectionService,
    UserService,
    FileService,
    BadgeService
} from 'shared/services';

import {
    Section,
    SectionQuest,
    User,
    Quest,
    Experience,
    Course,
    QuestMap,
    Badge
} from 'shared/models';

import {
    AsyncAction
} from 'rxjs/scheduler/AsyncAction';

import {
    ToastsManager
} from 'ng2-toastr';

import {
    saveAs
} from 'file-saver';

import {
	Chart
} from 'chart.js';

@Component({
    selector: 'app-grades',
    templateUrl: './grades.component.html',
    styleUrls: ['./grades.component.css']
})
export class GradesComponent implements OnInit {
    // basic page info
    private currentUser: any;
    private currentSection: Section;

    // grades info
    private quests: Quest[];
    private maxXp: number;

    //student's grade
    private studentGrades: StudentGrades[];
    private sectionGrades: Experience[];
    private submissions: Experience[];
    private questStudents: any = [];
    private isGraded: boolean[] = [];

    //class summary graph
    chart: Chart;
    lineChartColors: Array<any>;
    lineChartData: Array<any> = [];
    lineChartLabels: Array<any> = ['Week 0', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12', 'Week 13', 'Week 14', 'Week 15', 'Week 16'];
    lineChartOptions: any;

    constructor(
        private badgeService: BadgeService,
        private experienceService: ExperienceService,
        private questService: QuestService,
        private pageService: PageService,
        private route: ActivatedRoute,
        private sectionService: SectionService,
        private userService: UserService,
        private toaster: ToastsManager,
        private router: Router,
        private fileService: FileService
    ) {
    }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            let section_id = params.get('sectionId');
			this.sectionService.searchSection(section_id).subscribe(res => {
                this.sectionService.setCurrentSection(new Section(res[0].section));
                this.isGraded = [];
                this.setDefault();
                this.getCurrentSection();
                this.getCurrentUser();
                this.getSectionInformation();   
			});
		})
    }

    getCurrentUser() {
        this.route.paramMap.subscribe(params => {
            let sectionId = params.get('sectionId');
        });
        //AHJ: unimplemented... or not sure. Di ko sure kung tama na ning pagkuha sa current user
        this.currentUser = new User(this.userService.getCurrentUser());
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
        var ctx = (<HTMLCanvasElement>HTMLchart).getContext("2d");

        this.chart = new Chart(ctx, {
            type: 'line',
            data: data,
            options: this.lineChartOptions
        });

    }

    /**
     * Obtains the students who submitted a particular quest. 
     * @param quest_id id of the quest whose submitters are to be retrieved
     */
    getQuestGrades(quest_id: string) {
        //filters the students who submitted 
        this.submissions = this.sectionGrades.filter(submission => {
            this.questStudents.push({
                studentId: submission.getUserId(),
                studentName: ""
            });
            //includes the student's grade if the student submi
            return submission.getQuestSubmission(quest_id) != null && submission.getQuestSubmissionDate(quest_id) != "";
        });


        //determines if the student has been graded or not; used for enabling/disabling the grade input field
        this.isGraded = [];
        this.submissions.forEach(exp => {
            exp.getQuestsTaken().forEach(quest => {
                if (quest.quest_id == quest_id) {
                    this.isGraded.push(!quest.is_graded);
                }
            });
        });

        let tempStudents: any = [];
        let copyQuestStudents: any = [];
        this.questStudents.forEach(student => {
            if (tempStudents == null || tempStudents.indexOf(student.studentId) == -1) {
                tempStudents.push(student.studentId);
                copyQuestStudents.push({
                    studentId: student.studentId,
                    studentName: ""
                });
            }
        });

        this.questStudents = copyQuestStudents;
        this.questStudents.forEach(student => {
            this.userService.getUser(student.studentId).subscribe(res => {
                student.studentName = (new User(res).getUserFullName());
            });
        });
    }

    /**
     * Sets the student's grade of a particular quest.
     * @param userId the id of the student whose quest is to be graded
     * @param questId the id of the quest to be graded
     * @param inputGrade the grade of the student for the quest
     * @param gradedIndex the index of the student in the array (for knowing which input field to disable after grading) 
     */
    setStudentGrade(userId, questId, inputGrade, gradedIndex) {
        //AHJ: unimplemented/improvements; possible to change the grade index for flexibility
        if (inputGrade == "") {
            this.toaster.error(
                "You must input a grade to be submitted!",
                "Grade Submission Error!"
            );
        } else {
            this.questService.getQuest(questId).subscribe(res => {
                if (Number(inputGrade) <= (new Quest(res).getQuestXp()) && Number(inputGrade) >= 0) {
                    this.toaster.success(
                        "Successfully submitted the grade of " + this.toStudentName(userId),
                        "Grade Submission Success!"
                    );
                    this.experienceService.setStudentQuestGrade(this.currentSection.getSectionId(), userId, questId, inputGrade)
                        .subscribe(grade => {
                            this.isGraded[gradedIndex] = !this.isGraded[gradedIndex];

                            this.addDefaultRankBadge(userId);

                            this.submissions = this.submissions.map(quest => {
                                if (quest.getUserId() == userId) {
                                    quest.setIsGraded(questId);
                                }
                                return quest;
                            });

                            this.experienceService.getUserExpRecord(userId, this.currentSection.getSectionId()).subscribe(res => {
                                if (res) {
                                    this.studentGrades.find(student => {
                                        return student.student.getUserId() == userId;
                                    }).total = new Experience(res).getTotalExperience();
                                }
                            });
                        }
                        )
                } else {
                    this.toaster.error(
                        "Your submitted grade must be within 0 and " + (new Quest(res).getQuestXp()),
                        "Grade Submission Error!"
                    );
                }
            });
        }
    }


    isSubmitted(quests_taken: any[], quest_id: string) {
        quests_taken.forEach(quest => {
            if (quest_id == quest.quest_id) {
                // this.isGraded = quest.is_graded;
                return quest.is_graded;

            }
        });
    }

    /**
     * Sets all the default less-related functions/properties of the component
     */
    setDefault() {
        this.pageService.isProfilePage(false);
        this.submissions = [];
        this.studentGrades = [];
    }

    addDefaultRankBadge(userId: string) {
        let studentGrade = this.studentGrades.find(elem => elem.student.getUserId() == userId);
        console.log(studentGrade);
        if (studentGrade && studentGrade.total > 0) {
            this.questService.getSectionQuestMap(this.currentSection.getSectionId()).subscribe(questmap => {
                let questMap = new QuestMap(questmap);
                console.log(questMap);
                let flatOneGrade = questMap.getFlatOneGrade();
                console.log(flatOneGrade);
                if (studentGrade.total <= flatOneGrade) {
                    this.badgeService.getSectionBadges(this.currentSection.getSectionId()).subscribe(badges => {
                        let sectionBadges: Badge[] = badges.map(badge => new Badge(badge));
                        let defaultBadges = sectionBadges.filter(badge => badge.isDefaultBadge());
                        let rank: number = Math.ceil(studentGrade.total / (flatOneGrade / defaultBadges.length));
                        console.log(studentGrade.total);
                        console.log(rank);
                        defaultBadges.forEach(badge => {
                            if ((badge.getBadgeRank() == rank) && !badge.isBadgeAttainer(userId)) {
                                console.log("ATTAINED!");
                                console.log("userId: " + userId);
                                console.log("badgeattainer: " + badge.getBadgeAttainers());
                                this.badgeService.addBadgeAttainer(badge.getBadgeId(), userId).subscribe(res => {
                                    if(res){
                                        console.log(res);
                                        console.log("SUCESS!");
                                    }
                                })
                            }
                        })
                    });
                }
            })
        }
    }

    getQuestMaxXp(quest_id: string) {
        let quest = this.quests.find(quest => quest.getQuestId() == quest_id);
        return quest ? quest.getQuestXp() : 0;
    }

    setMaxXp(quest: Quest) {
        this.maxXp = quest.getQuestXp();
    }

    /**
     * Returns the name of the student based on the received school ID parameter.
     * @param studentId the id of the student whose name is to be retrieved
     * 
     * @returns the name of the student
     */
    toStudentName(studentId: string) {
        let studentName = studentId ? this.questStudents.filter(
            student => studentId == student.studentId
        ) : AsyncAction;

        return studentName[0].studentName;
    }

    /**
     * @author Alvaro, Cedric Y.
     */
    downloadFile(fileName: any) {
        this.fileService.download(fileName).subscribe(res => {
            alert("Downloading now!");
            saveAs(res, fileName),
                error => console.log(error)
        });
    }

}

export interface StudentGrades {
    student: User,
    total: number,
    grades: number[]
}