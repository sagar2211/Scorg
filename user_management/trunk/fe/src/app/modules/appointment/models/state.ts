export class State {
  'name'?: string;
  'id': number;

  generateObject(obj: any) {
    this.id = obj.State_Id;
    this.name = obj.State_Name;
  }
}
