import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { concat, Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { Constants } from 'src/app/config/constants';
import { IssueService } from 'src/app/modules/issue/services/issue.service';
import { MastersService } from 'src/app/modules/masters/services/masters.service';
import { IAlert } from 'src/app/public/models/AlertMessage';
@Component({
  selector: 'app-show-payment',
  templateUrl: './show-payment.component.html',
  styleUrls: ['./show-payment.component.scss']
})
export class ShowPaymentComponent implements OnInit, OnDestroy {
  @Input() formValue = null;
  @Output() updateFormValue = new EventEmitter<any>();
  paymentModeForm: FormGroup;
  submitted = false;
  bankList$ = new Observable<any>();
  bankInput$ = new Subject<any>();
  paymentModeList = [
    { id: 'CASH', name: "Cash" },
    { id: 'CHEQUE', name: "Cheque" },
    { id: 'CARD', name: "Card" },
    { id: 'NEFT', name: "NEFT" },
    { id: 'RTGS', name: "RTGS" },
    { id: 'IMPS', name: "IMPS" },
    { id: 'UPI', name: "UPI" },
    // { id: 'ADVANCE', name: "ADVANCE" },
  ];
  alertMsg: IAlert;
  $destroy = new Subject<any>();
  constructor(
    private fb: FormBuilder,
    private issueService: IssueService,
    private mastersService: MastersService,
  ) { }

  ngOnInit(): void {
    // console.log(this.formValue);
    this.createPaymentModeForm();
    this.loadBankList();
    this.paymentModeForm.valueChanges.subscribe(selectedValue => {
      this.sendPaymentData();
    });
    this.checkMode();
    this.subcriptionEvent();
  }

  ngOnDestroy() {
    this.$destroy.unsubscribe();
  }

  checkMode() {
    if (this.paymentModeForm) {
      if (this.formValue.netPayableAmount < 0 && this.formValue.consumptionId) {
        this.paymentModeForm.patchValue({
          paymentType: 'refund',
          createCreditNote: false,
        });
      } else if (this.formValue.netPayableAmount >= 0 && this.formValue.consumptionId) {
        this.paymentModeForm.patchValue({
          paymentType: 'collection',
          createCreditNote: false,
        });
        this.paymentModeForm.controls.mode.enable();
        this.paymentModeForm.controls.remark.enable();
        this.paymentModeForm.controls.amount.enable();
      }
    }
  }

  createPaymentModeForm() {
    this.paymentModeForm = this.fb.group({
      id: null,
      mode: [this.paymentModeList[0].id],
      amount: [''],
      paymentType: ['collection'],
      createCreditNote: false,
      cardMode: this.fb.group({
        cardHolderName: [''],
        cardNo: ['']
      }),
      neftMode: this.fb.group({
        accHolderName: [''],
        onlineTransactionNo: ['']
      }),
      upiMode: this.fb.group({
        upiTransactionNo: ['']
      }),
      chequeMode: this.fb.group({
        chequeNo: ['']
      }),
      bankName: [''],
      branchName: [''],
      ifscCode: [''],
      remark: ['']
    });
    if (this.formValue.paymentInfo) {
      this.paymentModeUpdate();
    } else {
      this.paymentMode('CASH')
    }
  }

  updateFormMode() {
    const payment = this.paymentModeForm.getRawValue();
    if (payment.createCreditNote) {
      this.clearForm();
      this.paymentModeForm.controls.mode.disable();
      this.paymentModeForm.controls.remark.disable();
      this.paymentModeForm.controls.amount.disable();
      this.paymentModeForm.patchValue({
        paymentType: 'refund',
        mode: 'CASH',
        amount: 0,
        bankName: null,
        branchName: null,
        ifscCode: null,
        remark: null,
        // createCreditNote: false
      });
    } else if (this.formValue.netPayableAmount < 0 && this.formValue.consumptionId) {
      this.paymentModeForm.patchValue({
        paymentType: 'refund',
        mode: 'CASH',
        amount: 0,
        bankName: null,
        branchName: null,
        ifscCode: null,
        remark: null,
      });
    } else if (this.formValue.netPayableAmount >= 0 && this.formValue.consumptionId) {
      this.paymentModeForm.patchValue({
        paymentType: 'collection',
        mode: 'CASH',
        amount: 0,
        bankName: null,
        branchName: null,
        ifscCode: null,
        remark: null,
      });
      this.paymentModeForm.controls.mode.enable();
      this.paymentModeForm.controls.remark.enable();
      this.paymentModeForm.controls.amount.enable();
    } else {
      this.paymentModeForm.patchValue({
        paymentType: 'collection',
        mode: 'CASH',
        amount: 0,
        bankName: null,
        branchName: null,
        ifscCode: null,
        remark: null,
        // createCreditNote: false
      });
      this.paymentModeForm.controls.mode.enable();
      this.paymentModeForm.controls.remark.enable();
      this.paymentModeForm.controls.amount.enable();
    }
  }

  clearForm() {
    this.paymentModeForm.patchValue({
      paymentType: 'collection',
      mode: 'CASH',
      amount: 0,
      bankName: null,
      branchName: null,
      ifscCode: null,
      remark: null,
      // createCreditNote: false
    });
    this.paymentModeForm.get('cardMode').patchValue({
      cardHolderName: null,
      cardNo: null,
    });
    this.paymentModeForm.get('neftMode').patchValue({
      accHolderName: null,
      onlineTransactionNo: null,
    });
    this.paymentModeForm.get('upiMode').patchValue({
      upiTransactionNo: null,
    });
    this.paymentModeForm.get('chequeMode').patchValue({
      chequeNo: null,
    });
  }

  paymentModeUpdate() {
    const payment = this.formValue.paymentInfo;
    this.paymentModeForm.patchValue({
      mode: payment.mode || 'CASH',
      amount: payment.amount,
      bankName: payment.bankName,
      branchName: payment.branchName,
      ifscCode: payment.ifscCode,
      remark: payment.remark,
      paymentType: this.formValue.paymentType,
      createCreditNote: this.formValue.createCreditNote,
    });
    this.paymentModeForm.get('cardMode').patchValue({
      cardHolderName: payment.cardMode.cardHolderName,
      cardNo: payment.cardMode.cardNo,
    });
    this.paymentModeForm.get('neftMode').patchValue({
      accHolderName: payment.neftMode.accHolderName,
      onlineTransactionNo: payment.neftMode.onlineTransactionNo,
    });
    this.paymentModeForm.get('upiMode').patchValue({
      upiTransactionNo: payment.upiMode.upiTransactionNo,
    });
    this.paymentModeForm.get('chequeMode').patchValue({
      chequeNo: payment.chequeMode.chequeNo,
    });
    this.paymentModeForm.controls.mode.enable();
    this.paymentModeForm.controls.remark.enable();
    this.paymentModeForm.controls.amount.enable();
  }

  updatePaymentType(val) {
    this.paymentModeForm.patchValue({
      paymentType: val
    });
    this.sendPaymentData();
  }

  paymentMode($event: any) {
    const form = this.paymentModeForm;
    form.clearValidators();
    if ($event === 'CASH') {
    } else if ($event === 'CHEQUE') {
      form.get('chequeMode').get('chequeNo').setValidators([Validators.required]);
    } else if ($event === 'CARD') {
      form.get('cardMode').get('cardHolderName').setValidators([Validators.required]);
      form.get('cardMode').get('cardNo').setValidators([Validators.required]);
    } else if ($event === 'NEFT' || $event === 'RTGS' || $event === 'IMPS') {
      form.get('cardMode').get('cardHolderName').setValidators([Validators.required]);
      form.get('neftMode').get('accHolderName').setValidators([Validators.required]);
      form.get('neftMode').get('onlineTransactionNo').setValidators([Validators.required]);
    } else if ($event === 'UPI') {

    }
  }

  checkAndUpdateAmount() {
    const data = this.paymentModeForm.getRawValue();
    if (data.paymentType === 'collection') {
      if (+data.amount > (+this.formValue.finalNetAmount - +this.formValue.paidAmount)) {
        this.paymentModeForm.patchValue({
          amount: null
        });
        this.alertMsg = {
          message: 'Amount should less then or equal to balance',
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
        this.sendPaymentData();
        return;
      } else {
        this.sendPaymentData();
      }
    } else if (data.paymentType === 'refund') {
      if (+data.amount > (+this.formValue.finalNetAmount + +this.formValue.paidAmount)) {
        this.paymentModeForm.patchValue({
          amount: null
        });
        this.alertMsg = {
          message: 'Amount should less then or equal to balance',
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
        this.sendPaymentData();
        return;
      } else {
        this.sendPaymentData();
      }
    }

  }

  private loadBankList(searchTxt?) {
    this.bankList$ = concat(
      this.issueService.getBankDepoTypeDetails(searchTxt ? searchTxt : '', 1), // default items
      this.bankInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.issueService.getBankDepoTypeDetails(term ? term : (searchTxt ? searchTxt : ''), 1).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  sendPaymentData() {
    const obj = {
      paymentInfo: this.paymentModeForm.getRawValue(),
      paymentType: this.paymentModeForm.getRawValue().paymentType,
      createCreditNote: this.paymentModeForm.getRawValue().createCreditNote,
    }
    this.updateFormValue.emit(obj);
  }

  subcriptionEvent() {
    this.mastersService.$subUpdatePaymentRelatedData.pipe(takeUntil(this.$destroy)).subscribe((obj: any) => {
      if (obj) {
        this.formValue = obj;
        if (this.paymentModeForm) {
          if (this.formValue.netPayableAmount < 0 && this.formValue.consumptionId) {
            this.paymentModeForm.patchValue({
              paymentType: 'refund',
              createCreditNote: false,
            });
          } else if (this.formValue.netPayableAmount >= 0 && this.formValue.consumptionId) {
            this.paymentModeForm.patchValue({
              paymentType: 'collection',
              createCreditNote: false,
            });
            this.paymentModeForm.controls.mode.enable();
            this.paymentModeForm.controls.remark.enable();
            this.paymentModeForm.controls.amount.enable();
          }
        }
      }
    });
  }

}
