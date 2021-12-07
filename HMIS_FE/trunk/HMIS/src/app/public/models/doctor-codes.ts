export class DoctorCodes {
  // tslint:disable-next-line: ban-types
  'name': String;
  // tslint:disable-next-line: ban-types
  'code': String;

  isObjectValid(obj: any) {
    return obj.hasOwnProperty('code') ? true : false;
  }
  generateObject(obj: any) {
    this.code = obj.code;
    this.name = obj.doctor_name;
  }
}
