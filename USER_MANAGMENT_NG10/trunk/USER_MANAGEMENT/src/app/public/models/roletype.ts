export class RoleType {
  'name': string;
  'id': number;
  'application_id': number;
  'application_name': string;
  'application_key': string;

  isObjectValid(obj: any) {
    return obj.hasOwnProperty('id') ? true : false ;
  }
  generateObject(obj: any) {
    this.id = obj.id;
    this.name = obj.role_type;
    this.application_id = obj.application_id;
    this.application_name = obj.application_name;
    this.application_key = obj.application_key;
  }
}
