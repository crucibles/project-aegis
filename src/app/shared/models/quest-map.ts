import { Quest } from "shared/models/quest";
import { SectionQuest } from "shared/models/section";
import { User } from "shared/models/user";
import { Experience } from "shared/models/experience";


/**
 * A class that represents questmaps.
 */
export class QuestMap {

	private _id: String;
	private datasets;
	private flat_one_perc: number;
	private max_exp: number;
	private mainquestY: number;
	private questCoordinates: any[];
	private tempquestCoord: any[];
	private quests: Quest[];

	/**
	 * Constructor for Quest Map 
	 * @param data data containing quest map's id and section's max EXP and flat-one grade percentage 
	 * @param quests quests included in the section
	 * @param sectionQuests quests attribute of the section (which includes the quest's participants & prereq; for student's use only)
	 * @param isTeacher determines if user requesting quest map data is from a teacher or not (for '+' points in the graph)
	 * 
	 * @author Sumandang, AJ Ruth H.
	 */
	constructor(data) {
		this.mainquestY = 25;
		this._id = data._id;
		this.max_exp = data && data.max_exp ? data.max_exp : 0;
		this.flat_one_perc = data && data.flat_one_perc ? data.flat_one_perc : 80;
		this.tempquestCoord = data.quest_coordinates;
	}

	/**
	 * Sorts the quests according to date.
	 * Used especially for correct quest map label/tags (e.g A, J1, Z15 on the quest points)
	 * @param quests the quests to sort
	 * @returns sorted quests by date
	 * 
	 * @author Sumandang, AJ Ruth H.
	 */
	private sortQuestsByDate(quests: Quest[]): Quest[] {
		quests = quests.map(quest => new Quest(quest));
		quests.sort((a, b) => {
			return this.getTime(a.getQuestStartTimeDate()) - this.getTime(b.getQuestStartTimeDate());
		})
		return quests;
	}

	/**
	 * Returns time of the received date; useful for undefined checking 
	 * @param date date whose time is to be retrieved
	 */
	private getTime(date?: Date) {
		date = new Date(date);
		return date != null ? date.getTime() : 0;
	}

	/**
	 * Returns questmap datasets.
	 * @returns array of datasets with properties such as type, label, data (array), fill, radius, etc.
	 */
	getQuestMapDataSet() {
		return this.datasets;
	}

	hasSubmitted(questId: string) {
		this.datasets.forEach((set, i) => {
			set
		});
	}

	getMaxEXP(): number {
		return this.max_exp;
	}

	getFlatOnePercentage(): number {
		return this.flat_one_perc;
	}

	getQuestMapId() {
		return this._id;
	}

	getQuestLabel(questId: string): string {
		let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		let index = this.quests.findIndex(quest => quest.getQuestId() == questId);
		let addtlIndex: string = "";

		if (index > alphabet.length - 1) {
			addtlIndex = Math.floor(index / alphabet.length) + "";
			index = index % alphabet.length;
		}

		let label: string = alphabet.charAt(index) + addtlIndex;

		return index < 0 ? "?" : label;
	}

	getQuestInformationArray() {
		let questArray: any[] = [];
		this.quests.forEach((quest) => {
			questArray.push({
				quest: quest,
				questLabel: this.getQuestLabel(quest.getQuestId())
			})
		})
		return questArray;
	}

	setFlatOnePercentage(flatOne: number) {
		this.flat_one_perc = flatOne ? flatOne : 80;
	}

	setMaxEXP(maxEXP: number) {
		this.max_exp = maxEXP;
	}

	/**
	 * Determines if the user has accomplished all quest prerequisite for a certain quest.
	 * A quest is only considered accomplished if the submission has been graded by the teacher.
	 * @param questId the id of the quest whose quest prerequisites are to be checked 
	 * @returns true if all quest prerequisites had graded submissions; false if not.
	 * 
	 * @author Sumandang, AJ Ruth H.
	 */
	passQuestPrerequisites(questId: string, experience: Experience) {
		let hasPass: boolean = true;
		let questPrereq: string[] = this.quests.filter(quest => quest.getQuestId() == questId).length > 0 ?
			this.quests.filter(quest => quest.getQuestId() == questId)[0].getQuestPrerequisite() : [];

		questPrereq.forEach(quest_id => {
			if (!experience.isQuestGraded(quest_id)) {
				hasPass = false;
			}
		})
		return hasPass;
	}

