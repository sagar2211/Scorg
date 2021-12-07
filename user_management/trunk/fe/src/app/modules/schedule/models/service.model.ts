
import * as _ from 'lodash';

export class Service {
  id: number;
  name: string;
  timeSlot: number;
  maxNum: number;
  caterTime?: number;
  formId?: number;
  serviceMaxPatient: number;
  serviceBookedCount: number;

  isObjectValid(obj: any) {
    return (obj.hasOwnProperty('service_id') || obj.hasOwnProperty('id'))
      && (obj.hasOwnProperty('cater_time') || obj.hasOwnProperty('timeSlot'))
      && (obj.hasOwnProperty('service_name') || obj.hasOwnProperty('name')) ? true : false;
  }

  generateObject(obj: any) {
    this.id = obj.service_id || obj.id;
    this.name = obj.service_name || obj.name;
    this.timeSlot = obj.cater_time || obj.timeSlot;
    this.maxNum = obj.maxNum || null;
    this.caterTime = obj.cater_time || obj.service_duration || null;
    this.formId = obj.formId || null;
    this.serviceMaxPatient = obj.service_max_no_of_patient;
    this.serviceBookedCount =  obj.service_booked_count;
  }
}
