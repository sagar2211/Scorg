export class IndentType {
  indentType: string;
  description: string;

  isObjectValid(obj: any) {
    return (obj.hasOwnProperty('indentType'))
      && (obj.hasOwnProperty('description')) ? true : false;
  }

  generateObject(obj: any) {
    this.indentType = obj.indentType;
    this.description = obj.description;
  }

}
