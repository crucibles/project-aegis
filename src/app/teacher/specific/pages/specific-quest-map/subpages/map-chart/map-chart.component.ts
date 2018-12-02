// Core Imports
import { 
	Component, 
	OnInit, 
	TemplateRef,
	ViewChild
} from '@angular/core';

import {
	ActivatedRoute,
	Router
} from '@angular/router';

// Application Imports
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
	SectionService,
	UserService
} from 'shared/services';

// Third-Party Imports
import {
	BsModalRef,
	BsModalService
} from 'ngx-bootstrap';

import {
	Chart
} from 'chart.js';

import 'chartjs-plugin-datalabels';

@Component({
  	selector: 'app-map-chart',
  	templateUrl: './map-chart.component.html',
  	styleUrls: ['./map-chart.component.css']
})
export class MapChartComponent implements OnInit {
	// Stores the x- and y-coordinate respectively of the recently clicked point in the questmap chart
	private x: any;
	private y: any;

	// basic info
	private currentSection: Section;
	private currentUser: User;

  	// quests details
	private questClicked: Quest;
	private quests: Quest[];

	// quest map details
	private questMap: QuestMap;

	// quest map chart
	private xTick: number;
	private yTick: number;
	private chart: Chart;
	private chartColors: Array<any>;
	private chartLabels: Array<any> = [];
	private chartWidth: number;
	private chartHeight: number;

	// modal
	@ViewChild('questTemplate') questTemplate: TemplateRef<any>;
	private bsModalRef: BsModalRef;
	private badgeNames: any = [];

  	constructor(
		private badgeService: BadgeService,
		private modalService: BsModalService,
		private pageService: PageService,
		private questService: QuestService,
		private route: ActivatedRoute,
		private router: Router,
		private sectionService: SectionService,
		private userService: UserService
	) { }

  	ngOnInit() {
		this.route.parent.paramMap.subscribe(params => {
			let sectionId = params.get('sectionId');
			this.sectionService.searchSection(sectionId).subscribe(res => {
				this.sectionService.setCurrentSection(new Section(res[0].section));
				this.setDefault();
				this.getCurrentUser();
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
				this.setQuestMap();
			});
		});
	}

	/**
    * Sets the quest map (the GUI graph) based on the data received.
	* @param data string where the quests and its respective coordinates will be located
    */
   	setQuestMap() {
		this.chartColors = this.pageService.lineChartColors;
		this.chartWidth = 500;
		this.chartHeight = 500;

		var QM = {
			datasets: this.questMap.getQuestMapDataSet()
		}

		this.xTick = 50;
		this.yTick = 50;

		let options = {
			onClick: this.chartClicked.bind(this),
			legend: { display: false },
			plugins: {
				datalabels: {
					display: true,
					color: 'red',
					font: {
						weight: 'bold'
					},
					formatter: function (value, context) {
						return context.chart.data.datasets[context.datasetIndex].label;
					},
					padding: 4
				}
			},
			scales: {
				xAxes: [{
					display: false,
					type: 'linear',
					ticks: {
						max: this.xTick,
						min: 0
					}
				}],
				yAxes: [{
					display: false,
					ticks: {
						max: this.yTick,
						min: 0
					}
				}],
			},
			tooltips: {
				enabled: true,
				mode: 'single',
				callbacks: {
					title: function (tooltipItems, data) {
						var tooltipItem = tooltipItems[0];
						return data.datasets[tooltipItem.datasetIndex].title;
					},
					label: function (tooltipItem, data) {
						return "";
					}
				}
			}
		}

		var HTMLchart = document.getElementById("quest-map");
		var ctx = (<HTMLCanvasElement>HTMLchart).getContext("2d");

		let cc: any = {
			data: QM,
			options: options
		};

		this.chart = new Chart(ctx, cc);
	}

	/**
	 * Triggers when the quest map chart is clicked.
	 * Does nothing when no point has been clicked,
	 * Opens quest modal when quest point is clicked and;
	 * Opens add quest if plus point is clicked.
	 * 
	 * @param $event the event of the point clicked on the chart
	 * @see openCreateQuestModal
	 * @see openQuest
	 */
	chartClicked($event) {
		var points: any = this.chart.getDatasetAtEvent($event);
		if (points.length != 0) {
			this.x = points[0]._model.x / (this.chartWidth / this.xTick);
			this.y = (this.chartHeight - points[0]._model.y) / (this.chartHeight / this.yTick);

			if ((this.x % 5 != 0 || this.y % 5 !== 0) || this.questMap.getQuestIdOf(this.x, this.y) == "") {
				if (!this.questMap.hasQuestPointAtDirection(this.x, this.y)) {
					this.goToCreateQuest(this.x, this.y);
				} else {
					// For empty quest points (x: ?, y: ?)
				}
			} else {
				var questId = this.questMap.getQuestIdOf(this.x, this.y);
				var quests: Quest[] = this.quests.filter(quest => quest.getQuestId() == questId);
				if (quests.length > 0) {
					this.openQuest(quests[0]);
				}
			}
		}
	}

	/**
	 * Open quest modal and display clicked quest details.
	 * @param quest quest to display
	 * 
	 * @author Sumandang, AJ Ruth
	 */
	openQuest(quest: any) { //'quest: any' in here means the quest has not been converted to Quest type
		//AHJ: Unimplemented
		//WARNING!! Remove QUESTS in specific-qm.html when this is implemented
		this.questClicked = new Quest(quest);
		this.getBadgeName();
		if (this.questClicked) {
			this.bsModalRef = this.modalService.show(this.questTemplate);
		}
	}

	/**
	 * Acquires the badge names of the badge rewards of a certain quest.
	 */
	getBadgeName() {
		this.badgeNames = [];
		if (this.questClicked.getQuestBadge().length != 0) {
			this.questClicked.getQuestBadge().map(badge => {
				this.badgeService.getBadge(badge).subscribe(res => {
					this.badgeNames.push(new Badge(res).getBadgeName());
				});
			});
		}
	}

	/**
	 * Redirects to the create-quest page with the chart coordinates x and y.
	 * @param x 
	 * @param y 
	 */
	goToCreateQuest(x: number, y: number) {
		this.router.navigate(['../create-quest/' + x + '/' + y], {relativeTo: this.route});
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

	getCurrentUser() {
		//AHJ: unimplemented... or not sure. Di ko sure kung tama na ning pagkuha sa current user
		this.currentUser = new User(this.userService.getCurrentUser());
	}
}
