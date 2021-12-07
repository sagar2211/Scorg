export class ServiceModel {
  serviceId: number;
  serviceName: string;
  serviceType: string;
  serviceHeadName: string;
  serviceCategoryName: string;
  isGST: boolean;
  gstRate: number;
  status: string;
  isDoctorPolicy: boolean;
  isFullychargeable: boolean;
  isModifyRate: boolean;
  serviceHeadId: number;
  outsidelabcharge: boolean;
  isSpotBill: boolean;
  isAdminCharge: boolean;
  adminChargePercent: number;
  rate: number;

  constructor() { }

  isObjectValid(obj: any) {
    return (obj.hasOwnProperty('srvId') && obj.srvId !== '') ? true : false;
  }
  generateObject(obj: any): void {
    obj = obj ? obj : {};

    this.serviceId = obj.srvId;
    this.serviceName = obj.srvName;
    this.serviceType = obj.srvType;
    this.serviceHeadName = obj.srvHeadName;
    this.serviceCategoryName = obj.srvCategoryName || '';
    this.isGST = obj.srvIsGst == 'Y';
    this.gstRate = obj.srvGstRate;
    this.status = obj.status;
    this.isDoctorPolicy = obj.srvIsdoctorpolicy == 'Y';
    this.isFullychargeable = obj.srvFullychargeable == 'Y';
    this.isModifyRate = obj.srvModifyRate == 'Y';
    this.serviceHeadId = obj.srvServiceHeadId;
    this.outsidelabcharge = obj.SrvOutsidelabcharge == 'Y';
    this.isSpotBill = obj.srvIsSpotBill == 'Y';
    this.isAdminCharge = obj.srvIsAdminCharges == 'Y';
    this.adminChargePercent = obj.srvAdminchargesper || 0;
    this.rate = obj.SrvRate;
  }
}
