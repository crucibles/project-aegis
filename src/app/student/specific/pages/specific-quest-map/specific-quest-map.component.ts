//Core Imports
import {
	Component,
	OnInit
} from '@angular/core';

//Third-Party Imports
import {
	FileUploader
} from 'ng2-file-upload/ng2-file-upload';

import {
	ToastsManager
} from 'ng2-toastr';

//Application Imports
import {
	Quest,
	Section,
	User,
	QuestMap,
	Experience
} from 'shared/models';

import {
	PageService,
	SectionService,
	UserService,
	ExperienceService
} from 'shared/services';

@Component({
	selector: 'app-specific-quest-map',
	templateUrl: './specific-quest-map.component.html',
	styleUrls: ['./specific-quest-map.component.css']
})
export class SpecificQuestMapComponent implements OnInit {
	// Stored here is the security questions in the sign up form.
	private quests: Quest[] = new Array();

	sectionEXP: Experience;

	// quest map details
	questMap: QuestMap;

	currentUser: User;

	private currentSection: Section;

	constructor(
		private experienceService: ExperienceService,
		private pageService: PageService,
		private sectionService: SectionService,
		private userService: UserService
	) {
		this.pageService.getChartObservable().subscribe(value => {
			this.setNewSection();
		});
		this.currentUser = this.userService.getCurrentUser();
		this.currentSection = new Section(this.sectionService.getCurrentSection());
	}

	ngOnInit() {
		this.pageService.getChartObservable().subscribe(value => {
			this.setNewSection();
		});

		this.setDefault();
		this.getCurrentUser();
		this.getCurrentSection();
	}

	/**
	 * Sets all the default less-related functions/properties of the component
	 */
	setDefault() {
		this.pageService.isProfilePage(false);
		this.currentUser = new User(this.userService.getCurrentUser());
		this.currentSection = new Section(this.sectionService.getCurrentSection());
	}

	/**
	 * Obtains the user's navigated section
	 * @description Obtains the current section and stores it into 'currentSection' variable
	 */
	getCurrentSection() {
		this.currentSection = this.sectionService.getCurrentSection();
	}

	getCurrentUser() {
		//AHJ: unimplemented... or not sure. Di ko sure kung tama na ning pagkuha sa current user
		this.currentUser = new User(this.userService.getCurrentUser());
	}

	setNewSection() {
		this.sectionService.getUserSections(this.currentUser.getUserId(), this.currentSection.getSectionId()).subscribe(
			sections => {
				this.sectionService.setCurrentSection(sections[0].section);
				this.currentSection = new Section(this.sectionService.getCurrentSection());
				this.questMap.setQuestMapDataSet(this.quests, this.currentSection.getQuests(), this.currentUser, this.sectionEXP, false);
				this.pageService.updateStudentSideTab(this.currentUser.getUserId());
			}
		);
	}

	setNewExperience() {
		this.experienceService.getSectionGrades(this.currentSection.getSectionId(), this.currentUser.getUserId())
			.subscribe(EXP => {
				if (EXP && EXP.length > 0) {
					this.sectionEXP = new Experience(EXP[0]);
					this.setNewSection();
				}
			});
	}
}
