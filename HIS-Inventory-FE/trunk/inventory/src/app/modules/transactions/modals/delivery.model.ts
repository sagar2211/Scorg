export class Delivery {
  id: number;
  description: string;

  isObjectValid(obj: any) {
    return (obj.hasOwnProperty('deliveryId') || obj.hasOwnProperty('id'))
      && (obj.hasOwnProperty('description')) ? true : false;
  }

  generateObject(obj: any) {
    this.id = obj.deliveryId || obj.id;
    this.description = obj.description;
  }

}
