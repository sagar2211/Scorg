export class DocumentType {
  id: number;
  name: string;
  key: string;

  isObjectValid(obj: any) {
    return obj.hasOwnProperty('docType') ? obj.hasOwnProperty('docTypeId') ?
      obj.hasOwnProperty('docTypeName') ? true : false : false : false;
  }

  generateObject(obj: any) {
    this.id = obj.docTypeId || obj.id || null;
    this.name = obj.docTypeName || obj.name || null;
    this.key = obj.docType || obj.key || null;
  }
}


