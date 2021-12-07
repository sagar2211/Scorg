export class Country {
  'name'?: string;
  'id': number;

  generateObject(obj: any) {
    this.id = obj.Country_Id;
    this.name = obj.Country_Name;
  }
}
