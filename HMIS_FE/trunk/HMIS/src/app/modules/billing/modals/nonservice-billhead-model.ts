export class NonServiceBillHeadModel {
  nonServiceHeadId: number;
  nonServiceHeadName: string;
  isAdminCharge: boolean;

  constructor() { }

  isObjectValid(obj: any) {
    return obj.id ? true : false;
  }
  generateObject(obj: any): void {
    obj = obj ? obj : {};

    this.nonServiceHeadId = obj.id;
    this.nonServiceHeadName  = obj.name;
    this.isAdminCharge = obj.isAdminCharge == 'Y';
  }
}
