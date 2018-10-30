//Core Imports
import {
	Injectable
} from '@angular/core';

import {
	HttpParams,
	HttpClient
} from '@angular/common/http';

//Third-party Imports
import {
	tap,
	catchError
} from 'rxjs/operators';

import { Observable }
	from 'rxjs';

import {
	of
} from 'rxjs/observable/of';

//Application Imports
import {
	Inventory,
	Item
} from 'shared/models';



@Injectable()
export class ItemService {

	/**
	 * Used for adding/editing/deleting items 
	 */
	private itemUrl = "api/items";

	/**
	 * Used for accessing/editing/deleting inventories
	 */
	private inventoryUrl = "api/items";

	/**
	 * Used for using/discarding/adding items to inventory
	 */
	private inventoryItemUrl = "api/inventories/items";

	/**
	 * Used for retrieving statuses/ailments
	 */
	private statusUrl = "api/statuses";

	private currentInventory: Inventory;

	constructor(
		private http: HttpClient
	) { }

	/**
   * Adds item to the inventory
   * @param item_id id of the item to be added to the inventory
   * @param inventory_id id of the inventory where the added item will be placed 
   */
	addItem(item_id, inventory_id) {
		const url = this.inventoryUrl;
	}

	/**
	 * Adds an item to a section.
	 * @param item_id ID of the item to be added to a section
	 * @param section_id ID of the section where the item is to be added
	 * 
	 * @author Sumandang, AJ Ruth H.
	 */
	addItemToSection(item_id, section_id) {
		const url = this.itemUrl;

		let body = {
			method: "addItemToSection",
			item_id,
			section_id
		}

		return this.http.post<any>(url, body)
			.pipe(
				tap(x => console.log("adding item to section: " + x)),
				catchError(this.handleError<any>('addItemToSection'))
			);
	}

	/**
	 * Creates new item in the database
	 * @description Creates new item by adding the received item parameter to the database
	 * @param item item to be added to the database
	 * 
	 * @returns ID of the newly created item; false if error
	 */
	createItem(
		item_type,
		item_part,
		item_name,
		item_photo,
		item_description,
		item_hp,
		item_xp,
		item_armor,
		item_ailment,
		item_cure,
		is_default
	) {
		const url = this.itemUrl;

		let body = {
			method: "createItem",
			item_type,
			item_part,
			item_name,
			item_photo,
			item_description,
			item_hp,
			item_xp,
			item_armor,
			item_ailment,
			item_cure,
			is_default
		};

		console.log(body);
		return this.http.post<Item>(url, body)
			.pipe(
				tap(x => {
					console.log("creating & adding item to section: " + x);
				}),
				catchError(this.handleError<Item>('createItem'))
			);
	}

	/**
	 * Deletes the existing item from the database
	 * @param item_id id of the item to be deleted
	 */
	deleteItem(item_id) {
		const url = this.itemUrl;
	}


	/**
	 * Edits existing item in the database 
	 * @description Edit old information of existing item of id contained in the item parameter with the new item received in the parameter
	 * @param item the item editing the existing item in the database; also contains id to identify which item to edit
	 */
	editItem(item: Item) {
		const url = this.itemUrl;
	}

    /**
   	 * Equip the wearable item and make use of its effects
     * @description Equip the wearable item and make use of its effects and
      * remove them from the inventory (using removeInventoryItem)
      * @param item_id ID of the item to be equipped
   	  * @param item_part Part where the item will be equipped
      * @param inventory_id ID of the inventory where the item was located
      * @param to_equip Determines if an item is to be equipped or unequipped
      *
      * @see removeInventoryItem
      */
	equipItem(item_id, item_part, inventory_id, to_equip) {
		const url = this.inventoryUrl;

		let body = {
			method: "equipItem",
			item_id: item_id,
			item_part: item_part,
			inventory_id: inventory_id,
			to_equip: to_equip
		};

		return this.http.post<any>(this.inventoryUrl, body).pipe(
			tap(() =>
				console.log("Item " + item_id + " is equipped.")),
			catchError(this.handleError<any>('equipItem'))
		);
	}

