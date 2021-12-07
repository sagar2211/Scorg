export class MedicineLanguageMaster {
    id: Number;
    name: String;

    isObjectValid(obj: any) {
        return obj.hasOwnProperty('id')
            && obj.hasOwnProperty('name') ? true : false;
    }

    generateObject(obj: any) {
        this.id = obj.id;
        this.name = obj.name;
    }
}
