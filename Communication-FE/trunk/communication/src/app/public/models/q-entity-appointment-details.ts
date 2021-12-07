export class RoomDetails {
  roomName: string;
  roomId: number;
  mappingMainId: number;
  timeDetailId: number;

  generateObject(obj): void {
    this.roomName = obj.RoomName;
    this.roomId = obj.room_id;
    this.mappingMainId = obj.mapping_main_id;
    this.timeDetailId = obj.time_detail_id;
  }

}

export class QAppointments {
  bookingStatus: string; // "TENTATIVE"
  bookingStatusId: number; // 1
  patName: string; // "RAJESH P KAPOOR"
  patUhid: string; // "20180100044"
  queueId: number; // 0
  tokenNo: string; // "VB-00015-W"
  appointmentId: number;
  skippedCount?: number;
  queueStatus: string;
  queueStatusId: number;
  appointmentType: string;
  patAge: number;
  patDob: any;
  patGender: string;
  patMobileNo?: number;
  appointmentTypeId: number;
  patType: string;
  queueStatusDisplayName: string;
  patTitle: string;
  appointmentTime?: string;
  slotTime?: string;

  // -- new api keys
  slotId: number;
  isBooked: boolean;
  isBlocked: boolean;
  trnSequence: number;
  patTypeId: number;
  patTypeDisplayName: string;
  caterRoomId: string;
  isFollowUp: boolean;
  queueValueId?: number;
  queueTypeId?: number;
  queueType?: string;
  queueName?: string;
  bookingStatusDisplayName?: string;
  addedBy?: string;
  appointmentRemark?: string;
  slotFromTime?: string;
  slotToTime?: string;
  visitTypeId?: number;
  visitTypeName?: string;

  generateObject(obj): void {
    this.bookingStatus = obj.booking_status;
    this.bookingStatusId = obj.booking_status_id;
    this.patName = obj.pat_name;
    this.patUhid = obj.pat_uhid;
    this.queueId = obj.queue_id;
    this.tokenNo = obj.token_no;
    this.appointmentId = obj.appointment_id;
    this.skippedCount = obj.skippedCount;
    this.queueStatus = obj.queue_status;
    this.queueStatusId = obj.queue_status_id;
    this.appointmentType = obj.appointment_type;
    this.patAge = obj.pat_age;
    this.patDob = obj.pat_dob;
    this.patGender = obj.pat_gender;
    this.patMobileNo = obj.pat_mobile_number;
    this.appointmentTypeId = obj.appointment_type_id;
    this.patType = obj.pat_type;
    this.queueStatusDisplayName = obj.queue_status_displayname;
    this.patTitle = obj.pat_title;

    this.slotId = obj.slot_id;
    this.slotTime = obj.slot_time;
    this.isBooked = obj.is_booked;
    this.isBlocked = obj.is_blocked;
    this.trnSequence = obj.trn_sequence;
    this.patTypeId = obj.pat_type_id;
    this.patType = obj.pat_type;
    this.patTypeDisplayName = obj.pat_type_display_name;
    this.caterRoomId = obj.cater_room_id;
    this.skippedCount = obj.skip_count;
    this.isFollowUp = obj.is_followup;
    this.bookingStatusDisplayName = obj.booking_status_display_name;
    this.addedBy = obj.added_by;
    this.appointmentRemark = obj.appointment_remark;
    this.slotFromTime = obj.slot_time_from;
    this.slotToTime = obj.slot_time_to;
    this.visitTypeId = obj.visit_type_id;
    this.visitTypeName = obj.visit_type_name;
  }

}

export class QSlotInfo {
  // appointments: Array<QAppointments>;
  // isBlocked: boolean;
  // isBooked: boolean;
  // slotId: number;
  // slotTime: string;
  // checked?: boolean;
  // roomDetails: Array<RoomDetails>;

  // -- new API modals
  appointmentTypeId: number; // "appointment_type_id": 3,
  roomMappingId: number; // "room_mapping_id": 135,
  timeDetailId: number; // "time_detail_id": 20456,
  roomDetails: Array<RoomDetails>;
  appointments: Array<QAppointments>;
  checked?: boolean;
  startTime: string; //  "09:00:00"
  endTime: string; //  "13:00:00"
  default_time_per_patient: number;


