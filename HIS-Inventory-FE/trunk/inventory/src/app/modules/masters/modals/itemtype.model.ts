export class ItemType {
  id: number;
  desc: string;
  isActive: boolean;

  isObjectValid(obj: any) {
    return (obj.hasOwnProperty('itemTypeId') || obj.hasOwnProperty('id'))
      && (obj.hasOwnProperty('itemTypeDesc') || obj.hasOwnProperty('desc')) ? true : false;
  }

  generateObject(obj: any) {
    this.id = obj.itemTypeId || obj.id;
    this.desc = obj.itemTypeDesc || obj.desc;
    this.isActive = obj.isActive || null;
  }

}
