import { Patient } from './patient.model';
import { ServiceType } from './service-type.model';

export class IpdPatient {
  patientData: Patient;
  rowId: number;
  srNo: number;
  ipdId: string;
  bed: string;
  admissionDate: Date;
  status: number;
  floor: string;
  ward: string;
  type: string;
  isViewOnlyPat: boolean;
  serviceType: ServiceType;
  dischargeDate: Date;
  dischargeRemark: string;
  deptId: number;
  doctorId: number;
  doctorName: string;

  generateObject(obj): void {
    this.patientData = this.generatePatientObj(obj);
    this.rowId = obj.id;
    this.srNo = obj.srno;
    this.ipdId = obj.admissionRefid;
    this.bed = obj.bed;
    this.admissionDate = new Date(obj.admissionDate);
    this.status = obj.status;
    this.floor = obj.floor;
    this.ward = obj.ward;
    this.type = 'ipd';
    this.isViewOnlyPat = false;
    this.serviceType = this.generateServiceObj(obj);
    this.dischargeDate = obj.dischargeDate;
    this.dischargeRemark = obj.dischargeRemark;
    this.deptId = obj.deptId;
    this.doctorId = obj.doctorId;
    this.doctorName = obj.doctorName;
  }

  generatePatientObj(obj): Patient {
    const patData = new Patient();
    patData.generateObject(obj);
    return patData;
  }

  generateServiceObj(obj): ServiceType {
    const service = new ServiceType();
    service.generateObject(obj);
    return service;
  }
}
