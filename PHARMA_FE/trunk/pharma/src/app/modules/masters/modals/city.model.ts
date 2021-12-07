export class City {
  id: number;
  name: string;

  isObjectValid(obj: any) {
    return (obj.hasOwnProperty('cityId') || obj.hasOwnProperty('id'))
      && (obj.hasOwnProperty('cityName') || obj.hasOwnProperty('name')) ? true : false;
  }

  generateObject(obj: any) {
    this.id = obj.cityId || obj.id;
    this.name = obj.cityName || obj.name || obj.city;
  }

}
