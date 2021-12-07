import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BillingService } from '../../services/billing.service';
import { concat, Observable, of, Subject } from 'rxjs';
import * as _ from 'lodash';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, takeUntil } from 'rxjs/operators';
import { BillPaymentModel, SaveBillPaymentModel } from '../../modals/bill-payment-model';
import { Console } from 'console';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { Constants } from 'src/app/config/constants';
import { UsersService } from "src/app/public/services/users.service";
import * as moment from 'moment';
import { nullSafeIsEquivalent } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-bill-payment',
  templateUrl: './bill-payment.component.html',
  styleUrls: ['./bill-payment.component.scss']
})
export class BillPaymentComponent implements OnInit {
  alertMsg: IAlert;
  existingPayment = [];
  newPayment: BillPaymentModel[] = [];
  payAmount: any = '0.00';
  billAmount: any = '0.00';
  remaingAmount: any = '0.00';
  totalAmount: any = '0.00';
  bankMaster: Array<Object>;
  paymentModes: Array<Object>;

  isCheque = false;
  isCard = false;
  isNEFT = false;
  isIMPS = false;
  isRTGS = false;
  isUPI = false;
  isBank = false;
  todayDate = new Date();

  isValid = true;
  flag = 1;
  selectedBank = null;
  destroy$ = new Subject();

  bankList$ = new Observable<any>();
  bankInput$ = new Subject<any>();

  @Input() patientData: any;
  @Output() saveBillPaymentEvent = new EventEmitter<any>();
  @Output() updateSettledAmtEvent = new EventEmitter<any>();

  paymentModeForm: FormGroup;
  submitted = false;
  paymentType="cashPayment";
  debitorTypeArray = [
    {
      id : 1,
      name : "Patient"
    },
    {
      id : 2,
      name : "Employee"
    },
    {
      id : 3,
      name : "Company"
    },
    {
      id : 4,
      name : "Insurance Company"
    }
  ]
  selectedDebitorType;
  selectedDebitor;
  debitorArray = [];
  staffArray = [];
  companyArray = [];
  insCompanyArray = [];
  amount: any;
  remark: any;
  debitNoteId = 0;
  voucherDate = moment(new Date()).format("DD/MM/YYYY");
  debitNoteInfo: any;
  isDebitNote = false;
  actionPopup = false;
  clearAmountTotal = 0;
  unClearAmountTotal = 0;
  constructor(
    public modal: NgbActiveModal,
    private fb: FormBuilder,
    public billingService: BillingService,
    private userService : UsersService
  ) { }

  ngOnInit(): void {
    this.paymentModes = this.billingService.PaymentMode;
    this.billAmount = _.round(parseFloat(this.patientData.billAmount|| 0), 2).toFixed(2);
    this.payAmount = _.round(parseFloat(this.patientData.billAmount || 0), 2).toFixed(2);
    this.remaingAmount = parseFloat(this.patientData.billAmount || 0).toFixed(2);
    this.getPatientPayDetails();
    this.createPaymentModeForm();
    this.loadBankList();
    //this.getStaffList();
    //this.loadCompanyList();
    //this.getDebitNote();
  }

  getStaffList(){
    this.userService.getStaffList().subscribe((response)=>{
      _.map(response,itr=>{
        itr.id = itr.EmpId,
        itr.name = itr.EmpFullname
        this.staffArray.push(itr);
      })
    })
  }

  loadCompanyList(){
    const param = {
      type: "COMPANY"
    }
    this.userService.GetCompanyList(param).subscribe((response)=>{
      _.map(response,itr=>{
        itr.id = itr.compId;
        itr.name = itr.compName
        this.companyArray.push(itr);
      })
    })

    const insParam = {
      type: "INSURANCE"
    }
    this.userService.GetCompanyList(insParam).subscribe((response)=>{
      _.map(response,itr=>{
        itr.id = itr.compId;
        itr.name = itr.compName
        this.insCompanyArray.push(itr);
      })
    })
  }

