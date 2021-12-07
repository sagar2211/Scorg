export class ScheduleType {
    id: number;
    name: string;
    key: string;

    isObjectValid(obj: any) {
        return obj.hasOwnProperty('token_id')
            && obj.hasOwnProperty('token_name') ? true : false;
    }

    generateObject(obj: any) {
        this.id = obj.token_id;
        this.name = obj.token_name;
        this.key = obj.token_alias;
    }
}
