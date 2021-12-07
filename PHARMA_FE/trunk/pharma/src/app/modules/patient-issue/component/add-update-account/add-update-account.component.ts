import { Component, HostListener, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Constants } from 'src/app/config/constants';
import { MastersService } from 'src/app/modules/masters/services/masters.service';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { AuthService } from 'src/app/public/services/auth.service';

@Component({
  selector: 'app-add-update-account',
  templateUrl: './add-update-account.component.html',
  styleUrls: ['./add-update-account.component.scss']
})
export class AddUpdateAccountComponent implements OnInit {
  @Input() formData: any;
  alertMsg: IAlert;
  addAccountForm: FormGroup;
  loadForm = false;
  submitted = false;
  saleOnList = ['Purchase Rate', 'Sale Rate', 'MRP'];
  constructor(
    public modal: NgbActiveModal,
    private fb: FormBuilder,
    private mastersService: MastersService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.createPatientform();
  }

  createPatientform() {
    this.addAccountForm = this.fb.group({
      accountId: [this.formData.accountId || 0],
      accountName: [this.formData.accountName, Validators.required],
      contactPerson: [null],
      debtorAddress1: [null],
      debtorAddress2: [null],
      accountType: [this.formData.accountType || this.mastersService.accountTypeList[0], Validators.required],
      patientId: [0],
      contactNo: [this.formData.accountContact1],
      openingDebitAmt: [null],
      openingCreditAmt: [null],
      gstNo: [null],
      storeId: this.authService.getLoginStoreId(),
      rateOn: ['Sale Rate'],
      perOnPurRate: [null],
      isActive: [true],
      isPatient: [true],
      patientName: [null],
      patientContact: [null],
      patientAddress: [null],
    });
    if (this.formData.accountData) {
      this.addAccountForm.patchValue({
        contactPerson: this.formData.accountData.contactPerson,
        debtorAddress1: this.formData.accountData.address1,
        debtorAddress2: this.formData.accountData.address2,
        openingDebitAmt: this.formData.accountData.openingDebitAmt,
        openingCreditAmt: this.formData.accountData.openingCreditAmt,
        gstNo: this.formData.accountData.gstNo,
        rateOn: this.formData.accountData.saleUnitRate || 'Sale Rate',
        perOnPurRate: this.formData.accountData.perMargionOnSaleRate,
      });
    }
    if (this.formData.accountType && this.formData.accountType.id === 1 && !this.formData.selectedPatient) {
      this.addAccountForm.patchValue({
        isPatient: true,
      });
    } else if (this.formData.accountType && this.formData.accountType.id === 2 && !this.formData.accountId) {
      this.addAccountForm.patchValue({
        isPatient: false,
      });
      this.addAccountForm.controls.isPatient.disable();
    }
    this.loadForm = true;
  }

  closePopup(from?) {
    const obj = {
      data: from || null,
      type: from ? 'yes' : 'no'
    }
    this.modal.close(obj);
  }

  get getFrmCntrols() {
    return this.addAccountForm.controls;
  }

  saveData() {
    const param = this.addAccountForm.getRawValue();
    this.submitted = true;
    if (param.accountType && param.accountType.id === 2 && !param.patientName) {
      return;
    } else if (param.accountType && param.accountType.id === 1 && !param.isPatient && !param.patientName) {
      return;
    }
    if (this.addAccountForm.valid) {
      if (param.accountType && param.accountType.id === 1) {
        param.accountType = 'DEBTOR';
      } else if (param.accountType && param.accountType.id === 2) {
        param.accountType = 'COMPANY';
      }
      param.patientId = param.patientId || 0;
      this.mastersService.saveAccountMaster(param).subscribe(res => {
        this.alertMsg = {
          message: 'Value Updated!',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        }
        const data = this.addAccountForm.getRawValue();
        data.saleUnitRate = data.rateOn;
        data.perMargionOnSaleRate = data.saleUnitRate;
        data.address1 = data.debtorAddress1;
        data.address2 = data.debtorAddress2;
        data.accountContact = data.contactNo;
        data.accountId = res.accountId;
        data.patientId = res.patientId;
        this.closePopup(data);
      });
    }
  }

  onAccountTypeChange(val) {
    this.addAccountForm.controls.isPatient.enable();
    if (val && val.id === 2) {
      this.addAccountForm.patchValue({
        isPatient: false,
        patientName: null,
        patientContact: null,
        patientAddress: null,
      });
      this.addAccountForm.controls.isPatient.disable();
    }
  }

  @HostListener('document:keyup', ['$event'])
  handleDeleteKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closePopup();
    }
  }

}