  getPatientPayDetails() {
    let param = {
      uhId: this.patientData.uhId,
      penId: this.patientData.penId,
      PpmId: 0,
      flag: 0,
      pbmId: this.patientData.billId || 0
    };
    this.billingService.GetPatientPayDetails(param).subscribe(res => {
      this.existingPayment = res;
      const unClearedChkList = _.filter(this.existingPayment, d => {
        return d.mode === 'CHEQUE' && d.chqcleared === 'N';
      })
      this.clearAmountTotal = _.sumBy(this.existingPayment, 'amount');
      this.unClearAmountTotal = _.sumBy(unClearedChkList, 'amount');
      this.clearAmountTotal = +this.clearAmountTotal - +this.unClearAmountTotal;
    });
  }

  private loadBankList(searchTxt?) {
    this.bankList$ = concat(
      this.billingService.getBankDepoTypeDetails(searchTxt ? searchTxt : '', this.flag), // default items
      this.bankInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.billingService.getBankDepoTypeDetails(term ? term : (searchTxt ? searchTxt : ''), this.flag).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  onBankChange(event) {

  }

  paymentMode($event: any) {
    this.isCheque = false; this.isCard = false; this.isNEFT = false; this.isUPI = false; this.isBank = false;this.isDebitNote = false;
    if ($event === 'CASH') {

    } else if ($event === 'CHEQUE') {
      this.isCheque = true;
      this.isBank = true;
    } else if ($event === 'CARD') {
      this.isCard = true;
    } else if ($event === 'NEFT' || $event === 'RTGS' || $event === 'IMPS') {
      this.isNEFT = true;
      this.isBank = true;
    } else if ($event === 'UPI') {
      this.isUPI = true;
    } else if ($event === 'DebitNote') {
      this.isDebitNote = true;
      if(this.debitNoteInfo){
        this.editDebitNote();
      }
    }
  }

  chequeDateChange(chequeDate) {
    this.paymentModeForm.get('chequeMode').get('chequeDate').setValue(chequeDate);
  }

  createPaymentModeForm() {
    this.submitted = false;
    this.paymentModeForm = this.fb.group({
      id: null,
      mode: ['', Validators.required],
      amount: ['', Validators.required],
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
        chequeNo: [''],
        chequeDate: [new Date()]
      }),
      debitNoteMode:this.fb.group({
        debitorType: [''],
        debitor: ['']
      }),
      bankName: [null],
      branchName: [''],
      ifscCode: [''],
      remark: ['']
    });
    this.paymentModeForm.get('chequeMode').get('chequeDate').setValue(new Date());
    this.paymentModeForm.controls['mode'].setValue('CASH', { onlySelf: true });
    this.paymentMode('CASH');

    this.subscribePaymentFormValidation();
  }

  subscribePaymentFormValidation() {
    this.paymentModeForm.get('mode').valueChanges.subscribe(mode => {
      this.paymentModeForm.get('neftMode').get('accHolderName').clearValidators();
      this.paymentModeForm.get('neftMode').get('onlineTransactionNo').clearValidators();
      this.paymentModeForm.get('bankName').clearValidators();
      this.paymentModeForm.get('branchName').clearValidators();
      this.paymentModeForm.get('ifscCode').clearValidators();
      this.paymentModeForm.get('chequeMode').get('chequeNo').clearValidators();
      this.paymentModeForm.get('chequeMode').get('chequeDate').clearValidators();
      this.paymentModeForm.get('upiMode').get('upiTransactionNo').clearValidators();
      this.paymentModeForm.get('cardMode').get('cardHolderName').clearValidators();
      this.paymentModeForm.get('cardMode').get('cardNo').clearValidators();

      // apply validation
      if (mode == 'CHEQUE' || mode == 'NEFT' || mode == 'RTGS' || mode == 'IMPS') {
        if (mode == 'CHEQUE') {
          this.paymentModeForm.get('chequeMode').get('chequeNo').setValidators(Validators.required);
          this.paymentModeForm.get('chequeMode').get('chequeDate').setValidators(Validators.required);
        }
        this.paymentModeForm.get('bankName').setValidators(Validators.required);
        this.paymentModeForm.get('branchName').setValidators(Validators.required);

        if (mode == 'NEFT' || mode == 'RTGS' || mode == 'IMPS') {
           this.paymentModeForm.get('ifscCode').setValidators(Validators.required);
          this.paymentModeForm.get('neftMode').get('accHolderName').setValidators(Validators.required);
          this.paymentModeForm.get('neftMode').get('onlineTransactionNo').setValidators(Validators.required);
        }
      } else if (mode == 'CARD') {
        this.paymentModeForm.get('cardMode').get('cardHolderName').setValidators(Validators.required);
        this.paymentModeForm.get('cardMode').get('cardNo').setValidators(Validators.required);
      } else if (mode == 'UPI') {
        this.paymentModeForm.get('cardMode').get('upiTransactionNo').setValidators(Validators.required);
      }

      // update value
      this.paymentModeForm.get('neftMode').get('accHolderName').updateValueAndValidity();
      this.paymentModeForm.get('neftMode').get('onlineTransactionNo').updateValueAndValidity();
      this.paymentModeForm.get('bankName').updateValueAndValidity();
      this.paymentModeForm.get('branchName').updateValueAndValidity();
      this.paymentModeForm.get('ifscCode').updateValueAndValidity();
      this.paymentModeForm.get('chequeMode').get('chequeNo').updateValueAndValidity();
      this.paymentModeForm.get('chequeMode').get('chequeDate').updateValueAndValidity();
      this.paymentModeForm.get('upiMode').get('upiTransactionNo').updateValueAndValidity();
      this.paymentModeForm.get('cardMode').get('cardHolderName').updateValueAndValidity();
      this.paymentModeForm.get('cardMode').get('cardNo').updateValueAndValidity();
    });
  }

