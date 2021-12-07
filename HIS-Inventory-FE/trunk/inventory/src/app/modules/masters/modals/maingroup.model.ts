export class MainGroup {
  id: number;
  name: string;
  aliasName: string;
  isActive: boolean;

  isObjectValid(obj: any) {
    return (obj.hasOwnProperty('groupId') || obj.hasOwnProperty('id'))
      && (obj.hasOwnProperty('groupDesc') || obj.hasOwnProperty('name')) ? true : false;
  }

  generateObject(obj: any) {
    this.id = obj.groupId || obj.id;
    this.name = obj.groupDesc || obj.name;
    this.aliasName = obj.aliasName || obj.desc;
    this.isActive = obj.isActive || null;
  }

}
