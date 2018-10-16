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
    private badge_attainers: string[];

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
            this.badge_attainers = badge.badge_attainers ? badge.badge_attainers : [];
        } else {
            this.badge_name = "";
            this.badge_photo = "";
            this.badge_description = "";
            this.badge_conditions = new Conditions();
            this.is_system_badge = false;
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
        badge_attainers
    ) {
        this.badge_name = badge_name ? badge_name : "";
        this.badge_photo = badge_photo ? badge_photo : "";
        this.badge_description = badge_description ? badge_description : "";
        this.badge_conditions = badge_conditions ? badge_conditions : new Conditions();
        this.is_system_badge = is_system_badge ? is_system_badge : false;
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
 * items, items_used, items_owned, head, left_leg, left_arm, right_leg, right_arm
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
    left_leg: string;
    right_leg: string;
    left_arm: string;
    right_arm: string;

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
            this.left_leg = conditions.left_leg ? conditions.left_leg : "";
            this.right_leg = conditions.right_leg ? conditions.right_leg : "";
            this.left_arm = conditions.left_arm ? conditions.left_arm : "";
            this.right_arm = conditions.right_arm ? conditions.right_arm : "";
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
            this.left_leg = "";
            this.right_leg = "";
            this.left_arm = "";
            this.right_arm = "";
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
        return this.left_leg;
    }

    getRightLeg() {
        return this.right_leg;
    }

    getLeftArm() {
        return this.left_arm;
    }

    getRightArm() {
        return this.right_arm;
    }

    getJSONObject(){
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
            left_leg: this.left_leg,
            right_leg: this.right_leg,
            left_arm: this.left_arm,
            right_arm: this.right_arm
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

    setLeftLeg(left_leg) {
        this.left_leg = left_leg;
    }

    setRightLeg(right_leg) {
        this.right_leg = right_leg;
    }

    setLeftArm(left_arm) {
        this.left_arm = left_arm;
    }

    setRightArm(right_arm) {
        this.right_arm = right_arm;
    }


}

