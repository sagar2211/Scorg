export class Roles {
  'id': number;
  'name': string;
  'isPrimary': boolean;
  'type_id': number;
  'type_name': string;
  'is_active': boolean;
  'is_used': boolean;
  'is_primary': boolean;
  'role_application_id':number;

  isObjectValid(obj: any) {
    return obj.hasOwnProperty('role_id') ? true : false;
  }
  generateObject(obj: any) {
    this.id = obj.role_id;
    this.name = obj.role_name;
    this.isPrimary = obj.role_is_primary ? obj.role_is_primary : false,
    this.type_id = obj.role_type_id ? obj.role_type_id : '',
    this.type_name = obj.role_type_name ? obj.role_type_name : '',
    this.is_active = obj.is_active ? obj.is_active : false,
    this.is_used = obj.is_used ? obj.is_used : false;
    this.role_application_id = obj.role_application_id;
  }
}
