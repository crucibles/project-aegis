//Core Imports
import {
	Component,
	OnInit,
	HostListener,
	ViewChild,
	ElementRef
} from '@angular/core';

import {
	ActivatedRoute
} from '@angular/router';

//Application Imports
import {
	Section, Item
} from 'shared/models';

import {
	PageService,
	SectionService
} from 'shared/services';

@Component({
	selector: 'app-specific-character',
	templateUrl: './specific-character.component.html',
	styleUrls: ['./specific-character.component.css']
})
export class SpecificCharacterComponent implements OnInit {
	@ViewChild('checkBox') checkBox: ElementRef;

	private currentSection: Section;

	private ctx: any = {
		isImage: true
	};

	//for collapsible equipments/consummables
	windowWidth: number = window.innerWidth;
	hasEnoughSpace: boolean = this.windowWidth <= 1024 ? false : true;

	tabButtons: any[];
	openedTab: string = "";
	openedItem: Item;

	isList: boolean = false;

	//AHJ: unimplemented; dummy 
	equipment: Item;
	consummable: Item;
	inventoryItems: Item[];

	//if screen size changes it'll update
	@HostListener('window:resize', ['$event'])
	resize(event) {
		this.checkSize();
	}

	constructor(
		private pageService: PageService,
		private sectionService: SectionService,
		private route: ActivatedRoute
	) { }

	ngOnInit() {
		this.setDefault();
		this.setDummy();
		this.getCurrentSection();
	}

	/**
	 * Sets all the default less-related functions/properties of the component
	 */
	setDefault() {
		this.pageService.isProfilePage(false);
		this.tabButtons = [
			{
				tabName: "All",
				tabLogo: "/assets/images/all_logo.png"
			},
			{
				tabName: "Equipment",
				tabLogo: "/assets/images/eqmt_logo.png"
			},
			{
				tabName: "Item",
				tabLogo: "/assets/images/item_logo.png"
			}
		];
		this.openedTab = "All";
	}

	setDummy() {
		this.equipment = new Item();
		this.equipment.createItem("Equipment", "Sword", "default_sword.jpg", "Default. Duh", "0", "0", "None");
		this.consummable = new Item();
		this.consummable.createItem("Consummable", "Potion", "item_logo.png", "Default. Duh", "0", "0", "None");
		this.inventoryItems = [];
		this.inventoryItems.push(this.equipment);
		this.inventoryItems.push(this.consummable);
	}

	/**
	 * Obtains the user's navigated section
	 * @description Obtains the current section and stores it into 'currentSection' variable
	 */
	getCurrentSection() {
		this.route.paramMap.subscribe(params => {
			let sectionId = params.get('sectionId');
		});
	}

	checkSize() {
		this.windowWidth = window.innerWidth;
		if (this.windowWidth <= 1024) {
			this.hasEnoughSpace = false;
		} else {
			this.hasEnoughSpace = true;
		}
	}

	/**
	 * Activates when one of the inventory tabs are clicked.
	 * Sets the opened tab with the recently clicked tab; empty string if none of the listed cases are clicked.
	 * @param tab The name of the latest clicked tab
	 * 
	 * @author Sumandang, AJ Ruth H.
	 */
	clickedNewTab(tab: string) {
		this.openedTab = tab;
		switch (tab) {
			case "All":
			case "Equipment":
			case "Item":
				break;
			default:
				this.openedTab = "";
		}
	}

	/**
	 * Activates when one of the inventory tabs are clicked.
	 * Sets the opened tab with the recently clicked tab; empty string if none of the listed cases are clicked.
	 * @param item The name of the latest clicked tab
	 * 
	 * @author Sumandang, AJ Ruth H.
	 */
	clickedNewItem(item: Item) {
		this.openedItem = item;
	}

	/**
	 * Filters inventory item to display in the inventory slots based on the latest clicked tab.
	 * @param tab The name of the latest clicked tab; determines what inventory items to display
	 * @returns the array of items to display in the inventory slots; 
	 * - All of the user's item if opened tab is "All"
	 * - Items of type 'Equipment' if opened tab is "Equipment"
	 * - Items of type 'Consummable' if opened tab is "Item"
	 * 
	 * @author Sumandang, AJ Ruth H.
	 */
	filterInventoryItems(tab: string) {
		let items: Item[] = [];
		switch (tab) {
			case "All":
				items = this.inventoryItems;
				break;
			case "Equipment":
				items = this.inventoryItems.filter(item => item.getItemType() == tab);
				break;
			case "Item":
				items = this.inventoryItems.filter(item => item.getItemType() == "Consummable");
				break;
		}
		return items;
	}

	/**
	 * Activates when checkbox in the inventory tab is clicked.
	 * Sets the value of 'isList' which is mainly used by inventory slots (if display view is list or image)
	 * 
	 * @author Sumandang, AJ Ruth H.
	 */
	checkIsList(){
		this.isList = this.checkBox.nativeElement.checked;
	}

	/**
	 * Discards the selected item
	 * @param item The item to discard.
	 */
	discardItem(item: Item){

	}

	/**
	 * Equips the selected item.
	 * Applicable for items of type "Equipment".
	 * @param item The item to equip.
	 */
	equipItem(item: Item){

	}

	/**
	 * Uses the selected item.
	 * Applicable for items of type "Consummable".
	 * @param item The item to use.
	 */
	useItem(item: Item){

	}
}