  addNewPaymentRow() {
    this.submitted = true;
    const paymentFormVal = this.paymentModeForm.value;
    if (this.paymentModeForm.invalid) {
      this.alertMsg = {
        message: parseFloat(paymentFormVal.amount || 0) == 0 ? 'Amount cannot be left blank' : 'Please fill required fields',
        messageType: 'warning',
        duration: Constants.ALERT_DURATION
      };
      return;
    }
    this.validateBillAmount(paymentFormVal.amount, paymentFormVal.id);
    if (!this.isValid) return;

    let obj = new BillPaymentModel();
    obj.id = paymentFormVal.id;
    obj.billMainId = this.patientData.billId || 0;
    obj.billNo = this.patientData.billNo || '';
    obj.billAmount = _.round(parseFloat(this.billAmount || 0), 2).toFixed(2);

    obj.mode = paymentFormVal.mode;
    obj.amount = _.round(parseFloat(paymentFormVal.amount), 2).toFixed(2);
    obj.transactionDate = "";
    obj.remark = paymentFormVal.remark;

    obj.bankId = paymentFormVal.bankName?.Id;
    obj.bankName = paymentFormVal.bankName?.Name;
    obj.ifscCode = paymentFormVal.ifscCode;
    obj.branchName = paymentFormVal.branchName;

    obj.chequeNo = paymentFormVal.chequeMode.chequeNo;
    obj.chequeDate = paymentFormVal.chequeMode.chequeDate;

    obj.cardHolderName = paymentFormVal.cardMode.cardHolderName;
    obj.cardNo = paymentFormVal.cardMode.cardNo;

    obj.accHolderName = paymentFormVal.neftMode.accHolderName;
    obj.onlineTransactionNo = paymentFormVal.neftMode.onlineTransactionNo;

    obj.upiTransactionNumber = paymentFormVal.upiMode.upiTransactionNo;
    obj.debitorType = paymentFormVal.debitNoteMode?.debitorType || '';
    obj.debitor = paymentFormVal.debitNoteMode?.debitor || '';

    const checkIdx = _.findIndex(this.newPayment, d => {
      return d.id === paymentFormVal.id;
    });
    if (checkIdx != -1) {
      this.newPayment[checkIdx] = obj;
    } else {
      obj.id = (this.newPayment.length) + 1;
      this.newPayment.push(obj);
    }
    //this.paymentModeForm.reset();
    this.createPaymentModeForm();
    this.paymentModeForm.controls['mode'].setValue('CASH', { onlySelf: true });
    this.paymentMode('CASH');
    this.isDebitNote = false;
  }

