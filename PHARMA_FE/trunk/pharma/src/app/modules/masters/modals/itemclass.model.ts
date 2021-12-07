export class ItemClass {
  id: number;
  name: string;
  isActive: boolean;

  isObjectValid(obj: any) {
    return (obj.hasOwnProperty('classId') || obj.hasOwnProperty('id'))
      && (obj.hasOwnProperty('className') || obj.hasOwnProperty('name')) ? true : false;
  }

  generateObject(obj: any) {
    this.id = obj.classId || obj.id;
    this.name = obj.className || obj.name;
    this.isActive = obj.isActive || null;
  }

}
