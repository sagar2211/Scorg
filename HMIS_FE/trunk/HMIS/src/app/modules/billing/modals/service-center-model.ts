export class ServiceCenterModel {
  serviceCenterId: number;
  serviceCenterName: string;
  isDefault: boolean;

  constructor() { }

  isObjectValid(obj: any) {
    return (obj.hasOwnProperty('ScmId') && obj.ScmId !== '') ? true : false;
  }
  generateObject(obj: any): void {
    obj = obj ? obj : {};

    this.serviceCenterId = obj.ScmId;
    this.serviceCenterName = obj.ScmName;
    this.isDefault = (obj.ScmDefault == 'Y') || false;
  }
  setUserServiceCenter(obj: any): void {
    this.serviceCenterId = obj.serviceCenterId;
    this.serviceCenterName = obj.serviceCenterName;
    this.isDefault = false;
  }
}
