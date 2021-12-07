import { PatientDetails } from './patient-details.model';

export class AppointmentPatientDetails {
  reference_id: String;
  reference_creation_date: Date;
  ref_id: String;
  admissionDate: Date;
  last_opd_date: Date;
  patient: any;

  isObjectValid(obj: any) {
    return obj.hasOwnProperty('id') ? obj.hasOwnProperty('patient_name') ?
      obj.hasOwnProperty('hospital_pat_id') ? true : false : false : false;
  }

  generateObject(obj: any) {
    this.reference_id = obj.reference_id;
    this.reference_creation_date = obj.reference_creation_date;
    this.ref_id = obj.ref_id;
    this.admissionDate = obj.admissionDate;
    this.last_opd_date = obj.last_opd_date;
    this.patient = this.getpatientObj(obj);
  }

  getpatientObj(obj: any) {
    const patientObj = new PatientDetails();
    patientObj.generateObject(obj);
    return patientObj;
  }
}
