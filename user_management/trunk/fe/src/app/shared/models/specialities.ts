export class Specialities {
  // tslint:disable-next-line: ban-types
  'name': String;
  // tslint:disable-next-line: ban-types
  'id': String;

  isObjectValid(obj: any) {
    return obj.hasOwnProperty('id') ? true : false ;
  }
  generateObject(obj: any) {
    this.id = obj.id;
    this.name = obj.speciality_name;
  }
}
