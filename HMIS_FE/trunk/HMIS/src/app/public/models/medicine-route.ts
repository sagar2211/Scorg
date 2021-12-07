export class MedicineRoute {
    id: number;
    name: string;
    short_name: string;

    constructor(id?: number, route?: string) {
        this.id = id;
        this.name = route;
    }

    isObjectValid(obj: any) {
        return obj.hasOwnProperty('id')
            && obj.hasOwnProperty('route') ? true : false;
    }

    generateObject(obj: any) {
        this.id = obj.id;
        this.name = obj.route;
        this.short_name = obj.short_name;
    }
}
