export class Manufacturer {
  id: number;
  name: string;
  shortName: string;
  isActive: boolean;

  isObjectValid(obj: any) {
    return (obj.hasOwnProperty('manufacturerId') || obj.hasOwnProperty('id'))
    && (obj.hasOwnProperty('manufacturerName') || obj.hasOwnProperty('name')) ? true : false;
  }

  generateObject(obj: any) {
    this.id = obj.manufacturerId || obj.id;
    this.name = obj.manufacturerName || obj.name;
    this.shortName = obj.shortName || '';
    this.isActive = (obj.isActive === true);
  }

}
