export class WeekDays {
    name: string;
    key: string;
    isSelected: boolean;

    isObjectValid(obj: any) {
        return obj.hasOwnProperty('name')
            && obj.hasOwnProperty('key')
            && obj.hasOwnProperty('isSelected') ? true : false;
    }

    generateObject(obj: any) {
        this.name = obj.name;
        this.key = obj.key;
        this.isSelected = obj.isSelected;
    }
}
