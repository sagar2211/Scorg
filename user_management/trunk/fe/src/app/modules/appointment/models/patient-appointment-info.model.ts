export class PatientAppoitmentInfoModel {
  appointmentId: number;
  patientTypeName: string;
  patientTypeDisplayname: string;
  notes: string;
  remarks: string;
  visitTypeId: number;
  Services: [];
  AppointmentTypeName: string;
  slotTimeFrom: string;
  slotTimeTo: string;

  generateObject(obj: any) {
    this.appointmentId = obj.appointment_id;
    this.patientTypeDisplayname = obj.patient_type_displayname;
    this.patientTypeName = obj.patient_type_name;
    this.notes = obj.notes;
    this.remarks = obj.remarks;
    this.visitTypeId = obj.visit_type_id;
    this.Services = obj.Services;
    this.AppointmentTypeName = obj.appointment_type;
    this.slotTimeFrom = obj.slot_time_from;
    this.slotTimeTo = obj.slot_time_to;
  }
}
