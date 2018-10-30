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
    private item_cure: string;
    private item_armor: string;
    private item_durability: number;
    private is_default: boolean;

    constructor(
        item?: any
    ) {
        if (item) {
            this._id = item._id? item._id: "";
            this.item_type = item.item_type ? item.item_type : "";
            this.item_part = item.item_part ? item.item_part : "";
            this.item_name = item.item_name ? item.item_name : "";
            this.item_photo = item.item_photo ? item.item_photo : "";
            this.item_description = item.item_description ? item.item_description : "";
            this.item_hp = item.item_hp ? item.item_hp : "";
            this.item_xp = item.item_xp ? item.item_xp : "";
            this.item_ailment = item.item_ailment ? item.item_ailment : "";
            this.item_cure = item.item_cure ? item.item_cure : "";
            this.item_armor = item.item_armor ? item.item_armor : "";
            this.is_default = item.is_default ? item.is_default : false;
        } else {
            this._id = "";            
            this.item_type = "";
            this.item_part = "";
            this.item_name = "";
            this.item_photo = "";
            this.item_description = "";
            this.item_hp = "";
            this.item_xp = "";
            this.item_ailment = "";
            this.item_cure = "";
            this.item_armor = "";
            this.item_durability = 0;
            this.is_default = false;
        }
    }

    createItem(
        item_type,
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

    getItemType(isFullWord?): string{
        if(isFullWord){
            if(this.item_type == "w"){
                return "Wearable";
            } else {
                return "Consummable";
            }
        } else {
            return this.item_type;
        }
    }

    getItemName() {
        return this.item_name;
    }

    getItemPart(){
        return this.item_part;
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

    /**
     * Gets the item's HP increase/decrease.
     * @param isString determines return type of item HP
     * @returns the item's HP increase/decrease
     * - string if isString == true
     * - number if isString is undefined or false
     */
    getItemHp(isString?: boolean) {
        if(isString){
            return this.item_hp;
        } else {
            return Number.parseInt(this.item_hp);
        }
    }

    getItemXp() {
        return this.item_xp;
    }

    getItemAilment() {
        return this.item_ailment;
    }

    getItemCure() {
        return this.item_cure;
    }

    /**
     * Retrieves the item's armor addition/reduction.
     * Type to return depends on the received param
     * @param isString determines the return type of the item's armor
     * 
     * @returns the item's armor
     * - string type if isString is true
     * - number type if isString is false (negative or positive)
     */
    getItemArmor(isString?: boolean) {
        if (isString) {
            return this.item_armor;
        } else {
            if (this.item_armor.length == 0) {
                return 0;
            } else {
                switch (this.item_armor.charAt(0)) {
                    case "+":
                    case "-":
                        return Number.parseInt(this.item_armor);
                    default:
                        return Number.parseInt(this.item_armor);
                }
            }
        }
    }

    getItemDurability() {
        return this.item_durability;
    }

    isDefaultItem() {
        return this.is_default;
    }

    setItemId(_id) {
        this._id = _id;
    }

    setItemType(item_type) {
        this.item_type = item_type;
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

    setItemCure(item_cure) {
        this.item_cure = item_cure;
    }
}