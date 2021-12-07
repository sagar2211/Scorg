export class GstCode {
  gstCode: string;
  description: string;
  igstPercent: number;
  sgstPercent: number;
  cgstPercent: number;

  isObjectValid(obj: any) {
    return (obj.hasOwnProperty('gstCode'))
      && (obj.hasOwnProperty('description')) ? true : false;
  }

  generateObject(obj: any) {
    this.gstCode = obj.gstCode;
    this.description = obj.description;
    this.igstPercent = obj.igstPercent;
    this.sgstPercent = obj.sgstPercent;
    this.cgstPercent = obj.cgstPercent;
  }
}
