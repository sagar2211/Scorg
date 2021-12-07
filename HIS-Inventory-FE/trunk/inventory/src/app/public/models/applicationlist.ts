export class Applicationlist {
  'name'?: string;
  'id': number;

  isObjectValid(obj: any) {
    return obj.hasOwnProperty('id') ? true : false;
  }
  generateObject(obj: any) {
    this.id = obj.id;
    this.name = obj.application_name;
  }
}
