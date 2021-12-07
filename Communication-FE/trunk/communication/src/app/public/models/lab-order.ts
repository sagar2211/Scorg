import { InvestigationMaster } from './investigation-master.model';
import { InvestigationComponentMaster } from './investigation-component-master.model';

export class LabOrders {
  id?: number; // -- order id
  name: string; // -- order name
  labInvestigationObj: InvestigationMaster; // -- lab investigation object
  specimen: string;
  startDateTime?: Date;
  endDateTime?: Date;
  recurring?: string;
  priority?: string;
  action?: string;
  status?: string;
  patientConsentNeeded?: string;
  labInstruction?: string;
  patientInstruction?: string;
  reason?: string;
  isDirty?: boolean;
  tempstatus?: string;
  componentList: InvestigationComponentMaster;
  selectedComponentCount: number;
  isValidObject: boolean;
  invalidObjectMessage: string;
  tempId: number;
  frequency?: string;
  frequencySchedule?: string;
  freqStartTime: string;
  orderDate: Date;
  orderBy: any;
  approvedBy: any;
  sequence: number;
  key: string;

  isObjectValid(obj: any) {
    const isTrue = obj['name'] != '' ? obj['labInvestigationObj'] != '' ? true : false : false;
    const stat = obj.hasOwnProperty('name') ? obj.hasOwnProperty('labInvestigationObj') ? true : false : false;
    this.isValidObject = !!(isTrue && stat);
    return stat;
  }

  generateObject(obj: any): void {
    this.id = this.returnEmptyString(obj.id);
    this.name = this.returnEmptyString(obj.name);
    this.labInvestigationObj = obj.labInvestigationObj;
    this.specimen = this.returnEmptyString(obj.specimen);
    this.startDateTime = obj.startDateTime ? new Date(obj.startDateTime) : new Date();
    this.endDateTime = obj.endDateTime ? new Date(obj.endDateTime) : null;
    this.recurring = obj.recurring;
    this.priority = this.returnEmptyString(obj.priority);
    this.action = this.returnEmptyString(obj.action);
    this.status = this.returnEmptyString(obj.status);
    this.patientConsentNeeded = this.returnEmptyString(obj.patientConsentNeeded);
    this.labInstruction = this.returnEmptyString(obj.labInstruction);
    this.patientInstruction = this.returnEmptyString(obj.patientInstruction);
    this.reason = this.returnEmptyString(obj.reason);
    this.isDirty = obj.isDirty;
    this.tempstatus = this.returnEmptyString(obj.tempstatus);
    this.componentList = obj.componentList || null;
    this.selectedComponentCount = obj.selectedComponentCount || 0;
    this.invalidObjectMessage = !this.isValidObject ? this.getInvalidObjectMessage() : '';
    this.tempId = this.returnEmptyString(obj.tempId);
    this.frequency = obj.frequency || '1';
    this.frequencySchedule = obj.frequencySchedule || '1-0-0';
    this.freqStartTime = obj.freqStartTime || '08:00 AM';
    this.orderDate = (obj.order_date) ? new Date(obj.order_date) : new Date();
    this.orderBy = obj.orderBy || null;
    this.approvedBy = obj.approvedBy || null;
    this.sequence = obj.sequence || null;
    this.key = obj.key || null;
  }

  getInvalidObjectMessage() {
    return 'Name may be missing';
  }

  generateLabInvestigationObj(obj) {
    const labInv = new InvestigationMaster();
    if (labInv.isObjectValid(obj)) {
      labInv.generateObject(obj);
      return labInv;
    } else {
      return null;
    }
  }

  returnEmptyString(value) {
    return value ? value : '';
  }

}
