import { Patient } from './patient.model';
import { ServiceType } from './service-type.model';
import * as _ from 'lodash';

export class EncounterPatient {
  patientData: Patient;
  serviceType: ServiceType;
  visitNo: string;
  bed: string;
  admissionDate: Date;
  dischargeDate: Date;
  dischargeRemark: string;
  floor: string;
  ward: string;
  type: string;
  deptId: number;
  doctorId: number;
  doctorName: string;
  isViewOnlyPat: boolean;
  status: string;
  loadFrom?: any;
  dischargeType?: any;
  dischargeReason?: [];
  actualDischargeDate?: any;
  admissionReason: any;
  encounterId: number;
  patientAllergies: any;
  isFollowupPatient: boolean;
  lastActiveUrl: string;
  tentativeDischargeDate: string;
  isPregnancy: any;
  isDelevery: any;
  typeOfDeath: any;
  patientCategory: any;
  generateObject(obj): void {
    this.patientData = this.generatePatientObj(obj);
    //this.rowId = obj.id;
    //this.srNo = obj.srno;
    //this.ipdId = obj.admissionRefid;
    this.visitNo = obj.visitNo;
    this.bed = obj.bed;
    this.admissionDate = new Date(obj.admissionDate);
    this.status = obj.status;
    this.floor = obj.floor;
    this.ward = obj.ward;
    this.type = (obj.service_type || obj.serviceType || '').toLowerCase(); //'ip';
    this.isViewOnlyPat = obj.isViewOnly || obj.is_View_only || false;
    this.serviceType = this.generateServiceObj(obj);
    this.dischargeDate = obj.dischargeDate;
    this.dischargeRemark = obj.dischargeRemark;
    this.deptId = obj.deptId;
    this.doctorId = obj.doctorId;
    this.doctorName = obj.doctorName;
    this.loadFrom = obj.loadFrom;
    this.dischargeType = this.generateDischaregeType(obj);
    this.dischargeReason = _.map(obj.dischargeReason, d => {
      return {
        name: d.dischargeReason,
        id: d.dischargeReasonId
      }
    });
    this.actualDischargeDate = obj.actualDischargeDate || obj.dischargeDate || null;
    this.admissionReason = obj.admissionReason || null;
    this.encounterId = obj.encounterId || null;
    this.patientAllergies = obj.patientAllergies || [];
    this.isFollowupPatient = obj.isFollowupPatient || false;
    this.lastActiveUrl = obj.lastActiveUrl || null;
    this.tentativeDischargeDate = obj.tentativeDischargeDate || null;
    this.isPregnancy = obj.isPregnancy || null;
    this.isDelevery = obj.isDelevery || null;
    this.typeOfDeath = obj.typeOfDeath || null;
    this.patientCategory = obj.patientCategory || null;
  }

  generateDischaregeType(obj) {
    const dt = {
      id: obj.dischargeType && obj.dischargeType.dischargeTypeId ? obj.dischargeType.dischargeTypeId : null,
      name: obj.dischargeType && obj.dischargeType.dischargeType ? obj.dischargeType.dischargeType : null,
      date: obj.dischargeType && obj.dischargeType.deceasedDateTime ? new Date(obj.dischargeType.deceasedDateTime) : null,
    }
    return dt;
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
