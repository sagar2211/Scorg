export class RadiologyOrder {
  id?: number; // -- order id
  name: string; // -- order name
  startDateTime?: Date;
  endDateTime?: Date;
  recurring?: string;
  priority?: string;
  action?: string;
  status?: string;
  reason?: string;
  signSymptoms?: string;
  patientConsentNeeded?: string;
  clinicalInfo?: string;
  radiologyInstruction?: string;
  patientInstruction?: string;
  isDirty: boolean;
  tempId?: number;  // set tempId for created orders
  tempstatus?: string;
  isValidObject?: boolean;
  radioInvestigationObj: any;
  invalidObjectMessage?: string; // -- main investigation object
  frequency: string;
  frequencySchedule: string;
  freqStartTime: string;
  orderDate: Date;
  orderBy: any;
  approvedBy: any;
  sequence: number;
  key: string;
  requisition?: string;

  isObjectValid(obj: any) {
    const isTrue = obj['name'] != '' ? obj['radioInvestigationObj'] != '' ? true : false : false;
    const stat = obj.hasOwnProperty('name') ? obj.hasOwnProperty('radioInvestigationObj') ? true : false : false;
    this.isValidObject = !!(isTrue && stat);
    return stat;
  }

  generateObject(obj) {
    this.id = obj.id || '';
    this.name = obj.name;
    this.radioInvestigationObj = obj.radioInvestigationObj;
    this.startDateTime = obj.startDateTime ? new Date(obj.startDateTime) : new Date();
    this.endDateTime = obj.startDateTime ? new Date(obj.endDateTime) : null;
    this.recurring = (obj.recurring) ? obj.recurring : '';
    this.priority = obj.priority;
    this.action = (obj.action) ? obj.action : '';
    this.status = obj.status;
    this.reason = (obj.reason) ? obj.reason : '';
    this.signSymptoms = (obj.signSymptoms) ? obj.signSymptoms : '';
    this.patientConsentNeeded = (obj.patientConsentNeeded) ? obj.patientConsentNeeded : 'no';
    this.clinicalInfo = (obj.clinicalInfo) ? obj.clinicalInfo : '';
    this.radiologyInstruction = (obj.radiologyInstruction) ? obj.radiologyInstruction : '';
    this.patientInstruction = (obj.patientInstruction) ? obj.patientInstruction : '';
    this.isDirty = obj.isDirty;
    this.tempId = obj.tempId;
    this.tempstatus = obj.tempstatus || '';
    this.invalidObjectMessage = !this.isValidObject ? this.getInvalidObjectMessage() : '';
    this.frequency = obj.frequency || 1;
    this.frequencySchedule = obj.frequencySchedule || '1-0-0';
    this.freqStartTime = obj.freqStartTime || '08:00 AM';
    this.orderDate = (obj.order_date) ? new Date(obj.order_date) : new Date();
    this.orderBy = obj.orderBy || null;
    this.approvedBy = obj.approvedBy || null;
    this.sequence = obj.sequence || null;
    this.key = obj.key || null;
    this.requisition = obj.requisition || null;
  }

  getInvalidObjectMessage() {
    return 'Name may be missing';
  }

}
