import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MastersService } from 'src/app/modules/masters/services/masters.service';
import * as _ from 'lodash';
import { Constants } from 'src/app/config/constants';

@Component({
  selector: 'app-add-update-item-purchase-order',
  templateUrl: './add-update-item-purchase-order.component.html',
  styleUrls: ['./add-update-item-purchase-order.component.scss']
})
export class AddUpdateItemPurchaseOrderComponent implements OnInit {
  @Input() itemData: any;
  purchaseItemForm: FormGroup;
  loadForm: boolean;
  alertMsg: IAlert;
  submitted: boolean;
  searchString = '';
  constructor(
    public modal: NgbActiveModal,
    private fb: FormBuilder,
    private mastersService: MastersService,
  ) { }

  ngOnInit(): void {
    this.loadForm = false;
    this.submitted = false;
    if (this.itemData.item) {
      this.createForm(this.itemData.item);
    }
  }

  createForm(form?): void {
    this.patchDefaultValue(form);
  }

  patchDefaultValue(val?): void {
    const form = {
      detailId: [null],
      item: [null],
      qty: [null, Validators.required],
      freeQty: [null],
      totalQty: [null],
      rate: [null, Validators.required],
      amount: [null],
      discountPercent: [null],
      discountAmount: [null],
      discountType: [null],
      gstCode: [val && val.gstCode ? val.gstCode : null],
      gstPercent: [val && val.gstRate ? val.gstRate : null],
      gstAmount: [null],
      netAmount: [null],
      mrp: [null],
      unitRate: [null],
      remark: [null],
    };
    this.purchaseItemForm = this.fb.group(form);
    if (val.qty) {
      this.patchEditValue(val);
    } else if (this.itemData.type !== 'update') {
      this.purchaseItemForm.controls.item.patchValue(val);
    }
    this.loadForm = true;
  }

  patchEditValue(val): void {
    this.purchaseItemForm.controls.item.patchValue(val.item);
    this.purchaseItemForm.controls.detailId.patchValue(val.detailId);
    this.purchaseItemForm.controls.qty.patchValue(val.qty);
    this.purchaseItemForm.controls.freeQty.patchValue(val.freeQty);
    this.purchaseItemForm.controls.totalQty.patchValue(val.totalQty);
    this.purchaseItemForm.controls.rate.patchValue(val.rate);
    this.purchaseItemForm.controls.amount.patchValue(val.amount);
    this.purchaseItemForm.controls.discountPercent.patchValue(val.discountPercent);
    this.purchaseItemForm.controls.discountAmount.patchValue(val.discountAmount);
    this.purchaseItemForm.controls.discountType.patchValue(val.discountType);
    this.purchaseItemForm.controls.gstPercent.patchValue(val.gstPercent);
    this.purchaseItemForm.controls.gstAmount.patchValue(val.gstAmount);
    this.purchaseItemForm.controls.netAmount.patchValue(val.netAmount);
    this.purchaseItemForm.controls.mrp.patchValue(val.mrp);
    this.purchaseItemForm.controls.unitRate.patchValue(val.unitRate);
    this.purchaseItemForm.controls.remark.patchValue(val.remark);
  }

  addItemValue(): void {
    this.submitted = true;
    if (this.purchaseItemForm.valid && this.submitted) {
      const formVal = this.purchaseItemForm.value;
      const obj = {
        data: formVal,
        type: 'close',
        forVal: this.itemData.type
      };
      this.modal.close(obj);
    }
  }

  updateFormValueCalculation(formKey): void {
    const formval = _.cloneDeep(this.purchaseItemForm.value);
    if (formval.qty || formval.freeQty) {
      const ttlVal = (formval.qty ? formval.qty : 0) + (formval.freeQty ? formval.freeQty : 0);
      this.purchaseItemForm.controls.totalQty.patchValue(ttlVal);
    } else {
      this.purchaseItemForm.controls.totalQty.patchValue(0);
    }
    if (formval.qty && formval.rate) {
      const amount = (formval.qty ? formval.qty : 0) * (formval.rate ? formval.rate : 0);
      this.purchaseItemForm.controls.amount.patchValue(amount);
    } else {
      this.purchaseItemForm.controls.amount.patchValue(0);
    }
    if (formKey === 'discountPercent' || formKey === 'discountAmount') {
      this.purchaseItemForm.controls.discountType.patchValue(formKey);
      if (formKey === 'discountPercent' && formval.discountPercent > 100) {
        this.alertMsg = {
          message: 'Discount % can not be more then 100',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
        this.purchaseItemForm.controls.discountAmount.patchValue(0);
        this.purchaseItemForm.controls.discountPercent.patchValue(0);
      }
      if (formKey === 'discountAmount' && formval.discountAmount > formval.rate) {
        this.alertMsg = {
          message: 'Discount can not be more then Rate (' + formval.rate + ')',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
        this.purchaseItemForm.controls.discountAmount.patchValue(0);
        this.purchaseItemForm.controls.discountPercent.patchValue(0);
      }
    }
    this.calculateDiscount(formKey, formval);
  }

  calculateDiscount(formKey, formval?): void {
    formval = formval ? formval : _.cloneDeep(this.purchaseItemForm.value);
    let perVal = formval.discountPercent ? formval.discountPercent : 0;
    let amtVal = formval.discountAmount ? formval.discountAmount : 0;
    this.purchaseItemForm.controls.discountPercent.patchValue(0);
    this.purchaseItemForm.controls.discountAmount.patchValue(0);
    amtVal = (formKey === 'discountPercent' && !formval.discountPercent) ? 0 : amtVal;
    if (formKey === 'discountPercent' && (formval.discountPercent)) {
      amtVal = _.toNumber(((formval.rate * formval.discountPercent) / 100).toFixed(2));
      this.purchaseItemForm.controls.discountAmount.patchValue(amtVal);
      this.purchaseItemForm.controls.discountPercent.patchValue(formval.discountPercent);
    } else if (formKey === 'discountAmount' && (formval.discountAmount)) {
      perVal = _.toNumber(((formval.discountAmount * 100) / formval.rate).toFixed(2));
      this.purchaseItemForm.controls.discountAmount.patchValue(formval.discountAmount);
      this.purchaseItemForm.controls.discountPercent.patchValue(perVal);
    }
    const gstAmount = _.toNumber(((((formval.rate - amtVal) * formval.gstPercent) / 100) * formval.qty).toFixed(2));
    const netAmount = _.toNumber((((formval.rate - amtVal) * formval.qty) + gstAmount).toFixed(2));
    const netPurAmount = _.toNumber((((formval.rate - amtVal) * formval.qty)).toFixed(2));
    const unitRate = _.toNumber((netAmount / formval.totalQty).toFixed(2));
    this.purchaseItemForm.controls.gstAmount.patchValue(gstAmount);
    this.purchaseItemForm.controls.netAmount.patchValue(netAmount);
    this.purchaseItemForm.controls.amount.patchValue(netPurAmount);
    this.purchaseItemForm.controls.unitRate.patchValue(unitRate);
    this.purchaseItemForm.controls.mrp.patchValue(unitRate);
  }

  onMrpUpdate() {
    const formval = this.purchaseItemForm.value;
    if (formval.unitRate > formval.mrp) {
      this.alertMsg = {
        message: 'MRP should be Equal/Greter Then Unit Price',
        messageType: 'warning',
        duration: Constants.ALERT_DURATION
      };
      this.purchaseItemForm.controls.mrp.patchValue(formval.unitRate);
    }
  }

  get purchaseFormControl(): any {
    return this.purchaseItemForm.controls;
  }

}
