export class HmisSettingModel {
  id: number;
  question: string;
  tagName: string;
  tagValue: string;
  isPatientRegForm: boolean;

  constructor() { }

  isObjectValid(obj: any) {
    return obj.HsetId ? true : false;
  }
  generateObject(obj: any): void {
    obj = obj ? obj : {};
    this.id = obj.GsetId;
    this.question = obj.HsetQuestion;
    this.tagName = obj.HsetTagname;
    this.tagValue = obj.HsetValue;
    this.isPatientRegForm = obj.HsetIspatientregistrationform;
  }
}