  generateObject(obj): void {
    this.appointments = this.generateAppointments(obj.patientAppointmentSlotDetails);
    this.appointmentTypeId = obj.appointment_type_id;
    this.roomMappingId = obj.room_mapping_id;
    this.timeDetailId = obj.time_detail_id;
    // this.isBlocked = obj.is_blocked;
    // this.isBooked = obj.is_booked;
    // this.slotId = obj.slot_id;
    // this.slotTime = obj.slot_time;
    this.checked = obj.checked;
    this.roomDetails = this.generateRoomDetails(obj.room_details);
    this.startTime = obj.start_time;
    this.endTime = obj.end_time;
    this.default_time_per_patient = obj.default_time_per_patient;

  }

  generateAppointments(array): Array<any> {
    const tmp = [];
    array.forEach(element => {
      const ent = new QAppointments();
      ent.generateObject({ ...element });
      tmp.push(ent);
    });
    return tmp;
  }

  generateRoomDetails(array): Array<any> {
    const tmp = [];
    array.forEach(element => {
      const r = new RoomDetails();
      r.generateObject({ ...element });
      tmp.push(r);
    });
    return tmp;
  }
}

export class QSlotInfoDummy {
  appointments: Array<QAppointments>;
  isBlocked: boolean;
  isBooked: boolean;
  slotId: number;
  slotTime: string;
  checked?: boolean;
  // -- extras
  appointmentId: number;
  appointmentType: string;
  bookingStatus: string;
  bookingStatusId: number;
  patName: string;
  patUhid: string;
  queueId: number;
  queueStatus: string;
  queueStatusId: number;
  skippedCount: number;
  tokenNo: string;
  patAge: any;
  patDob: any;
  patGender: string;
  appointmentTypeId: number;
  roomDetails: Array<RoomDetails>;
  isDisabled?: boolean;
  patType: string;
  queueStatusDisplayName: string;
  patTitle: string;

  trnSequence: number;
  patTypeId: number;
  patTypeDisplayName: string;
  caterRoomId: string;
  roomMappingId: number;
  timeDetailId: number;
  startTime: string;
  endTime: string;
  isFollowUp: boolean;
  bookingStatusDisplayName: string;

  generateObject(obj): void {
    this.appointments = this.generateAppointments(obj.patientAppointmentSlotDetails);
    this.appointmentTypeId = obj.appointment_type_id;
    this.roomMappingId = obj.room_mapping_id;
    this.timeDetailId = obj.time_detail_id;
    this.checked = obj.checked;
    this.roomDetails = this.generateRoomDetails(obj.room_details);
    this.startTime = obj.start_time;
    this.endTime = obj.end_time;
  }

  generateAppointments(array): Array<any> {
    const tmp = [];
    array.forEach(element => {
      const ent = new QAppointments();
      ent.generateObject({ ...element });
      tmp.push(ent);
    });
    return tmp;
  }

  generateRoomDetails(array): Array<any> {
    const tmp = [];
    array.forEach(element => {
      const r = new RoomDetails();
      r.generateObject({ ...element });
      tmp.push(r);
    });
    return tmp;
  }

}

export class QAppointmentDetails {
  configId: number;
  entityAlias: string;
  slotsDetails: Array<QSlotInfo>;
  entityId: number;
  entityTag: string;
  entityValueId: number;
  queueDate: Date;
  entityValueName: string;

  generateObject(obj): void {
    this.configId = obj.config_id;
    this.entityAlias = obj.entity_alias;
    this.slotsDetails = this.generateSlots(obj.entity_details);
    this.entityId = obj.entity_id;
    this.entityTag = obj.entity_tag;
    this.entityValueId = obj.entity_value_id;
    this.queueDate = obj.queue_date;
    this.entityValueName = obj.entity_value_name;
  }

  generateSlots(array): Array<any> {
    const tmp = [];
    array.forEach(element => {
      const ent = new QSlotInfo();
      ent.generateObject({ ...element });
      tmp.push(ent);
    });
    return tmp;
  }
}


