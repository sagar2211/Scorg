export class ServiceSurchargeModel {
  id: number;
  serviceId: number;
  charges: number;
  fromTime: any;
  toTime: any;
  surchargeTypeId: number;
  surchargeType: string;

  constructor() { }

  isObjectValid(obj: any) {
    return (obj.hasOwnProperty('ScmId') && obj.ScmId !== '') ? true : false;
  }
  generateObject(obj: any): void {
    obj = obj ? obj : {};

    this.id = obj.id;
    this.serviceId = obj.serviceId;
    this.charges = obj.charges;
    this.fromTime = obj.srsfrm;
    this.toTime = obj.srsto;
    this.surchargeTypeId = obj.type_id;
    this.surchargeType = obj.type_name;
  }
}
