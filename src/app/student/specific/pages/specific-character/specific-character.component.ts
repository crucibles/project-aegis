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
	Section, Item, User, Inventory
} from 'shared/models';

import {
	PageService,
	SectionService,
	ItemService,
	UserService
} from 'shared/services';
import { ToastsManager } from 'ng2-toastr';

@Component({
	selector: 'app-specific-character',
	templateUrl: './specific-character.component.html',
	styleUrls: ['./specific-character.component.css']
})
export class SpecificCharacterComponent implements OnInit {
	@ViewChild('checkBox') checkBox: ElementRef;

	//default informatoin
	private currentSection: Section;
	private currentUser: User;

	//for collapsible equipments/consummables
	windowWidth: number = window.innerWidth;
	hasEnoughSpace: boolean = this.windowWidth <= 1024 ? false : true;

	//variables mainly used for HTML
	tabButtons: any[];
	openedTab: string = "";
	openedItem: Item;
	isList: boolean = false;

	//inventory variables
	inventory: Inventory;
	inventoryItems: Item[];
	leftEquipment: any[];
	rightEquipment: any[];

	//if screen size changes it'll update
	@HostListener('window:resize', ['$event'])
	resize(event) {
		this.checkSize();
	}

	constructor(
		private itemService: ItemService,
		private pageService: PageService,
		private route: ActivatedRoute,
		private sectionService: SectionService,
		private toastr: ToastsManager,
		private userService: UserService
	) { }

	ngOnInit() {
		this.setDefault();
		this.getUserSectionInventory();
	}

	/**
	 * Sets all the default less-related functions/properties of the component
	 */
	setDefault() {
		this.pageService.isProfilePage(false);
		this.currentUser = this.userService.getCurrentUser();
		this.currentSection = new Section(this.sectionService.getCurrentSection());

		this.tabButtons = [
			{
				tabName: "All",
				itemType: "All",
				tabLogo: "/assets/images/all_logo.png"
			},
			{
				tabName: "Equipment",
				itemType: "w",
				tabLogo: "/assets/images/eqmt_logo.png"
			},
			{
				tabName: "Item",
				itemType: "c",
				tabLogo: "/assets/images/item_logo.png"
			}
		];
		this.openedTab = "All";
	}

	checkSize() {
		this.windowWidth = window.innerWidth;
		if (this.windowWidth <= 1024) {
			this.hasEnoughSpace = false;
		} else {
			this.hasEnoughSpace = true;
		}
	}

	getUserSectionInventory() {
		this.itemService.getUserSectionInventory(this.currentUser.getUserId(), this.currentSection.getSectionId()).subscribe(temp => {
			if (temp) {
				let inventory: any = temp;
				this.inventory = new Inventory(inventory.inventory);
				this.inventoryItems = [];
				if (inventory.items) {
					inventory.items.forEach(item => {
						this.inventoryItems.push(new Item(item));
					})
				}
				this.setUserEquipment();
			} else {
				console.log("ERROR in loading inventory");
			}
		});
	}

	setUserEquipment() {
		this.leftEquipment = [
			{
				image: this.inventory.getHead().length > 0 ?
					this.inventoryItems.find(item => item.getItemId() == this.inventory.getHead()).getItemPhoto() : "/assets/images/helmet_bg.png",
				hasEquipped: this.inventory.getHead().length > 0,
				itemId: this.inventory.getHead()
			},
			{
				image: this.inventory.getLeftHand().length > 0 ?
				this.inventoryItems.find(item => item.getItemId() == this.inventory.getLeftHand()).getItemPhoto() : "/assets/images/sword_bg2.png",
				hasEquipped: this.inventory.getLeftHand().length > 0,
				itemId: this.inventory.getLeftHand()
			},
			{
				image: this.inventory.getFootwear().length > 0 ?
				this.inventoryItems.find(item => item.getItemId() == this.inventory.getFootwear()).getItemPhoto() : "/assets/images/boots_bg2.png",
				hasEquipped: this.inventory.getFootwear().length > 0,
				itemId: this.inventory.getFootwear()
			},
		];
		
		this.rightEquipment = [
			{
				image: this.inventory.getArmor().length > 0 ?
				this.inventoryItems.find(item => item.getItemId() == this.inventory.getArmor()).getItemPhoto() : "/assets/images/helmet_bg.png",
				hasEquipped: this.inventory.getArmor().length > 0,
				itemId: this.inventory.getArmor()
			},
			{
				image: this.inventory.getRightHand().length > 0 ?
				this.inventoryItems.find(item => item.getItemId() == this.inventory.getRightHand()).getItemPhoto() : "/assets/images/sword_bg2.png",
				hasEquipped: this.inventory.getRightHand().length > 0,
				itemId: this.inventory.getRightHand()
			},
			{
				image: this.inventory.getAccessory().length > 0 ?
				this.inventoryItems.find(item => item.getItemId() == this.inventory.getAccessory()).getItemPhoto() : "/assets/images/boots_bg2.png",
				hasEquipped: this.inventory.getAccessory().length > 0,
				itemId: this.inventory.getAccessory()
			},
		];
	}

	getItem(itemId){
		return this.inventoryItems.find(item => item.getItemId() == itemId);
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
	filterInventoryItems(type: string) {
		let displayItems = this.inventoryItems ? this.inventoryItems.filter(item => !this.inventory.isEquipped(item.getItemId())) : [];
		if (type == "All") {
			return displayItems;
		} else {
			return displayItems.filter(item => item.getItemType() == type);
		}
	}

	/**
	 * Activates when checkbox in the inventory tab is clicked.
	 * Sets the value of 'isList' which is mainly used by inventory slots (if display view is list or image)
	 * 
	 * @author Sumandang, AJ Ruth H.
	 */
	checkIsList() {
		this.isList = this.checkBox.nativeElement.checked;
	}

	/**
	 * Discards the selected item
	 * @param item The item to discard.
	 * 
	 * @author Sumandang, AJ Ruth H.
	 */
	discardItem(item: Item) {
		if (confirm("Are you sure you want to discard this item?")) {
			this.itemService.removeInventoryItem(item.getItemId(), this.inventory.getInventoryId()).subscribe(result => {
				if (result) {
					let title = "Discard Item Success";
					let message = "Item <" + item.getItemName() + "> successfully discarded!";
					this.toastr.success(message, title);

					this.openedItem = null;
					if(this.inventory.removeItem(item.getItemId())){
						let index = this.inventoryItems.findIndex(temp => temp.getItemId() == item.getItemId());
						//AHJ: unimplemented; not sure if removing of element is correct here,
						this.inventoryItems = this.inventoryItems.splice(index - 1, 1);
					}
				} else {
					this.toastr.error("Item has not been discarded due to some error.", "Error in Discarding Item");
				}
			})
		}
	}

	/**
	 * Equips the selected item.
	 * Applicable for items of type "Equipment".
	 * @param item The item to equip.
	 */
	equipItem(item: Item, toEquip: boolean) {

		this.itemService.equipItem(item.getItemId(), item.getItemPart(), this.inventory.getInventoryId(), toEquip).subscribe(res => {
			if (res) {
				this.inventory.equipItem(item.getItemId(), item.getItemPart(), toEquip);
				this.openedItem = null;
				this.setUserEquipment();
			} 
		})
	}

	/**
	 * Uses the selected item.
	 * Applicable for items of type "Consummable".
	 * @param item The item to use.
	 */
	useItem(item: Item) {
	}
}
