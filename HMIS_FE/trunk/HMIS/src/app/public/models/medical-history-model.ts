import { AttachmentsModel } from './attachments-model';

export class MedicalHistoryModel {
  // [dt.col_name]: [this.getColVal(dt.col_name), Validators.pattern('^[0-9\.\,]*$')],
  medicalHistoryNote: string;
  attachmentData: Array<AttachmentsModel>;

  isObjectValid(obj: any) {
    return (obj.hasOwnProperty('medical_history_note')) ? (obj.hasOwnProperty('attachment_data')) ? true : false : false;
  }

  generateObject(obj: any) {
    this.medicalHistoryNote = obj.medical_history_note;
    this.attachmentData = obj.attachment_data;
  }

}
