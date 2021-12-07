
export class MedicineSig {
  id: String;
  name: String;

  constructor(id?: String, sig?: String) {
    this.id = id;
    this.name = sig;
  }

  isObjectValid(obj: any) {
    return obj.hasOwnProperty('id')
      && obj.hasOwnProperty('sig') ? true : false;
  }

  generateObject(obj: any) {
    this.id = obj.id;
    this.name = obj.sig;
  }
}
