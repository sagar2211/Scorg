export class State {
  id: number;
  name: string;

  isObjectValid(obj: any) {
    return (obj.hasOwnProperty('stateId') || obj.hasOwnProperty('id'))
      && (obj.hasOwnProperty('stateName') || obj.hasOwnProperty('name')) ? true : false;
  }

  generateObject(obj: any) {
    this.id = obj.stateId || obj.id;
    this.name = obj.stateName || obj.name;
  }

}
