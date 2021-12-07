import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DxAutocompleteComponent } from 'devextreme-angular';
import CustomStore from 'devextreme/data/custom_store';
import * as _ from 'lodash';
import { concat, Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, takeUntil } from 'rxjs/operators';
import { Constants } from 'src/app/config/constants';
import { MastersService } from 'src/app/modules/masters/services/masters.service';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { AddUpdateAccountComponent } from '../add-update-account/add-update-account.component';
import { AttachPatientToAccountComponent } from '../attach-patient-to-account/attach-patient-to-account.component';
import { SelectPatientFromAccountComponent } from '../select-patient-from-account/select-patient-from-account.component';

@Component({
  selector: 'app-counter-patient-block',
  templateUrl: './counter-patient-block.component.html',
  styleUrls: ['./counter-patient-block.component.scss']
})
export class CounterPatientBlockComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild("account", { static: false }) public autocomplete: DxAutocompleteComponent;
  @Input() formValue = null;
  @Input() clearDebtorOrPatient = null;
  @Output() updateFormValue = new EventEmitter<any>();
  @Output() voucherData = new EventEmitter<any>();
  allTypeSaleForm: FormGroup;
  currentCounterDebtorList = [];
  currentCounterPatientList = [];
  selectedAccountPatient = null;
  alertMsg: IAlert;
  patientCounterList$ = new Observable<any>();
  patientCounterListInput$ = new Subject<any>();
  debtorAccountList$ = new Observable<any>();
  debtorAccountInput$ = new Subject<any>();
  patientDataSource: any;
  accountDataSource: any;
  $destroy = new Subject<any>();
  constructor(
    private fb: FormBuilder,
    private mastersService: MastersService,
    private modalService: NgbModal,
  ) {
    this.getpatientDataSource();
    this.getAccountDataSource();
  }

  ngOnInit(): void {
    this.createSaleform();
    if (this.formValue && this.allTypeSaleForm) {
      this.allTypeSaleForm.patchValue({
        counterType: this.formValue.counterType,
        patientId: this.formValue.patientId,
        selectedPatient: this.formValue.selectedPatient,
        accountId: this.formValue.accountId,
        accountName: this.formValue.accountName,
        accountContact1: this.formValue.accountContact,
        accountData: this.formValue.accountData,
        patientName: this.formValue.patientName,
        patientMobile1: this.formValue.patientMobile,
        patientAddress1: this.formValue.patientAddress,
        advanceAccountAmount: this.formValue.advanceAccountAmount
      });
    }

    this.subcriptionOfEvent();
  }

  ngOnChanges() {
    if (this.formValue && this.allTypeSaleForm) {
      console.log(this.formValue);
      this.allTypeSaleForm.patchValue({
        counterType: this.formValue.counterType,
        patientId: this.formValue.patientId,
        selectedPatient: this.formValue.selectedPatient,
        accountId: this.formValue.accountId,
        accountName: this.formValue.accountName,
        // accountContact1: this.formValue.accountContact,
        accountData: this.formValue.accountData,
        patientName: this.formValue.patientName,
        // patientMobile1: this.formValue.patientMobile,
        // patientAddress1: this.formValue.patientAddress,
        advanceAccountAmount: this.formValue.advanceAccountAmount
      });
      if (this.clearDebtorOrPatient && this.clearDebtorOrPatient === 'debtor') {
        this.clearDebtorAccount();
      } else if (this.clearDebtorOrPatient && this.clearDebtorOrPatient === 'patient') {
        this.clearCounterPatient();
      }
      if (this.formValue.accountType) {
        this.allTypeSaleForm.patchValue({
          accountType: this.formValue.accountType,
        })
      }
      if (this.formValue.isEditMode) {
        this.allTypeSaleForm.controls.accountType.disable();
      } else {
        this.allTypeSaleForm.controls.accountType.enable();
      }
    }
  }

  ngOnDestroy() {
    this.$destroy.unsubscribe();
  }

  createSaleform() {
    this.allTypeSaleForm = this.fb.group({
      accountType: this.mastersService.accountTypeList[0],
      patientId: null,
      counterType: null,
      patientName: null,
      patientMobile1: null,
      patientAddress1: null,
      selectedPatient: null,
      accountId: null,
      accountName: null,
      accountContact1: null,
      accountData: null,
      advanceAccountAmount: null,
    });
  }

  onAccountTypeChange(val) {
    this.updateFormVal();
  }

  onDebtorChange(val, isReturn?) {
    const indx = _.findIndex(this.currentCounterDebtorList, d => {
      return isReturn ? +val.previousValue === +d.accountId : +val.value === +d.accountId;
    });
    if (isReturn) {
      return indx;
    }
    if (indx !== -1) {
      this.allTypeSaleForm.patchValue({
        patientId: null,
        selectedPatient: null,
        accountId: val.value,
        accountName: this.currentCounterDebtorList[indx].accountName,
        accountContact1: this.currentCounterDebtorList[indx].contactNo,
        accountData: { ...this.currentCounterDebtorList[indx] }
      });
    }
    this.updateFormVal();
    this.openAccountPatientList();
  }

  onDebtorNameChange(val) {
    // if (!val.event) {
    //   return;
    // }
    if (val.value && _.isNumber(val.value)) {
      this.onDebtorChange(val);
    } else {
      if (val.previousValue && _.isNumber(val.previousValue)) {
        const indx = this.onDebtorChange(val, true);
        if (indx !== -1 && this.currentCounterDebtorList[indx].accountName === val.value) {
          return;
        }
      }
      this.allTypeSaleForm.patchValue({
        patientId: null,
        selectedPatient: null,
        accountId: null,
        accountData: null,
        accountName: val.value
      });
      this.updateFormVal();
    }
  }

  clearDebtorAccount() {
    this.allTypeSaleForm.patchValue({
      patientId: null,
      accountId: null,
      selectedPatient: null,
      accountName: null,
      accountContact1: null,
      accountData: null,
      advanceAccountAmount: null,
    });
    this.updateFormVal();
  }

  clearCounterPatient() {
    this.allTypeSaleForm.patchValue({
      patientId: null,
      patientName: null,
      patientMobile1: null,
      patientAddress1: null,
      selectedPatient: null,
      advanceAccountAmount: null,
    });
    this.updateFormVal();
  }

  onCounterPatientChange(val, isReturn?) {
    const indx = _.findIndex(this.currentCounterPatientList, d => {
      return isReturn ? +val.previousValue === +d.patientId : +val.value === +d.patientId;
    });
    if (isReturn) {
      return indx;
    }
    if (indx !== -1) {
      this.allTypeSaleForm.patchValue({
        patientId: val.value,
        patientName: this.currentCounterPatientList[indx].patientName,
        patientMobile1: this.currentCounterPatientList[indx].mobileNo,
        patientAddress1: this.currentCounterPatientList[indx].patientAddress,
        selectedPatient: { ...this.currentCounterPatientList[indx] }
      });
    }
    this.updateFormVal();
    this.getAdvanceAmountDetailsForAccount().then(res => {
      this.updateFormVal();
    });
  }

  onCounterPatientNameChange(val) {
    // if (!val.event) {
    //   return;
    // }
    if (val.value && _.isNumber(val.value)) {
      this.onCounterPatientChange(val);
    } else {
      if (val.previousValue && _.isNumber(val.previousValue)) {
        const indx = this.onCounterPatientChange(val, true);
        if (indx !== -1 && this.currentCounterPatientList[indx].patientName === val.value) {
          return;
        }
      }
      this.allTypeSaleForm.patchValue({
        patientId: null,
        selectedPatient: null,
        patientName: val.value
      });
      this.updateFormVal();
    }
  }

  getDebtorAccountList(compObj, searchValue) {
    return new Promise((resolve, reject) => {
      let acType = '';
      if (compObj.allTypeSaleForm.value.accountType && compObj.allTypeSaleForm.value.accountType.id) {
        acType = compObj.allTypeSaleForm.value.accountType.id === 1 ? 'DEBTOR' : 'COMPANY';
      }
      const param = {
        searchKeyword: searchValue,
        patientId: 0,
        accountType: acType
      };
      return compObj.mastersService.getDebtorsAccountBySearchKeyword(param).subscribe(result => {
        this.currentCounterDebtorList = result;
        resolve(result);
      });
    });
  }

  getAccountDataSource() {
    let compObj = this;
    this.accountDataSource = new CustomStore({
      key: "accountName",
      load: function (loadOptions: any) {
        return compObj.getDebtorAccountList(compObj, loadOptions.searchValue).then((result) => {
          return result;
        });
      },
      byKey: (key) => {
        return compObj.getDebtorAccountList(compObj, key).then((result) => {
          return result;
        });
      }
    });
  }

  getpatientDataSource() {
    let compObj = this;
    this.patientDataSource = new CustomStore({
      key: "patientName",
      load: function (loadOptions: any) {
        return compObj.getListPromise(compObj, loadOptions.searchValue).then((result) => {
          return result;
        });
      },
      // Needed to process selected value(s) in the SelectBox, Lookup, Autocomplete, and DropDownBox
      byKey: (key) => {
        return compObj.getListPromise(compObj, key).then((result) => {
          return result;
        });
      }
    });
  }

  getListPromise(compObj, searchValue) {
    return new Promise((resolve, reject) => {
      const param = {
        searchKeyword: searchValue,
        debtorId: 0,
      };
      compObj.mastersService.getPharmacyPatientBySearchKeyword(param).subscribe(result => {
        this.currentCounterPatientList = result;
        resolve(result);
      });
    });
  }

  getCounterPatientList(searchKey?): Observable<any> {
    const param = {
      searchKeyword: searchKey,
      debtorId: this.allTypeSaleForm.getRawValue().accountId,
    };
    return this.mastersService.getPharmacyPatientBySearchKeyword(param).pipe(map((res: any) => {
      this.currentCounterPatientList = res;
      return res;
    }));
  }

  getAllVauchers() {
    const formData = this.allTypeSaleForm.value;
    if (formData.counterType && formData.counterType.id === 2 && !formData.accountId) {
      this.alertMsg = {
        message: 'Check Account',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      }
      return;
    } else if ((formData.counterType && formData.counterType.id === 2 && formData.accountId && !formData.patientId)
      || (formData.counterType && formData.counterType.id === 1 && !formData.patientId)) {
      this.alertMsg = {
        message: 'Check Patient',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      }
      return;
    }
    this.updateFormVal();
    this.voucherData.emit(true);
  }

  openAccountPatientList() {
    this.getCounterPatientList().subscribe(res => {
      if (this.currentCounterPatientList.length > 0) {
        const formData = this.allTypeSaleForm.value;
        const modalInstance = this.modalService.open(SelectPatientFromAccountComponent,
          {
            ariaLabelledBy: 'modal-basic-title',
            backdrop: 'static',
            keyboard: false,
            size: 'xl',
            container: '#homeComponent'
          });
        modalInstance.result.then((result) => {
          if (result.type === 'yes') {
            this.selectedAccountPatient = result.data;
            this.updateSelectedPatient();
            return;
          } else {
            return;
          }
        });
        modalInstance.componentInstance.formData = formData;
        modalInstance.componentInstance.patientList = [...this.currentCounterPatientList];
        modalInstance.componentInstance.selectedPatient = { ...this.selectedAccountPatient };
      }
    });
  }

  attachPatientToDebtor() {
    const formData = this.allTypeSaleForm.value;
    if (!formData.accountId) {
      this.alertMsg = {
        message: 'Check Account',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      }
      return;
    }
    const modalInstance = this.modalService.open(AttachPatientToAccountComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        size: 'xl',
        container: '#homeComponent'
      });
    modalInstance.result.then((result) => {
      if (result.type === 'yes') {
        this.alertMsg = {
          message: 'Value Updated!',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        }
        return;
      } else {
        return;
      }
    });
    modalInstance.componentInstance.formData = formData;
  }

  addNewaccount() {
    const formData = this.allTypeSaleForm.getRawValue();
    if (formData.accountId && !formData.accountData) {
      this.getAccountDetail().then(res => {
        this.openAccountModalPopup();
      });
    } else {
      this.openAccountModalPopup();
    }
  }

  getAccountDetail() {
    return new Promise((resolve, reject) => {
      const formData = this.allTypeSaleForm.getRawValue();
      this.mastersService.getAccountDataByID(formData.accountId).subscribe(result => {
        this.allTypeSaleForm.patchValue({
          accountData: result
        });
        resolve(result);
      });
    });
  }

  openAccountModalPopup() {
    const formData = this.allTypeSaleForm.getRawValue();
    const modalInstance = this.modalService.open(AddUpdateAccountComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        size: 'xl',
        container: '#homeComponent'
      });
    modalInstance.result.then((result) => {
      if (result.type === 'yes') {
        this.alertMsg = {
          message: 'Value Updated!',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        }
        this.updateAccountData(result.data);
        return;
      } else {
        return;
      }
    });
    modalInstance.componentInstance.formData = formData;
  }

  updateSelectedPatient() {
    this.allTypeSaleForm.patchValue({
      selectedPatient: this.selectedAccountPatient,
      patientId: this.selectedAccountPatient.patientId,
      patientName: this.selectedAccountPatient.patientName,
      patientMobile1: this.selectedAccountPatient.mobileNo,
    });
    this.updateFormVal();
    this.getAdvanceAmountDetailsForAccount().then(res => {
      this.updateFormVal();
    });
  }

  updateAccountData(data) {
    this.allTypeSaleForm.patchValue({
      accountId: data.accountId,
      accountName: data.accountName,
      accountContact1: data.accountContact,
      accountData: data,
      patientId: data.patientId,
      patientName: data.isPatient ? data.accountName : data.patientName,
      patientMobile1: data.isPatient ? data.contactNo : data.patientContact,
      patientAddress1: data.isPatient ? data.debtorAddress1 : data.patientAddress,
      selectedPatient: {
        patientId: data.patientId,
        patientName: data.isPatient ? data.accountName : data.patientName,
        mobileNo: data.isPatient ? data.contactNo : data.patientContact,
        patientAddress: data.isPatient ? data.debtorAddress1 : data.patientAddress,
      }
    });
    this.updateFormVal();
    this.getAdvanceAmountDetailsForAccount().then(res => {
      this.updateFormVal();
    });
  }

  updateFormVal() {
    const formData = { ...this.allTypeSaleForm.getRawValue() };
    formData.accountContact = formData.accountContact1;
    formData.patientMobile = formData.patientMobile1;
    formData.patientAddress = formData.patientAddress1;
    this.updateFormValue.emit(formData);
  }

  getAdvanceAmountDetailsForAccount() {
    return new Promise((resolve, reject) => {
      if (this.allTypeSaleForm.getRawValue().accountId || this.allTypeSaleForm.getRawValue().patientId) {
        const param = {
          accountId: this.allTypeSaleForm.getRawValue().accountId || 0,
          patientId: this.allTypeSaleForm.getRawValue().patientId || 0
        };
        this.mastersService.getAdvanceAmountDetails(param).subscribe(result => {
          this.allTypeSaleForm.patchValue({
            advanceAccountAmount: result && result.advanceAmount ? result.advanceAmount : 0
          });
          resolve(result);
        });
      } else {
        resolve(false);
      }

    });
  }

  subcriptionOfEvent() {
    this.mastersService.$subOpenAddAccountPopup.pipe(takeUntil(this.$destroy)).subscribe((obj: any) => {
      if (obj) {
        this.addNewaccount();
      }
    });

    this.mastersService.$subOpenPatientAttachePopup.pipe(takeUntil(this.$destroy)).subscribe((obj: any) => {
      if (obj) {
        this.attachPatientToDebtor();
      }
    });
  }

}
