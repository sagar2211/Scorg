export class Entity {
    id: number;
    name: string;
    key: string;

    isObjectValid(obj: any) {
        return obj.hasOwnProperty('entity_id')
            && obj.hasOwnProperty('entity_alias')
            && obj.hasOwnProperty('entity_name') ? true : false;
    }

    generateObject(obj: any) {
        this.id = obj.entity_id;
        this.name = obj.entity_name;
        this.key = obj.entity_alias;
    }

}
