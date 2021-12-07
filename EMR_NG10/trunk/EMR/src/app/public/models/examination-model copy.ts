import {ExaminationTags} from './examination-tags';

export class ExaminationModel {
  // [dt.col_name]: [this.getColVal(dt.col_name), Validators.pattern('^[0-9\.\,]*$')],
  displayName: string;
  displayType: string;
  freeText: string;
  suggestionText: string;
  headKey: string;
  status: string;
  tagText: Array<ExaminationTags>;

  isObjectValid(obj: any) {
    return (obj.hasOwnProperty('displayName')) ? (obj.hasOwnProperty('displayType')) ?
      (obj.hasOwnProperty('headKey')) ? (obj.hasOwnProperty('status')) ?
      true : false : false : false : false;
  }

  generateObject(obj: any) {
    this.displayName = obj.displayName;
    this.displayType = obj.displayType;
    this.freeText = obj.freeText;
    this.suggestionText = obj.suggestionText;
    this.headKey = obj.headKey;
    this.status =  obj.status;
    this.tagText = obj.tagText;
  }

}
