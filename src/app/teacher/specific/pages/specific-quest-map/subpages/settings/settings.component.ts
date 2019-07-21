// Core imports
import { 
    Component, 
    OnInit
} from '@angular/core';

import { 
    ActivatedRoute 
} from '@angular/router';

// Application imports
import { 
    QuestService, 
    SectionService, 
    PageService 
} from 'shared/services';

import { 
    QuestMap, 
    Section,
    Quest,
    SectionQuest,
    User,
    Experience
} from 'shared/models';

// Third-party imports
import { 
    ToastsManager 
} from 'ng2-toastr';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
	// quest map details
	private questMap: QuestMap;
	private maxExp: number = 0;
	private flatOnePercentage: number = 0;
    
    // quests details
    private quests: Quest[];

    // basic info
	private currentSection: Section;

    constructor(
        private questService: QuestService,
        private sectionService: SectionService,
        private pageService: PageService,
        private toastr: ToastsManager,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        this.route.parent.paramMap.subscribe(params => {
			let section_id = params.get('sectionId');
			this.sectionService.searchSection(section_id).subscribe(res => {
				this.sectionService.setCurrentSection(new Section(res[0].section));
                this.setDefault();
                this.getCurrentSection();
				this.loadQuestMap();
			});
		})
    }

	/**
	 * Sets the max exp points of the current course as specified by the user.
	 * @param maxEXP 
	 */
    setMaxEXP(maxEXP: number) {
		if (maxEXP <= 0) {
			this.toastr.error(
				"You must input a max EXP greater than 0!",
				"Max EXP Error!"
			);
		} else {
			this.questService.setMaxEXP(this.questMap.getQuestMapId(), maxEXP).subscribe((x) => {
				if (x) {
					this.toastr.success(
						"Successfully set the section max EXP to " + maxEXP,
						"Grade Submission Success!"
					);
					this.questMap.setMaxEXP(maxEXP);
					this.setMapDetails();
				} else {
					this.toastr.error(
						"The system failed to set your max EXP.",
						"Max EXP Error!"
					);
				}
			})
		}
    }
	
	/**
	 * Sets the flat one grade (1.00) percentage of the current course as specified by the user.
	 * @param flatOne 
	 */
    setFlatOnePercentage(flatOne: number) {
		if (flatOne <= 0 || flatOne > 100) {
			this.toastr.error(
				"Invalid input of percentage! Number must be 0 - 100.",
				"Flat One Percentage Error!"
			);
		} else {
			this.questService.setFlatOnePercentage(this.questMap.getQuestMapId(), flatOne).subscribe((x) => {
				if (x) {
					this.toastr.success(
						"Successfully set the section flat one percentage to " + flatOne,
						"Setting Grade Percentage Success!"
					);
					this.questMap.setFlatOnePercentage(flatOne);
					this.setMapDetails();
				} else {
					this.toastr.error(
						"The system failed to set the class' flat-one percentage.",
						"Setting Grade Percentage Error!"
					);
				}
			});
		}
    }

    /**
	 * Loads quest map.
	 * Includes loading of quests and retrieval of quest map.
	 * 
	 * @author Sumandang, AJ Ruth
	 */
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

			this.questService.getSectionQuestMap(this.currentSection.getSectionId()).subscribe(questmap => {
				this.questMap = new QuestMap(questmap);
				this.questMap.setQuestMapDataSet(this.quests, [], new User(), new Experience(), true);
				this.setMapDetails();
			});
		});
	}

	/**
	 * Sets the maxExp and flatOnePercentage variablels to be used in the HTML angular binder.
	 */
	setMapDetails() {
		if (this.questMap) {
			this.maxExp = this.questMap.getMaxEXP();
			this.flatOnePercentage = this.questMap.getFlatOnePercentage();
		} else {
			this.maxExp = 0;
			this.flatOnePercentage = 0;
		}
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
		this.pageService.isProfilePage(false);
	}
}
