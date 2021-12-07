import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BillingService } from '../../services/billing.service';
import * as _ from 'lodash';
import { Constants } from 'src/app/config/constants';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { AdvancePaymentModel, AdvPaymentSettlement, UtilizeAdvanceAmount } from '../../modals/advance-payment-model';
import { DxDataGridComponent } from 'devextreme-angular';

@Component({
  selector: 'app-patient-advance-payment',
  templateUrl: './patient-advance-payment.component.html',
  styleUrls: ['./patient-advance-payment.component.scss']
})
export class PatientAdvancePaymentComponent implements OnInit {
  @Input() patientData: any;
  @Output() AdvancePaymentEvent = new EventEmitter<any>();
  @ViewChild(DxDataGridComponent, { static: false }) public dataGrid: DxDataGridComponent;

  alertMsg: IAlert;
  isApply = false;
  netAmount = 0;
  totalDeposited = 0;
  totalGenBillSettled = 0;
  totalSpotBillSettled = 0;
  totalBalance = 0;
  appliedAmount = 0;
  focusedRowData: any;
  focusedRowIndex: number;
  headertext: string;

  advancePaymentData: Array<AdvancePaymentModel> = [];
  utilizeAdvanceAmount: Array<UtilizeAdvanceAmount> = [];
  advPaymentSettlement: Array<AdvPaymentSettlement> = [];

  constructor(
    public modal: NgbActiveModal,
    public billingService: BillingService
  ) {
    this.onEditorPreparing = this.onEditorPreparing.bind(this);
    this.setApplicableAmount = this.setApplicableAmount.bind(this);
  }

  ngOnInit(): void {
    // set popup header title
    this.headertext = " UHID - " + this.patientData.uhId;
    // set net payable bill amount
    this.netAmount = _.toNumber(parseFloat(this.patientData.billAmount).toFixed(2));

    // load popup grid from existing loaded data else load data using api call
    if (this.patientData.advancePaymentRowData.length != 0) {
      this.loadRowData(this.patientData.advancePaymentRowData);
    } else {
      this.getAdvancePaymentDetails();
    }
  }

  decimalWithPrecision(data: any) {
    return parseFloat(data.value || 0).toFixed(2);
  }

  getAdvancePaymentDetails() {
    const uhId = this.patientData.uhId;
    const penId = this.patientData.penId;
    this.billingService.getAdvancePaymentDetailsList(uhId, penId).subscribe(res => {
      _.map(res, (o) => {
        o.paymentStatus = (o.mode == 'CHEQUE' || o.mode == 'CHEQUE/DD') ? (o.chqCleared == 'Y' ? 'Cleared' : 'Not Cleared') : '';
      });
      const advanceGridData = _.cloneDeep(res);
      this.loadRowData(advanceGridData);
    });
  }

  loadRowData(row: any) {
    let totalspotbillSettled = 0;
    let totalgenbillSettled = 0;
    this.advancePaymentData = _.cloneDeep(row);

    // get sum of all advance settled amount from voucher
    _.map(row, (d: any) => {
      // set total deposited amount
      this.totalDeposited = parseFloat(d.totalDeposited || 0);
      _.map(d.totalSettled, (val: any) => {
        if (val?.PbmBookType == "SP") {
          totalspotbillSettled = _.round(parseFloat(val?.PbmTotAdvamt || 0), 2);
        } else {
          totalgenbillSettled = _.round(parseFloat(val?.PbmTotAdvamt || 0), 2);
        }
      });
    });

    // total deposit - total settle against bill and spot bill = balance amount
    var totalSettled = totalgenbillSettled + totalspotbillSettled;
    this.totalGenBillSettled = _.round(totalgenbillSettled, 2);
    this.totalSpotBillSettled = _.round(totalspotbillSettled, 2);
    this.totalBalance =  _.round((this.totalDeposited - totalSettled), 2);

    // update applied amount based on applicable amount
    this.appliedAmount = this.calculateAppliedAmount();
    this.netAmount += this.appliedAmount;
  }

  setApplicableAmount(newData, value, currentRowData) {
    if (currentRowData.balanceAmount < parseFloat(value)) {
      newData.applicableAmount = 0;
      this.showValidationMsg("Applied amount must be equal or less of balanced amount");
      return;
    } else {
      newData.applicableAmount = _.round(parseFloat(value), 2);
    }
    const appliedAmount = this.calculateAppliedAmount();
    this.appliedAmount = appliedAmount;
  }

  showValidationMsg(msg) {
    this.alertMsg = {
      message: msg,
      messageType: 'warning',
      duration: Constants.ALERT_DURATION
    };
  }