	// lock - grey - #c0c0c0; open - green - #008421; ongoing - blue - #0073aa; done - orange - #FF8000
	getQuestPointColor(quest: Quest, secQuests: SectionQuest[], user: User, experience: Experience): string {
		let tempArr: SectionQuest[] = quest ? secQuests.filter(sectionquest =>
			sectionquest.getSectionQuestId() == quest.getQuestId()) : [];
		if (tempArr.length == 0) {
			return "#FFFFFF";
		} else {
			let sectionQuest: SectionQuest = tempArr[0];
			// if user is not a participant (either 'locked' or 'open')
			if (sectionQuest.getQuestParticipants().length == 0 || !sectionQuest.searchParticipant(user.getUserId())) {
				if (this.passQuestPrerequisites(quest.getQuestId(), experience)) {
					console.log("PASSPREREQ!");
					return "#008421";
				} else {
					console.log("NOPASSPREREQ!");
					return "#C0C0C0";
				}
			} else { // if user is participant (either 'ongoing' or 'done')	
				if (experience.hasSubmittedQuest(quest.getQuestId())) {
					return "#FF8000";
				} else {
					return "#0073aa";
				}
			}
		}
	}

	/**
	 * Sets the quest map's datasets which is used in the HTML graph.
	 * @param quests All quests of the section
	 * @param sectionQuests Section quest which includes participants and quest prerequisite
	 * @param user The current user (mostly used when requesting user is student)
	 * @param experience The user's experience (used to know if user submitted quest; for students only)
	 * @param isTeacher Determines whether the requesting user is a teacher or not
	 */
	setQuestMapDataSet(quests: Quest[], sectionQuests: SectionQuest[], user: User, experience: Experience, isTeacher) {
		this.quests = this.sortQuestsByDate(quests);
		let questMapDetails = this.getQuestMapDetails(this.tempquestCoord);

		let exclude: any[] = questMapDetails.exclude;
		let questPositions = questMapDetails.questPositions;
		let minX: number = questMapDetails.minX;
		let maxX: number = questMapDetails.maxX;
		let mainquestY: number = this.mainquestY;
		let dataset: any;
		var datasets: any[] = [];

		this.questCoordinates = [];

		for (let questPosition of questPositions) {
			let quest = quests.filter(quest => quest.getQuestId() == questPosition.questId);
			let questLabel = quest.length == 0 ? "?" : this.getQuestLabel(quest[0].getQuestId());
			let color: string = isTeacher ? "#000" : this.getQuestPointColor(quest[0], sectionQuests, user, experience);
			var title = quest.length == 0 ? "<No title>" : quest[0].getQuestTitle();
			if (questPosition.type === "scatter") {
				dataset = {
					type: "scatter",
					label: questLabel,
					title: title,
					data: [{
						x: questPosition.x,
						y: questPosition.y
					}],
					backgroundColor: color,
					borderColor: color,
					pointHoverRadius: 9,
					radius: 10,
					showLine: false
				};

				var coordinates: any = {
					questId: questPosition.questId,
					x: questPosition.x,
					y: questPosition.y
				};

				this.questCoordinates.push(coordinates);

				var scatterPoints: any[] = [];

				if (isTeacher) {
					scatterPoints = this.addQuestPlus(questPosition.x, questPosition.y, minX, maxX, mainquestY, exclude);
					if (scatterPoints.length != 0) {
						for (let scatterPoint of scatterPoints) {
							datasets.push(scatterPoint);
						}
					}
				}

			} else if (questPosition.type === "line") {
				let borderWidth: number = questPosition.y == mainquestY && questPosition.y1 == mainquestY ? 5 : 2.5;
				dataset = {
					type: 'line',
					label: '',
					data: [{
						x: questPosition.x,
						y: questPosition.y
					}, {
						x: questPosition.x1,
						y: questPosition.y1
					}],
					fill: false,
					radius: 0,
					borderWidth: borderWidth,
					borderColor: "#000"
				}
			}

			datasets.push(dataset);

		}

		dataset = {
			type: 'line',
			label: '',
			data: [{
				x: minX,
				y: mainquestY
			}, {
				x: maxX,
				y: mainquestY
			}],
			fill: false,
			radius: 0,
			borderWidth: 4,
			borderColor: "#000"
		}

		datasets.push(dataset);

		this.datasets = datasets;
	}

