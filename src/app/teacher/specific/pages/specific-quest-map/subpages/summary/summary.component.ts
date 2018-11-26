// Core imports
import { 
	Component, 
	OnInit,
	TemplateRef,
	ViewChild
} from '@angular/core';

import {
	ActivatedRoute
} from '@angular/router';

// Application imports
import {
	Badge,
	Experience,
	Quest,
	QuestMap,
	Section,
	SectionQuest,
	User
} from 'shared/models';

import {
	BadgeService,
	PageService,
	QuestService,
	SectionService
} from 'shared/services';

// Third-party imports
import {
	BsModalRef,
	BsModalService
} from 'ngx-bootstrap';

@Component({
	selector: 'app-summary',
	templateUrl: './summary.component.html',
	styleUrls: ['./summary.component.css']
})
export class SummaryComponent implements OnInit {
	// quests details
	private questClicked: Quest;
	private quests: Quest[];

	// basic info
	private currentSection: Section;

	// quest map details
	private questMap: QuestMap;

	// modal
	@ViewChild('questTemplate') questTemplate: TemplateRef<any>;
	private bsModalRef: BsModalRef;
	private badgeName: any = "";

	constructor(
		private badgeService: BadgeService,
		private modalService: BsModalService,
		private pageService: PageService,
		private questService: QuestService,
		private route: ActivatedRoute,
		private sectionService: SectionService
	) { }

	ngOnInit() {
		this.route.parent.paramMap.subscribe(params => {
			let sectionId = params.get('sectionId');
			this.sectionService.searchSection(sectionId).subscribe(res => {
				this.sectionService.setCurrentSection(new Section(res[0].section));
                this.setDefault();
                this.getCurrentSection();
				this.loadQuestMap();
			});
		})
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
			});
		});
	}

	/**
	 * Open quest modal and display clicked quest details.
	 * @param quest quest to display
	 * 
	 * @author Sumandang, AJ Ruth
	 */
	openQuest(quest: any) {
		this.questClicked = new Quest(quest);
		this.getBadgeName(this.questClicked.getQuestBadge());
		if (this.questClicked) {
			this.bsModalRef = this.modalService.show(this.questTemplate);
		}
	}

	getBadgeName(badge_id: any) {
		if (badge_id) {
			this.badgeService.getBadge(badge_id).subscribe(res => {
				this.badgeName = new Badge(res).getBadgeName();
			});
		}
		this.badgeName = "";
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
