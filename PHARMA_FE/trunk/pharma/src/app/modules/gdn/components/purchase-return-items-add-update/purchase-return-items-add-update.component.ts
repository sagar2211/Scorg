import {Component, Input, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {TransactionsService} from '../../../transactions/services/transactions.service';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {Supplier} from '../../../masters/modals/supplier.model';
import * as _ from 'lodash';
import * as moment from 'moment';
@Component({
  selector: 'app-purchase-return-items-add-update',
  templateUrl: './purchase-return-items-add-update.component.html',
  styleUrls: ['./purchase-return-items-add-update.component.scss']
})
export class PurchaseReturnItemsAddUpdateComponent implements OnInit {
  prItemDetailForm: FormGroup;
  @Input() prData: any;
  @Input() itemEditData: any;
  compInstance: any;
  constructor(
    public modal: NgbActiveModal,
    private fb: FormBuilder,
    private transactionsService: TransactionsService
  ) { }

  ngOnInit(): void {
    this.compInstance = this;
    this.createForm();
    if (this.itemEditData.type === 'edit') {
      this.patchValues(this.itemEditData.data);
    }
  }

  createForm(): void {
    this.prItemDetailForm = this.fb.group({
      id: [0],
      grnId: [0],
      grnNo: [''],
      grnDetailId: [0],
      itemId: [null, Validators.required],
      itemDescription: [''],
      batchNo: [{value: 0, disabled: true}],
      expiryDate: [null],
      totalReturnQty: [0, Validators.min(1)],
      unitRate: [{value: 0, disabled: true}],
      amount: [{value: 0, disabled: true}],
      qty: [{value: 0, disabled: true}],
      freeQty: [0],
      remark: ['']
    });

  }

  patchValues(obj): void {
    this.prItemDetailForm.patchValue({
      id: obj.id,
      grnId: obj.grnId,
      grnNo: obj.grnNo,
      grnDetailId: obj.grnDetailId,
      itemId: obj.itemId,
      itemDescription: obj.itemDescription,
      batchNo: obj.batchNo,
      expiryDate: new Date(moment(obj.expiryDate).format('YYYY-MM-DD')),
      totalReturnQty: obj.totalReturnQty,
      unitRate: obj.unitRate,
      amount: obj.amount,
      qty: obj.qty,
      freeQty: obj.freeQty,
      remark: obj.remark
    });
    // calculate amount here
    this.calculateAmount();
  }
  getGRNListBySearchKeyword(searchKey?): Observable<any> {
    const params = {
      searchKeyword: searchKey ? searchKey : '',
      // searchKeyword: searchKey ? searchKey : '',
      isApproved: true,
      // supplierId: 4,
      supplierId: this.compInstance.prData.supplierId,
      // storeId: 1
      storeId: this.compInstance.prData.storeId
    };
    return this.compInstance.transactionsService.getGRNListBySearchKeyword(params).pipe(map((res: any) => {
      return res.data;
    }));
  }

  selectGRNNo($event): void {
    if ($event) {
      this.prItemDetailForm.patchValue({grnId: $event.grnId, grnNo: $event.grnNo});
    } else {
      this.prItemDetailForm.patchValue({grnId: 0, grnNo: '', itemDescription: '', itemId: null});
    }
    this.getItemDetailForGDN('').subscribe();
  }

  getItemDetailForGDN(searchKey?): Observable<any> {
    const params = {
      searchKeyword: searchKey ? searchKey : '',
      // supplierId: 4,
      supplierId: this.compInstance.prData.supplierId,
      // storeId: 1,
      storeId: this.compInstance.prData.storeId,
      // grnId: 7
      grnId: (this.compInstance.prData.gdnType === 'DIRECT') ? 0 : this.compInstance.prItemDetailForm.value.grnId
    };
    if (this.compInstance.prData.gdnType !== 'DIRECT' && params.grnId !== 0) {
      return this.compInstance.transactionsService.getItemDetailForGDN(params).pipe(map((res: any) => {
        return res.data;
      }));
    } else {
      return of([]);
    }
  }

  selectItem($event): void {
    this.prItemDetailForm.patchValue(
      {
        itemId: ($event) ? $event.itemId : 0,
        itemDescription: ($event) ? $event.itemDescription : "",
        grnDetailId: ($event) ? $event.grnDetailId : 0,
        batchNo: ($event) ? $event.batchNo : 0,
        // expiryDate: ($event) ? moment($event.expiryDate).format('YYYY-MM-DD') : null,
        expiryDate: ($event) ? new Date(moment($event.expiryDate).format('YYYY-MM-DD')) : null,
        qty: ($event) ? $event.balQty : 0,
        unitRate: ($event) ? this.calculateUnitRate($event) : 0
      });
  }

  calculateUnitRate(event): any{
    const conversionFactor = event.conversionFactor;
    if (!conversionFactor || conversionFactor === 0 || conversionFactor === '0') {
      return event.unitRate;
    } else {
      const newUnitRate = (+event.unitRate / +conversionFactor).toFixed(2);
      return newUnitRate;
    }
  }

  addItem(): void{
    if (this.prItemDetailForm.valid) {
      const rawDat = this.prItemDetailForm.getRawValue();
      this.modal.close(rawDat);
    }
  }

  calculateAmount(): void {
    const formData = this.prItemDetailForm.getRawValue();
    const amount = formData.unitRate * this.prItemDetailForm.value.totalReturnQty;
    this.prItemDetailForm.patchValue({amount: amount.toFixed(2)});
  }

  validateReturnQty(): void {
    // return qty must be less than or equal to avail qty.
    const returnQty = this.prItemDetailForm.value.totalReturnQty;
    const rawValues = this.prItemDetailForm.getRawValue();
    const availableQty = rawValues.qty;
    if (returnQty < 0) {
      this.prItemDetailForm.get('totalReturnQty').setErrors({ isLessThanZero: true });
    } else if (returnQty <= availableQty) {
      this.prItemDetailForm.get('totalReturnQty').setErrors(null);
      this.calculateAmount();
    } else {
      this.prItemDetailForm.get('totalReturnQty').setErrors({ isGreater: true });
    }
  }
}
