
/**
 * A class to represent student EXP
 * @class
 *
 * @property experience_id identification for a badge
 * @property badge_photo photoname for the badge
 * @property badge_description description what the badge is all about
 * @property badge_conditions conditions needed to accomplish in order to obtain this badge
 */
export class Status {
    private status_id: string;
    private status_name: string;
    private status_description: string;
    private status_hp: string;
    private status_armor: string;
    private status_duration: number;

    constructor(
        status?
    ) {
        if (status) {
            this.status_id = status._id;
            this.status_name = status.status_name ? status.status_name : "";
            this.status_description = status.status_description ? status.status_description : "";
            this.status_hp = status.status_hp ? status.status_hp : "";
            this.status_armor = status.status_armor ? status.status_armor : "";
            this.status_duration = status.status_duration ? status.status_duration : 0;
        } else {
            this.status_id = "";
            this.status_name = "";
            this.status_description = "";
            this.status_hp = "";
            this.status_armor = "";
            this.status_duration = 0;
        }
    }

    getStatusId() {
        return this.status_id;
    }

    getStatusName() {
        return this.status_name;
    }

    getStatusDescription() {
        return this.status_description;
    }
}