export class StatusModel {
  statusId: string;
  status: string;

  constructor() { }

  isObjectValid(obj: any) {
    return (obj.hasOwnProperty('status') && obj.status !== '') ? true : false;
  }
  generateObject(obj: any): void {
    obj = obj ? obj : {};

    this.statusId = obj.statusId;
    this.status = obj.status;
  }
}
