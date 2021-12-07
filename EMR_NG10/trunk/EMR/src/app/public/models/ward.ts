export class Ward {
  'name': string;
  'id': number;

  isObjectValid(obj: any) {
    return obj.hasOwnProperty('ward_id') ? true : false;
  }
  generateObject(obj: any) {
    this.id = obj.ward_id;
    this.name = obj.ward_name;
  }
}
