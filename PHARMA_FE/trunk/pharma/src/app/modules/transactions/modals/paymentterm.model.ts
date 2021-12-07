export class PaymentTerm {
  id: number;
  description: string;

  isObjectValid(obj: any) {
    return (obj.hasOwnProperty('paymentTermId') || obj.hasOwnProperty('id'))
      && (obj.hasOwnProperty('description')) ? true : false;
  }

  generateObject(obj: any) {
    this.id = obj.paymentTermId || obj.id;
    this.description = obj.description;
  }

}
