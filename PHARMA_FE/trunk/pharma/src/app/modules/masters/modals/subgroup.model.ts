import { MainGroup } from './maingroup.model';

export class SubGroup {
  mainGroup: MainGroup;
  id: number;
  name: string;
  aliasName: string;
  assetCode: string;
  depreciationPercent: string;
  isActive: boolean;

  isObjectValid(obj: any) {
    return (obj.hasOwnProperty('subGroupId') || obj.hasOwnProperty('id'))
      && (obj.hasOwnProperty('subGroupDesc') || obj.hasOwnProperty('name')) ? true : false;
  }

  generateObject(obj: any) {
    this.mainGroup = obj.groupId ? this.generateMainGrp(obj) : null;
    this.id = obj.subGroupId || obj.id;
    this.name = obj.subGroupDesc || obj.name;
    this.aliasName = obj.aliasName || obj.desc;
    this.assetCode = obj.assetCode || null;
    this.depreciationPercent = obj.depreciationPercent || null;
    this.isActive = obj.isActive || null;
  }

  generateMainGrp(val) {
    const obj = {
      id: val.groupId,
      name: val.groupName,
      aliasName: null,
      isActive: null
    };
    const mg = new MainGroup();
    if (mg.isObjectValid(obj)) {
      mg.generateObject(obj);
    }
    return mg;
  }

}
