import { SlotInfo } from './slot-info.model';

export class SubTimeSlots {
  timeDetailId: number;
  subDetailId: number;
  subTimeFrom: string;
  subTimeTo: string;
  slots: Array<SlotInfo>;
  appointmentTypeName: string;


  generateObject(obj) {
    this.subDetailId = obj.sub_detail_id;
    this.subTimeFrom = obj.sub_time_from;
    this.timeDetailId = obj.time_detail_id ? obj.time_detail_id : 0;
    this.subTimeTo = obj.sub_time_to;
    this.appointmentTypeName = obj.appointment_type_name ? obj.appointment_type_name : '';
    this.slots = this.generateSlots(obj.slots);
  }

  generateSlots(slots): Array<SlotInfo> {
    const temp = [];
    slots.forEach(element => {
      const slot = new SlotInfo();
      slot.generateObj({ ...element });
      temp.push(slot);
    });
    return temp;
  }
}

export class AppointmentTimeSlots {
  entityAlias: string;
  entityName: string;
  entityValueId: number;
  entityValueName: string;
  tokenType: string;
  totalSlotCount: number;
  usedSlotCount: number;
  morningSlots?: Array<SlotInfo>;
  afterNoon?: Array<SlotInfo>;
  evening?: Array<SlotInfo>;
  subTimeSlots: Array<SubTimeSlots>;
  arpDays: number;
  defaultTimePerPatient?: number;

  generateObject(obj) {
    this.entityAlias = obj.entity_alias;
    this.entityName = obj.entity_name;
    this.entityValueId = obj.entity_value_id;
    this.entityValueName = obj.entity_value_name;
    this.subTimeSlots = this.generateSubTimeSlots(obj.sub_time_slots);
    this.tokenType = obj.token_type;
    this.totalSlotCount = obj.total_slot_count;
    this.usedSlotCount = obj.used_slot_count;
    this.arpDays = obj.arp_days;
    this.defaultTimePerPatient = obj.def_time_per_pat;
  }

  generateSubTimeSlots(subSlots): Array<SubTimeSlots> {
    const temp = [];
    subSlots.forEach(element => {
      const subslot = new SubTimeSlots();
      subslot.generateObject({ ...element });
      temp.push(subslot);
    });
    return temp;
  }

}
