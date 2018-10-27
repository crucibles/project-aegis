/**
 * A class to represent inventories
 *
 * @property user_id identification of the user owning the inventory
 * @property section_id id of the section where the user inventory belongs to
 * @property items[] array of item ids stored in this inventory
 */
export class Inventory {
    private _id: string;
    private user_id: string;
    private section_id: string;
    private items: string[];
    private head: string;
    private footware: string;
    private armor: string;
    private left_hand: string;
    private right_hand: string;
    private accessory: string;

    constructor(
        inventory?: any
    ) {
        if (inventory) {
            this._id = inventory._id ? inventory._id : "";
            this.user_id = inventory.user_id ? inventory.user_id : "";
            this.section_id = inventory.section_id ? inventory.section_id : "";
            this.items = inventory.items ? inventory.items : "";
            this.head = inventory.head? inventory.head: "";
            this.footware = inventory.footware? inventory.footware: "";
            this.armor = inventory.armor? inventory.armor: "";
            this.left_hand = inventory.left_hand? inventory.left_hand: "";
            this.right_hand = inventory.right_hand? inventory.right_hand: "";
            this.accessory = inventory.accessory? inventory.accessory: "";
        } else {
            this.user_id = "";
            this.section_id = "";
            this.items = [];
        }
    }

    setInventory(
        user_id,
        section_id,
        items,
    ) {
        this.user_id = user_id;
        this.section_id = section_id;
        this.items = items;
    }

    getInventoryId() {
        return this._id;
    }

    getUserId() {
        return this.user_id;
    }

    getSectionId() {
        return this.section_id;
    }

    getItems() {
        return this.items;
    }

    getHead() {
        return this.head;
    }

    getLeftLeg() {
        return this.footware;
    }

    getRightLeg() {
        return this.armor;
    }

    getLeftHand() {
        return this.left_hand;
    }

    getRightHand() {
        return this.right_hand;
    }

    getAccessory() {
        return this.accessory;
    }

    setInventoryId(_id) {
        this._id = _id;
    }

    setUserId(user_id) {
        this.user_id = user_id;
    }

    setSectionId(section_id) {
        this.section_id = section_id;
    }

    setItems(items) {
        this.items = items;
    }

    setHead(head) {
        this.head = head;
    }

    setLeftLeg(footware) {
        this.footware = footware;
    }

    setRightLeg(armor) {
        this.armor = armor;
    }

    setLeftHand(left_hand) {
        this.left_hand = left_hand;
    }

    setRightHand(right_hand) {
        this.right_hand = right_hand;
    }

    setAccessory(accessory) {
        this.accessory = accessory;
    }
}