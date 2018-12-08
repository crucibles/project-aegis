// Core Imports
import {
	Component,
	OnInit,
	TemplateRef
} from '@angular/core';

import {
	FormBuilder,
	FormControl,
	FormGroup,
	Validators
} from '@angular/forms';

//Third-Party Imports
import {
	BsModalRef,
	BsModalService
} from 'ngx-bootstrap';

//Application Imports
import {
	Badge,
	Item,
	User,
	Conditions,
	Section,
	Course
} from 'shared/models';

import {
	BadgeService,
	ItemService,
	UserService,
	SectionService
} from 'shared/services';
import { ActivatedRoute } from '@angular/router';
import { ToastsManager } from 'ng2-toastr';
import { FileUploader } from 'ng2-file-upload/ng2-file-upload';
import { Status } from 'shared/models/status';

const ITEMS: any[] = [
	{
		_id: "12",
		item_type: "w",
		item_part: "Head",
		item_name: "Dark Sword",
		item_photo: "dark-sword.jpg",
		item_description: "Pierces to the soul.",
		item_hp: "123",
		item_xp: "124",
		item_armor: "0",
		item_ailment: "Poison",
		is_default: false
	}
];

@Component({
	selector: 'app-inventory',
	templateUrl: './inventory.component.html',
	styleUrls: ['./inventory.component.css']
})

export class InventoryComponent implements OnInit {
	//modal
	private bsModalRef: BsModalRef;
	private itemForm: FormGroup;
	private badgeForm: FormGroup;
	//url of uploaded image
	private itemImgUrl: string = "/assets/images/not-found.jpg";
	private badgeImgUrl: string = "/assets/images/not-found.jpg";
	private badgeImgFile: File;

	private url = 'api/upload';
	public uploader: FileUploader = new FileUploader({ url: this.url, itemAlias: 'file' });

	currentUser: User;
	openedItem: Item;
	items: Item[];
	equipmentParts: string[] = [
		"Head",
		"Armor",
		"Footwear",
		"Left Hand",
		"Right Hand",
		"Accessory"
	];
	badges: Badge[];
	statuses: Status[];
	instructorSections: any[];
	sections: Section[];
	sectionId: any;

	isAddDefaultItem: boolean = true;

	constructor(
		private formBuilder: FormBuilder,
		private itemService: ItemService,
		private modalService: BsModalService,
		private userService: UserService,
		private sectionService: SectionService,
		private badgeService: BadgeService,
		private route: ActivatedRoute,
		private toastr: ToastsManager
	) {
		this.uploader = new FileUploader({ url: this.url, itemAlias: 'file' });
	}

	ngOnInit() {
		//override the onAfterAddingfile property of the uploader so it doesn't authenticate with //credentials.
		this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
		//overide the onCompleteItem property of the uploader so we are 
		//able to deal with the server response.
		this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
			this.toastr.success("Well done!", "Upload success!");
			this.createBadge(JSON.parse(response));
		};

		this.getUser();
		this.initializeForm();
		this.getSections();

