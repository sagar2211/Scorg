import * as _ from 'lodash';
export class ExaminationTags {
  id: number;
  transId: number;
  headId: number;
  tagKey: string;
  tagName: string;
  tagPriority: string;
  masterSave: boolean;
  isTagEdited: boolean;
  chart_detail_id: number;
  conceptData: any;

  generateObject(obj: any) {
    this.id = obj.exam_id || obj.id || null;
    this.transId = obj.tran_id || obj.transId || null;
    this.headId = obj.exam_head_id || obj.headId || null;
    this.tagKey = obj.exam_key || obj.tagKey || null;
    this.tagName = obj.exam_name || obj.tagName || null;
    this.tagPriority = obj.tag_priority || obj.tagPriority || null;
    this.masterSave = obj.masterSave || false;
    this.isTagEdited = obj.isTagEdited || false;
    this.chart_detail_id = obj.chart_detail_id || null;
    this.conceptData = (!_.isUndefined(obj.conceptData) && obj.conceptData !== null && obj.conceptData.length) ? (_.isArray(obj.conceptData)) ? obj.conceptData : JSON.parse(obj.conceptData) : [];
  }
}


export class ExaminationSave {
  tran_id: number;
  examination_head_id: number;
  exam_id: number;
  examination_text: string;
  severity: string;
  add_to_master: boolean;
  chart_detail_id: number;
  conceptData: string;

  generateObject(obj: any) {
    this.tran_id = obj.tran_id || null;
    this.examination_head_id = obj.examination_head_id || null;
    this.exam_id = obj.exam_id || null;
    this.examination_text = obj.examination_text || null;
    this.severity = obj.severity || null;
    this.add_to_master = obj.add_to_master || false;
    this.chart_detail_id = obj.chart_detail_id || null;
    this.conceptData = (obj.conceptData) ? JSON.stringify(obj.conceptData) : '';
  }
}
