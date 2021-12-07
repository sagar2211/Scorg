export class MedicineNameMaster {
    id: Number;
    name: String;
    genricName: String;
    typeId: Number;
    price: Number;


    isObjectValid(obj: any) {
        return obj.hasOwnProperty('id')
            && obj.hasOwnProperty('Name')
            && obj.hasOwnProperty('Price')
            && obj.hasOwnProperty('MedicineTypeID')
            && obj.hasOwnProperty('genric_name') ? true : false;
    }

    generateObject(obj: any) {
        this.id = obj.id;
        this.name = obj.Name;
        this.genricName = obj.genric_name;
        this.typeId = obj.MedicineTypeID;
        this.price = obj.Price;
    }
}
