
export class BillPaymentModel {
  id: number;
  mode: string;
  amount: number;
  transactionDate: string;
  bankId: number;
  bankName: string;
  chequeNo: number;
  chequeDate?: Date;
  ifscCode: string;
  branchName: string;
  cardHolderName: string;
  cardNo: string;
  remark: string;
  accHolderName: string;
  onlineTransactionNo: string;
  upiTransactionNumber: string;
  billMainId: number;
  billNo: string;
  billAmount: number;
  paydepositId: number;
  debitorType : number;
  debitor : number;
}

export class SaveBillPaymentModel {
  PpdMode: string;
  PpdAmount: number;
  PpdBankId: number;
  PpdChqno: string;
  PpdIfscCode: string;
  PpdBranch: string;
  PpdCcholderName: string;
  PpdCardno: string;
  PpdChqdate?: Date;
  PpdPaydepositId: number;
  PpdRemarks: string;
  PpdPbmId: number;
  PpdPbmBillno: string;
  PpdBillamount: number;
  PpdAccHolderName: string;
  PpdOnlineTransactionNo: string;
  PpdUpiTransactionNo: string;

  generateObject(obj: any): void {
    this.PpdMode = obj.mode;
    this.PpdAmount = obj.amount;
    this.PpdChqno = obj.chequeNo;
    this.PpdChqdate = obj.chequeDate || null;
    this.PpdIfscCode = obj.ifscCode;
    this.PpdBranch = obj.branchName;
    this.PpdCcholderName = obj.cardHolderName;
    this.PpdCardno = obj.cardNo;
    this.PpdRemarks = obj.remark;
    this.PpdPbmId = obj.billMainId;
    this.PpdPbmBillno = obj.billNo;
    this.PpdBillamount = obj.billAmount;
    this.PpdAccHolderName = obj.accHolderName;
    this.PpdOnlineTransactionNo = obj.onlineTransactionNo;
    this.PpdUpiTransactionNo = obj.upiTransactionNumber;
    this.PpdBankId = obj.bankId;
    this.PpdPaydepositId = obj.paydepositId;
  }
}