	/**
	 * Adds surrounding'+' points to the performance graph based on the given point.
	 * @param x x-coordinate of the basis point
	 * @param y y-coordinate of the basis point
	 * @param minX minimum x-value of the graph
	 * @param maxX maximum x-value of the graph
	 * @param mainquestY y-coordinate of the main quest line
	 * @param exclude array of points with respective direction to exclude
	 */
	addQuestPlus(x: number, y: number, minX: number, maxX: number, mainquestY: number, exclude: any[]): any[] {
		let scatterPoints: any[] = [];

		let excludedPoints = exclude.filter(data =>
			data.x == x && data.y == y
		);
		let directions = ["N", "S", "E"];
		for (let direction of directions) {
			// The following if-conditions are the cases that disallows '+' symbols to be added

			// if current point is a main quest, current x is not the latest main quest, and direction is towards east
			if (y == mainquestY && (x < maxX && direction == "E")) {
				continue;

				// if point to be added is not a main quest and direction is either north or south
			} else if ((y > mainquestY && direction === "S") || (y < mainquestY && direction === "N")) {
				continue;

				// explicitly disallowed '+' point (for cases such as north/south new points from main point)
			} else if (excludedPoints.filter(data => data.x == x && data.y == y && data.direction == direction).length != 0) {
				continue;
			}

			// stores the new '+' point's location (x1 & y1)
			let x1: number = x;
			let y1: number = y;

			if (direction == "N" || direction == "S") {
				y1 = direction === "N" ? y + 2 : y - 2;
			} else {
				x1 = x + 2;
			}

			// add to chart if there is no point existing at this point
			// (particularly the '+' point will be placed)
			if (!this.hasExistingPointAt(x1, y1)) {
				let label = "Add Quest";

				//determines where the quest point will be 
				let tempX = x;
				let tempY = y;

				//calculates where the quest point will be
				if (direction == "N" || direction == "S") {
					tempY = direction === "N" ? y + 5 : y - 5;
				} else {
					tempX = x + 5;
				}

				label = this.hasExistingPointAt(tempX, tempY) ? "Connect" : label;
				let scatterPoint: any = {
					type: "scatter",
					label: '',
					title: label,
					data: [{
						x: x1,
						y: y1
					}],
					showLine: false,
					pointStyle: "cross",
					radius: 3,
					backgroundColor: "#000",
					borderColor: "#000"
				}
				scatterPoints.push(scatterPoint);
			}
		}

		return scatterPoints;
	}

	/**
	 * Round off the number to the nearest 5.
	 * @param num number to round off
	 */
	roundOff(num: number) {
		num = num % 5 > 2 ? Math.ceil(num / 5) : Math.floor(num / 5);
		return num * 5;
	}

	editQuestMapCoordinateAt(x, y, questId) {
		this.questCoordinates = this.questCoordinates.map(coordinate => {
			if (coordinate.x == x && coordinate.y == y) {
				coordinate.questId = questId;
			}
			return coordinate;
		});
	}

