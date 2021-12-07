import * as _ from 'lodash';
export class ReportMenus {
  menuId: number;
  menuName: string;
  menuURL: string;
  menuKey: string;

  generateObj(obj) {
    this.menuId =  obj && obj.menu_id;
    this.menuName = obj && obj.menu_text;
    this.menuURL = obj && obj.menu_url;
    this.menuKey = (obj && obj.menu_text) ? _.camelCase(obj.menu_text) : undefined;
  }
}

export class ReportMenuRoutingDetails {
  linkKey: string;
  name: string;
  isActive: boolean;
  isFavourite: boolean;
  cssClass: string;
  isVisible: boolean;
  permission?: string;
}

export class PrescriptionDetails {
  patientId: string;
  patientName: string;
  prescriptionCount: number;
  itemCount: number;
  prescriptionId: number;
  prescriptionDate: Date;
  doctorName: string;
  visitType: string;
  medicineId: number;
  medicineName: string;
  requiredQty: number;
  issueQty: number;
  saleQty: number;
  frequency: number;
  dose: string;
  doseUnit: string;
  route: string;
  sig: string;
  days: string;
  colorCode : string


  isObjectValid(obj: any) {
    return (obj.hasOwnProperty('patientId')) ? true : false;
  }

  generateObject(obj: any) {
    this.patientId= obj.patientId;
    this.patientName= obj.patientName;
    this.prescriptionCount= obj.prescriptionCount;
    this.itemCount= obj.itemCount;
    this.prescriptionId= obj.prescriptionId;
    this.prescriptionDate= obj.prescriptionDate;
    this.doctorName= obj.doctorName;
    this.visitType= obj.visitType;
    this.medicineId= obj.medicineId;
    this.medicineName= obj.medicineName;
    this.requiredQty= obj.requiredQty;
    this.issueQty= obj.issueQty;
    this.saleQty= obj.saleQty;
    this.frequency= obj.frequency;
    this.dose= obj.dose;
    this.doseUnit= obj.doseUnit;
    this.route= obj.route;
    this.sig= obj.sig;
    this.days= obj.days;
    this.colorCode = obj.colorCode;
  }
}
