import { IMedicineListAllergy } from './iallergy';

export class IallergyListPatient {
    transId: number;
    remark: String;
    name: String;
    type: Number;
    medicine: Number;
    medicineObject: IMedicineListAllergy;

    isObjectValid(obj: any) {
        return obj.hasOwnProperty('remark')
            && obj.hasOwnProperty('name')
            && obj.hasOwnProperty('type')
            && obj.hasOwnProperty('medicine')
            && obj.hasOwnProperty('medicineObject') ? true : false;
    }

    generateObject(obj: any) {
        this.transId = obj.tran_id || obj.transId || 0;
        this.remark = obj.allergyRemark || obj.remark;
        this.name = obj.allergyTypeName || obj.name;
        this.type = obj.allergyType || obj.type;
        this.medicine = obj.medicine;
        this.medicineObject = obj.medicineObject;
    }
}