  editNewPayment(item, indx) {
    this.paymentModeForm = this.fb.group({
      id: [item.id],
      mode: [item.mode, Validators.required],
      amount: [item.amount, Validators.required],
      cardMode: this.fb.group({
        cardHolderName: [item.cardHolderName],
        cardNo: [item.cardNo]
      }),
      neftMode: this.fb.group({
        accHolderName: [item.accHolderName],
        onlineTransactionNo: [item.onlineTransactionNo]
      }),
      upiMode: this.fb.group({
        upiTransactionNo: [item.upiTransactionNo]
      }),
      chequeMode: this.fb.group({
        chequeNo: [item.chequeNo],
        chequeDate: [new Date(item.chequeDate)]
      }),
      bankName: item.bankId ? [{
        Id: item.bankId,
        Name: item.bankName
      }] : [null],
      branchName: [item.branchName],
      ifscCode: [item.ifscCode],
      remark: [item.remark]
    });

    this.subscribePaymentFormValidation();
    this.paymentModeForm.get('chequeMode').get('chequeDate').setValue(new Date(item.chequeDate));
    this.paymentModeForm.get('mode').setValue(item.mode);
    this.paymentMode(item.mode);
  }

  deleteNewPayment(index) {
    this.newPayment.splice(index, 1);
    this.validateBillAmount(0);
  }

  onPaymentChange(event: any) {
    this.payAmount = parseFloat(event || 0).toFixed(2);
    if (parseFloat(this.payAmount) < 0) {
      this.payAmount = parseFloat(this.billAmount).toFixed(2);
      this.showValidationMsg('Payment amount should not be in minus');
    }
    else if (parseFloat(this.payAmount) > parseFloat(this.billAmount)) {
      this.payAmount = parseFloat(this.billAmount).toFixed(2);
      this.showValidationMsg('Payment amount should not be more than ₹' + this.billAmount);
    }
    else if (parseFloat(this.totalAmount) > 0 && parseFloat(this.totalAmount) > parseFloat(this.payAmount)) {
      this.payAmount = parseFloat(this.totalAmount).toFixed(2);
      this.showValidationMsg('Payment amount should not be less than ₹' + this.totalAmount + '/- because new payments already added');
    }
    this.remaingAmount = _.round(parseFloat(this.payAmount) - parseFloat(this.totalAmount), 2).toFixed(2);
  }

  validateBillAmount(amount: number, formId?) {
    this.isValid = true;
    let sum: number = 0;
    const payAmt: number = +amount;
    if (payAmt < 0) {
      this.isValid = false;
      this.alertMsg = {
        message: "Amount should not be in minus",
        messageType: 'warning',
        duration: Constants.ALERT_DURATION
      };
    }

    _.forEach(this.newPayment, (val, k) => {
      const amt: number = parseFloat(val.amount);
      return val.id != formId ? sum += amt : 0;
    });
    sum += payAmt;

    if (sum > parseFloat(this.payAmount)) {
      this.isValid = false;
      this.alertMsg = {
        message: "Payment should not be more than ₹" + this.remaingAmount,
        messageType: 'warning',
        duration: Constants.ALERT_DURATION
      };
    } else {
      this.remaingAmount = (parseFloat(this.payAmount || 0) - sum).toFixed(2);
      this.totalAmount = (sum || 0).toFixed(2);
    }
  }

  showValidationMsg(msg) {
    this.alertMsg = {
      message: msg,
      messageType: 'warning',
      duration: Constants.ALERT_DURATION
    };
  }

  getDebitNote(){
    const param = {
      billId: this.patientData.billId || 0,
    }

    this.billingService.getDabitNote(param).subscribe((response)=>{
      this.debitNoteId = response.debitNoteId;
      this.amount = _.round(parseFloat(response.amount || 0), 2);
      this.selectedDebitorType = response.debitorTypeId;
      this.debitNoteInfo = response;

      if(this.selectedDebitorType === 1){
        this.debitorArray = this.staffArray;
      } else if(this.selectedDebitorType === 2){
        this.debitorArray = this.companyArray;
      } else if(this.selectedDebitorType === 3){
        this.debitorArray = this.insCompanyArray;
      } else {
        this.selectedDebitor = null;
        this.debitorArray = [];
      }

      this.selectedDebitor = response.debitorId;
      this.remark = response.remark;
    })
  }