	addNewQuestLine(x, y, quest): any[] {
		let newQuestCoordinates: any[] = [];
		let basisX = this.roundOff(x);
		let basisY = this.roundOff(y);


		let isNorth: boolean = y - basisY > 0 ? true : false;
		let isEast: boolean = x - basisX > 0 ? true : false;

		let x2 = basisX;
		let y2 = basisY;

		if (isEast) {
			//if added quest is not a main quest and goes east
			if (basisY != this.mainquestY) {
				newQuestCoordinates.push({
					type: "exclude",
					x1: basisX,
					y1: basisY,
					direction: "E"
				});
			}
			x2 += 5;
		}

		//if added quest point's direction is either towards north or south (for adding excluded plus points)
		if (basisY - y != 0) {
			let direction = isNorth ? "N" : "S";
			newQuestCoordinates.push({
				type: "exclude",
				x1: basisX,
				y1: basisY,
				direction: direction
			});
			y2 = isNorth ? y2 + 5 : y2 - 5;
		}

		let coord: any = {
			type: "line",
			x1: basisX,
			y1: basisY,
			x2: x2,
			y2: y2
		};
		newQuestCoordinates.push(coord);

		// if no quest exists on the newly created destination quest point
		if (quest && this.getQuestIdOf(x2, y2) == "") {
			coord = {
				quest_id: quest._id,
				type: "scatter",
				x1: x2,
				y1: y2
			}
			newQuestCoordinates.push(coord);
		}

		return newQuestCoordinates;
	}

	/**
	 * Used for '+' signs.
	 * Determines whether there is a direction towards where the '+' sign is directed.
	 * @param x x-coordinate of the '+' sign
	 * @param y y-coordinate of the '+' sign
	 */
	hasQuestPointAtDirection(x, y) {
		let basisX = this.roundOff(x);
		let basisY = this.roundOff(y);


		let isNorth: boolean = y - basisY > 0 ? true : false;
		let isEast: boolean = x - basisX > 0 ? true : false;

		let x2 = basisX;
		let y2 = basisY;

		if (isEast) {
			x2 += 5;
		}

		if (basisY - y != 0) {
			let direction = isNorth ? "N" : "S";
			y2 = isNorth ? y2 + 5 : y2 - 5;
		}

		return this.hasExistingPointAt(x2, y2);
	}

	private getQuestMapDetails(data: any[]): any {
		var lines: any[] = data;
		var i = 0;
		var dataArr: any[] = [];
		var exArr: any[] = [];
		var minX: number = 100;
		var maxX: number = 0;
		var mainquestY: number = 25;

		let questPoint: any;
		for (i = 0; i < lines.length; i++) {
			var lineData = lines[i];
			let x: number = parseInt(lineData.x1);
			let y: number = parseInt(lineData.y1);

			if (mainquestY == y) {
				minX = minX < x ? minX : x;
				maxX = maxX > x ? maxX : x;
			}

			if (lineData.type === "scatter") {
				questPoint = {
					questId: lineData.quest_id,
					type: lineData.type,
					x: x,
					y: y,
				}
			} else if (lineData.type === "line") {
				questPoint = {
					type: lineData.type,
					x: x,
					y: y,
					x1: parseInt(lineData.x2),
					y1: parseInt(lineData.y2),
				}
			} else if (lineData.type === "exclude") {
				let exclude: any = {
					type: lineData.type,
					x: x,
					y: y,
					direction: lineData.direction
				}
				exArr.push(exclude);
				continue;
			}

			dataArr.push(questPoint);
		}

		var questMapDetails: any = {
			maxX: maxX,
			minX: minX,
			questPositions: dataArr,
			exclude: exArr
		}
		return questMapDetails;
	}

	/**
	 * Determines whether point exists in the given coordinates.
	 * @param x x-coordinate of the point to check
	 * @param y y-coordinate of the point to check
	 */
	private hasExistingPointAt(x, y) {
		return this.questCoordinates.filter(coordinate => coordinate.x == x && coordinate.y == y).length > 0;
	}

	getQuestIdOf(x, y) {
		var quests = this.questCoordinates.filter(coordinate => coordinate.x == x && coordinate.y == y);
		var questId = quests.length == 0 ? "" : quests[0].questId;
		return questId;
	}

}