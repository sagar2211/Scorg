export class IfluidReportOptionNameList {
  type: string;
  name: string;
  id: number;

  isObjectValid(obj: any) {
    return obj.hasOwnProperty('name')
      && (obj.hasOwnProperty('feed_id') || obj.hasOwnProperty('fluid_id')) ? true : false;
  }

  generateObject(obj: any, type) {
    this.type = type;
    this.name = obj.name;
    if (type === 'feed') {
      this.id = obj.feed_id;
    } else {
      this.id = obj.fluid_id; // fluid_id
    }
  }
}
