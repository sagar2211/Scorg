export class FrontDeskEntityTimeData {
  configId: number;
  departmentId: number;
  departmentName: string;
  entityId: number;
  entityName: string;
  entityValueId: number;
  entityValueName: string;
  isCheckIn: boolean;
  endTime: string;
  startTime: string;
  remainingTime: string;
  appointemntTypeId: number;
  bookedNotConfirmed: number;
  bookedSlotCount: number;
  skippedPatientsCount: number;
  timeDetailId: number;
  totalSlotCount: number;
  walkinPatientsCount: number;
  slotAvailable: number;
  bookedSlots: number;
  defaultTimePerPatient: number;
  // added for Parallel Booking
  parallel_booking_allow: boolean;
  parallel_max_patients: number;
  token_type: string;
  isCheckOut?: string;
  isOnHoliday: boolean;
  isPaused: boolean;
  pausedMin: number;
  pendingActionCount: number;

  generateObject(obj) {
    this.configId = obj.config_id;
    this.departmentId = obj.department_id;
    this.departmentName = obj.department_name;
    this.entityId = obj.entity_id;
    this.entityName = obj.entity_name;
    this.entityValueId = obj.entity_value_id;
    this.entityValueName = obj.entity_value_name;
    this.isCheckIn = obj.is_entity_checkedin;
    this.isCheckOut = obj.is_entity_checkedout;
    this.endTime = obj.end_time;
    this.startTime = obj.start_time;
    this.remainingTime = obj.remaining_time;
    this.appointemntTypeId = obj.appointemnt_type_id;
    this.bookedNotConfirmed = obj.booked_not_confirmed;
    this.bookedSlotCount = obj.booked_slot_count;
    this.skippedPatientsCount = obj.skipped_patients_count;
    this.timeDetailId = obj.time_detail_id;
    this.totalSlotCount = obj.total_slot_count;
    this.walkinPatientsCount = obj.walkin_patients_count;
    this.slotAvailable = obj.available_slots_count;
    this.bookedSlots = obj.booked_not_confirmed + obj.confirmed_slot_count;
    this.defaultTimePerPatient = obj.def_time_per_pat;
    this.parallel_booking_allow = obj.is_allow_booking || false;
    this.parallel_max_patients = obj.max_allow_booking || 0;
    this.token_type = obj.token_type_name || '';
    this.isOnHoliday = obj.is_onholiday;
    this.isPaused = obj.is_opd_paused;
    this.pausedMin = obj.pause_time_in_minutes;
    this.pendingActionCount = obj.pending_action_count;
  }

}

export class FrontDeskDashboardData {
  absentPatientsCount: number;
  allSlotsCount: number;
  entityTimeData: Array<FrontDeskEntityTimeData>;
  occupiedSlotsCount: number;
  occupiedPercentage: string;
  skippedPatientsCount: number;
  walkinPatientsCount: number;
  totalServiceCount: number;
  totalSlotCount: number;
  checkedInCount: number;
  confirmedSlotCount: number;

  generateObject(obj) {
    this.absentPatientsCount = obj.absent_patients_count;
    this.allSlotsCount = obj.all_slots_count;
    this.entityTimeData = obj.entity_time_data ? this.generateTimeData(obj.entity_time_data) : [];
    this.occupiedSlotsCount = obj.occupied_slots_Count;
    this.occupiedPercentage = obj.percentage_of_occupied;
    this.skippedPatientsCount = obj.skipped_patients_count;
    this.walkinPatientsCount = obj.walkin_patients_count;
    this.totalServiceCount = obj.total_service_count;
    this.totalSlotCount = obj.total_slot_count;
    this.checkedInCount = obj.checkedin_count;
    this.confirmedSlotCount = obj.confirmed_slot_count;
  }

  generateTimeData(array): Array<FrontDeskEntityTimeData> {
    const temp = [];
    array.forEach(element => {
      const fd = new FrontDeskEntityTimeData();
      fd.generateObject({ ...element });
      temp.push(fd);
    });
    return temp;
  }

}
