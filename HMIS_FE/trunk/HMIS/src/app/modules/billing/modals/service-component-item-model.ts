export class ServiceComponentItemModel {
  tempId: any;
  serviceId: number;
  serviceName: string;
  serviceType: string;
  orderDateTime: Date;

  isSelected: boolean;
  sorcId: number;
  componentId: number;
  componentName: string;
  isDoctorPolicy: boolean;
  componentType: string;

  serviceCenterId: number;
  serviceCenterName: string;
  doctorId: number;
  doctorName: string;
  orderQty: number;

  multiplier: number;
  rate: number;
  netRate: number;
  totalAmount: number;
  remark: string;
  isDefault: boolean;
  isReadOnly: boolean;

  constructor() { }

  isObjectValid(obj: any) {
    return (obj.hasOwnProperty('compId') && obj.compId !== '') ? true : false;
  }
  generateObject(obj: any, serviceObj?: any): void {
    obj = obj ? obj : {};
    serviceObj = serviceObj ? serviceObj : {};

    this.tempId = Math.random();
    this.serviceId = obj.srvId || serviceObj.serviceId;
    this.serviceName = obj.srvName || serviceObj.serviceName;
    this.serviceType = obj.srvServicetype || serviceObj.serviceType;
    this.orderDateTime = obj.srvOrderDateTime ? new Date(obj.srvOrderDateTime) : new Date();

    this.isSelected = true;
    this.sorcId = obj.sorcId || 0;
    this.componentId = obj.compId || null;
    this.componentName = obj.attachedcompName || null;
    this.isDoctorPolicy = obj.isDoctorPolicy == 'Y';
    this.componentType = obj.scomType || 'COMPONENT';

    this.serviceCenterId = obj.serviceCenterId || null;
    this.serviceCenterName = obj.serviceCenterName || 'NA';
    this.doctorId = this.isDoctorPolicy ? (obj.resourceId > 0 ? obj.resourceId : null) : null;
    this.doctorName = this.isDoctorPolicy ? (obj.resourceName || 'Select') : 'NA';
    this.orderQty = obj.sorcQty || 1;
    this.multiplier = obj.multiplier || 1;
    this.rate = obj.compRate || 0;
    this.netRate = (this.rate * this.multiplier);
    this.totalAmount = (this.orderQty || 0) * (this.netRate || 0);
    this.remark = obj.sorc_remark || '';
    this.isDefault = serviceObj.serviceId ? false : true;
    this.isReadOnly = false;
  }
}
