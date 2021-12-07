export class DoctorModel {
  doctorId: number;
  doctorName: string;

  constructor() { }

  isObjectValid(obj: any) {
    return (obj.hasOwnProperty('id') && obj.ScmId !== '') ? true : false;
  }
  generateObject(obj: any): void {
    obj = obj ? obj : {};

    this.doctorId = obj.id;
    this.doctorName = obj.name;
  }
}
