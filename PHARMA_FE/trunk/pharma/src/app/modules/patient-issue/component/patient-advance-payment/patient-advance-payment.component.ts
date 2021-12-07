import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { Constants } from 'src/app/config/constants';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { DxDataGridComponent } from 'devextreme-angular';
import { IssueService } from 'src/app/modules/issue/services/issue.service';

@Component({
  selector: 'app-patient-advance-payment',
  templateUrl: './patient-advance-payment.component.html',
  styleUrls: ['./patient-advance-payment.component.scss']
})
export class PatientAdvancePaymentComponent implements OnInit {
  @Input() formData: any;
  @Input() advancePaymentRowData: any;
  @Output() AdvancePaymentEvent = new EventEmitter<any>();
  @ViewChild(DxDataGridComponent, { static: false }) public dataGrid: DxDataGridComponent;

  alertMsg: IAlert;
  isApply = false;
  netAmount = 0;
  totalDeposited = 0;
  totalBalance = 0;
  appliedAmount = 0;
  focusedRowData: any;
  focusedRowIndex: number;

  advancePaymentData = [];
  utilizeAdvanceAmount = [];
  advPaymentSettlement = [];


  constructor(
    public modal: NgbActiveModal,
    public issueService: IssueService
  ) {
    this.onEditorPreparing = this.onEditorPreparing.bind(this);
  }

  ngOnInit(): void {
    this.netAmount = _.toNumber(parseFloat(this.formData.netPayableAmount).toFixed(2));
    if (this.advancePaymentRowData.length != 0) {
      this.loadRowData(this.advancePaymentRowData);
    } else {
      this.getAdvancePaymentDetails();
    }
  }

  decimalWithPrecision(data: any) {
    return parseFloat(data.value || 0).toFixed(2);
  }

  getAdvancePaymentDetails() {
    const param = {
      accountId: this.formData.accountId || 0,
      patientId: this.formData.patientId || 0
    }
    this.issueService.getAdvancePaymentDetailsList(param).subscribe(res => {
      const advanceGridData = _.cloneDeep(res);
      advanceGridData.map(d => {
        d.isAdvanceApply = false;
        d.applicableAmount = null;
        d.usedAmount = d.amount - d.balanceAmount;
      });
      this.loadRowData(advanceGridData);
    });
  }

  loadRowData(row: any) {
    this.advancePaymentData = _.cloneDeep(row);
    this.totalDeposited = _.sumBy(row, 'balanceAmount');
  }

  showValidationMsg(msg) {
    this.alertMsg = {
      message: msg,
      messageType: 'warning',
      duration: Constants.ALERT_DURATION
    };
  }

  onFocusedRowChanged(evt) {
    console.log(evt);
    this.focusedRowData = evt.row.data;
    this.focusedRowIndex = evt.row.rowIndex;
  }

  onEditingStart(evt: any) {
    if (evt.column.dataField == 'isAdvanceApply' && evt.data.paymentmode === 'CHEQUE' && evt.data.chqCleared != 'Y') {
      evt.cancel = true;
    } else if (evt.column.dataField == 'isAdvanceApply') {
      let sum: number = 0;
      _.map(this.advancePaymentData, (d: any) => {
        if (d.isAdvanceApply) {
          d.applicableAmount = +d.applicableAmount || +d.balanceAmount;
          const amt: number = +d.applicableAmount;
          return sum += amt;
        } else {
          d.applicableAmount = 0;
        }
      });
      this.appliedAmount = sum;
    }
  }

  getCellData(data) {
    console.log(data);
  }

  onEditorPreparing(evt: any): void {
    // on cell value change event fire here
    evt.editorOptions.onValueChanged = (e: any) => {
      const appliedAmt = _.toNumber(e.value);
      let rowObj = this.advancePaymentData[evt.row.rowIndex];
      if (rowObj.balanceAmount < appliedAmt) {
        rowObj.applicableAmount = rowObj.applicableAmount || rowObj.balanceAmount;
        evt.setValue(rowObj.applicableAmount);
        this.showValidationMsg("Applied amount must be equal or less of balanced amount");
        return;
      } else {
        evt.setValue(e.value);
        this.appliedAmount = appliedAmt;
      }
      this.dataGrid.instance.refresh();
    }
  }

  validateAmount() {
    if (this.appliedAmount <= 0) {
      this.showValidationMsg("Applied amount cannot not be zero");
      return false;
    }
    else if (this.netAmount < this.appliedAmount) {
      this.showValidationMsg("Applied amount must be equal or less of bill amount");
      return false;
    }
    return true;
  }

  applyAdvancePayment() {
    if (!this.appliedAmount) {
      this.showValidationMsg("Please apply Amount");
      return;
    }
    if (this.netAmount < this.appliedAmount) {
      this.showValidationMsg("Applied amount must be equal or less of bill amount");
      return;
    }
    if (this.validateAmount()) {
      _.map(this.advancePaymentData, (d: any) => {
        if (d.isAdvanceApply) {
          const paymentSettlement = {
            advaceDetailid: d.advanceDetailId,
            amount: d.amount,
            utilizedAmount: d.applicableAmount,
            balanceAmount: d.balanceAmount - d.applicableAmount
          }
          this.advPaymentSettlement.push(paymentSettlement);
        }
      });
      const patientAdvObj = {
        advancePaymentRowData: this.advancePaymentData,
        advPaymentSettlement: this.advPaymentSettlement,
        advanceAppliedAmount: this.appliedAmount
      }
      this.AdvancePaymentEvent.emit(patientAdvObj);
      this.modal.dismiss();
    }
  }


}
