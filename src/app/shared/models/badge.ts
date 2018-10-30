/**
 * A class to represent badges
 * @class
 *
 * @property badge_id identification for a badge
 * @property badge_photo photoname for the badge
 * @property badge_description description what the badge is all about
 * @property badge_conditions conditions needed to accomplish in order to obtain this badge
 */
export class Badge {

    imageDir: string = "/assets/images/";

    private _id: string;
    private badge_name: string;
    private badge_photo: string;
    private badge_description: string;
    private badge_conditions: Conditions;
    private is_system_badge: boolean;
    private is_default: boolean;
    private badge_attainers: string[];
    public default_badges: any[] = [
        {
            badge_name: "Rookie Badge",
            badge_description: "Congratulations on your first badge out of the six ranked badges. Get more EXP to gain the other remaining badges!",
            badge_photo: "rookie_badge.png"
        },
        {
            badge_name: "Adept Badge",
            badge_description: "This is the second badge out of the six ranked badges. Get more EXP to gain the other remaining badges.",
            badge_photo: "adept_badge.png"
        },
        {
            badge_name: "Novice Badge",
            badge_description: "This is the third badge out of the six ranked badges. Get more EXP to gain the other remaining badges!",
            badge_photo: "novice_badge.png"
        },
        {
            badge_name: "Intermediate Badge",
            badge_description: "The fourth badge! Two more to gain and you're good to go!",
            badge_photo: "intermediate_badge.png"
        },
        {
            badge_name: "Expert Badge",
            badge_description: "The fifth badge out of six ranked badges. You're almost there!",
            badge_photo: "expert_badge.png"
        },
        {
            badge_name: "Master Badge",
            badge_description: "Rewarded to those loyal and faithful enough to complete their given quest. Congratulations!",
            badge_photo: "master_badge.png"
        }
    ];

    constructor(
        badge?: any
    ) {
        if (badge) {
            this._id = badge._id;
            this.badge_name = badge.badge_name ? badge.badge_name : "";
            this.badge_photo = badge.badge_photo ? badge.badge_photo : "";
            this.badge_description = badge.badge_description ? badge.badge_description : "";
            this.badge_conditions = badge.badge_conditions ? new Conditions(badge.badge_conditions) : new Conditions();
            this.is_system_badge = badge.is_system_badge ? badge.is_system_badge : false;
            this.is_default = badge.is_default ? badge.is_default : false;
            this.badge_attainers = badge.badge_attainers ? badge.badge_attainers : [];
        } else {
            this.badge_name = "";
            this.badge_photo = "";
            this.badge_description = "";
            this.badge_conditions = new Conditions();
            this.is_system_badge = false;
            this.is_default = false;
            this.badge_attainers = [];
        }
    }

    /**
     * Sets the badge properties
     * @param badge_name Name of the badge
     * @param badge_photo Photo url of the badge
     * @param badge_description Badge's description
     * @param badge_conditions Conditions of badge (in Badge model)
     * @param is_system_badge Determines whether the badge is a system badge or a section badge; 
     * true if system badge
     * @param is_system_badge Determines whether the badge is a default badge or a instructor-created badge; true if default
     * @param badge_attainers Array of users who owns this badge
     * 
     * @author Sumandang, AJ Ruth H.
     */
    setBadge(
        badge_name,
        badge_photo,
        badge_description,
        badge_conditions,
        is_system_badge,
        is_default,
        badge_attainers
    ) {
        this.badge_name = badge_name ? badge_name : "";
        this.badge_photo = badge_photo ? badge_photo : "";
        this.badge_description = badge_description ? badge_description : "";
        this.badge_conditions = badge_conditions ? badge_conditions : new Conditions();
        this.is_system_badge = is_system_badge ? is_system_badge : false;
        this.is_default = is_default ? is_default : false;
        this.badge_attainers = badge_attainers ? badge_attainers : [];
    }

    getBadgeId(): string {
        return this._id;
    }

    getBadgeName(): string {
        return this.badge_name;
    }

    /**
     * Returns the badge's image directory.
     * If the badge has no badge photo directory or is empty, the default directory is (imageDir)+"not-found.jpg"
     * @returns the image directory of the badge
     * 
     * @author Sumandang, AJ Ruth H.
     */
    getBadgePhoto(): string {
        let image: string = "";
        // if image does not exist or if user has not set an image
        if (!this.badge_photo || this.badge_photo.length == 0) {
            image = this.imageDir + "not-found.jpg";
        } else {
            image = this.imageDir + this.badge_photo;
        }

        return image;
    }

    getBadgeDescription(): string {
        return this.badge_description;
    }

    getBadgeConditions(): Conditions {
        return this.badge_conditions;
    }

    getisSystem(): boolean {
        return this.is_system_badge;
    }

    getBadgeAttainers(): string[] {
        return this.badge_attainers;
    }

    /**
     * Gets the badge rank from 1 being the lowest rank.
     * Works only if it is a default and rank badge.
     * @returns rank of a badge; returns 0 if not a default rank badge.
     * 
     * @author Sumandang, AJ Ruth H.
     */
    getBadgeRank(): number {
        if (!this.isDefaultBadge()) {
            console.log("not default");
            return 0;
        }
        console.log("orig_badge: " + this.getBadgeName());
        this.default_badges.forEach(badge => {
            console.log(badge.badge_name);
            console.log(badge.badge_name == this.getBadgeName());
            console.log(badge.badge_name == this.badge_name);
        })
        let rank: number = this.default_badges.findIndex(badge => badge.badge_name == this.badge_name);
        return rank + 1;
    }

