import * as _ from 'lodash';
export class SlotInfo {
  slotId: number;
  isBooked: boolean;
  isBlocked: boolean;
  isOnHoliday: boolean;
  slotTime: string;
  appointmentStatus?: string;
  appointmentDisplayStatus?: string;
  timePassed?: boolean;
  tokenNo?: string;
  slotTimeInFormat: string;
  slotFromTime: string;
  slotToTime: string;

  generateObj(obj) {
      this.slotId =  obj && obj.appt_slot_id || obj && obj.time_slot_id || obj && obj.slot_id;
      this.isBooked = obj && !_.isUndefined(obj.appt_booked) ? obj.appt_booked : obj && !_.isUndefined(obj.is_booked) ? obj.is_booked : false;
      this.isBlocked = obj && !_.isUndefined(obj.appt_blocked) ? obj.appt_blocked : obj && !_.isUndefined(obj.is_blocked) ? obj.is_blocked : false;
      this.isOnHoliday = obj && !_.isUndefined(obj.appt_is_onholiday) ? obj.appt_is_onholiday : obj && !_.isUndefined(obj.is_onholiday) ? obj.is_onholiday : false;
      this.slotTime = obj.appt_time || obj.time || obj.slot_time;
      this.tokenNo = obj.tokenNo;
      this.slotTimeInFormat = '';
      this.slotFromTime = obj && obj.slot_time_from;
      this.slotToTime = obj && obj.slot_time_to;
  }
}
