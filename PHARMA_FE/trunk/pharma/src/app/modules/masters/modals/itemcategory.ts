export class itemCategory {
  id: number;
  name: string;
  isActive: boolean;

  isObjectValid(obj: any) {
    return (obj.hasOwnProperty('categoryId') || obj.hasOwnProperty('id'))
      && (obj.hasOwnProperty('categoryName') || obj.hasOwnProperty('name')) ? true : false;
  }

  generateObject(obj: any) {
    this.id = obj.categoryId || obj.id;
    this.name = obj.categoryName || obj.name;
    this.isActive = (obj.isActive === true);
  }

}
