import {
    Item
} from "./item";

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
    private user_max_hp: number = 30;
    private user_hp: number;
    private user_armor: number;
    private user_status: string[];
    private items: any[];
    private head: string;
    private footwear: string;
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
            this.user_hp = inventory.user_hp ? inventory.user_hp : 30;
            this.user_armor = inventory.user_armor ? inventory.user_armor : 0;
            // this.user_status = inventory.user_status ? inventory.user_status : [];
            this.user_status = ["5bd794604ee9d9b612cfbcf3","5bd794604ee9d9b612cfbcf3"];
            this.items = inventory.items ? inventory.items : "";
            this.head = inventory.head ? inventory.head : "";
            this.footwear = inventory.footwear ? inventory.footwear : "";
            this.armor = inventory.armor ? inventory.armor : "";
            this.left_hand = inventory.left_hand ? inventory.left_hand : "";
            this.right_hand = inventory.right_hand ? inventory.right_hand : "";
            this.accessory = inventory.accessory ? inventory.accessory : "";
        } else {
            this.user_id = "";
            this.section_id = "";
            this.user_hp = 0;
            this.user_armor = 0;
            this.user_status = [];
            this.user_status = ["5bd794604ee9d9b612cfbcf3"];
            this.items = [];
            this.head = "";
            this.footwear = "";
            this.armor = "";
            this.left_hand = "";
            this.right_hand = "";
            this.accessory = "";
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

    /**
     * Changes the user's total armor based on the received armor increase/reduction.
     * @param armor The number to increase/decrease to the armor.
     * 
     * @author Sumandang, AJ Ruth H.
     */
    changeArmor(armor: number) {
        this.user_armor = this.user_armor + armor;
    }

    /**
     * Changes the user's total armor based on the received armor increase/reduction.
     * Includes error checking such as no negative HP or HP more than maximum
     * @param armor The number to increase/decrease to the armor.
     * 
     * @author Sumandang, AJ Ruth H.
     */
    changeHP(hp) {
        let newHP = (this.user_hp + hp) > this.user_max_hp ? this.user_max_hp : this.user_hp + hp;
        newHP = newHP < 0 ? 0 : newHP;
        this.user_hp = newHP;
    }

    /**
     * Changes the user's status based on the received ailment and/or cure
     * @param cure ID of the ailment to cure
     * @param ailment ID of the ailment to inflict
     * 
     * @author Sumandang, AJ Ruth H.
     */
    changeStatus(cure, ailment) {
        if(cure.length > 0){
            let index = this.user_status.indexOf(ailment);
            if(index >= 0){
                this.user_status.splice(index, 1);
            }
        }

        if(ailment.length > 0 && !this.user_status.find(stat => stat == ailment)){
            this.user_status.push(ailment);
        }
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

    getUserHP() {
        return this.user_hp;
    }

    getUserArmor() {
        return this.user_armor;
    }

    getUserStatus() {
        return this.user_status;
    }

    getItems() {
        return this.items;
    }

    getHead() {
        return this.head;
    }

    getArmor() {
        return this.footwear;
    }

    getFootwear() {
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

    setUserHP(hp) {
        this.user_hp = hp;
    }

    setUserArmor(armor) {
        this.user_armor = armor;
    }

    setUserStatus(status) {
        this.user_status = status;
    }

    setItems(items) {
        this.items = items;
    }

    setHead(head) {
        this.head = head;
    }

    setArmor(footwear) {
        this.footwear = footwear;
    }

    setFootwear(armor) {
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


    useItem(item: Item) {
        this.changeHP(item.getItemHp());
        this.changeStatus(item.getItemCure(), item.getItemAilment());
    }
    /**
     * Determines if the user has equipped an item.
     * @param itemId ID of item to check if it has been equipped
     * @returns true if item is equipped; false if not
     * 
     * @author Sumandang, AJ Ruth H.
     */
    isEquipped(itemId: string): boolean {
        switch (itemId) {
            case this.head:
            case this.armor:
            case this.footwear:
            case this.left_hand:
            case this.right_hand:
            case this.accessory:
                return true;
            default:
                return false;
        }
    }

 

    /**
     * Equip an item on a certain part.
     * @param itemId ID of the item to equipped
     * @param itemPart Part where the item is to be equipped
     * 
     * @author Sumandang, AJ Ruth H.
     */
    equipItem(item_id: string, item_armor, itemPart: string, to_equip: boolean) {
        let armor_change = to_equip ? item_armor : -item_armor;
        this.changeArmor(armor_change);
        let itemId = "";
        if(to_equip) {
            this.removeItem(itemId);
            itemId = item_id;
        }
        switch (itemPart) {
            case "head":
                this.head = itemId;
                break;
            case "armor":
                this.armor = itemId;
                break;
            case "footwear":
                this.footwear = itemId;
                break;
            case "left_hand":
                this.left_hand = itemId;
                break;
            case "right_hand":
                this.right_hand = itemId;
                break;
            case "accessory":
                this.accessory = itemId;
                break;
        }
    }

    /**
     * Removes an item from the list of the user's inventory items.
     * @param itemId ID of the item to be removed.
     * @returns true if the item is completely removed from the inventory (item qty = 0); false if item not found
     * 
     * @author Sumandang, AJ Ruth H.
     */
    removeItem(itemId: string): boolean{
        //AHJ: unimplemented; if user equipped an item
        let index = this.items.findIndex(item => item.item_id == itemId);
        if (index < 0) {
            return false;
        }

        if(--this.items[index].item_quantity == 0){            
            this.items = this.items.splice(index, 1);
            return true;
        } else {
            return false;
        }
    }

    getItemQuantity(itemId: string): number {
        let item = this.items.find(item => item.item_id == itemId);
        return item && item.item_quantity ? item.item_quantity : -1;
    }
}