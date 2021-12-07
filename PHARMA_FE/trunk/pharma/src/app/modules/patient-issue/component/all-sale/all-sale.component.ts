import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectComponent } from '@ng-select/ng-select';
import * as _ from 'lodash';
import * as moment from 'moment';
import { concat, Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { Constants } from 'src/app/config/constants';
import { IssueService } from 'src/app/modules/issue/services/issue.service';
import { MastersService } from 'src/app/modules/masters/services/masters.service';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { AuthService } from 'src/app/public/services/auth.service';
import { CommonService } from 'src/app/public/services/common.service';
import { MappingService } from "../../../../public/services/mapping.service";
import { PatientVoucherItemListComponent } from '../patient-voucher-item-list/patient-voucher-item-list.component';
import { ShowIndentItemDataComponent } from '../show-indent-item-data/show-indent-item-data.component';
import { ShowPatientPrescriptionComponent } from '../show-patient-prescription/show-patient-prescription.component';
@Component({
  selector: 'app-all-sale',
  templateUrl: './all-sale.component.html',
  styleUrls: ['./all-sale.component.scss']
})
export class AllSaleComponent implements OnInit {
  @ViewChild('patientSelection') selectPat: NgSelectComponent;
  @ViewChild('deptSelection') selectDept: NgSelectComponent;
  @ViewChild('counterPatientSelection') selectCounterPatient: NgSelectComponent;
  alertMsg: IAlert;
  allTypeSaleForm: FormGroup;


  saleTypeList = [
    {
      id: 1,
      name: 'Hospital Sale'
    },
    {
      id: 2,
      name: 'Counter Sale'
    }
  ];
  counterTypeList = [
    {
      id: 1,
      name: 'Patient'
    },
    {
      id: 2,
      name: 'Debtor'
    }
  ];
  patientType = [
    {
      id: 1,
      name: 'OP',
      count: 0,
    },
    {
      id: 2,
      name: 'IP',
      count: 0,
    },
    {
      id: 3,
      name: 'Indent',
      count: 0,
    }
  ];
  voucherTypeList = [{
    id: 1,
    name: 'CASH'
  },
  {
    id: 2,
    name: 'CREDIT'
  }];

  allSaleList = [
    {
      name: 'Hospital Sale - OP',
      saleType: this.saleTypeList[0],
      patientType: this.patientType[0],
      counterType: null,
    },
    {
      name: 'Hospital Sale - IP',
      saleType: this.saleTypeList[0],
      patientType: this.patientType[1],
      counterType: null,
    },
    {
      name: 'Hospital Sale - INDENT',
      saleType: this.saleTypeList[0],
      patientType: this.patientType[2],
      counterType: null,
    },
    {
      name: 'Counter Sale - Patient',
      saleType: this.saleTypeList[1],
      patientType: null,
      counterType: this.counterTypeList[0],
    },
    {
      name: 'Counter Sale - Debtor',
      saleType: this.saleTypeList[1],
      patientType: null,
      counterType: this.counterTypeList[1],
    }
  ];
  voucherTypeListClone = [];
  storeId;
  isVoucherDropDownVisible = false;
  patientList$ = new Observable<any>();
  patientListInput$ = new Subject<any>();
  deptList$ = new Observable<any>();
  deptListInput$ = new Subject<any>();
  patientList: Array<any> = [];
  voucherList = [];
  showPatientSearchBox: boolean;
  showDeptSearchBox: boolean;
  showCounterPatientSearchBox: boolean;
  counterList = [];
  activeCounterIndex = 0;
  itemListOperation = null;
  selectedVoucherItemList = [];
  isItemGridEditingAllow = false;
  batchSetting = false;
  selctedCounterItemList = [];
  prescriptionItemListSelected = [];
  prescriptionItemList = [];
  indentItemListSelected = [];
  indentItemList = [];
  loadForm = false;
  isPrescriptionAdded = false;
  isIndentAdded = false;
  clearPatOrDebtor = null;
  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private issueService: IssueService,
    private mastersService: MastersService,
    private modalService: NgbModal,
    private mappingService: MappingService,
    private router: Router,
    private commonService: CommonService,
  ) { }

  ngOnInit(): void {
    this.commonService.routeChanged(this.activatedRoute);
    this.voucherTypeListClone = [...this.voucherTypeList];
    this.activatedRoute.paramMap.subscribe(data => {
      const consumptionId = +data.get('id');
      const token = data.get('token');
      const loadFrom = data.get('loadFrom');
      this.getVoucherPrescriptionCount().then(res => {
        this.loadFormAndData(consumptionId);
      });
    });
  }

  loadFormAndData(consumptionId) {
    this.storeId = this.authService.getLoginStoreId();
    this.showPatientSearchBox = false;
    this.showDeptSearchBox = false;
    this.showCounterPatientSearchBox = false;
    this.createSaleform();
    this.loadPatientList();
    this.updateCounterList();
    this.focusPatSelection();
    if (+consumptionId !== -1) { // update
      this.updateConsumption(consumptionId).then(res => { });
    } else { // add
      this.loadPatientList();
      this.showPatientSearchBox = false;
    }
  }

  updateCounterList() {
    if (this.counterList.length === 0) {
      for (let i = 0; i < 10; i++) {
        const obj = {
          itemList: [],
          formData: this.allTypeSaleForm.getRawValue()
        };
        this.counterList.push({ ...obj });
      }
    }
  }

  createSaleform() {
    this.selctedCounterItemList.length = 0;
    this.allTypeSaleForm = this.fb.group({
      counter: [0],
      allSaleType: [this.allSaleList[0]],
      saleType: [this.saleTypeList[0]],
      patientType: [this.patientType[0]],
      counterType: [this.counterTypeList[0]],
      accountType: [this.mastersService.accountTypeList[0]],
      voucherType: [this.voucherTypeList[0]],
      consumptionId: [0],
      consumptionNo: [''],
      consumptionDate: [new Date()],
      storeId: [this.storeId],
      totalAmount: [0],
      remark: [''],
      isTakePrint: [false],
      patientId: [null],
      patientName: [null],
      patientMobile: [null],
      patientAddress: [null],
      selectedPatient: [null],
      deptId: [null],
      selectedDept: [null],
      selectedVoucher: [0],
      discountPercent: [0],
      discountAmount: [0],
      netAmount: [0],
      showTotal: [false],
      billAmount: [0],
      discountType: 'percent',
      finalNetAmount: [0],
      advanceAdjustmentAmt: [0],
      netPayableAmount: [0],
      paymentInfo: null,
      accountId: null,
      accountName: null,
      accountContact: null,
      accountData: null,
      advanceAccountAmount: 0,
      advPaymentSettlement: [],
      isEditMode: false,
      paidAmount: 0,
      createCreditNote: false,
      paymentType: 'collection'
    });
    this.loadForm = true;
  }

  onAllSaleTypeChange(val) {
    this.clearForm();
    if (!val) {
      return;
    }
    this.allTypeSaleForm.patchValue({ allSaleType: val });
    this.allTypeSaleForm.patchValue({ saleType: val.saleType });
    this.allTypeSaleForm.patchValue({ patientType: val.patientType });
    this.allTypeSaleForm.patchValue({ counterType: val.counterType });
    if (val.patientType && !val.counterType) {
      this.onPatientTypeChange(val.patientType);
    } else if (!val.patientType && val.counterType) {
      this.onCounterTypeChange(val.counterType);
    }
    if (val.saleType.id === 1) {
      this.loadPatientList();
      this.enableCounterPatientSearch(false);
      this.showCounterPatientSearchBox = false;
    } else if (val.saleType.id === 2) {
      this.showCounterPatientSearchBox = true;
      this.isItemGridEditingAllow = true;
      this.enableCounterPatientSearch(true);
    }
  }

  saveSaleData() {
    const formValue = { ...this.allTypeSaleForm.getRawValue() };
    formValue.itemList = this.selctedCounterItemList.filter(d => {
      return d.itemId;
    });
    if (formValue.itemList.length === 0) {
      this.alertMsg = {
        message: 'Please Add Item',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
      return;
    } else if (formValue.saleType && formValue.saleType.id === 1 && (formValue.patientType && formValue.patientType.id === 1 || formValue.patientType === 2) && !formValue.patientId) {
      this.alertMsg = {
        message: 'Please Select Patient',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
      return;
    } else if (formValue.saleType && formValue.saleType.id === 1 && formValue.patientType && formValue.patientType.id === 3 && !formValue.deptId) {
      this.alertMsg = {
        message: 'Please Select Department',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
      return;
    } else if (formValue.saleType && formValue.saleType.id === 2 && formValue.counterType && formValue.counterType.id === 1 && !formValue.patientName) {
      this.alertMsg = {
        message: 'Please Select Or Add Patient',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
      return;
    } else if (formValue.saleType && formValue.saleType.id === 2 && formValue.counterType && formValue.counterType.id === 2 && !formValue.accountName) {
      this.alertMsg = {
        message: 'Please Select Or Add Account',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
      return;
    } else if (formValue.saleType && formValue.saleType.id === 2 && formValue.counterType && formValue.counterType.id === 2 && formValue.accountName && !formValue.accountId) {
      this.alertMsg = {
        message: 'Please Save Acount Value!',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
      this.mastersService.openAccountPopup(true);
      return;
    } else if (formValue.saleType && formValue.saleType.id === 2 && formValue.counterType && formValue.counterType.id === 2 && formValue.accountName && formValue.accountId && !formValue.patientId) {
      this.alertMsg = {
        message: 'Please Select Or Add Patient',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
      this.mastersService.openAccountPatientPopup(true);
      return;
    } else if (!formValue.consumptionId && +formValue.netAmount <= 0) {
      this.alertMsg = {
        message: 'Please Check Items',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
      return;
    }
    const saveObj = this.generateSaveObj();
    this.issueService.savePatientIssue(saveObj).subscribe(res => {
      if (res.status_message === 'Success') {
        this.alertMsg = {
          message: res.message,
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        this.clearForm();
        this.updateDefaultAfterSave();
      }
    });
  }

  updateDefaultAfterSave() {
    this.allTypeSaleForm.patchValue({
      allSaleType: this.allSaleList[0],
      counter: this.activeCounterIndex,
      saleType: this.saleTypeList[0],
      patientType: this.patientType[0],
      counterType: this.counterTypeList[0],
      accountType: this.mastersService.accountTypeList[0],
      voucherType: this.voucherTypeList[0],
      consumptionId: 0,
      consumptionNo: '',
      consumptionDate: new Date(),
      storeId: this.storeId,
      totalAmount: 0,
      remark: '',
      isTakePrint: false,
      patientId: null,
      patientName: null,
      patientMobile: null,
      patientAddress: null,
      selectedPatient: null,
      deptId: null,
      selectedDept: null,
      selectedVoucher: 0,
      discountPercent: 0,
      discountAmount: 0,
      netAmount: 0,
      showTotal: false,
      billAmount: null,
      discountType: 'percent',
      finalNetAmount: 0,
      advanceAdjustmentAmt: 0,
      netPayableAmount: 0,
      paymentInfo: null,
      accountId: null,
      accountName: null,
      accountContact: null,
      accountData: null,
      advanceAccountAmount: 0,
      createCreditNote: true,
      editMode: false,
      paymentType: 'collection'
    });
    this.enableAllFieldInEditCase();
    // this.router.navigate(['/inventory/issue/patient/allsale/-1']);
  }

  generateSaveObj() {
    const formValue = { ...this.allTypeSaleForm.getRawValue() };
    let visitType = null;
    if (formValue.saleType && formValue.saleType.id === 1
      && formValue.patientType && (formValue.patientType.id === 1 || formValue.patientType.id === 2) &&
      formValue.selectedPatient && formValue.selectedPatient.visitType) {
      visitType = formValue.selectedPatient.visitType;
    } else if (formValue.saleType && formValue.saleType.id === 1
      && formValue.patientType && formValue.patientType.id === 3) {
      visitType = 'INDENT';
    } else if (formValue.saleType && formValue.saleType.id === 2
      && formValue.counterType && formValue.counterType.id === 1) {
      visitType = 'PATIENT';
    } else if (formValue.saleType && formValue.saleType.id === 2
      && formValue.counterType && formValue.counterType.id === 2) {
      visitType = 'DEBTOR';
    }
    let saleType = '';
    if (formValue.saleType && formValue.saleType.id === 1) {
      saleType = 'HospitalSale';
    } else if (formValue.saleType && formValue.saleType.id === 2) {
      saleType = 'CounterSale';
    }
    const obj = {
      consumptionId: formValue.consumptionId ? formValue.consumptionId : 0,
      consumptionDate: formValue.consumptionDate ? formValue.consumptionDate : new Date(),
      storeId: this.storeId,
      visitType: visitType,
      saleType: saleType,
      counterId: formValue.counter + 1,
      patientType: formValue.patientType ? formValue.patientType.id : '',
      deptID: formValue.deptId ? formValue.deptId : 0,
      accountId: formValue.accountId ? formValue.accountId : 0,
      patientId: formValue.patientId ? formValue.patientId : 0,
      voucherType: formValue.voucherType ? formValue.voucherType.name : 0,
      visitNo: formValue.selectedPatient ? formValue.selectedPatient.visitNo : null,
      totalAmount: formValue.billAmount ? formValue.billAmount : 0,
      discountPercent: formValue.discountPercent ? formValue.discountPercent : 0,
      discountAmount: formValue.discountAmount ? formValue.discountAmount : 0,
      advanceAdjusted: formValue.advanceAdjustmentAmt ? formValue.advanceAdjustmentAmt : 0,
      advPaymentSettlement: formValue.advPaymentSettlement || [],
      netTotalAmount: formValue.netAmount ? formValue.netAmount : 0,
      balanceAmount: formValue.netPayableAmount ? formValue.netPayableAmount : 0,
      paidAmount: formValue.paidAmount ? formValue.paidAmount : 0,
      remark: formValue.remark ? formValue.remark : null,
      paymentInfo: this.paymentInfo(formValue.paymentInfo),
      patientName: formValue.patientName || '',
      patientContact: formValue.patientMobile || '',
      patientAddress: formValue.patientAddress || '',
      createCreditNote: formValue.createCreditNote || false,
      paymentType: formValue.paymentType,
      itemlist: this.selctedCounterItemList.filter(d => {
        return d.itemId;
      })
    }
    if (obj.paymentInfo && +obj.paymentInfo.amount && formValue.paymentType === 'collection') {
      obj.paidAmount = +obj.paidAmount + +obj.paymentInfo.amount;
    } else if (obj.paymentInfo && +obj.paymentInfo.amount && formValue.paymentType === 'refund') {
      obj.paidAmount = +obj.paidAmount - +obj.paymentInfo.amount;
    }
    return { ...obj };
  }

  bindPaymentInfo(payment) {
    const obj = {
      mode: null,
      bankName: null,
      branchName: null,
      ifscCode: null,
      amount: null,
      remark: null,
      cardMode: {
        cardHolderName: null,
        cardNo: null,
      },
      neftMode: {
        accHolderName: null,
        onlineTransactionNo: null,
      },
      upiMode: {
        upiTransactionNo: null,
      },
      chequeMode: {
        chequeNo: null,
      }
    };
    if (payment) {
      obj.mode = payment.modeId ? payment.modeId : null;
      obj.cardMode.cardHolderName = payment.cardHolderName ? payment.cardHolderName : null;
      obj.cardMode.cardNo = payment.cardMode ? payment.cardNo : null;
      obj.neftMode.accHolderName = payment.accHolderName ? payment.accHolderName : null;
      obj.neftMode.onlineTransactionNo = payment.onlineTransactionNo ? payment.onlineTransactionNo : null;
      obj.upiMode.upiTransactionNo = payment.upiTransactionNo ? payment.upiTransactionNo : null;
      obj.chequeMode.chequeNo = payment.chequeNo ? payment.chequeNo : null;
      obj.bankName = payment.bankInfo ? payment.bankInfo : null;
      obj.branchName = payment.branchName ? payment.branchName : null;
      obj.ifscCode = payment.ifscCode ? payment.ifscCode : null;
      obj.amount = payment.amount ? payment.amount : 0;
      obj.remark = payment.remark ? payment.remark : null;
    }
    return { ...obj };
  }

  paymentInfo(payment) {
    if (!payment) {
      return null;
    }
    let obj = null;
    if (payment && payment.mode && payment.amount) {
      obj = {
        modeId: null,
        cardHolderName: null,
        cardNo: null,
        accHolderName: null,
        onlineTransactionNo: null,
        upiTransactionNo: null,
        chequeNo: null,
        bankInfo: null,
        branchName: null,
        ifscCode: null,
        amount: null,
        remark: null,
      };
      obj.modeId = payment.mode ? payment.mode : null;
      obj.cardHolderName = payment.cardMode && payment.cardMode.cardHolderName ? payment.cardMode.cardHolderName : null;
      obj.cardNo = payment.cardMode && payment.cardMode.cardNo ? payment.cardMode.cardNo : null;
      obj.accHolderName = payment.neftMode && payment.neftMode.accHolderName ? payment.neftMode.accHolderName : null;
      obj.onlineTransactionNo = payment.neftMode && payment.neftMode.onlineTransactionNo ? payment.neftMode.onlineTransactionNo : null;
      obj.upiTransactionNo = payment.upiMode && payment.upiMode.upiTransactionNo ? payment.upiMode.upiTransactionNo : null;
      obj.chequeNo = payment.chequeMode && payment.chequeMode.chequeNo ? payment.chequeMode.chequeNo : null;
      obj.bankInfo = payment.bankName ? payment.bankName : null;
      obj.branchName = payment.branchName ? payment.branchName : null;
      obj.ifscCode = payment.ifscCode ? payment.ifscCode : null;
      obj.amount = payment.amount ? payment.amount : 0;
      obj.remark = payment.remark ? payment.remark : null;
    }
    return obj;
  }

  onSaleTypeChange(sale) {
    this.clearForm();
    this.allTypeSaleForm.patchValue({ saleType: sale });
    if (sale.id === 1) {
      this.allTypeSaleForm.patchValue({ patientType: this.patientType[0] });
      this.loadPatientList();
      this.enableCounterPatientSearch(false);
      this.showCounterPatientSearchBox = false;
    } else {
      this.showCounterPatientSearchBox = true;
      this.isItemGridEditingAllow = true;
      this.allTypeSaleForm.patchValue({
        patientType: this.patientType[0]
      });
      this.enableCounterPatientSearch(true);
    }
  }

  onPatientTypeChange(type) {
    if (type.id === 1 || type.id === 2) {
      this.loadPatientList();
      this.enablePatientSearch(true);
      this.focusPatSelection();
    } else if (type.id === 3) {
      this.loadDeptList();
      this.enableDeptSearch(true);
      this.focusDeptSelection();
    }
  }

  onCounterTypeChange(type) {
    if (type.id === 1) {
      this.allTypeSaleForm.patchValue({
        accountType: null,
        selectedPatient: null,
        patientId: null,
        accountId: null,
        accountData: null,
        accountName: null,
        accountContact: null,
      });
      this.clearPatOrDebtor = 'debtor';
    } else if (type.id === 2) {
      this.allTypeSaleForm.patchValue({
        accountType: this.mastersService.accountTypeList[0],
        selectedPatient: null,
        patientId: null,
        patientName: null,
        patientMobile: null,
        accountId: null,
        accountData: null,
        accountName: null,
        accountContact: null,
      });
      this.clearPatOrDebtor = 'patient';
    }
    this.clearPatOrDebtor = null;
    this.isItemGridEditingAllow = true;
  }

  onVoucherTypeChange(val) {
    if (!val) {
      this.allTypeSaleForm.patchValue({ voucherType: this.voucherTypeList[0] });
    }
  }

  onPatientChange(event): void {
    if (event) {
      // this.allTypeSaleForm.patchValue({ patientId: null });
      this.allTypeSaleForm.patchValue({ selectedPatient: event });
      this.showPatientSearchBox = false;
      this.isItemGridEditingAllow = true;
      this.getAllVoucherList().subscribe();
      this.getPrescriptionData().then(res => {
        this.getAdvanceAmountDetailsForAccount().then(res1 => {
          if (this.prescriptionItemList && this.prescriptionItemList.length) {
            this.openPatientPrescriptionPopup();
          }
        });
      });
    } else {
      this.allTypeSaleForm.patchValue({ patientId: null });
      this.allTypeSaleForm.patchValue({ selectedPatient: null });
      this.showPatientSearchBox = true;
      this.isItemGridEditingAllow = false;
    }
    this.updateVoucherOption();
    this.emptyItemGrid();
  }

  updateVoucherOption() {
    const formValue = this.allTypeSaleForm.getRawValue();
    if (formValue.selectedPatient && formValue.selectedPatient.visitType === 'IP') {
      this.voucherTypeList = [...this.voucherTypeListClone];
    } else if (formValue.selectedPatient && formValue.selectedPatient.visitType === 'OP' &&
      !moment(moment().format('YYYY/MM/DD')).isSame(moment(moment(formValue.selectedPatient.admissionDate).format('YYYY/MM/DD')))) {
      this.voucherTypeList = [this.voucherTypeListClone[0]];
      this.allTypeSaleForm.patchValue({ voucherType: this.voucherTypeListClone[0] });
    } else if (formValue.selectedPatient && formValue.selectedPatient.visitType === 'OP' &&
      moment(moment().format('YYYY/MM/DD')).isSame(moment(moment(formValue.selectedPatient.admissionDate).format('YYYY/MM/DD')))) {
      this.voucherTypeList = [...this.voucherTypeListClone];
    }
  }

  onDeptChange(event): void {
    if (event) {
      this.allTypeSaleForm.patchValue({ selectedDept: event });
      // this.getAllVoucherList().subscribe();
      this.showDeptSearchBox = false;
      this.isItemGridEditingAllow = true;
      this.getIndentData().then(res => {
        if (this.indentItemList && this.indentItemList.length) {
          this.openIndentItemPopup();
        }
      });
    } else {
      this.allTypeSaleForm.patchValue({ selectedDept: null });
      this.showDeptSearchBox = true;
      this.isItemGridEditingAllow = false;
    }
    this.emptyItemGrid();
  }

  getSelectedVoucher(event) {
    if (event && event.consumptionId !== 0) {
      if (this.allTypeSaleForm.getRawValue().consumptionId !== event.consumptionId) {
        this.allTypeSaleForm.patchValue({ selectedVoucher: event.consumptionId });
        this.updateConsumption(event.consumptionId).then(res => { });
      }
    } else {
      this.allTypeSaleForm.patchValue({ selectedVoucher: 0 });
      this.allTypeSaleForm.patchValue({ consumptionId: 0 });
      this.allTypeSaleForm.patchValue({ consumptionNo: null });
      this.allTypeSaleForm.patchValue({ consumptionDate: new Date() });
      this.allTypeSaleForm.patchValue({ totalAmount: 0 });
      this.allTypeSaleForm.patchValue({ netAmount: 0 });
      this.allTypeSaleForm.patchValue({ discountAmount: 0 });
      this.allTypeSaleForm.patchValue({ discountPercent: 0 });
      this.allTypeSaleForm.patchValue({ remark: null });
      this.selctedCounterItemList.length = 0;
      this.emptyItemGrid()
    }
  }

  updateConsumption(consumptionId) {
    const promise = new Promise((resolve, reject) => {
      this.issueService.getPatientIssueById(consumptionId).subscribe(res => {
        if (res.status_message === 'Success') {
          const consumptionData = res.data;
          if (consumptionData.saleType === 'HospitalSale' && (consumptionData.patientType === '2' || consumptionData.patientType === '1')) {
            consumptionData.deptId = 0;
            this.loadPatientList(consumptionData.patientName);
          } else if (consumptionData.saleType === 'CounterSale') {
            consumptionData.patientType = null;
            consumptionData.deptId = null;
          }
          let saleType = null;
          let patientType = null;
          let counterType = null;
          let accountType = null;
          let paymentType = null;
          if (consumptionData.saleType === 'HospitalSale') {
            saleType = this.saleTypeList[0];
            this.showCounterPatientSearchBox = false;
          } else if (consumptionData.saleType === 'CounterSale') {
            this.showCounterPatientSearchBox = true;
            saleType = this.saleTypeList[1];
          }
          if (consumptionData.patientType === '2') {
            patientType = this.patientType[1];
          } else if (consumptionData.patientType === '1') {
            patientType = this.patientType[0];
          } else if (consumptionData.patientType === '3') {
            patientType = this.patientType[2];
          }
          if (consumptionData.visitType === 'DEBTOR') {
            counterType = this.counterTypeList[1];
          } else if (consumptionData.visitType === 'PATIENT') {
            counterType = this.counterTypeList[0];
          }
          if (consumptionData.accountType === 'COMPANY') {
            accountType = this.mastersService.accountTypeList[1];
          } else if (consumptionData.accountType === 'DEBTOR') {
            accountType = this.mastersService.accountTypeList[0];
          } else {
            accountType = this.mastersService.accountTypeList[0];
          }
          this.allTypeSaleForm.patchValue({
            counter: this.activeCounterIndex,
            consumptionId: consumptionData.consumptionId,
            consumptionNo: consumptionData.consumptionNo,
            consumptionDate: new Date(consumptionData.consumptionDate),
            storeId: consumptionData.storeId,
            billAmount: consumptionData.totalAmount,
            discountAmount: consumptionData.discountAmount,
            discountPercent: consumptionData.discountPercent,
            netAmount: consumptionData.netTotalAmount,
            remark: consumptionData.remark,
            selectedPatient: {
              patientId: consumptionData.patientId || 0,
              patientName: consumptionData.patientName || null,
              visitNo: consumptionData.visitNo || null,
              gender: consumptionData.gender || null,
              age: consumptionData.age || null,
              bedNo: consumptionData.bedNo || null,
              admissionDate: consumptionData.admissionDate || null,
              visitType: consumptionData.visitType || null,
              dob: new Date(consumptionData.dob) || null
            },
            patientId: consumptionData.patientId || 0,
            deptId: consumptionData.deptId || 0,
            selectedDept: {
              id: consumptionData.deptId || 0,
              name: consumptionData.deptName || 0,
            },
            saleType: saleType ? saleType : null,
            patientType: patientType ? patientType : null,
            accountAddress: consumptionData.accountAddress || null,
            accountContact: consumptionData.accountContact || null,
            accountId: consumptionData.accountId || 0,
            accountType: accountType,
            accountName: consumptionData.accountName || null,
            advanceAccountAmount: 0,
            paidAmount: consumptionData.paidAmount || 0,
            patientAddress: consumptionData.patientAddress || null,
            patientName: consumptionData.patientName || null,
            patientMobile: consumptionData.patientContact || null,
            paymentInfo: null, // this.bindPaymentInfo(consumptionData.paymentInfo)
            discountType: 'percent',
            finalNetAmount: 0,
            counterType: counterType || null,
            advanceAdjustmentAmt: consumptionData.advanceAdjustmentAmt || 0,
            netPayableAmount: consumptionData.netTotalAmount || 0,
            accountData: {
              accountId: consumptionData.accountId || 0,
              accountName: consumptionData.accountName || null,
              contactPerson: null,
              debtorAddress1: consumptionData.accountAddress || null,
              debtorAddress2: null,
              accountType: null,
            },
            isEditMode: true,
            voucherType: consumptionData.voucherType === 'CASH' ? this.voucherTypeList[0] : this.voucherTypeList[1],
          });
          consumptionData.itemlist.map(d => {
            d.item = {
              issueUnitId: null,
              issueUnitName: null,
              itemCode: d.itemCode,
              itemName: d.itemName,
              itemId: d.itemId,
              unitId: null,
              unitName: null,
            };
            d.tempId = Math.random();
          });
          this.selctedCounterItemList = [...consumptionData.itemlist];
          this.itemListOperation = 'update';
          this.selectedVoucherItemList = [...consumptionData.itemlist];
          setTimeout(() => {
            this.selectedVoucherItemList.length = 0;
            this.itemListOperation = null;
          }, 1000);
          // if (+consumptionData.deptId && consumptionData.saleType === 'HospitalSale') {
          //   this.getDeptVoucherData().subscribe();
          // } else if (+consumptionData.patientId && consumptionData.saleType === 'HospitalSale') {
          //   this.getAllVoucherList().subscribe();
          // } else if (+consumptionData.patientId && consumptionData.saleType === 'CounterSale') {
          //   this.getCounterVoucherData().subscribe();
          // }
          // this.isItemGridEditingAllow = true;
          this.counterList[this.activeCounterIndex].itemList = _.cloneDeep(consumptionData.itemlist);
          this.counterList[this.activeCounterIndex].formData = this.allTypeSaleForm.getRawValue();
          this.calculateBillData();
          this.disableAllFieldInEditCase();
          this.isItemGridEditingAllow = true;
          const formData = this.allTypeSaleForm.getRawValue();
          if (+formData.netPayableAmount >= 0) {
            this.allTypeSaleForm.patchValue({
              paymentType: 'collection'
            })
          } else if (+formData.netPayableAmount < 0) {
            this.allTypeSaleForm.patchValue({
              paymentType: 'refund'
            })
          }
        }
        resolve(true);
      });
    });
    return promise;

  }

  disableAllFieldInEditCase() {
    this.allTypeSaleForm.controls.saleType.disable();
    this.allTypeSaleForm.controls.patientType.disable();
    this.allTypeSaleForm.controls.counterType.disable();
    this.allTypeSaleForm.controls.voucherType.disable();
  }

  enableAllFieldInEditCase() {
    this.allTypeSaleForm.controls.saleType.enable();
    this.allTypeSaleForm.controls.patientType.enable();
    this.allTypeSaleForm.controls.counterType.enable();
    this.allTypeSaleForm.controls.voucherType.enable();
  }

  getAllVoucherList(): Observable<any> {
    const param = {
      storeId: this.storeId,
      visitType: this.allTypeSaleForm.getRawValue().selectedPatient.visitType,
      patientId: this.allTypeSaleForm.getRawValue().selectedPatient.patientId,
      visitNo: this.allTypeSaleForm.getRawValue().selectedPatient.visitNo
    };
    return this.issueService.getVoucherData(param).pipe(map(res => {
      this.voucherList = [];
      if (res.length > 0) {
        _.map(res, d => {
          d.customName = _.cloneDeep(d.consumptionNo + ' - ' + moment(d.consumptionDate).format('DD/MM/YYYY'));
        });
        this.voucherList = [...res];
      }
      return this.voucherList;
    }));
  }

  getDeptVoucherData(): Observable<any> {
    const param = {
      storeId: this.storeId,
      deptId: this.allTypeSaleForm.getRawValue().deptId
    };
    return this.issueService.getDeptVoucherData(param).pipe(map(res => {
      this.voucherList = [];
      if (res.length > 0) {
        _.map(res, d => {
          d.customName = _.cloneDeep(d.consumptionNo + ' - ' + moment(d.consumptionDate).format('DD/MM/YYYY'));
        });
        this.voucherList = [...res];
      }
      return this.voucherList;
    }));
  }

  getCounterVoucherData(): Observable<any> {
    const param = {
      patientId: this.allTypeSaleForm.getRawValue().patientId,
      storeId: this.storeId,
    };
    return this.issueService.getCounterSaleConsumptionVoucherList(param).pipe(map(res => {
      this.voucherList = [];
      if (res.length > 0) {
        _.map(res, d => {
          d.customName = _.cloneDeep(d.consumptionNo + ' - ' + moment(d.consumptionDate).format('DD/MM/YYYY'));
        });
        this.voucherList = [...res];
      }
      return this.voucherList;
    }));
  }

  getAllVauchers() {
    const formData = this.allTypeSaleForm.getRawValue();
    if (formData.saleType && formData.saleType.id === 1 && formData.patientType && (formData.patientType.id === 2 || formData.patientType.id === 1) && !formData.patientId) {
      this.alertMsg = {
        message: 'Check Patient',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      }
      return;
    } else if (formData.saleType && formData.saleType.id === 1 && formData.patientType && formData.patientType.id === 3 && !formData.deptId) {
      this.alertMsg = {
        message: 'Check Department',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      }
      return;
    }
    const modalInstance = this.modalService.open(PatientVoucherItemListComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        size: 'xl',
        container: '#homeComponent'
      });
    modalInstance.result.then((result) => {
      if (result.type === 'yes') {
        let counterIndex = null;
        let alreadyOpen = false;
        this.counterList.map((d, i) => {
          if (d.formData.consumptionId === result.data.consumptionId && !alreadyOpen) {
            alreadyOpen = true;
          }
          if (d.itemList.length === 0 && !d.formData.billAmount && counterIndex === null && !alreadyOpen) {
            counterIndex = i;
          }
        });
        if (!alreadyOpen) {
          this.onChangeCounter(counterIndex, result.data);
        } else {
          this.alertMsg = {
            message: 'Voucher Already Open',
            messageType: 'danger',
            duration: Constants.ALERT_DURATION
          };
        }
        return;
      } else {
        return;
      }
    });
    modalInstance.componentInstance.formData = formData;
  }

  enablePatientSearch(value) {
    this.showPatientSearchBox = value;
    if (value) {
      this.loadPatientList();
    }
  }

  enableCounterPatientSearch(value) {
    this.showCounterPatientSearchBox = value;
  }

  enableDeptSearch(value) {
    this.showDeptSearchBox = value;
    if (value) {
      this.loadDeptList();
    }
  }

  onChangeCounter(index, data?) {
    this.activeCounterIndex = _.cloneDeep(index);
    if (data) {
      this.updateConsumption(data.consumptionId).then(res => { });
      return;
    }
    if (this.counterList[index].itemList.length) {
      this.itemListOperation = 'update';
      this.selectedVoucherItemList = _.cloneDeep(this.counterList[index].itemList);
      setTimeout(() => {
        this.selectedVoucherItemList.length = 0;
        this.itemListOperation = null;
      }, 500);
    } else {
      this.emptyItemGrid();
      this.enableAllFieldInEditCase();
      this.updateDefaultAfterSave();
    }
    this.allTypeSaleForm.patchValue({
      counter: index,
    });
    this.selctedCounterItemList = _.cloneDeep(this.counterList[index].itemList);
    const formData = this.counterList[index].formData;
    this.allTypeSaleForm.setValue(formData);
    this.openSearchBox();
  }

  getUpdatedItemList(list) {
    const formData = this.allTypeSaleForm.getRawValue();
    if (formData.saleType.id === 1
      && (formData.patientType.id === 1
        || formData.patientType.id === 2)
      && !formData.patientId) {
      this.alertMsg = {
        message: 'Please Select Patient',
        messageType: 'warning',
        duration: Constants.ALERT_DURATION
      };
      this.emptyItemGrid();
      return;
    }
    if (formData.saleType.id === 1
      && formData.patientType.id === 3
      && !formData.deptId) {
      this.alertMsg = {
        message: 'Please Select Department',
        messageType: 'warning',
        duration: Constants.ALERT_DURATION
      };
      this.emptyItemGrid();
      return;
    }
    this.selctedCounterItemList = _.cloneDeep(list);
    const billAmt = _.sumBy(this.selctedCounterItemList, d => {
      return +d.netAmount;
    });
    this.allTypeSaleForm.patchValue({ billAmount: billAmt });
    this.calculateBillData();
    this.mastersService.updatePaymentAndInforRelatedData(this.counterList[this.activeCounterIndex].formData)
  }

  calculateBillData() {
    // bill discount calculation as per discount type
    const formData = this.allTypeSaleForm.getRawValue();
    const billAmt = formData.billAmount;
    const discountType = formData.discountType;
    let discountPercent = formData.discountPercent;
    let discountAmount = formData.discountAmount;
    let paymetAmount = formData.paymentInfo ? formData.paymentInfo.amount : 0;
    let lastPaidAmt = formData.paidAmount ? formData.paidAmount : 0;
    let paymentType = formData.paymentType;
    const advanceAdjustmentAmt = +formData.advanceAdjustmentAmt;
    if (discountType == 'percent') {
      discountAmount = (+(billAmt * +discountPercent) / 100).toFixed(2);
      this.allTypeSaleForm.patchValue({ discountAmount: (+discountAmount || 0) });
    } else if (discountAmount) {
      const discountPercent = ((+discountAmount * 100) / billAmt).toFixed(2);
      this.allTypeSaleForm.patchValue({ discountPercent: (+discountPercent || 0) });
    }

    // bill amount after concession
    const billAmountAfterDiscount = billAmt - discountAmount;

    // bill net amount
    const netAmount = billAmountAfterDiscount;
    this.allTypeSaleForm.patchValue({ netAmount: netAmount });

    // final net amount after gst
    const finalNetAmount = netAmount - advanceAdjustmentAmt;
    this.allTypeSaleForm.patchValue({ finalNetAmount: finalNetAmount });

    // insurance amount, advanced amount, settled amount to calculate balance amount
    const balanceAmount = finalNetAmount;
    //this.allTypeSaleForm.patchValue({ balanceAmount: balanceAmount });


    // net payable calculate....
    if (paymentType === 'collection') {
      const netPayableAmount = (balanceAmount - +paymetAmount - +lastPaidAmt).toFixed(2);
      this.allTypeSaleForm.patchValue({ netPayableAmount: netPayableAmount });
    } else if (paymentType === 'refund') {
      const netPayableAmount = (balanceAmount - +lastPaidAmt + +paymetAmount).toFixed(2);
      this.allTypeSaleForm.patchValue({ netPayableAmount: netPayableAmount });
    }

    this.calculateDiscountForAllItem();
  }

  emptyItemGrid() {
    this.itemListOperation = 'clear';
    setTimeout(() => {
      this.itemListOperation = null;
    }, 500);
  }

  calculateDiscountForAllItem() {
    const data = this.allTypeSaleForm.getRawValue();
    const ttlVal = (_.sumBy(this.selctedCounterItemList, d => { return _.toNumber(d.netAmount); })).toFixed(2);
    this.allTypeSaleForm.patchValue({
      billAmount: ttlVal ? ttlVal : 0,
    });
    this.counterList[this.activeCounterIndex].itemList = _.cloneDeep(this.selctedCounterItemList);
    this.counterList[this.activeCounterIndex].formData = _.cloneDeep(this.allTypeSaleForm.getRawValue());
    // console.log(JSON.stringify(this.counterList));
    // console.log(JSON.stringify(this.allTypeSaleForm.getRawValue()));
  }

  clearForm() {
    this.selctedCounterItemList.length = 0;
    this.allTypeSaleForm.patchValue({
      allSaleType: [this.allSaleList[0]],
      counter: this.activeCounterIndex,
      saleType: this.saleTypeList[0],
      patientType: this.patientType[0],
      consumptionId: 0,
      consumptionNo: null,
      consumptionDate: new Date(),
      storeId: this.storeId,
      totalAmount: 0,
      remark: null,
      isTakePrint: false,
      patientId: null,
      selectedPatient: null,
      deptId: null,
      selectedDept: null,
      selectedVoucher: 0,
      discountPercent: 0,
      discountAmount: 0,
      netAmount: 0,
      voucherType: this.voucherTypeList[0],
      showTotal: false,
      billAmount: null,
      discountType: 'percent',
      finalNetAmount: 0,
      advanceAdjustmentAmt: 0,
      netPayableAmount: 0,
      paymentInfo: null,
      accountId: 0,
      accountData: null,
      accountType: this.mastersService.accountTypeList[0],
      counterType: this.counterTypeList[0],
      patientName: null,
      patientMobile: null,
      patientAddress: null,
      accountName: null,
      accountContact: null,
      advanceAccountAmount: 0,
      createCreditNote: false,
      isEditMode: false,
      paidAmount: 0,
      paymentType: 'collection'
    });
    this.showCounterPatientSearchBox = false;
    this.emptyItemGrid();
    this.calculateDiscountForAllItem();
    this.clearPatOrDebtor = 'patient';
    this.clearPatOrDebtor = 'debtor';
    this.clearPatOrDebtor = null;
    this.mastersService.updatePaymentAndInforRelatedData(this.allTypeSaleForm.getRawValue());
  }

  openSearchBox() {
    const formData = this.allTypeSaleForm.getRawValue();
    if (formData.saleType.id === 1
      && (formData.patientType.id === 1
        || formData.patientType.id === 2)
      && !formData.patientId) {
      this.enablePatientSearch(true);
      return;
    }
    if (formData.saleType.id === 1
      && formData.patientType.id === 3
      && !formData.deptId) {
      this.enableDeptSearch(true);
      return;
    }
  }

  focusPatSelection() {
    setTimeout(() => {
      this.selectPat ? this.selectPat.focus() : null;
    }, 200);
  }

  focusDeptSelection() {
    setTimeout(() => {
      this.selectDept ? this.selectDept.focus() : null;
    }, 200);
  }

  getVoucherPrescriptionCount() {
    const promise = new Promise((resolve, reject) => {
      this.issueService.getVoucherPrescriptionCount().subscribe(res => {
        if (res) {
          this.patientType[0].count = res.op;
          this.patientType[1].count = res.ip;
          this.patientType[2].count = res.indent;
        }
        resolve(res);
      });
    });
    return promise;
  }

  getIndentData() {
    const promise = new Promise((resolve, reject) => {
      const param = {
        deptId: this.allTypeSaleForm.getRawValue().deptId,
        storeId: this.authService.getLoginStoreId(),
      };
      this.issueService.getIndentItemDetailsByDeptID(param).subscribe(res => {
        this.indentItemList = res;
        resolve(res);
      });
    });
    return promise;
  }

  getPrescriptionData() {
    const promise = new Promise((resolve, reject) => {
      const param = {
        patientId: this.allTypeSaleForm.getRawValue().patientId,
        storeId: this.authService.getLoginStoreId(),
      };
      this.issueService.getPrescriptionItemDetails(param).subscribe(res => {
        if (res) {
          // this.allTypeSaleForm.patchValue({
          //   advanceAccountAmount: res.advanceAmount
          // });
          this.prescriptionItemList = res.prescriptionItemListPatient;
        }
        resolve(res);
      });
    });
    return promise;
  }

  openPatientPrescriptionPopup(data?) {
    const modalInstance = this.modalService.open(ShowPatientPrescriptionComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        size: 'xl',
        container: '#homeComponent'
      });
    modalInstance.result.then((result) => {
      if (result.type === 'yes') {
        this.prescriptionItemListSelected = result.data.prescriptionItemListSelected;
        this.updatePrescriptionItemList();
        return;
      } else if (result.type === 'no') {
        return;
      }
    });
    modalInstance.componentInstance.formData = this.allTypeSaleForm.getRawValue();
    modalInstance.componentInstance.prescriptionItemListSelected = this.prescriptionItemListSelected;
    modalInstance.componentInstance.prescriptionItemList = this.prescriptionItemList;
  }

  openIndentItemPopup(data?) {
    const modalInstance = this.modalService.open(ShowIndentItemDataComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        size: 'xl',
        container: '#homeComponent'
      });
    modalInstance.result.then((result) => {
      if (result.type === 'yes') {
        this.indentItemListSelected = result.data.indentItemListSelected;
        this.updateIndentItemList();
        return;
      } else if (result.type === 'no') {
        return;
      }
    });
    modalInstance.componentInstance.formData = this.allTypeSaleForm.getRawValue();
    modalInstance.componentInstance.indentItemListSelected = this.indentItemListSelected;
    modalInstance.componentInstance.indentItemList = this.indentItemList;
  }

  updatePrescriptionItemList() {
    if (!this.isPrescriptionAdded) {
      this.isPrescriptionAdded = true;
      this.itemListOperation = "update_prescription";
      this.selectedVoucherItemList = [...this.prescriptionItemListSelected];
      setTimeout(() => {
        this.itemListOperation = null;
        this.selectedVoucherItemList.length = 0;
      }, 500);
    }
  }

  updateIndentItemList() {
    if (!this.isIndentAdded) {
      this.isIndentAdded = true;
      this.itemListOperation = "update_indent";
      this.selectedVoucherItemList = [...this.indentItemListSelected];
      setTimeout(() => {
        this.itemListOperation = null;
        this.selectedVoucherItemList.length = 0;
      }, 500);
    }
  }

  getFormCalculation(val) {
    this.allTypeSaleForm.patchValue({
      billAmount: val.billAmount,
      discountType: val.discountType,
      discountPercent: val.discountPercent || 0,
      discountAmount: val.discountAmount || 0,
      netAmount: val.netAmount,
      advanceAdjustmentAmt: val.advanceAdjustmentAmt,
      netPayableAmount: val.netPayableAmount,
      advPaymentSettlement: val.advPaymentSettlement,
    });
    this.calculateDiscountForAllItem();
  }

  getFormCalculationPayment(payment) {
    const obj = { ...payment.paymentInfo };
    this.allTypeSaleForm.patchValue({
      paymentInfo: obj,
      paymentType: payment.paymentType,
      createCreditNote: payment.createCreditNote,
    });
    this.calculateBillData();
  }

  private loadPatientList(searchTxt?) {
    this.patientList$ = concat(
      this.getPatientListByType(searchTxt ? searchTxt : ''), // default items
      this.patientListInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.getPatientListByType(term ? term : (searchTxt ? searchTxt : '')).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  private loadDeptList(searchTxt?): void {
    this.deptList$ = concat(
      this.getDepartmentList(searchTxt ? searchTxt : ''),
      this.deptListInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.getDepartmentList(term ? term : (searchTxt ? searchTxt : '')).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  getPatientListByType(searchText): Observable<any> {
    const param = {
      search_string: searchText,
      page_number: 1,
      limit: 50,
      visit_Type: this.allTypeSaleForm.getRawValue().patientType.name,
    };
    return this.mastersService.getPatientListByType(param).pipe(map((res: any) => {
      return res;
    }));
  }

  getDepartmentList(searchKey?): Observable<any> {
    const params = {
      search_string: searchKey ? searchKey : '',
      pageNumber: 1,
      limit: 50
    };
    return this.mappingService.getDepartmentList(params).pipe(map((res: any) => {
      return res;
    }));
  }

  getCounterPatientFormData(formValue) {
    this.allTypeSaleForm.patchValue({
      patientId: formValue.patientId,
      selectedPatient: formValue.selectedPatient,
      accountId: formValue.accountId,
      accountName: formValue.accountName,
      accountContact: formValue.accountContact,
      accountData: formValue.accountData,
      patientName: formValue.patientName,
      patientMobile: formValue.patientMobile,
      patientAddress: formValue.patientAddress,
      accountType: formValue.accountType,
      advanceAccountAmount: formValue.advanceAccountAmount || 0,
    });
    this.calculateDiscountForAllItem();
    console.log(this.allTypeSaleForm);
  }

  getAdvanceAmountDetailsForAccount() {
    return new Promise((resolve, reject) => {
      if (!this.allTypeSaleForm.getRawValue().patientId) {
        resolve(false);
      }
      const param = {
        accountId: 0,
        patientId: this.allTypeSaleForm.getRawValue().patientId || 0
      };
      this.mastersService.getAdvanceAmountDetails(param).subscribe(result => {
        this.allTypeSaleForm.patchValue({
          advanceAccountAmount: result && result.advanceAmount ? result.advanceAmount : 0
        });
        resolve(result);
      });
    });
  }


}
