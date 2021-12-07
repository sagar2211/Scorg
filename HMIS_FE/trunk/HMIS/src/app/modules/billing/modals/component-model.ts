export class ComponentItemModel {
  componentId: number;
  componentName: string;

  constructor() { }

  isObjectValid(obj: any) {
    return (obj.scomId && obj.scomName) || (obj.componentId && obj.componentName) ? true : false;
  }
  generateObject(obj: any,): void {
    obj = obj ? obj : {};
    this.componentId = obj.scomId  || obj.componentId;
    this.componentName = obj.scomName || obj.componentName;
  }
}
