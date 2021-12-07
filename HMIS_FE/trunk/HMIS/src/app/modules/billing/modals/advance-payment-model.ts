
export class AdvancePaymentModel {
  papId: number;
  mode: string;
  chqCleared: string;
  isAdvanceApply: boolean;
  advAmount: number;
  advDate: string;
  addUser: string;
  addDate: string;
  amountUsed: string;
  divisionName: string;
  balanceAmount: number;
  applicableAmount: number;
  totalDeposited: number;
  totalSettled: [];

  generateObject(obj: any): void {
    this.papId = obj.PapId;
    this.mode = obj.PapMode;
    this.chqCleared = obj.PapChqCleared;
    this.advAmount = obj.PapAmount;
    this.advDate = obj.PapDate;
    this.addUser = obj.AddUser;
    this.addDate = obj.AddDate;
    this.amountUsed = obj.AmountUsed;
    this.divisionName = obj.DivisionName;
    this.totalDeposited = obj.totalDeposited;
    this.totalSettled = obj.totalSettled;
  }
}

export class UtilizeAdvanceAmount {
  AupApdId: number;
  AupDepositAmount: number;
  AupBalanceAmount: number;
  AupUtilizedAmount: number;

}

export class AdvPaymentSettlement {
  ApsApdId: number;
  ApsAmount: number;
}
