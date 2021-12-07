export class Doctor {
    id: number;
    specialityId?: number;
    name: string;

    isObjectValid(obj: any) {
        return obj.hasOwnProperty('id')
            && obj.hasOwnProperty('name') ? true : false;
    }

    generateObject(obj: any) {
        this.id = obj.id;
        this.name = obj.name;
        this.specialityId = obj.speciality_id;
    }
}