		this.route.paramMap.subscribe(params => {
			this.sectionId = params.get('sectionId');
		});
	}

	createBadge(res: any) {
		this.badgeForm.value.badgeImage = res ? res.uploadName : "";
		this.badgeService.createBadge(this.setBadge(), this.badgeForm.value.badgeSection).subscribe(data => {
			if (!data) {
				console.log('Your badge failed to be created.');
			}
		});

		this.bsModalRef.hide();
		this.badgeForm.reset();
	}

	private setConditions() {
		let badgeCondition = new Conditions();
		badgeCondition.setXp(this.badgeForm.value.badgeXP);
		badgeCondition.setLogInstreak(this.badgeForm.value.badgeLoginStreak);
		return badgeCondition;
	}

	private setBadge() {
		let badge = new Badge();
		badge.setBadge(
			this.badgeForm.value.badgeName,
			this.badgeForm.value.badgeImage,
			this.badgeForm.value.badgeDescription,
			this.setConditions(),
			false,
			false,
			false
		);
		return badge;
	}


	public badgeImageEvent($event: any) {
		if ($event.target.files && $event.target.files[0]) {
			const fileSelected: File = $event.target.files[0];
			var reader = new FileReader();

			reader.readAsDataURL($event.target.files[0]); // read file as data url

			reader.onload = ($event) => { // called once readAsDataURL is completed
				let target: any = $event.target;
				let content: string = target.result;
				this.badgeImgUrl = content;
			}
		}
	}

	createItem() {
		if (this.itemForm.invalid) {
			return;
		} else {
			console.log(this.itemForm);
			console.log(this.itemType);

			if (this.isAddDefaultItem) {
				this.itemService.addItemToSection(this.openedItem.getItemId(), this.itemForm.value.sectionId).subscribe(success => {
					if (success) {
						console.log("SCUESS!");
					} else {
						console.log("failed!");
					}
				});
			} else {
				this.itemService.createItem(
					this.itemForm.value.itemType,
					this.itemForm.value.itemPart,
					this.itemForm.value.itemName,
					this.itemForm.value.itemPhoto,
					this.itemForm.value.itemDescription,
					this.itemForm.value.itemHP,
					this.itemForm.value.itemXP,
					this.itemForm.value.itemArmor,
					this.itemForm.value.itemAilment,
					this.itemForm.value.itemCure,
					false
				).subscribe(success => {
					console.log(success);
					if (success) {
						console.log("yay!");
					} else {
						console.log("huhu!");
					}
				});
			}
		}
	}

	initializeForm() {
		this.itemForm = this.formBuilder.group({
			sectionId: new FormControl("", Validators.required),
			itemId: new FormControl("", Validators.required),
			itemName: new FormControl({ value: "", disabled: this.isAddDefaultItem }, Validators.required),
			itemDescription: new FormControl({ value: "", disabled: this.isAddDefaultItem }, Validators.required),
			itemType: new FormControl({ value: "", disabled: this.isAddDefaultItem }, Validators.required),
			itemPart: new FormControl({ value: "", disabled: this.isAddDefaultItem }),
			itemImage: new FormControl(""),
			itemHP: new FormControl({ value: "0", disabled: this.isAddDefaultItem }, Validators.pattern("[0-9]+")),
			itemXP: new FormControl({ value: "0", disabled: this.isAddDefaultItem }, Validators.pattern("[0-9]+")),
			itemArmor: new FormControl({ value: "0", disabled: this.isAddDefaultItem }, Validators.pattern("[0-9]+")),
			itemAilment: new FormControl({ value: "", disabled: this.isAddDefaultItem }),
			itemCure: new FormControl({ value: "", disabled: this.isAddDefaultItem })
		});

		this.badgeForm = this.formBuilder.group({
			badgeName: new FormControl("", Validators.required),
			badgeImage: new FormControl(""),
			badgeDescription: new FormControl("", Validators.required),
			badgeSection: new FormControl("", Validators.required),
			badgeXP: new FormControl("", Validators.required),
			badgeLoginStreak: new FormControl("", Validators.required)
		});

	}

	public itemImageEvent($event: any) {
		if ($event.target.files && $event.target.files[0]) {
			const fileSelected: File = $event.target.files[0];
			var reader = new FileReader();

			reader.readAsDataURL($event.target.files[0]); // read file as data url

			reader.onload = ($event) => { // called once readAsDataURL is completed
				let target: any = $event.target;
				let content: string = target.result;
				this.itemImgUrl = content;
			}
		}
	}

	/**
	 * Obtains information of the current user
	 */
	getUser(): void {
		let currentUser = JSON.parse(localStorage.getItem("currentUser"));
		this.userService.getUser(currentUser._id)
			.subscribe(user => {
				this.currentUser = new User(user);
				this.getTeacherItems();
				this.getTeacherStatuses();
				this.getTeacherBadges();
			});
	}

	getTeacherItems() {
		//AHJ: unimplemented; add items relative to the teacher; 
		//remove dummy below if itemService.getDefaultItems() get properly implemented
		this.items = ITEMS.map(item => new Item(item));

		/*this.itemService.getDefaultItems().subscribe(items => {
			this.items = items.map(item => new Item(item));
		});*/
	}

	getTeacherStatuses() {
		this.itemService.getDefaultStatuses().subscribe(statuses => {
			if (statuses) {
				this.statuses = statuses.map(status => new Status(status));
			}
		});
	}

	/**
	 * @description This function is used in general inventory page. It lets the teacher view all the badges
	 * he/she created in the system.
	 */
	getTeacherBadges() {
		console.warn(this.userService.getCurrentUser().getUserId());
		this.badgeService.getTeacherBadges(this.userService.getCurrentUser().getUserId()).subscribe(badge => {
			this.badges = badge.map(b => new Badge(b));
		});
	}

	/**
	 * Open item modal
	 * @description Open 'Add Item' modal.
	 * @param itemTemplate template
	 */
	openItemModal(itemTemplate: TemplateRef<any>) {
		this.bsModalRef = this.modalService.show(itemTemplate);
	}

	/**
	 * Open badge modal
	 * @description Open 'Add Badge' modal.
	 * @param badgeTemplate template
	 */
	openBadgeModal(badgeTemplate: TemplateRef<any>) {
		this.bsModalRef = this.modalService.show(badgeTemplate);
	}

	getSections(): void {
		this.sectionService.getInstructorSections(
			this.userService.getCurrentUser().getUserId()
		).subscribe(data => {
			this.instructorSections = data;
		});
	}

	getStatusName(statusId) {
		let status = this.statuses.find(stat => stat.getStatusId() == statusId);
		return status ? status.getStatusName() : "";
	}

	getStatusDescription(statusId) {
		let status = this.statuses.find(stat => stat.getStatusId() == statusId);
		return status ? status.getStatusDescription() : "";
	}

	openItem(itemId: String) {
		this.openedItem = this.items.find(item => item.getItemId() == itemId);
	}

	addDefaultItem(isAdd: boolean) {
		this.isAddDefaultItem = isAdd;
		if (isAdd) {
			this.itemForm.disable();
			this.itemForm.get('sectionId').enable();
			this.itemForm.get('itemId').enable();
			this.itemForm.get('itemId').setValidators(Validators.required);
		} else {
			// AHJ: unimplemented; reset all fields when navigating from one tab to another
			this.itemForm.enable();
			this.itemForm.get('itemId').clearValidators();
		}
	}

	get itemId() {
		return this.itemForm.get('itemId');
	}

	get itemName() {
		return this.itemForm.get('itemName');
	}

	get itemType() {
		return this.itemForm.get('itemType');
	}

	get itemDescription() {
		return this.itemForm.get('itemDescription');
	}
	
	get itemHP() {
		return this.itemForm.get('itemHP');
	}

	get itemXP() {
		return this.itemForm.get('itemXP');
	}

	get itemArmor() {
		return this.itemForm.get('itemArmor');
	}

	get itemAilment() {
		return this.itemForm.get('itemAilment');
	}

	get itemCure() {
		return this.itemForm.get('itemCure');
	}

	get secId() {
		return this.itemForm.get('sectionId');
	}
}
