import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IssueService } from 'src/app/modules/issue/services/issue.service';
import { MastersService } from 'src/app/modules/masters/services/masters.service';
import { PatientAdvancePaymentComponent } from '../patient-advance-payment/patient-advance-payment.component';
import { PaymentHistoryComponent } from '../payment-history/payment-history.component';
@Component({
  selector: 'app-show-total-value',
  templateUrl: './show-total-value.component.html',
  styleUrls: ['./show-total-value.component.scss']
})
export class ShowTotalValueComponent implements OnInit, OnDestroy {
  @Input() formValue = null;
  @Output() updateFormValue = new EventEmitter<any>();
  billingForm: FormGroup;
  advancePaymentRowData = [];
  $destroy = new Subject<any>();
  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private issueService: IssueService,
    private mastersService: MastersService,
  ) { }

  ngOnInit(): void {
    this.createForm();
    this.subcriptionEvent();
  }

  ngOnDestroy() {
    this.$destroy.unsubscribe();
  }

  // ngOnChanges() {
  //   if (this.billingForm) {
  //     this.billingForm.patchValue({
  //       billAmount: this.formValue.billAmount || 0,
  //       discountType: this.formValue.discountType,
  //       discountPercent: this.formValue.discountPercent || 0,
  //       discountAmount: this.formValue.discountAmount || 0,
  //       netAmount: this.formValue.netAmount || 0,
  //       finalNetAmount: this.formValue.finalNetAmount || 0,
  //       advanceAdjustmentAmt: this.formValue.advanceAdjustmentAmt || 0,
  //       netPayableAmount: this.formValue.netPayableAmount || 0,
  //       advPaymentSettlement: this.formValue.advPaymentSettlement,
  //     });
  //   }
  // }

  createForm(): void {
    this.billingForm = this.fb.group({
      billAmount: [this.formValue.billAmount || 0],
      discountType: [this.formValue.discountType],
      discountPercent: [this.formValue.discountPercent || 0],
      discountAmount: [this.formValue.discountAmount || 0],
      netAmount: [this.formValue.netAmount || 0],
      finalNetAmount: [this.formValue.finalNetAmount || 0],
      advanceAdjustmentAmt: [this.formValue.advanceAdjustmentAmt || 0],
      netPayableAmount: [this.formValue.netPayableAmount || 0],
      advPaymentSettlement: [this.formValue.advPaymentSettlement],
    });
    this.calculateBillData();
  }

  updateBillCalType(type) {
    if (type == 'percent' || type == 'amount') {
      this.billingForm.patchValue({ discountType: type });
    }
    this.calculateBillData();
  }

  calculateBillData() {
    // bill discount calculation as per discount type
    const billAmt = this.billingForm.value.billAmount;
    const discountType = this.billingForm.value.discountType;
    let discountPercent = this.billingForm.value.discountPercent;
    let discountAmount = this.billingForm.value.discountAmount;
    let paymetAmount = this.formValue.paymentInfo ? this.formValue.paymentInfo.amount : 0;
    let lastPaidAmt = this.formValue.paidAmount ? this.formValue.paidAmount : 0;
    let paymentType = this.formValue.paymentType;
    const advanceAdjustmentAmt = +this.billingForm.value.advanceAdjustmentAmt;
    if (discountType == 'percent') {
      discountAmount = (+(billAmt * +discountPercent) / 100).toFixed(2);
      this.billingForm.patchValue({ discountAmount: +discountAmount });
    } else if (discountAmount) {
      const discountPercent = ((+discountAmount * 100) / billAmt).toFixed(2);
      this.billingForm.patchValue({ discountPercent: +discountPercent });
    }

    // bill amount after concession
    const billAmountAfterDiscount = billAmt - discountAmount;

    // bill net amount
    const netAmount = billAmountAfterDiscount;
    this.billingForm.patchValue({ netAmount: netAmount });

    // final net amount after gst
    const finalNetAmount = netAmount - advanceAdjustmentAmt;
    this.billingForm.patchValue({ finalNetAmount: finalNetAmount });

    // insurance amount, advanced amount, settled amount to calculate balance amount
    const balanceAmount = finalNetAmount;
    //this.allTypeSaleForm.patchValue({ balanceAmount: balanceAmount });

     // net payable calculate....
     if (paymentType === 'collection') {
      const netPayableAmount = (balanceAmount - +paymetAmount - +lastPaidAmt).toFixed(2);
      this.billingForm.patchValue({ netPayableAmount: netPayableAmount });
    } else if (paymentType === 'refund') {
      const netPayableAmount = (balanceAmount - +lastPaidAmt + +paymetAmount).toFixed(2);
      this.billingForm.patchValue({ netPayableAmount: netPayableAmount });
    }
    this.savePatientBillConfirmation();
  }

  savePatientBillConfirmation() {
    this.updateFormValue.emit(this.billingForm.getRawValue());
  }

  // Advanced Utilization Code started ----------------------------------------
  patientAdvancePayment() {
    const modalInstance = this.modalService.open(PatientAdvancePaymentComponent, {
      ariaLabelledBy: 'modal-basic-title',
      keyboard: false,
      size: 'xl',
      container: '#homeComponent',
      // backdrop: 'static',
    });
    modalInstance.componentInstance.formData = this.formValue;
    modalInstance.componentInstance.advancePaymentRowData = this.advancePaymentRowData;
    modalInstance.componentInstance.AdvancePaymentEvent.subscribe((e: any) => {
      // update patient advance payment untilization into bill
      this.advancePaymentRowData = _.cloneDeep(e.advancePaymentRowData);
      const advPaymentSettlement = _.cloneDeep(e.advPaymentSettlement);
      const advanceAppliedAmount = _.cloneDeep(e.advanceAppliedAmount);
      this.billingForm.patchValue({
        advanceAdjustmentAmt: advanceAppliedAmount + (this.formValue.advanceAdjustmentAmt || 0),
        advPaymentSettlement: advPaymentSettlement
      });
      this.calculateBillData();
    });
    modalInstance.result.then((result) => {
      if (result === true) {

      }
    });
  }

  getPayementHistoryData() {
    const promise = new Promise((resolve, reject) => {
      this.issueService.getPaymentHistory(this.formValue.consumptionId).subscribe(res => {
        resolve(res);
      });
    });
    return promise;
  }

  patientPaymentHistory() {
    this.getPayementHistoryData().then(res => {
      const modalInstance = this.modalService.open(PaymentHistoryComponent,
        {
          ariaLabelledBy: 'modal-basic-title',
          backdrop: 'static',
          keyboard: false,
          size: 'xl',
          container: '#homeComponent'
        });
      modalInstance.result.then((result) => {
        if (result.type === 'yes') {
          // this.prescriptionItemListSelected = result.data.prescriptionItemListSelected;
          // this.updatePrescriptionItemList();
          return;
        } else if (result.type === 'no') {
          return;
        }
      });
      modalInstance.componentInstance.formData = this.formValue;
      modalInstance.componentInstance.paymentHistory = res;
    })
  }

  subcriptionEvent() {
    this.mastersService.$subUpdatePaymentRelatedData.pipe(takeUntil(this.$destroy)).subscribe((obj: any) => {
      if (obj) {
        this.formValue = obj;
        this.billingForm.patchValue({
          billAmount: this.formValue.billAmount || 0,
          discountType: this.formValue.discountType,
          discountPercent: this.formValue.discountPercent || 0,
          discountAmount: this.formValue.discountAmount || 0,
          netAmount: this.formValue.netAmount || 0,
          finalNetAmount: this.formValue.finalNetAmount || 0,
          advanceAdjustmentAmt: this.formValue.advanceAdjustmentAmt || 0,
          netPayableAmount: this.formValue.netPayableAmount || 0,
          advPaymentSettlement: this.formValue.advPaymentSettlement,
        });
      }
    });
  }

}
