export class IOrdersCategory {
  orderId: number;
  orderName: string;
  display: boolean;
  orderKey: string;

  generateObject(obj: any): void {
    this.orderId = obj.orderId ?  obj.orderId : 0;
    this.orderName = obj.orderName ? obj.orderName : '';
    this.display = obj.display ? obj.display : true;
    this.orderKey = obj.orderKey ? obj.orderKey : '';
  }
}
