export class City {
  'name'?: string;
  'id': number;

  generateObject(obj: any) {
    this.id = obj.City_Id;
    this.name = obj.City_Name;
  }
}
