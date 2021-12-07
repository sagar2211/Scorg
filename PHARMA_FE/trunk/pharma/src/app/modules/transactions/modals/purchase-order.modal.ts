export class PurchaseOrder {
  id: number;
  supplierName: string;
  storeId: number;
  poNo: number;
  poDate: string;
  purchaseAmount: number;
  gstAmount: number;
  netAmount: number;
  isPoClosed: boolean;
  isApproved: boolean;
  status: string;
  createdBy: string;
  createdDate: string;
  createdByUser: string;
  lastUpdatedByUser: string;
  lastUpdatedDate: string;
  discountAmount: number;
  discountPercent: number;

  isObjectValid(obj: any) {
    return (obj.hasOwnProperty('poId') || obj.hasOwnProperty('id'))
      && (obj.hasOwnProperty('poNo')) && obj.hasOwnProperty('poDate') && obj.hasOwnProperty('purchaseAmount') ? true : false;
  }

  generateObject(obj: any) {
    this.id = obj.id || obj.poId;
    this.supplierName = obj.supplierName;
    this.storeId = obj.storeId;
    this.poNo = obj.poNo;
    this.poDate = obj.poDate;
    this.purchaseAmount = obj.purchaseAmount;
    this.gstAmount = obj.gstAmount;
    this.netAmount = obj.netAmount;
    this.isPoClosed = obj.isPoClosed;
    this.isApproved = obj.isApproved;
    this.status = obj.status;
    this.createdBy = obj.createdBy;
    this.createdDate = obj.createdDate;
    this.createdByUser = obj.createdByUser;
    this.lastUpdatedByUser = obj.lastUpdatedByUser;
    this.lastUpdatedDate = obj.lastUpdatedDate;
    this.discountAmount = obj.discountAmount;
    this.discountPercent = obj.discountPercent;
  }

}
