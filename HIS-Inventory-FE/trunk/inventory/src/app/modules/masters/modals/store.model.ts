export class Store {
  id: number;
  name: string;
  isActive: boolean;
  isMainStore: boolean;
  deptId: number;
  deptName: number;
  isObjectValid(obj: any) {
    return (obj.hasOwnProperty('storeId') || obj.hasOwnProperty('id'))
      && (obj.hasOwnProperty('storeName') || obj.hasOwnProperty('name')) ? true : false;
  }

  generateObject(obj: any) {
    this.id = obj.storeId || obj.id;
    this.name = obj.storeName || obj.name;
    this.isActive = obj.isActive;
    this.isMainStore = obj.isMainStore || false;
    this.deptId = obj.deptId || 0;
    this.deptName = obj.deptName || null;
  }

}
