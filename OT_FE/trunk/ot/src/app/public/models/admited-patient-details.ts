import { PatientDetails } from './patient-details.model';

export class AdmitedPatientDetails {
    admissionDate: Date;
    patient: any;
    bed_no?: String;
    hospital_location_id?: String;
    IpdId: String;
    ward?: String;
    primary_doc_id?: String;
    bgcolor: String;

    isObjectValid(obj: any) {
        return obj.hasOwnProperty('ipdId') ? obj.hasOwnProperty('admission_date') ?
        obj.hasOwnProperty('primary_doc_id') ? true : false : false : false;
    }

    generateObject(obj: any) {
        this.IpdId = obj.ipdId;
        this.primary_doc_id = obj.primary_doc_id;
        this.admissionDate = obj.admission_date;
        this.hospital_location_id = obj.hospital_location_id;
        this.ward = obj.ward;
        this.bed_no = obj.bed_no;
        this.patient = this.getpatientObj(obj);
        this.bgcolor = this.getRandomColor();
    }

    getpatientObj(obj: any) {
        const patientObj = new PatientDetails();
        patientObj.generateObject(obj);
        return patientObj;
    }

    getRandomColor() {
      const color = Math.floor(0x1000000 * Math.random()).toString(16);
      return '#' + ('000000' + color).slice(-6);
    }
}
