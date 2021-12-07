export class NursingOrder {
  name: string;
  tempId?: number;  // set tempId for created orders
  nursingId: number; // selected nursing id;
  action?: string;
  id?: number;
  status?: string;
  isDirty?: boolean;
  genericFreq: string;
  genericDuration: string;
  startDateTime?: Date;
  isValidObject: boolean;
  invalidObjectMessage: string;
  is_favourite: string;
  use_count: string;
  tempstatus?: string;
  freqStartTime: string;
  FreqSchedule?: string;
  orderDate: Date;
  orderBy: any;
  approvedBy: any;
  isFav: boolean;
  sequence: number;
  key: string;

  constructor() { }

  isObjectValid(obj: any) {
    return this.isValidObject = (obj.hasOwnProperty('name') && obj.name !== '') ? (obj.hasOwnProperty('nursingId') && obj.nursingId !== '') ? true : false : false;
  }

  isObjectIncomplete(obj: any) {
    return (obj.hasOwnProperty('name') && obj.name !== '') ? (obj.hasOwnProperty('nursingId') && obj.nursingId !== '') ?
      (obj.hasOwnProperty('genericFreq') && !obj.genericFreq === null) ? (obj.hasOwnProperty('genericDuration') && !obj.genericDuration === null) ?
        false : true : true : true : true;
  }

  getInvalidObjectMessage() {
    return 'Frequency or Duration may be missing';
  }

  generateObject(obj: any, isFromSuggestion?): void {
    this.name = obj.name;
    this.tempId = obj.tempId;
    this.nursingId = !isFromSuggestion ? obj.nursingId : obj.id;
    this.action = obj.action;
    this.id = !isFromSuggestion ? obj.id : '';
    this.status = obj.status;
    this.isDirty = obj.isDirty;
    this.genericFreq = obj.genericFreq ? obj.genericFreq : 1;
    this.genericDuration = obj.genericDuration ? obj.genericDuration : 1;
    this.startDateTime = obj.startDateTime ? new Date(obj.startDateTime) : new Date();
    this.is_favourite = obj.is_favourite;
    this.use_count = obj.use_count;
    this.invalidObjectMessage = this.isValidObject ? this.getInvalidObjectMessage() : '';
    this.tempstatus = obj.tempstatus || '';
    this.freqStartTime = obj.freqStartTime;
    this.FreqSchedule = obj.FreqSchedule;
    this.orderDate = (obj.order_date) ? new Date(obj.order_date) : new Date();
    this.orderBy = obj.orderBy || null;
    this.approvedBy = obj.approvedBy || null;
    this.isFav = obj.suggestion_flag && obj.suggestion_flag === 'user_fav' ? true : false;
    this.sequence = obj.sequence || null;
    this.key = obj.key || null;
  }

}




