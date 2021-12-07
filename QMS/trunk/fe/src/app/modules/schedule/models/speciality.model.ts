export class Speciality {

  id: number;
  name: string;

  isObjectValid(obj: any) {
    return obj.hasOwnProperty('id')
      && obj.hasOwnProperty('name')
      || obj.hasOwnProperty('speciality_name') ? true : false;
  }

  generateObject(obj: any) {
    this.id = +obj.id;
    this.name = obj.name || obj.speciality_name;
  }
}
