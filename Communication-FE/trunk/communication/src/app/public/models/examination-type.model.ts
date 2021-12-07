export class ExaminationType {
  id: number;
  name: string;
  key: string;

  isObjectValid(obj: any) {
    return obj.hasOwnProperty('exam_type_id') ? obj.hasOwnProperty('type_key') ?
      obj.hasOwnProperty('type_name') ? true : false : false : false;
  }

  generateObject(obj: any) {
    this.id = obj.exam_type_id;
    this.name = obj.type_name;
    this.key = obj.type_key || null;
  }
}
