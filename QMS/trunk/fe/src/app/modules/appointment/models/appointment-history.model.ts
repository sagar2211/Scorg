import * as moment from 'moment';

export class HistoryEntity {
  entityValueId: number;
  entityValueName: string;
  entitySpecialityId: number;
  entitySpecialityName: string;

  generateObject(obj) {
    this.entityValueId = obj.entity_value_id;
    this.entityValueName = obj.entity_value_name;
    this.entitySpecialityId = obj.SpecialityId;
    this.entitySpecialityName = obj.speciality_name;
  }
}

export class AppointmentHistory {
  appointmentId: number;
  appointmentDate: Date;
  appointmentTime: string;
  entityName: string;
  appointmentStatusId: number;
  appointmentStatus: string;
  appointmentDisplayStatus: string;
  entityValue: Array<HistoryEntity>;
  entityId: number;
  queueStatus: string;
  queueStatusId: string;
  slotId: number;
  default_time_per_patient: number;
  tokenNo: string;
  appointmentTypeName: string;
  appointmentFromTime: string;
  appointmentToTime: string;
  visitTypeId?: number;
  visitTypeName?: string;

  generateObject(obj) {
    this.appointmentId = obj.Appt_Id;
    this.appointmentDate = moment(obj.Appointment_Date || obj.appointmentDate, 'DD/MM/YYYY').toDate();
    this.appointmentTime = obj.Appointment_Time || obj.appointmentTime;
    this.entityName = obj.Entity_Name || obj.entityName;
    this.appointmentStatusId = obj.appt_status_id;
    this.appointmentStatus = obj.appt_status || obj.appointmentStatus;
    this.entityValue = this.generateEntities(obj.Entity_Value || obj.entityValue);
    this.appointmentDisplayStatus = obj.appt_displaystatus || obj.appointmentDisplayStatus;
    this.entityId = obj.Entity_Id;
    this.queueStatus = obj.queue_status;
    this.queueStatusId = obj.queue_status_id;
    this.slotId = obj.slot_id;
    this.default_time_per_patient = obj.default_time_per_patient;
    this.tokenNo = obj.token_no;
    this.visitTypeId = obj.visit_type_id;
    this.visitTypeName = obj.visit_type_name;
    this.appointmentTypeName = obj.appt_type_name;
    this.appointmentFromTime = obj.appt_from_time;
    this.appointmentToTime = obj.appt_to_time;
  }

  generateEntities(array) {
    const temp = [];
    array.forEach(element => {
      const entity = new HistoryEntity();
      entity.generateObject({ ...element });
      temp.push(entity);
    });
    return temp;
  }
}
