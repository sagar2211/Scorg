export class Stock {
  itemId : number;
  itemCode: any;
  itemName: any;
  reorderLevelQty: number;
  balanceQty: number;
  isActive: boolean;
  
  isObjectValid(obj: any) {
    return (obj.hasOwnProperty('itemId')) ? true : false;
  }

  generateObject(obj: any) {
    this.itemId = obj.itemId;
    this.itemCode = obj.itemCode;
    this.itemName = obj.itemName;
    this.reorderLevelQty = obj.reorderLevelQty;
    this.balanceQty = obj.balanceQty || null;
    this.isActive = obj.isActive || null;
  }

}
