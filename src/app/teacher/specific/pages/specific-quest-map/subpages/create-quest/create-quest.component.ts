import { 
	Component,
	OnInit
} from '@angular/core';

import {
	FormArray,
	FormBuilder,
	FormControl,
	FormGroup,
	Validators
} from '@angular/forms';

import {
	ActivatedRoute,
	Router
} from '@angular/router';

import {
	BadgeService,
	PageService,
	QuestService,
	SectionService
} from 'shared/services';

import {
	Badge,
	Experience,
	Quest,
	QuestMap,
	Section,
	SectionQuest,
	User
} from 'shared/models';

@Component({
	selector: 'app-create-quest',
	templateUrl: './create-quest.component.html',
	styleUrls: ['./create-quest.component.css']
})
export class CreateQuestComponent implements OnInit {
	// The x- and y-coordinate respectively of the recently clicked point in the questmap chart
	private x: any;
	private y: any;

	// Basic info
	private currentSection: Section;

	// Form structure
	private createQuestForm: FormGroup;

	// create quest details
	private questBadges: any[] = [];

	// quests details
	private quests: Quest[];

	// quest map details
	private questMap: QuestMap;

	constructor(
		private badgeService: BadgeService,
		private formBuilder: FormBuilder,
		private pageService: PageService,
		private questService: QuestService,
		private route: ActivatedRoute,
		private router: Router,
		private sectionService: SectionService
	) { }

