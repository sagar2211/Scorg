import { ServiceModel } from './service-master-model';
export class PackageDetailModel {
  packageId: number;
  packageRowId: string;
  detailId: number;
  chargingTypeId: number;
  categoryType: string;
  serviceHeadId: number;
  serviceId: number;
  service: ServiceModel;

  bedTypeId: number;
  qty: number;
  rate: number;
  amount: number;
  derivedAmt: number;
  utilizedQty: number;
  utilizedAmount: number;
  //availQty: number;
  //availAmount: number;
  sequence: number;
  billRowTempId: any;
  //inclusiveId: number;
  billDetailId: number;
  proformaId: number;
  constructor() { }

  isObjectValid(obj: any) {
    return (obj.packageId && obj.packageRowId) ? true : false;
  }
  generateObject(obj: any, billRowTempId: any): void {
    //obj = obj ? obj : {};

    this.packageId = obj.packageId;
    this.packageRowId = obj.packageRowId;
    this.detailId = obj.detailId;
    this.chargingTypeId = obj.chargingTypeId;
    this.categoryType = obj.type;
    this.serviceHeadId = obj.serviceHeadId;
    this.serviceId = obj.serviceId;
    this.bedTypeId = obj.bedTypeId || 0;
    this.qty = obj.qty || 0;
    this.rate = obj.rate || 0;
    this.amount = obj.amount || 0;
    this.derivedAmt = obj.derivedAmt || 0;
    this.utilizedQty = 0;
    this.utilizedAmount = 0;
    this.sequence = this.categoryType == 'SERVICE' ? 1 : (this.categoryType == 'NONSERVICE' ? 2 : 3);
    this.billRowTempId = billRowTempId || 0;
    this.billDetailId = obj.billDetailId;
    this.proformaId = obj.proformaId;
    //this.availQty = obj.availQty || 0;
    //this.availAmount = obj.availAmount || 0;
    //this.inclusiveId = obj.inclusiveId || 0;

    // service model generate object
    const serviceObj = new ServiceModel();
    serviceObj.generateObject(obj.serviceDetail);
    this.service = serviceObj;

  }
}
