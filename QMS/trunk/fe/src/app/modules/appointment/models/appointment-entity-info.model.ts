import { SlotInfo } from './slot-info.model';

export class AppointmentEntityInfoModel {
  'appointment_type': string;
  'appointment_type_id': number;
  'date': Date;
  'calDate': Date;
  'end_time': string;
  'start_time': string;
  'time_detail_id': number;
  'total_available_count': number;
  'total_slot_count': number;
  'used_slot_count': number;
  'slot_data': Array<SlotInfo>;
  'isAdvanceBookingDaysCrossed': boolean;
  'isEntityOnHoliday': boolean;
  'advanceBookingDays': number;
  'walkinAllowed': boolean;

  generateObj(obj) {
    this.appointment_type = obj.appointment_type;
    this.appointment_type_id = obj.appointment_type_id;
    this.date = new Date(obj.appt_date);
    this.end_time = obj.slot_time_to_formatted;
    this.start_time = obj.slot_time_from_formatted;
    this.time_detail_id = obj.time_detail_id;
    this.total_available_count = obj.total_available_count;
    this.total_slot_count = obj.total_slot_count;
    this.used_slot_count = +obj.total_slot_count - +obj.total_available_count;
    this.isAdvanceBookingDaysCrossed = obj.IsArpDaysCrossed;
    this.isEntityOnHoliday = obj.is_entity_onholiday;
    this.advanceBookingDays = obj.arpdays;
    this.slot_data = obj.slot_data ? this.generateSlotData(obj.slot_data) : [];
    this.walkinAllowed = obj.walkin_allowed;
  }

  generateSlotData(masterArr): Array<SlotInfo> {
    const temp = [];
    masterArr.forEach(element => {
      const slot = new SlotInfo();
      slot.generateObj(element);
      temp.push({ ...slot });
    });
    return temp;
  }

}

