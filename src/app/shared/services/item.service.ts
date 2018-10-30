//Core Imports
import {
	Injectable
} from '@angular/core';

import {
	Item
} from 'shared/models';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { tap, catchError } from 'rxjs/operators';

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
	 * Creates new item in the database
	 * @description Creates new item by adding the received item parameter to the database
	 * @param item item to be added to the database
	 */
	createItem(item: Item) {
		const url = this.itemUrl;
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
	getTeacherInventoryItems(teacher_id) {

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
	 * Removes item from the inventory.
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
	 * @param operation name of the operation that failed
	 * @param result optional value to return as the observable result
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
