export class Country {
  id: number;
  name: string;

  isObjectValid(obj: any) {
    return (obj.hasOwnProperty('countryId') || obj.hasOwnProperty('id'))
      && (obj.hasOwnProperty('countryName') || obj.hasOwnProperty('name')) ? true : false;
  }

  generateObject(obj: any) {
    this.id = obj.countryId || obj.id;
    this.name = obj.countryName || obj.name || 'India';
  }

}
