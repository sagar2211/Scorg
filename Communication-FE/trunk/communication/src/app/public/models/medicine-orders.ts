import { Medicine } from './medicine';

export class MedicineOrders {
  id?: number; // -- order id
  tempId?: number; // set tempId for order
  medicineObj: Medicine;
  priority: string;
  action?: string;
  status: string;
  isDirty?: boolean;
  isValidObject: boolean;
  tempstatus?: string;
  invalidObjectMessage?: string;
  isObjGenerated?: boolean;
  freqStartTime: string;
  orderDate: Date;
  orderBy: any;
  approvedBy: any;
  sequence: number;
  key: string;


  constructor(
    id?: number,
    tempId?: number,
    medicineObj?: Medicine,
    priority?: string,
    action?: string,
    status?: string,
    isDirty?: boolean,
    isValidObject?: boolean,
    tempstatus?: string,
    invalidObjectMessage?: string,
    orderDate?: Date, orderBy?: any,
    approvedBy?: any,
    sequence?: number,
    key?: string
  ) {
    this.id = id;
    this.tempId = tempId;
    this.medicineObj = medicineObj;
    this.priority = priority;
    this.action = action;
    this.status = status;
    this.isDirty = isDirty;
    this.isValidObject = isValidObject;
    this.tempstatus = tempstatus;
    this.invalidObjectMessage = invalidObjectMessage;
    this.orderDate = orderDate;
    this.orderBy = orderBy;
    this.approvedBy = approvedBy;
    this.sequence = sequence || null;
    this.key = key || null;
  }

  isObjectValid(obj: any) {
    this.isObjGenerated = this.isModelKeysAreExist(obj);
    return this.isValidObject = (obj.hasOwnProperty('medicineObj') && obj['medicineObj'] !== '') ? true : false;
  }

  generateObject(obj: any, isAlreadyObjGenerated?): any {
    if (isAlreadyObjGenerated) {
      return new MedicineOrders(obj.id, obj.tempId, obj.medicineObj, obj.priority, obj.action, obj.status, obj.isDirty,
        obj.isValidObject, obj.tempstatus, obj.invalidObjectMessage, obj.order_date, obj.order_by, obj.approved_by);
    }
    this.id = obj.id;
    this.tempId = this.retunrstringObj(obj.tempId);
    this.medicineObj = this.returnMedicineObj(obj.medicineObj);
    this.priority = this.retunrstringObj(obj.priority);
    this.action = this.retunrstringObj(obj.action);
    this.status = this.retunrstringObj(obj.status);
    this.isDirty = obj.isDirty;
    this.invalidObjectMessage = (!this.isValidObject && !this.medicineObj.isValid) ? this.getInvalidObjectMessage() : '';
    this.tempstatus = obj.tempstatus || '';
    this.freqStartTime = obj.freqStartTime;
    this.orderDate = (obj.order_date) ? new Date(obj.order_date) : new Date();
    this.orderBy = obj.orderBy || null;
    this.approvedBy = obj.approvedBy || null;
    this.sequence = obj.sequence || null;
    this.key = obj.key || null;
  }

  retunrstringObj(item): any {
    return item === undefined ? '' : item;
  }

  getInvalidObjectMessage(): string {
    return 'Type, Name, Frequency or Duration may be missing';
  }

  returnMedicineObj(obj): Medicine {
    const medicine = new Medicine();
    if (medicine.isObjectValid(obj) || medicine.isObjGenerated) {
      if (medicine.isObjGenerated) {
        obj['startDate'] = new Date(obj.startDate);
        obj['isValid'] = medicine.isValid;
        return obj;
      }
      medicine.generateObject(obj);
      return medicine;
    }
    return null;
  }

  isModelKeysAreExist(obj): boolean {
    for (const o in obj) {
      if (!(new MedicineOrders()).hasOwnProperty(o) && !(o === 'isObjGenerated')) { return false; }
    }
    return true;
  }

}