	getCurrentInventory() {
		return this.currentInventory ? this.currentInventory : new Inventory();
	}

	/**
	 * Gets default statuses/ailments.
	 * Mainly used as options for item effects.
	 * 
	 * @author Sumandang, AJ Ruth H.
	 */
	getDefaultStatuses(): Observable<any[]> {
		const url = this.statusUrl;

		let params = new HttpParams()
			.set('method', "getDefaultStatuses");

		return this.http.get<any[]>(url, {
			params: params
		}).pipe(
			tap(h => {
				const outcome = h ? 'fetched statuses' : 'did not fetched statuses';
				console.log(h);
				console.log(outcome);
			})
		);
	}



	/**
	 * Gets default items.
	 * Mainly used as options for adding new items in a section.
	 */
	getDefaultItems() {

	}

	/**
	 * Returns the item information based on item id
	 * @param item_id id of the item whose information are to be retrieved
	 */
	getItem(item_id) {
		const url = this.itemUrl;
	}

	/**
	 * Gets the teacher's inventory
	 * @param teacher_id id of the teacher whose inventory items are to be retrieved
	 * 
	 * @returns {Item[]} array of items inside a teacher's inventor 
	 */
	getSectionItems(section_id) {

	}

	/**
	 * Gets the user's section inventory
	 * @param user_id id of the user whose section inventory is to be retrieved
	 * @param section_id id of the section where the user inventory is to be retrieved from
	 * 
	 * @returns {Inventory} User's section inventory
	 */
	getUserSectionInventory(user_id, section_id) {
		const url = this.inventoryUrl;

		let params = new HttpParams()
			.set('user_id', user_id)
			.set('section_id', section_id)
			.set('method', 'getUserSectionInventory');

		return this.http.get<any>(url, {
			params: params
		}).pipe(
			tap(inventory => console.log(inventory)),
			catchError(this.handleError(`getSectionBadges`, []))
		);
	}

    /**
	 * @param item_id ID of the item to be removed to the inventory
	 * @param inventory_id ID of the inventory where the item will be removed from
	 */
	removeInventoryItem(item_id, inventory_id) {
		const url = this.inventoryUrl;

		let body = {
			method: "removeItem",
			item_id: item_id,
			inventory_id: inventory_id,
		};

		return this.http.post<any>(this.inventoryUrl, body).pipe(
			tap(() =>
				console.log("Item " + item_id + " is removed from inventory.")),
			catchError(this.handleError<any>('removeItem'))
		);
	}

	setCurrentInventory(inventory: Inventory) {
		this.currentInventory = inventory;
	}

	/**
   * Equip the wearable item and make use of its effects
   * @description Equip the wearable item and remove effects (if applicable) and 
   * add them back to the inventory (using addItem)
   * @param item_id id of the item to be unequipped
   * @param user_id id of the user who equipped the item
   * @param inventory_id id of the inventory where the item will be placed
   * 
   * @see addItem
   */
	unequipItem(item_id, user_id, inventory_id) {
		const url = this.inventoryUrl;
	}

	/**
	 * Use the item and make use of its effects.
	 * @description Use the item and make use of its effects and deletes them from the inventory (using removeInventoryItem)
	 * @param item_id Id of the item to be used
	 * @param user_id Id of the user where the item will be used on
	 * @param inventory_id id of the inventory where the item was located
	 * 
	 * @see removeInventoryItem
	 */
	useItem(item_id, user_id, inventory_id) {
		const url = this.inventoryItemUrl;
	}

	/**
     * Handle Http operation that failed.
     * Let the app continue.
     * @param operation - name of the operation that failed
     * @param result - optional value to return as the observable result
     */
	private handleError<T>(operation = 'operation', result?: T) {
		return (error: any): Observable<T> => {

			// TODO: send the error to remote logging infrastructure
			console.error(error); // log to console instead

			// TODO: better job of transforming error for user consumption
			console.log(`${operation} failed: ${error.message}`);

			// Let the app keep running by returning an empty result.
			return of(result as T);
		};
	}

}
