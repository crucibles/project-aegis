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
	QuestService,
	SectionService,
	UserService
} from 'shared/services';

import {
	Experience,
	QuestMap,
	Section,
	User
} from 'shared/models';

@Component({
	selector: 'app-grades-summary',
	templateUrl: './grades-summary.component.html',
	styleUrls: ['./grades-summary.component.css']
})
export class GradesSummaryComponent implements OnInit {
	// basic page info
	private currentSection: Section;
	// student's grade
	public studentGrades: StudentGrades[];
	

	constructor(
		private experienceService: ExperienceService,
		private questService: QuestService,
		private route: ActivatedRoute,
		private sectionService: SectionService,
		private userService: UserService
	) { }

	ngOnInit() {
		this.route.parent.paramMap.subscribe(params => {
            let sectionId = params.get('sectionId');
			this.sectionService.searchSection(sectionId).subscribe(res => {
                this.sectionService.setCurrentSection(new Section(res[0].section));
                this.setDefault();
                this.getCurrentSection();
                this.getSectionInformation();   
			});
		});
	}

	/**
     * Obtains the section information which includes the students' info (student number, name, and grades).
     * It also totals the student's grades (for the grade summary table).
     * 
     * @author Sumandang, AJ Ruth H.
     */
    getSectionInformation() {
		this.studentGrades = [];
		//obtain section questmap (for flat one perc and max EXP for this section)
		this.questService.getSectionQuestMap(this.currentSection.getSectionId()).subscribe(questmap => {
			let questMap = new QuestMap(questmap);
			let max: number = questMap.getMaxEXP() ? questMap.getMaxEXP() : 10;

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
								});
							});
						}
					});
				}
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
     * Sets all the default less-related functions/properties of the component
     */
    setDefault() {
        // this.studentGrades = [];
    }
}

export interface StudentGrades {
    student: User,
    total: number,
    grades: number[]
}