  saveBillPayment() {
    let tempObj = [];
    if(this.newPayment.length === 0) {
      this.notifyAlertMessage({
        msg: "Please add atleast 1 payment.",
        class: 'danger',
      });
      return;
    }

    // check total amount matched with payment amount.
    if (this.remaingAmount != 0) {
      this.notifyAlertMessage({
        msg: "Payment amount not matching total amount to pay.",
        class: 'danger',
      });
      return;
    }

    _.map(this.newPayment, (d: any) => {
      const billPaymentObj = new SaveBillPaymentModel();
      if(d.mode !== "DebitNote"){
        billPaymentObj.generateObject(d);
        tempObj.push({ ...billPaymentObj });
      }
    });

    const debitorObj = _.filter(this.newPayment,itr=>{
        return (itr.mode === "DebitNote")
    })

    const saveObj = {
      PpmUhid: this.patientData.uhId,
      PpmPenId: this.patientData.penId,
      PpmAmount: this.payAmount,
      visitType: this.patientData.visitType,
      paymentDetailViewModel: tempObj,
      DebitNoteSaveModel: debitorObj.length === 0 ? null : {
          debitNoteId: this.debitNoteInfo ? this.debitNoteInfo?.debitNoteId : 0,
          debitorTypeId: debitorObj[0]?.debitorType ? debitorObj[0]?.debitorType : null,
          debitorId: debitorObj[0]?.debitor ? debitorObj[0]?.debitor : null,
          amount: debitorObj[0]?.amount,
          oldAmount: this.debitNoteInfo ? this.debitNoteInfo?.amount : 0,
          remark: debitorObj[0]?.remark
      }
    };
    this.billingService.AddEditPatientPaymentDetails(saveObj).subscribe(res => {
      if (res.status_message === 'Success') {
        // reload voucher and bill details...
        this.saveBillPaymentEvent.emit(res);
        this.modal.dismiss();
      } else {
        this.notifyAlertMessage({
          msg: res.message,
          class: 'danger',
        });
      }
    });
  }

  onChangePaymentMethod(paymentType){
    this.paymentType = paymentType;
  }

  onDebitorTypeChange(){
    if(this.selectedDebitorType === 1){
      const patientInfo = [
        {
          id : this.patientData?.patientInfo?.penId,
          name : this.patientData?.patientInfo?.fullName
        }
      ]
      this.debitorArray = patientInfo;
      // this.selectedDebitor = this.debitorArray[0].id;
    } else if(this.selectedDebitorType === 2){
      // this.selectedDebitor = null;
      this.debitorArray = this.staffArray;
    } else if(this.selectedDebitorType === 3){
      // this.selectedDebitor = null;
      this.debitorArray = this.companyArray;
    } else if(this.selectedDebitorType === 4){
      // this.selectedDebitor = null;
      this.debitorArray = this.insCompanyArray;
    } else {
      this.amount = null;
      this.selectedDebitor = null;
      this.debitorArray = [];
    }
    this.selectedDebitor = this.debitNoteInfo ? this.debitNoteInfo.debitorId : this.debitorArray[0]?.id;
  }

  editDebitNote(){
    this.isDebitNote = true;
    this.paymentModeForm.patchValue({
      mode: "DebitNote",
      amount : this.debitNoteInfo.amount,
      debitNoteMode:this.fb.group({
        debitorType: this.debitNoteInfo.debitorTypeId,
      }),
      remark : this.debitNoteInfo.remark
    })
    this.onDebitorTypeChange();

    this.paymentModeForm.patchValue({
      debitNoteMode:this.fb.group({
        debitor: this.debitNoteInfo.debitorId
      }),
    })
  }

  showHideActionPopup(){
    this.actionPopup = !this.actionPopup;
  }

  saveDebitNote(){
    if(this.selectedDebitorType && this.selectedDebitor && this.amount){
      if(parseFloat(this.amount) > parseFloat(this.payAmount)) {
        this.notifyAlertMessage({
          msg: "Debit amount is greater than pay amount.",
          class: 'danger',
        });
        return false;
      }
      const param = {
        debitNoteId: this.debitNoteId,
        voucherDate : new Date(),
        billId: this.patientData.billId || 0,
        debitorTypeId: this.selectedDebitorType,
        debitorId: this.selectedDebitor,
        amount: +this.amount,
        remark: this.remark,
        settledAmount: this.patientData.settledAmt || 0,
        netPayableAmount : this.patientData.settledAmt || 0
      }
      this.billingService.saveDabitNote(param).subscribe((response)=>{
        this.notifyAlertMessage({
          msg: response.message,
          class: 'success',
        });

        this.updateSettledAmtEvent.emit(param);
        this.modal.dismiss();
      })
    }
  }

  notifyAlertMessage(data): void {
    this.alertMsg = {
      message: data.msg,
      messageType: data.class,
      duration: Constants.ALERT_DURATION
    };
  }
}
