export class Department {
  'name': string;
  'id': number;

  isObjectValid(obj: any) {
    return obj.hasOwnProperty('department_id') ? true : false;
  }
  generateObject(obj: any) {
    this.id = obj.department_id;
    this.name = obj.department_name;
  }
}
