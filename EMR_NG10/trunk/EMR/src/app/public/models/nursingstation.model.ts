export class Nursingstation {

  id: number;
  name: string;

  isObjectValid(obj: any) {
    return obj.hasOwnProperty('id')
      && obj.hasOwnProperty('name')
      || obj.hasOwnProperty('nursingStation') ? true : false;
  }

  generateObject(obj: any) {
    this.id = +obj.nursingStationId || +obj.id;
    this.name = obj.name || obj.nursingStation;
  }
}
