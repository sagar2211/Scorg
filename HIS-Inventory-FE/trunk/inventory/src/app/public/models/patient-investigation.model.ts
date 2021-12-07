import { InvestigationMaster } from './investigation-master.model';

export class PatientInvestigation {
  investigation: InvestigationMaster;
  investigationName: string;
  comment: string;
  date: Date;
  id: number;

  isObjectValid(obj: any) {
    return obj.hasOwnProperty('investigation')
      && obj.hasOwnProperty('comment')
      && obj.hasOwnProperty('date') ? true : false;
  }

  generateObject(obj: any) {
    this.investigation = obj.investigation ? this.generateMaster(obj.investigation) : null;
    this.investigationName = this.investigation ? this.investigation.name : null;
    this.comment = obj.comment;
    this.date = obj.date;
    this.id = obj.id;
  }

  generateMaster(obj) {
    const invMaster = new InvestigationMaster();
    invMaster.generateObject(obj);
    return invMaster;
  }
}