	ngOnInit() {
		this.route.paramMap.subscribe(params => {
			this.x = params.get('x');
			this.y = params.get('y');

			this.route.parent.paramMap.subscribe(params => {
				let sectionId = params.get('sectionId');
				this.sectionService.searchSection(sectionId).subscribe(res => {
					this.sectionService.setCurrentSection(new Section(res[0].section));
					this.setDefault();
					this.getCurrentSection();
					this.createBadgeArray();
					this.loadQuestMap();
				});
			})
		});
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
	 * Creates badge array for the create-quest form.
	 * @author Sumandang, AJ Ruth H.
	 */
	createBadgeArray() {
		let badges: Badge[] = [];
		this.badgeService.getSectionBadges(this.currentSection.getSectionId()).subscribe(
			badges => {
				badges = badges.map(badge => new Badge(badge));
				this.questBadges = [];
				this.questBadges = badges.map(function week(badge) {
					let obj = {
						badgeId: badge.getBadgeId(),
						badgeName: badge.getBadgeName(),
						badgeDescription: badge.getBadgeDescription(),
						isChecked: false
					}
					return obj;
				});

				this.initializeForm();
			}
		);
	}

	/**
	 * Initializes create-quest form.
	 */
	initializeForm() {
		this.createQuestForm = this.formBuilder.group({
			questTitle: new FormControl("", Validators.required),
			questDescription: new FormControl(""),
			questRetakable: new FormControl("Y", Validators.required),
			questEXP: new FormControl("", [Validators.required, Validators.pattern("[0-9]+")]),
			questHP: new FormControl("", Validators.pattern("[0-9]+")),
			questBadges: this.buildBadges(),
			questEndDate: new FormControl("", Validators.required),
			questPrerequisite: this.formBuilder.array([])
		});
	}

	/**
	 * Build badge's formbuilder array.
	 */
	buildBadges() {
		const arr = this.questBadges.map(badge => {
			return this.formBuilder.group({
				badge: badge.badgeId,
				badgeName: badge.badgeName,
				badgeDescription: badge.badgeDescription,
				isChecked: false
			})
		});

		return this.formBuilder.array(arr);
	}

	createQuest() {
		let questBadgesArr = [];
		let questPrereq = [];

		this.createQuestForm.value.questBadges.forEach(badge => {
			if (badge.isChecked) {
				questBadgesArr.push(badge.badge);
			}
		});

		this.createQuestForm.value.questPrerequisite.forEach(prereq => {
			if (prereq.questId.length != 0) {
				questPrereq.push(prereq.questId);
			}
		});

		let newQuest: Quest = new Quest();
		this.questService.createQuest(
			this.currentSection.getSectionId(),
			this.questTitle.value,
			this.questDescription.value,
			this.questRetakable.value,
			questBadgesArr,
			"",
			this.questEXP.value,
			this.questHP.value,
			new Date(),
			this.questEndDate.value,
			"",
			questPrereq
		).subscribe(quest => {
			quest = new Quest(quest);
			this.quests.push(quest);
			this.addNewQuestLine(quest, questPrereq);
			this.resetQuest();
			this.goToQuestMap();
		});
	}

	addNewQuestLine(quest, prereq) {
		//AHJ: unimplemented; add to database so questmap is refreshed
		// if the clicked point is a '+' sign
		if (this.x % 5 != 0 || this.y % 5 != 0) {
			let newQuestCoordinates: any[] = this.questMap.addNewQuestLine(this.x, this.y, quest);

			if (newQuestCoordinates.length > 0) {
				this.questService.addQuestMapCoordinates(this.currentSection.getSectionId(), this.questMap.getQuestMapId(), newQuestCoordinates, prereq).subscribe(questmap => {
					this.questService.getSectionQuestMap(this.currentSection.getSectionId()).subscribe(questmap => {
						this.questMap = new QuestMap(questmap);
						this.questMap.setQuestMapDataSet(this.quests, [], new User(), new Experience(), true);
					});
				});
			}

			// if clicked point is a quest point
		} else {
			let basisX = this.roundOff(this.x);
			let basisY = this.roundOff(this.y);

			if (this.x == 5 && this.y == 25) {
				this.questMap.editQuestMapCoordinateAt(basisX, basisY, quest._id);
			}

			this.questService.editQuestMapCoordinateAt(this.currentSection.getSectionId(), this.questMap.getQuestMapId(), quest._id, basisX, basisY).subscribe(() => {
				this.questService.getSectionQuestMap(this.currentSection.getSectionId()).subscribe(questmap => {
					this.questMap = new QuestMap(questmap);
					this.questMap.setQuestMapDataSet(this.quests, [], new User(), new Experience(), true);
				});
			})
		}
	}

	addQuestPrerequisite() {
		this.questPrerequisite.push(this.formBuilder.group({ questId: "" }));
	}

	/**
	 * Obtains the user's navigated section
	 * @description Obtains the current section and stores it into 'currentSection' variable
	 */
	getCurrentSection() {
		this.currentSection = this.sectionService.getCurrentSection();
	}

	/**
	 * Resets all the inputs in the createQuestForm.
	 */
	resetQuest() {
		this.createQuestForm.reset();
	}

	/**
	 * Round off the number to the nearest 5.
	 * @param num number to round off
	 */
	roundOff(num: number) {
		num = num % 5 > 2 ? Math.ceil(num / 5) : Math.floor(num / 5);
		return num * 5;
	}

	/**
	 * Redirects to the map-chart page.
	 */
	goToQuestMap() {
		this.router.navigate(['../../../map-chart'], {relativeTo: this.route});
	}

	/**
	 * Sets all the default less-related functions/properties of the component
	 */
	setDefault() {
		this.pageService.isProfilePage(false);
	}

	get questBadgesArray(): FormArray {
		return this.createQuestForm.get('questBadges') as FormArray;
	}

	get questDescription() {
		return this.createQuestForm.get('questDescription');
	}

	get questRetakable() {
		return this.createQuestForm.get('questRetakable');
	}

	get questTitle() {
		return this.createQuestForm.get('questTitle');
	}

	get questEndDate() {
		return this.createQuestForm.get('questEndDate');
	}

	get questPrerequisite(): FormArray {
		return this.createQuestForm.get('questPrerequisite') as FormArray;
	}

	get questEXP() {
		return this.createQuestForm.get('questEXP');
	}

	get questHP() {
		return this.createQuestForm.get('questHP');
	}
}
