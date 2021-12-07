export class AttachmentsModel {
 id: number;
 display_name: string;
 filename: string;

  isObjectValid(obj: any) {
    return (obj.hasOwnProperty('id')) ? (obj.hasOwnProperty('filename')) ?
      (obj.hasOwnProperty('display_name')) ?  true : false : false : false;
  }
}
