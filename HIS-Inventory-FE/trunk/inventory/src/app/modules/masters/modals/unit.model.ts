export class Unit {
  id: number;
  name: string;

  isObjectValid(obj: any) {
    return (obj.hasOwnProperty('unitId') || obj.hasOwnProperty('id'))
      && (obj.hasOwnProperty('unitName') || obj.hasOwnProperty('name')) ? true : false;
  }

  generateObject(obj: any) {
    this.id = obj.unitId || obj.id;
    this.name = obj.unitName || obj.name;
  }

}
