import { DecimalPipe } from '@angular/common';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';


@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.component.html',
  styleUrls: ['./item-details.component.scss'],
  providers: [DecimalPipe]
})
export class ItemDetailsComponent implements OnInit, OnDestroy {
  itemDetailsFrm: FormGroup;
  @Input() recieptData;
  @Input() mode: string;

  destroy$ = new Subject<any>();
  submitted = false;

  constructor(
    public modal: NgbActiveModal,
    private fb: FormBuilder,
    private decimalPipe: DecimalPipe
  ) { }

  ngOnInit(): void {
    this.submitted = false;
    const challanQty = this.recieptData.itemDetails.balQty ? this.recieptData.itemDetails.balQty : this.recieptData.itemDetails.challanQty ? this.recieptData.itemDetails.challanQty : 0
    const receivedQty = this.recieptData.itemDetails.balQty ? this.recieptData.itemDetails.balQty : this.recieptData.itemDetails.receivedQty ? this.recieptData.itemDetails.receivedQty : 0;
    const acceptedQty = this.recieptData.itemDetails.balQty ? this.recieptData.itemDetails.balQty : this.recieptData.itemDetails.acceptedQty ? this.recieptData.itemDetails.acceptedQty : 0;
    const totalQty = acceptedQty + this.recieptData.itemDetails.freeQty;

    this.itemDetailsFrm = this.fb.group({
      grnDetailId: [this.recieptData.itemDetails.grnDetailId ? this.recieptData.itemDetails.grnDetailId : 0],
      itemId: [this.recieptData.itemDetails.itemId],
      itemName: [this.recieptData.itemDetails.itemName],
      itemCode: [this.recieptData.itemDetails.itemCode],
      itemCf: [this.recieptData.itemDetails.conversionFactor ? this.recieptData.itemDetails.conversionFactor : null],
      itemUnit: [this.recieptData.itemDetails.purchaseUnitName ? this.recieptData.itemDetails.purchaseUnitName : null],
      batchNo: [this.recieptData.itemDetails.batchNo ? this.recieptData.itemDetails.batchNo : '', Validators.required], //
      expiryDate: [this.recieptData.itemDetails.expiryDate ? new Date(this.recieptData.itemDetails.expiryDate) : null, Validators.required], //
      poQty: [this.recieptData.itemDetails.balQty ? this.recieptData.itemDetails.balQty : 0], //
      challanQty: [challanQty],
      receivedQty: [receivedQty],
      acceptedQty: [acceptedQty, Validators.required],
      freeQty: [this.recieptData.itemDetails.freeQty], //
      totalQty: [totalQty], //
      purchaseRate: [this.recieptData.itemDetails.rate || this.recieptData.itemDetails.purchaseRate, Validators.required], //
      isDiscountInPercent: [this.recieptData.itemDetails.discountPercent ? true : false], //
      discountAmount: [this.recieptData.itemDetails.discountAmount ? this.recieptData.itemDetails.discountAmount : 0], //
      discountPercent: [this.recieptData.itemDetails.discountPercent ? this.recieptData.itemDetails.discountPercent : 0], //
      gstCode: [this.recieptData.gstCode],
      gstPercent: [this.recieptData.itemDetails.gstRate || this.recieptData.itemDetails.gstPercent], //
      gstAmount: [this.recieptData.itemDetails.gstAmount ? this.recieptData.itemDetails.gstAmount : 0], //
      unitRate: [this.recieptData.itemDetails.unitRate ? this.recieptData.itemDetails.unitRate : 0], //
      mrp: [this.recieptData.itemDetails.mrp ? this.recieptData.itemDetails.mrp : 0], //
      saleUnitPrice: [this.recieptData.itemDetails.unitRate ? this.recieptData.itemDetails.unitRate : 0], //
      netTotalAmount: [this.recieptData.itemDetails.netAmount ? this.recieptData.itemDetails.netAmount : this.recieptData.itemDetails.netTotalAmount ? this.recieptData.itemDetails.netTotalAmount : 0],
      remark: [''],
      isActive: [true]
    });

    if (this.itemDetailsFrm.value.isDiscountInPercent) {
      this.onDiscountPerChange(null, this.recieptData.itemDetails.discountPercent);
    } else {
      this.onDiscountAmount(null, this.recieptData.itemDetails.discountAmount);
    }

    this.itemDetailsFrm.get('totalQty').disable();
    // this.itemDetailsFrm.get('discountPercent').disable();
    this.itemDetailsFrm.get('gstPercent').disable();
    this.itemDetailsFrm.get('gstCode').disable();
    this.itemDetailsFrm.get('gstAmount').disable();
    this.itemDetailsFrm.get('poQty').disable();
    this.itemDetailsFrm.get('netTotalAmount').disable();
    this.itemDetailsFrm.get('unitRate').disable();
    if (this.recieptData.poId) {
      this.itemDetailsFrm.get('purchaseRate').disable();
    } else {
      this.itemDetailsFrm.get('purchaseRate').enable();
    }

    this.formFieldChangeDetection();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  // To validate first name
  checkRecievedQtyValue = (control: AbstractControl): any => {
    if (this.itemDetailsFrm && (+control.value > +this.itemDetailsFrm.value.challanQty)) {
      return { isReceivedQtyGreater: true };
    }
    return null;
  }


  commonFieldCalculation(): void {
    const formData = this.itemDetailsFrm.getRawValue();
    const gstAmt = (((+formData.purchaseRate - +formData.discountAmount) * +formData.gstPercent) / 100) * +formData.acceptedQty;
    const netAmt = (formData.acceptedQty * (+formData.purchaseRate - +formData.discountAmount)) + (gstAmt);
    this.itemDetailsFrm.patchValue({
      gstAmount: gstAmt.toFixed(2),
      netTotalAmount: netAmt.toFixed(2),
    });
    this.itemDetailsFrm.patchValue({
      unitRate: (+netAmt / formData.totalQty).toFixed(2),
      mrp: (+netAmt / formData.totalQty).toFixed(2),
      saleUnitPrice: (+netAmt / formData.totalQty).toFixed(2)
    });
  }

  formFieldChangeDetection(): void {
    this.itemDetailsFrm.get('acceptedQty').valueChanges.pipe(takeUntil(this.destroy$)).subscribe(acceptedQty => {
      this.itemDetailsFrm.patchValue({
        totalQty: (+this.itemDetailsFrm.value.freeQty + +acceptedQty)
      });
      this.commonFieldCalculation();
    });

    this.itemDetailsFrm.get('freeQty').valueChanges.pipe(takeUntil(this.destroy$), debounceTime(200)).subscribe(freeQty => {
      this.itemDetailsFrm.patchValue({
        totalQty: (+this.itemDetailsFrm.value.acceptedQty + +freeQty)
      });
      this.commonFieldCalculation();
    });

    this.itemDetailsFrm.get('purchaseRate').valueChanges.pipe(takeUntil(this.destroy$)).subscribe(freeQty => {
      const formData = this.itemDetailsFrm.getRawValue();
      this.itemDetailsFrm.patchValue({
        discountAmount: formData.isDiscountInPercent ? +((Number(formData.purchaseRate) * Number(formData.discountPercent)) / 100) : formData.discountAmount,
      });
      this.commonFieldCalculation();
    });

    this.itemDetailsFrm.get('receivedQty').valueChanges.pipe(takeUntil(this.destroy$)).subscribe(receivedQty => {
      const formData = this.itemDetailsFrm.getRawValue();
      const fc = this.itemDetailsFrm.get('receivedQty');
      if (+receivedQty > +formData.challanQty) {
        fc.setErrors({ isRecievedQtyGreater: true });
      } else {
        fc.setErrors(null);
      }
      const chln = this.itemDetailsFrm.get('challanQty');
      const challanQty = +formData.challanQty;
      if ((+challanQty < +formData.receivedQty
        || +challanQty < +formData.acceptedQty
        || (formData.poQty ? +challanQty > +formData.poQty : false))) {
        chln.setErrors({ isChalanQtyLess: true });
      } else {
        chln.setErrors(null);
      }
      const acceptedQty = +formData.acceptedQty;
      const acp = this.itemDetailsFrm.get('acceptedQty');
      if (+acceptedQty > +formData.receivedQty || +acceptedQty > +formData.challanQty) {
        acp.setErrors({ isAcceptedQtyLess: true });
      } else {
        acp.setErrors(null);
      }
    });

    this.itemDetailsFrm.get('challanQty').valueChanges.pipe(takeUntil(this.destroy$)).subscribe(challanQty => {
      this.submitted = true;
      const formData = this.itemDetailsFrm.getRawValue();
      const fc = this.itemDetailsFrm.get('challanQty');
      if (+formData.poQty < +formData.challanQty && (this.recieptData && this.recieptData.poId)) {
        fc.setErrors({ isChallanQtyGreaterPo: true });
      } else if (+challanQty < +formData.receivedQty
        || +challanQty < +formData.acceptedQty
        || (formData.poQty ? +challanQty > +formData.poQty : false)) {
        fc.setErrors({ isChalanQtyLess: true });
      } else {
        fc.setErrors(null);
      }
      const receivedQty = +formData.receivedQty;
      const rcv = this.itemDetailsFrm.get('receivedQty');
      if (+receivedQty > +formData.challanQty) {
        rcv.setErrors({ isRecievedQtyGreater: true });
      } else {
        rcv.setErrors(null);
      }
      const acceptedQty = +formData.acceptedQty;
      const acp = this.itemDetailsFrm.get('acceptedQty');
      if (+acceptedQty > +formData.receivedQty || +acceptedQty > +formData.challanQty) {
        acp.setErrors({ isAcceptedQtyLess: true });
      } else {
        acp.setErrors(null);
      }
      // fc.updateValueAndValidity();
    });

    this.itemDetailsFrm.get('acceptedQty').valueChanges.pipe(takeUntil(this.destroy$)).subscribe(acceptedQty => {
      const formData = this.itemDetailsFrm.getRawValue();
      const fc = this.itemDetailsFrm.get('acceptedQty');
      if (+acceptedQty > +formData.receivedQty || +acceptedQty > +formData.challanQty) {
        fc.setErrors({ isAcceptedQtyLess: true });
      } else {
        fc.setErrors(null);
      }
      const chln = this.itemDetailsFrm.get('challanQty');
      const challanQty = +formData.challanQty;
      if (!(+challanQty < +formData.receivedQty
        || +challanQty < +formData.acceptedQty
        || (formData.poQty ? +challanQty > +formData.poQty : false))) {
        chln.setErrors(null);
      }
    });

    this.itemDetailsFrm.get('mrp').valueChanges.pipe(takeUntil(this.destroy$)).pipe(debounceTime(500)).subscribe(mrp => {
      const formData = this.itemDetailsFrm.getRawValue();
      const fc = this.itemDetailsFrm.get('mrp');
      if (+mrp >= +formData.unitRate) {
        fc.setErrors(null);
      } else {
        fc.setErrors({ isLessThenUnitRate: true });
      }
    });

    this.itemDetailsFrm.get('saleUnitPrice').valueChanges.pipe(takeUntil(this.destroy$)).pipe(debounceTime(500)).subscribe(saleUnitPrice => {
      const formData = this.itemDetailsFrm.getRawValue();
      const fc = this.itemDetailsFrm.get('saleUnitPrice');
      if (+saleUnitPrice <= +formData.mrp) {
        fc.setErrors(null);
      } else {
        fc.setErrors({ isGreateThenMrp: true });
      }
    });

    this.itemDetailsFrm.get('discountPercent').valueChanges.pipe(takeUntil(this.destroy$), debounceTime(500)).subscribe(discountPercent => {
      const formData = this.itemDetailsFrm.getRawValue();
      const fc = this.itemDetailsFrm.get('discountPercent');
      if (+discountPercent > 100) {
        fc.setErrors({ isGreateThenPR: true });
      } else {
        fc.setErrors(null);
      }
    });

    this.itemDetailsFrm.get('discountAmount').valueChanges.pipe(takeUntil(this.destroy$), debounceTime(500)).subscribe(discountAmount => {
      const formData = this.itemDetailsFrm.getRawValue();
      const fc = this.itemDetailsFrm.get('discountAmount');
      if (+discountAmount > formData.purchaseRate) {
        fc.setErrors({ isGreateThenPR: true });
      } else {
        fc.setErrors(null);
      }
    });
  }

  saveItemDetails(): void {
    this.submitted = true;
    if (this.itemDetailsFrm.invalid) { return; }
    this.modal.close(this.itemDetailsFrm.getRawValue());
  }

  onDiscountPerChange(event, disValue?): void {
    const discountPercent = event ? +event.target.value : disValue;
    const formData = this.itemDetailsFrm.getRawValue();
    this.itemDetailsFrm.patchValue({
      discountAmount: ((Number(formData.purchaseRate) * Number(discountPercent)) / 100).toFixed(2),
    });
    this.commonFieldCalculation();
  }

  onDiscountAmount(event, disAmount?): void {
    const discountAmount = event ? +event.target.value : disAmount;
    const formData = this.itemDetailsFrm.getRawValue();
    this.itemDetailsFrm.patchValue({
      discountPercent: ((discountAmount * 100) / +formData.purchaseRate).toFixed(2),
    });
    this.commonFieldCalculation();
  }

}
