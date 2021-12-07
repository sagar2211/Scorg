export class IMedicineTypes {
  id: number;
  shortName?: string;
  name: string;
  doseUnit?: string;
  doseUnitObj?: {
    dose_unit: string
    id: string
  };
  isObjGenerated: boolean; // -- check if already data is generated

  constructor(id?: number, shortName?: string, name?: string, doseUnit?: string, doseUnitObj?: any) {
    this.id = id;
    this.name = name || '';
  }

  isObjectValid(obj: any) {
    if (!obj) { return false; }
    this.isObjGenerated = this.isModelKeysAreExist(obj);
    return obj.hasOwnProperty('id') && obj.hasOwnProperty('ShortName') && obj.hasOwnProperty('Name') ? true : false;
  }

  generateObject(obj: any) {
    this.id = obj.id;
    this.name = obj.type || obj.name || '';
  }

  isModelKeysAreExist(obj): boolean {
    for (const o in obj) {
      if (!(new IMedicineTypes()).hasOwnProperty(o) && !(o == 'isObjGenerated')) { return false; }
    }
    return true;
  }
}

// MedicineTypeID: "3"
// Name: "CAPSULE"
// ShortName: "CAP"
// creation_date: null
// dose_unit: "capsules"
// id: "3"
// is_deleted: null
// last_updation_date: null
// name: "CAPSULE"


