export class InvestigationMaster {
  id: number;
  name: string;
  label?: string;
  headId: number;
  comment?: string;
  type?: string;
  isFav: boolean;

  isObjectValid(obj: any) {
    return obj.hasOwnProperty('id') && obj.hasOwnProperty('label')
      && (obj.hasOwnProperty('investigation_head_id'))
      && (obj.hasOwnProperty('default_comment')) ? true : false;
  }

  generateObject(obj: any) {
    this.id = obj.id;
    this.name = obj.label || obj.name;
    this.label = obj.label || null;
    this.headId = obj.investigation_head_id || obj.InvestigationHeadID || obj.headId || obj.investigationHeadId || null;
    this.comment = obj.default_comment || null;
    this.isFav = obj.suggestion_flag && obj.suggestion_flag === 'user_fav' ? true : false;
    this.type = obj.type || null;
  }
}

export class InvestigationSave {
  tran_id: number;
  investigation_id: number;
  investigation: string;
  investigation_type: string;
  investigation_head_id: number;
  comment: string;
  source: string;
  date: string;
  chart_detail_id: number;

  generateObject(obj: any) {
    this.tran_id = obj.tran_id || null;
    this.investigation_id = obj.investigation_id;
    this.investigation_type = obj.investigation_type || null;
    this.investigation_head_id = obj.investigation_head_id;
    this.investigation = obj.investigation;
    this.comment = obj.comment || null;
    this.date = obj.date || null;
    this.chart_detail_id = obj.chart_detail_id || null;
    this.source = obj.source;
  }
}
