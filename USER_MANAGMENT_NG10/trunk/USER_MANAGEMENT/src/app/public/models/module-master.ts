export class ModuleMasterList {
  'name'?: string;
  'id': number;

  isObjectValid(obj: any) {
    return obj.hasOwnProperty('moduleId') ? true : false;
  }
  generateObject(obj: any) {
    this.id = obj.moduleId;
    this.name = obj.moduleName;
  }
}
