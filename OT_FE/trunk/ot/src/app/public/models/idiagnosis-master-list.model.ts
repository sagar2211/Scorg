export class IdiagnosisMasterList {
  id: number;
  name: string;
  description: string;
  isFav: boolean;
  IsActive: boolean;
  isIcd: boolean;
  useCount: number;

  isObjectValid(obj: any) {
    return (obj.hasOwnProperty('id')
      && obj.hasOwnProperty('diagnosis_name')
      && obj.hasOwnProperty('description')
      && obj.hasOwnProperty('is_icd_code')
      && obj.hasOwnProperty('is_active')) ? true : false;
  }

  generateObject(obj: any) {
    this.id = obj.id.toString();
    this.name = obj.diagnosis_name;
    this.isFav = obj.suggestion_flag && obj.suggestion_flag === 'user_fav' ? true : false;
    this.isIcd = obj.is_icd_code;
    // this.useCount = obj.use_count;
    this.description = obj.description;
    this.IsActive = obj.is_active;
  }
}
