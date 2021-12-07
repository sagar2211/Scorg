export class IAllergyTypes {
  id: Number;
  name: String;

  isObjectValid(obj: any) {
    return obj.hasOwnProperty('AllergyTypeId')
      && obj.hasOwnProperty('AllergyTypeName') ? true : false;
  }

  generateObject(obj: any) {
    this.id = obj.AllergyTypeId.toString();
    this.name = obj.AllergyTypeName;
  }
}

export class IMedicineListAllergy {
  id: Number;
  name: String;

  isObjectValid(obj: any) {
    return obj.hasOwnProperty('id')
      && obj.hasOwnProperty('name') ? true : false;
  }

  generateObject(obj: any) {
    this.id = obj.id.toString();
    this.name = obj.name;
  }
}


