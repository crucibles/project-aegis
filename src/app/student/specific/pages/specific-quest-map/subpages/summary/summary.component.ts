// Core Imports
import { 
    Component, 
    OnInit 
} from '@angular/core';

// Application Imports
import { 
	ExperienceService,
	PageService,
	QuestService,
	SectionService,
	UserService
} from 'shared/services';

import {
    Experience,
    Quest,
	QuestMap,
	Section,
	SectionQuest,
	User
} from 'shared/models';

@Component({
    selector: 'app-summary',
    templateUrl: './summary.component.html',
    styleUrls: ['./summary.component.css']
})
export class SummaryComponent implements OnInit {

	private sectionEXP: Experience;
	private currentUser: User;
	private currentSection: Section;

	private quests: Quest[] = new Array();
	// quest map details
	private questMap: QuestMap;

    constructor(
		private experienceService: ExperienceService,
		private pageService: PageService,
		private questService: QuestService,
		private sectionService: SectionService,
		private userService: UserService
    ) { }

    ngOnInit() {
		this.setDefault();
		this.getCurrentUser();
		this.getCurrentSection();
		this.loadQuestMap();
    }

    loadQuestMap() {
		this.questService.getSectionQuests(this.currentSection.getSectionId()).subscribe(quests => {
			this.quests = quests.map(quest => new Quest(quest));
			//inserts quest prerequisite from the Section('quests' field) to the Quests 
			this.quests.forEach((quest, i) => {
				let tempQuests: SectionQuest[] = this.currentSection.getQuests().filter(
					sectionQuest => sectionQuest.getSectionQuestId() == quest.getQuestId()
				);
				let tempQuest: SectionQuest = tempQuests.length > 0 ? tempQuests[0] : new SectionQuest();
				this.quests[i].setQuestPrerequisite(tempQuest.getQuestPrerequisite());
			});
			this.experienceService.getSectionGrades(this.currentSection.getSectionId(), this.currentUser.getUserId())
				.subscribe(EXP => {
					if (EXP && EXP.length > 0) {
						this.sectionEXP = new Experience(EXP[0]);
					}
					this.questService.getSectionQuestMap(this.currentSection.getSectionId()).subscribe(questmap => {
						this.questMap = new QuestMap(questmap);
						this.questMap.setQuestMapDataSet(this.quests, this.currentSection.getQuests(), this.currentUser, this.sectionEXP, false);
					});
				});
		});
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
}