    /**
     * Determines whether a user is an attainer of this badge
     * @param userId id of the user to be checked whether he/she is an attainer of the badge
     * @returns true if the user is an attainer of the badge; false if not.
     * 
     * @author Sumandang, AJ Ruth H.
     */
    isBadgeAttainer(userId: string): boolean {
        let attainer = this.badge_attainers.find(attainerId => attainerId == userId);
        return attainer ? true : false;
    }

    isDefaultBadge(): boolean {
        return this.is_default;
    }

    setBadgeId(_id: string) {
        this._id = _id;
    }

    setBadgeName(badge_name: string) {
        this.badge_name = badge_name;
    }

    setBadgePhoto(badge_photo: string) {
        this.badge_photo = badge_photo;
    }

    setBadgeDescription(badge_description) {
        this.badge_description = badge_description;
    }

    setBadgeConditions(badge_conditions) {
        this.badge_conditions = badge_conditions;
    }

    setIsSystem(is_system_badge) {
        this.is_system_badge = is_system_badge;
    }

    setBadgeAttainers(badge_attainers) {
        this.badge_attainers = badge_attainers;
    }
}

/**
 * A class to represent badge conditions.
 * @property hp, xp, ailment, log_in_streak,log_in_total, 
 * items, items_used, items_owned, head, footwear, left_hand, armor, right_hand
 */
export class Conditions {
    hp: number;
    xp: number;
    ailment: string;
    log_in_streak: number;
    log_in_total: Date[];
    items: any[];
    items_used: string;
    items_owned: string;
    head: string;
    footwear: string;
    armor: string;
    left_hand: string;
    right_hand: string;

    constructor(
        conditions?: any
    ) {
        if (conditions) {
            this.hp = conditions.hp ? conditions.hp : 0;
            this.xp = conditions.xp ? conditions.xp : 0;
            this.ailment = conditions.ailment ? conditions.ailment : "";
            this.log_in_streak = conditions.log_in_streak ? conditions.log_in_streak : 0;
            this.log_in_total = conditions.log_in_total ? conditions.log_in_total : [];
            this.items = conditions.items ? conditions.items : "";
            this.items_used = conditions.items_used ? conditions.items_used : "";
            this.items_owned = conditions.items_owned ? conditions.items_owned : "";
            this.head = conditions.head ? conditions.head : "";
            this.footwear = conditions.footwear ? conditions.footwear : "";
            this.armor = conditions.armor ? conditions.armor : "";
            this.left_hand = conditions.left_hand ? conditions.left_hand : "";
            this.right_hand = conditions.right_hand ? conditions.right_hand : "";
        } else {
            this.hp = 0;
            this.xp = 0;
            this.ailment = "";
            this.log_in_streak = 0;
            this.log_in_total = [];
            this.items = [];
            this.items_used = "";
            this.items_owned = "";
            this.head = "";
            this.footwear = "";
            this.armor = "";
            this.left_hand = "";
            this.right_hand = "";
        }
    }

    addToLoggedInTotal() {
        let date = new Date(Date.now());
        this.log_in_streak++;
        this.log_in_total.push(date);
    }

    getHp() {
        return this.hp;
    }

    getXp() {
        return this.xp;
    }

    getAilment() {
        return this.ailment;
    }

    getLogInStreak() {
        return this.log_in_streak;
    }

    getLogInTotal() {
        return this.log_in_total;
    }

    getItems() {
        return this.items;
    }

    getItemsUsed() {
        return this.items_used;
    }

    getItemsOwned() {
        return this.items_owned;
    }

    getHead() {
        return this.head;
    }

    getLeftLeg() {
        return this.footwear;
    }

    getRightLeg() {
        return this.armor;
    }

    getLeftArm() {
        return this.left_hand;
    }

    getRightArm() {
        return this.right_hand;
    }

    getJSONObject() {
        let badge: any = {
            hp: this.hp,
            xp: this.xp,
            ailment: this.ailment,
            log_in_streak: this.log_in_streak,
            log_in_total: this.log_in_total,
            items: this.items,
            items_used: this.items_used,
            items_owned: this.items_owned,
            head: this.head,
            footwear: this.footwear,
            armor: this.armor,
            left_hand: this.left_hand,
            right_hand: this.right_hand
        }
        return badge;
    }

    setHp(hp) {
        this.hp = hp;
    }

    setXp(xp) {
        this.xp = xp;
    }

    setAilment(ailment) {
        this.ailment = ailment;
    }

    setLogInstreak(log_in_streak) {
        this.log_in_streak = log_in_streak;
    }

    setLogIntotal(log_in_total) {
        this.log_in_total = log_in_total;
    }

    setItems(items) {
        this.items = items;
    }

    setItemsUsed(items_used) {
        this.items_used = items_used;
    }

    setItemsOwned(items_owned) {
        this.items_owned = items_owned;
    }

    setHead(head) {
        this.head = head;
    }

    setLeftLeg(footwear) {
        this.footwear = footwear;
    }

    setRightLeg(armor) {
        this.armor = armor;
    }

    setLeftArm(left_hand) {
        this.left_hand = left_hand;
    }

    setRightArm(right_hand) {
        this.right_hand = right_hand;
    }


}

