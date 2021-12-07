import { ItemType } from './itemtype.model';
import { MainGroup } from './maingroup.model';
import { SubGroup } from './subgroup.model';
import { Manufacturer } from './manufacturer.model';
import { ItemClass } from './itemclass.model';
import { Unit } from './unit.model';

export class ItemMaster {
  id: number;
  code: string;
  description: string;
  itemType: ItemType;
  genericDescription: string;
  conversionFactor: number;
  saleQty: number;
  reorderLevel: number;
  vatPurchaseRate: number;
  manufacturer: Manufacturer;
  class: ItemClass;
  mainGroup: MainGroup;
  subGroup: SubGroup;
  unitPurchase: Unit;
  unitIssue: Unit;
  brandName: string;
  hsnSacCode: string;
  stockOnBatch: boolean;
  issueOnBatch: boolean;
  isSelleable: boolean;
  expiryApplicable: boolean;
  isAsset: boolean;
  isActive: boolean;

  isObjectValid(obj: any) {
    return (obj.hasOwnProperty('itemId') || obj.hasOwnProperty('id'))
      && (obj.hasOwnProperty('itemCode') || obj.hasOwnProperty('code')) ? true : false;
  }

  generateObject(obj: any) {
    this.id = obj.itemId || obj.id;
    this.code = obj.itemCode || obj.code;
    this.description = obj.description || obj.itemDescription;
    this.itemType = obj.itemTypeId ? this.generateItemTypeObject(obj) : null;
    this.conversionFactor = obj.conversionFactor || null;
    this.saleQty = obj.saleQty || null;
    this.reorderLevel = obj.reorderLevel || null;
    this.vatPurchaseRate = obj.vatPurchaseRate || null;
    this.manufacturer = obj.manufactureId ? this.generateManufactureObject(obj) : null;
    this.class = obj.itemClassId ? this.generateClassObject(obj) : null;
    this.mainGroup = this.generateMainGroupObject(obj);
    this.subGroup = this.generateSubGroupObject(obj);
    this.unitPurchase = (obj.unitId || obj.purchaseUnitId) ? this.generateUnitObject(obj, 'purchase') : null;
    this.unitIssue = obj.issueUnitId ? this.generateUnitObject(obj, 'issue') : null;
    this.brandName = obj.brandName || null;
    this.hsnSacCode = obj.hsnSacCode || null;
    this.stockOnBatch = obj.stockOnBatch || null;
    this.issueOnBatch = obj.issueOnBatch || null;
    this.isSelleable = obj.isSelleable || null;
    this.expiryApplicable = obj.expiryApplicable || null;
    this.isAsset = obj.isAsset || null;
    this.isActive = obj.isActive || null;
  }

  generateItemTypeObject(val) {
    const obj = {
      id: val.itemTypeId,
      desc: val.itemTypeDesc,
      isActive: true
    };
    const mg = new ItemType();
    if (mg.isObjectValid(obj)) {
      mg.generateObject(obj);
    }
    return mg;
  }

  generateUnitObject(val, type?) {
    let obj = {};
    if (type === 'purchase') {
      obj = {
        id: val.unitId ? val.unitId : val.purchaseUnitId,
        name: val.unitName ? val.unitName : val.purchaseUnitName,
      };
    } else {
      obj = {
        id: val.issueUnitId,
        name: val.issueUnitName,
      };
    }
    const mg = new Unit();
    if (mg.isObjectValid(obj)) {
      mg.generateObject(obj);
    }
    return mg;
  }

  generateManufactureObject(val) {
    const obj = {
      id: val.manufactureId,
      name: val.manufacturerName,
      shortName: null,
      isActive: true
    };
    const mg = new Manufacturer();
    if (mg.isObjectValid(obj)) {
      mg.generateObject(obj);
    }
    return mg;
  }


  generateClassObject(val) {
    const obj = {
      id: val.itemClassId,
      name: val.className,
      isActive: true
    };
    const mg = new ItemClass();
    if (mg.isObjectValid(obj)) {
      mg.generateObject(obj);
    }
    return mg;
  }

  generateMainGroupObject(val) {
    const obj = {
      id: val.primaryGroupId,
      name: val.priGroupDesc,
      aliasName: null,
      isActive: true
    };
    const mg = new MainGroup();
    if (mg.isObjectValid(obj)) {
      mg.generateObject(obj);
    }
    return mg;
  }

  generateSubGroupObject(val) {
    const obj = {
      mainGroup: this.generateMainGroupObject(val),
      id: val.subgroupId,
      name: val.subGroupDesc,
      aliasName: null,
      assetCode: null,
      depreciationPercent: null,
      isActive: true
    };
    const mg = new SubGroup();
    if (mg.isObjectValid(obj)) {
      mg.generateObject(obj);
    }
    return mg;
  }

}