  getFocusedRowIndex(papId) {
    const focusedRowIndex = _.findIndex(this.advancePaymentData, (o) => { return o.papId == papId; });
    return focusedRowIndex;
  }

  onFocusedRowChanged(evt) {
    console.log(evt);
    this.focusedRowData = evt.row.data;
    this.focusedRowIndex = evt.row.rowIndex;
  }

  onEditingStart(evt: any) {
    if (evt.column.dataField == 'isAdvanceApply' && evt.data.chqCleared != 'Y') {
      evt.cancel = true;
    } else if (evt.column.dataField == 'applicableAmount' && !evt.data.isAdvanceApply) {
      evt.cancel = true;
    } else if (evt.column.dataField == 'isAdvanceApply' && evt.data.isAdvanceApply) {
    }
  }

  onEditorPreparing(evt: any): void {
    // on cell value change event fire here
    evt.editorOptions.onValueChanged = (e: any) => {
      evt.setValue(e.value);

      const rowIndex = this.getFocusedRowIndex(evt.row.data.papId);
      let rowObj = this.advancePaymentData[rowIndex];

      switch (evt.dataField) {
        case 'applicableAmount':
          // reset applicable amount enter more than balance amount
          if (rowObj.balanceAmount < parseFloat(e.value)) {
            evt.setValue(0);
            rowObj.applicableAmount = 0;
            this.showValidationMsg("Applied amount must be equal or less of balanced amount");
            break;
          }

          // update applied amount from grid to summary
          rowObj.applicableAmount = parseFloat(e.value || 0);
          const appliedAmount = this.calculateAppliedAmount();
          if (appliedAmount <= this.netAmount) {
            this.appliedAmount = appliedAmount;
          } else {
            evt.setValue(0);
            rowObj.applicableAmount = 0;

            this.appliedAmount = this.calculateAppliedAmount();
            const applicableAmount = this.netAmount - this.appliedAmount;
            if (applicableAmount > 0) {
              evt.setValue(applicableAmount);
              rowObj.applicableAmount = applicableAmount;
              this.appliedAmount += applicableAmount;
            }
          }
          break;
        case 'isAdvanceApply':
          rowObj.applicableAmount = 0;
          this.appliedAmount = this.calculateAppliedAmount();
          break;
      }
      // refresh data grid
      this.dataGrid.instance.refresh();
    }
  }

  calculateAppliedAmount() {
    // update applied amount from grid to summary
    let appliedAmount: number = 0;
    _.map(this.advancePaymentData, (d: any) => {
      if (d.isAdvanceApply) {
        const amt = parseFloat(d.applicableAmount || 0);
        return appliedAmount += amt;
      }
    });
    return appliedAmount;
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
    if (this.validateAmount()) {
      _.map(this.advancePaymentData, (d: any) => {
        if (d.isAdvanceApply) {
          const advanceAmount: number = +d.applicableAmount;
          const orgDepositedAmount: number = +d.advAmount;
          const depositedAmount: number = +d.balanceAmount; // +d.advAmount;
          const balanceAmount = (_.isNaN(depositedAmount) ? 0 : depositedAmount) - (_.isNaN(advanceAmount) ? 0 : advanceAmount)

          const utilizeAmount = new UtilizeAdvanceAmount();
          utilizeAmount.AupApdId = d.papId;
          utilizeAmount.AupDepositAmount = (_.isNaN(orgDepositedAmount) ? 0 : orgDepositedAmount);
          utilizeAmount.AupUtilizedAmount = (_.isNaN(advanceAmount) ? advanceAmount : advanceAmount);
          utilizeAmount.AupBalanceAmount = (_.isNaN(balanceAmount) ? balanceAmount : balanceAmount);
          this.utilizeAdvanceAmount.push(utilizeAmount);

          const paymentSettlement = new AdvPaymentSettlement();
          paymentSettlement.ApsApdId = d.papId;;
          paymentSettlement.ApsAmount = (_.isNaN(advanceAmount) ? 0 : advanceAmount)
          this.advPaymentSettlement.push(paymentSettlement);
        }
      });
      const patientAdvObj = {
        advancePaymentRowData: this.advancePaymentData,
        utilizeAdvanceAmount: this.utilizeAdvanceAmount,
        advPaymentSettlement: this.advPaymentSettlement,
        advanceAppliedAmount: this.appliedAmount
      }
      this.AdvancePaymentEvent.emit(patientAdvObj);
      this.modal.dismiss();
    }
  }


}
