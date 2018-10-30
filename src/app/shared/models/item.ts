/**
 * A class to represent inventories
 * @class
 *
 * @property item_id identification string of the item
 * @property item_type the type of the item;
 * "W" for wearable & "C" for consummable
 * @property item_name the item's name
 * @property item_photo the item's photo name
 * @property item_description the item's description about what it is and what it does
 * @property item_hp the item's addition or deduction to the user's health points
 * @property item_xp the item's addition or deduction to the user's exp points
 * @property item_ailment the item's ailment effects
 */
export class Item {

    imageDir: string = "/assets/images/";

    private _id: string;
    private item_type: string;
    private item_part: string;
    private item_name: string;
    private item_photo: string;
    private item_description: string;
    private item_hp: string;
    private item_xp: string;
    private item_ailment: string;
    private item_armor: string;
    private item_durability: string;

    constructor(
        item?: any
    ) {
        if(item){
            this._id = item._id;
            this.item_type = item.item_type ? item.item_type : "";
            this.item_part = item.item_part? item.item_part: "";
            this.item_name = item.item_name ? item.item_name : "";
            this.item_photo = item.item_photo ? item.item_photo : "";
            this.item_description = item.item_description ? item.item_description : "";
            this.item_hp = item.item_hp ? item.item_hp : "";
            this.item_xp = item.item_xp ? item.item_xp : "";
            this.item_ailment = item.item_ailment ? item.item_ailment : "";
            this.item_armor = item.item_armor ? item.item_armor : "";
            this.item_durability = item.item_durability ? item.item_durability : "";
        } else {
            this.item_type = "";
            this.item_part = "";
            this.item_name = "";
            this.item_photo = "";
            this.item_description = "";
            this.item_hp = "";
            this.item_xp = "";
            this.item_ailment = "";
            this.item_armor = "";
            this.item_durability = "";
        }
    }
    
    createItem(
        item_type,
        item_part,
        item_name,
        item_photo,
        item_description,
        item_hp,
        item_xp,
        item_ailment,
        item_armor,
        item_durability
        ) {
        this.item_type = item_type;
        this.item_part = item_part;
        this.item_name = item_name;
        this.item_photo = item_photo;
        this.item_description = item_description;
        this.item_hp = item_hp;
        this.item_xp = item_xp;
        this.item_ailment = item_ailment;
        this.item_armor = item_armor;
        this.item_durability = item_durability;
    }

    getItemId() {
        return this._id;
    }

    /**
     * Determines if an item is of equipment or consummable type
     * @param isFullWord (optional) Determines if returned type string is full word or not.
     * @returns the type of the item
     * - for equipment item type, returns "Wearable" if 'isFullWord' is true; "w" if not 
     * - for consummable item type, returns "Consummable" if 'isFullWord' is true; "c" if not 
     */
    getItemType(isFullWord?: boolean) {
        if(isFullWord){
            let itemType = "";
            switch(this.item_type){
                case "w": itemType = "Wearable";
                case "c": itemType = "Consummable";
            }
        } else {
            return this.item_type;
        }
    }

    /**
     * Determines where the item (of type wearable) is to placed.
     * @returns the part where the item can be placed; returns null if item is not of type 'wearable'.
     */
    getItemPart(){
        if(this.item_type == 'w'){
            return this.item_part;
        } else {
            return null;
        }
    }

    getItemName() {
        return this.item_name;
    }

    /**
     * Returns the items's image directory.
     * If the item has no image directory or is empty, the default directory is (imageDir)+"not-found.jpg"
     * @returns the image directory of the item
     * 
     * @author Sumandang, AJ Ruth H.
     */
    getItemPhoto() {
        let image: string = "";

        // if image does not exist or if user has not set an image
        if (!this.item_photo || this.item_photo.length == 0) {
            image = this.imageDir + "not-found.jpg";
        } else {
            image = this.imageDir + this.item_photo;
        }

        return image;
    }

    getItemDescription() {
        return this.item_description;
    }

    getItemHp() {
        return this.item_hp;
    }

    getItemXp() {
        return this.item_xp;
    }

    getItemAilment() {
        return this.item_ailment;
    }

    getItemArmor() {
        return this.item_armor;
    }

    getItemDurability() {
        return this.item_durability;
    }

    getItemStatus() {
        return this.item_durability > "0"? "Okay": "Broken";
    } 

    setItemId(_id) {
        this._id = _id;
    }

    setItemType(item_type) {
        this.item_type = item_type;
    }

    setItemPart(item_part){
        this.item_part = item_part;
    }

    setItemName(item_name) {
        this.item_name = item_name;
    }

    setItemPhoto(item_photo) {
        this.item_photo = item_photo;
    }

    setItemDescription(item_description) {
        this.item_description = item_description;
    }

    setItemHp(item_hp) {
        this.item_hp = item_hp;
    }

    setItemXp(item_xp) {
        this.item_xp = item_xp;
    }

    setItemAilment(item_ailment) {
        this.item_ailment = item_ailment;
    }

    setItemArmor(item_armor) {
        this.item_armor = item_armor;
    }
    setItemDurability(item_durability) {
        this.item_durability = item_durability;
    }
}