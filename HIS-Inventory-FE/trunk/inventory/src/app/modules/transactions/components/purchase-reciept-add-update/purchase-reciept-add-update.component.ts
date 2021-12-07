import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject, Observable, concat, of } from 'rxjs';
import { TransactionsService } from '../../services/transactions.service';
import { distinctUntilChanged, tap, switchMap, catchError, map, debounceTime } from 'rxjs/operators';
import { IPOList } from '../../modals/po-list.modal';
import { SupplierItem } from '../../modals/supplier-item.modal';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ItemDetailsComponent } from '../item-details/item-details.component';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { Constants } from 'src/app/config/constants';
import { ActivatedRoute, Router } from '@angular/router';
import { Route } from '@angular/compiler/src/core';
import { ConfirmationPopupWithReasonComponent } from 'src/app/shared/confirmation-popup-with-reason/confirmation-popup-with-reason.component';
import { PermissionsConstants } from '../../../../config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { ConfirmationPopupComponent } from 'src/app/shared/confirmation-popup/confirmation-popup.component';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/public/services/auth.service';
import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
  selector: 'app-purchase-reciept-add-update',
  templateUrl: './purchase-reciept-add-update.component.html',
  styleUrls: ['./purchase-reciept-add-update.component.scss']
})
export class PurchaseRecieptAddUpdateComponent implements OnInit, OnDestroy {
  purchaseRecieptFrm: FormGroup;
  supplierList$ = new Observable<any>();
  supplierListInput$ = new Subject<any>();
  formLoading = false;
  poList: Array<IPOList> = [];
  storeId: number;
  itemList: Array<SupplierItem> = [];
  itemListClone: Array<SupplierItem> = [];
  prItemList: Array<any> = [];
  alertMsg: IAlert;
  purchaseRecieptId: number;
  supplierList: Array<any>;
  submitted = false;

  constpermissionList: any = [];
  supplierItemList = [];
  poNoPreviousVal: any = {};
  printData = null;
  totalNetAmount = 0.00;
  loginUserId = null;
  constructor(
    private transactionsService: TransactionsService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private commonService: CommonService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.storeId = JSON.parse(localStorage.getItem('globals')).storeId;
    this.loginUserId = this.authService.getLoggedInUserId();
    this.loadSupplierList('');
    this.createInitForm();
    this.commonService.routeChanged(this.activatedRoute);
    this.activatedRoute.paramMap.subscribe(data => {
      this.purchaseRecieptId = +data.get('id');
      if (this.purchaseRecieptId !== -1) { // update mode
        this.itemList = [];
        this.prItemList = [];
        this.transactionsService.getGRNById(this.purchaseRecieptId).subscribe((res1: any) => {
          this.updateForm(res1.data);
          this.prItemList = res1.data.receiptItemList;
          this.billCalculation(this.prItemList);
          this.loadSupplierList(res1.data.supplierName);
          this.getPoListBySupplier(res1.data.supplierId);
        });
        this.purchaseRecieptFrm.get('supplierId').disable();
      } else { // -- add mode
        this.itemList = [];
        this.prItemList = [];
        this.purchaseRecieptFrm.reset();
        this.createInitForm();
        this.purchaseRecieptFrm.get('grnId').disable();
        // this.purchaseRecieptFrm.get('discountPercent').disable();
        // this.purchaseRecieptFrm.get('discountAmount').enable();
        // this.purchaseRecieptFrm.get('isDiscountInPercent').valueChanges.subscribe(res2 => {
        //   if (res2) {
        //     this.purchaseRecieptFrm.get('discountPercent').enable();
        //     this.purchaseRecieptFrm.get('discountAmount').disable();
        //     this.purchaseRecieptFrm.patchValue({
        //       discountAmount: 0
        //     });
        //   } else {
        //     this.purchaseRecieptFrm.get('discountPercent').disable();
        //     this.purchaseRecieptFrm.get('discountAmount').enable();
        //     this.purchaseRecieptFrm.patchValue({
        //       discountAmount: 0,
        //       discountPercent: 0
        //     });
        //   }
        // });
      }
    });

    // this.formChangeDetection();
    this.constpermissionList = PermissionsConstants;
  }

  ngOnDestroy(): void {
    this.modalService.dismissAll();
  }

  formChangeDetection(): void {
    this.purchaseRecieptFrm.get('discountAmount').valueChanges.pipe(debounceTime(500)).subscribe(discountAmount => {
      this.purchaseRecieptFrm.patchValue({
        netAmount: this.totalNetAmount - +discountAmount
      });
    });

    this.purchaseRecieptFrm.get('discountPercent').valueChanges.pipe(debounceTime(500)).subscribe(discountPercent => {
      const fc = this.purchaseRecieptFrm.get('discountPercent');
      if (+discountPercent > 100) {
        fc.setErrors({ isGreater: true });
      } else {
        fc.setErrors(null);
      }
    });
  }

  updateForm(updateData): void {

    this.purchaseRecieptFrm.patchValue({
      grnId: updateData.grnId ? updateData.grnId : 0,
      grnNo: updateData.grnNo ? updateData.grnNo : 0,
      grnDate: updateData.grnDate ? new Date(updateData.grnDate) : new Date(),
      receivedDate: updateData.ReceivedDate ? new Date(updateData.ReceivedDate) : new Date(),
      supplierId: updateData.supplierId ? updateData.supplierId : null,
      billNo: updateData.billNo ? updateData.billNo : null,
      billDate: updateData.billDate ? new Date(updateData.billDate) : null,
      custAcNo: updateData.custAcNo ? updateData.custAcNo : '',
      poId: updateData.poId ? updateData.poId : null,
      storeId: updateData.storeId ? updateData.storeId : this.storeId,
      purchaseAmount: updateData.purchaseAmount ? updateData.purchaseAmount : 0, // itemList sum of totalAmount
      gstAmount: updateData.gstAmount ? updateData.gstAmount : '', // itemList sum of gstAmount
      discountPercent: updateData.discountPercent ? updateData.discountPercent : 0,
      discountAmount: updateData.discountAmount ? updateData.discountAmount : 0,
      netAmount: updateData.netAmount ? updateData.netAmount : '',
      isApproved: updateData.isApproved ? updateData.isApproved : false,
      isActive: updateData.isActive ? updateData.isActive : true,
      rateContract: updateData.rateContract ? updateData.rateContract : false,
      rcValidFrom: updateData.rcValidFrom ? updateData.rcValidFrom : null,
      rcValidTo: updateData.rcValidTo ? updateData.rcValidTo : null,

      itemDetails: null,  // -- for temporary
      itemDesc: '', // - for temp,
      gstCode: '', // --for temp
      isDiscountInPercent: updateData.discountPercent ? true : false,
      status: updateData.status,
      poDate: updateData.poDate ? new Date(updateData.poDate) : null,
      createdBy: updateData.createdBy
    });
    this.purchaseRecieptFrm.get('poId').disable();
    const formValues = this.purchaseRecieptFrm.getRawValue();
    if (formValues.poId && formValues.supplierId) {
      this.getPurchaseOrdersById();
    } else {
      this.onSupplierChange(this.purchaseRecieptFrm.getRawValue());
    }
  }

  createInitForm(): void {
    this.purchaseRecieptFrm = this.fb.group({
      grnId: [0],
      grnNo: [0],
      grnDate: [new Date()],
      receivedDate: [new Date()],
      supplierId: [null, Validators.required],
      billNo: [null, Validators.required],
      billDate: [new Date()],
      custAcNo: [''],
      poId: [null],
      storeId: [this.storeId],
      purchaseAmount: [0], // itemList sum of totalAmount
      gstAmount: [''], // itemList sum of gstAmount
      discountPercent: [0],
      discountAmount: [0],
      netAmount: [''],
      isApproved: [false],
      isTakePrint: [false],
      isActive: [true],
      rateContract: [false],
      rcValidFrom: [null],
      rcValidTo: [null],

      itemDetails: [null],  // -- for temporary
      itemDesc: [''], // - for temp,
      gstCode: [''],
      isDiscountInPercent: [false],
      status: [''],
      poDate: [null],
      createdBy: [null]
    });
    this.purchaseRecieptFrm.get('grnNo').disable();
    this.purchaseRecieptFrm.get('purchaseAmount').disable();
    this.purchaseRecieptFrm.get('gstAmount').disable();
    this.purchaseRecieptFrm.get('netAmount').disable();
    this.purchaseRecieptFrm.get('rateContract').disable();

  }

  private loadSupplierList(searchTxt?): void {
    this.supplierList$ = concat(
      this.transactionsService.getSupplierBySearchKeyword(searchTxt = searchTxt ? searchTxt : '').pipe(map(res => {
        this.supplierList = res;
        const index = this.supplierList.findIndex((o) => o.supplierId === this.purchaseRecieptFrm.getRawValue().supplierId);
        if (index > -1) {
          const suppObject = this.supplierList[index];
          this.purchaseRecieptFrm.patchValue({
            gstCode: suppObject.gstCode
          });
        }
        return res;
      })), // default items
      this.supplierListInput$.pipe(
        distinctUntilChanged(),
        tap(() => this.formLoading = true),
        switchMap(term => this.transactionsService.getSupplierBySearchKeyword(term).pipe(
          catchError(() => of([])), // empty list on error
          tap(() => this.formLoading = false)
        ))
      )
    );
  }

  onSupplierChange(event): void {
    this.purchaseRecieptFrm.patchValue({
      gstCode: event.gstCode,
      poId: null
    });
    if (event) {
      this.getPoListBySupplier(event.supplierId);
      this.getSupplierItemsList();
    }

  }

  // Get PO list by supplierId
  getPoListBySupplier(supplierId): void {
    this.transactionsService.getPoListBySupplierId(supplierId, this.storeId).subscribe((res: any) => {
      if (res.status_message === 'Success') {
        this.poList = res.data;
      } else {
        this.poList = [];
      }
    });
  }

  // called when po select
  getPurchaseOrdersById(): void {
    const formValues = this.purchaseRecieptFrm.getRawValue();
    const POID = formValues.poId ? formValues.poId : 0;
    if (POID === 0) {
      this.purchaseRecieptFrm.patchValue({
        poDate: null,
        rateContract: null,
        rcValidFrom: null,
        rcValidTo: null
      });
      this.itemList =  this.supplierItemList;
      return;
    }

    // this.purchaseRecieptFrm.value.poId = formValues.poId ? formValues.poId : 0;
    this.transactionsService.getPurchaseOrderById(POID).subscribe((res: any) => {
      if (res.status_message === 'Success') {
        this.itemList = POID === 0 ? this.supplierItemList : _.filter(res.data.itemlist, dt => +dt.balQty > 0);
        this.purchaseRecieptFrm.patchValue({
          poDate: new Date(res.data.poDate),
          rateContract: res.data.rateContract,
          rcValidFrom: res.data.rcValidFrom ? new Date(res.data.rcValidFrom) : null,
          rcValidTo: res.data.rcValidTo ? new Date(res.data.rcValidTo) : null
        });
      } else {
        this.itemList = POID === 0 ? this.supplierItemList : [];
      }
    });
  }

  // -- called when supplier select
  getSupplierItemsList(): void {
    const reqParams = {
      supplierId: this.purchaseRecieptFrm.getRawValue().supplierId,
      searchKeyword: ''
    };
    this.transactionsService.getSupplierItemsList(reqParams).subscribe((res: any) => {
      if (res.status_message === 'Success') {
        this.supplierItemList = [...res.data];
        this.itemList = res.data;
      } else {
        this.itemList = [];
      }
    });
  }

  onItemSelect(index, mode?): void {
    const modalInstance = this.modalService.open(ItemDetailsComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        size: 'lg'
      });
    modalInstance.result.then((result) => {
      if (mode === 'Edit') {
        this.prItemList[index] = result;
      } else {
        this.prItemList.push(result);
        this.billCalculation(this.prItemList);
        this.purchaseRecieptFrm.patchValue({
          itemDetails: null
        });
      }
    }, () => {
      this.purchaseRecieptFrm.patchValue({
        itemDetails: null
      });
    });
    (modalInstance.componentInstance as ItemDetailsComponent).recieptData = this.purchaseRecieptFrm.getRawValue();
  }

  onPOSelect(event): void {
    if (event) {
      if (this.poNoPreviousVal && this.poNoPreviousVal.poNo !== event.poNo && this.prItemList.length) {
        this.openConfirmPopup('all selected items will clear', 'poselect', event);
        return;
      } else {
        this.poNoPreviousVal = event.poNo;
      }
      this.purchaseRecieptFrm.patchValue({
        grnDate: new Date(event.poDate)
      });
    } else {
      this.poNoPreviousVal = '';
      this.itemList = _.filter(this.supplierItemList, dt => +dt.balQty > 0);
    }
    this.getPurchaseOrdersById();
  }

  savePurchaseReciept(): void {
    this.submitted = true;
    if (!this.prItemList.length) {
      this.notifyAlertMessage({
        msg: 'Please Add Item(s)',
        class: 'danger',
      });
      return;
    } else if (this.purchaseRecieptFrm.invalid) {
      this.notifyAlertMessage({
        msg: 'Please Check Fields',
        class: 'danger',
      });
      return;
    }
    const reqParams = this.purchaseRecieptFrm.getRawValue();
    reqParams.billDate = moment(reqParams.billDate).format('YYYY-MM-DD');
    reqParams.grnDate = moment(reqParams.grnDate).format('YYYY-MM-DD');
    reqParams.receivedDate = moment(reqParams.receivedDate).format('YYYY-MM-DD');
    reqParams.grnItemList = this.prItemList;
    _.map(reqParams.grnItemList, dt => {
      dt.discountPercent = _.isNumber(dt.discountPercent) ? dt.discountPercent : 0;
      dt.freeQty = dt.freeQty ? dt.freeQty : 0;
      dt.gstPercent = _.isNumber(dt.gstPercent) ? dt.gstPercent : 0;
    });
    this.transactionsService.saveGRN(reqParams).subscribe((res: any) => {
      if (res.status_message === 'Success') {
        this.submitted = false;
        this.alertMsg = {
          message: res.message,
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        if (this.purchaseRecieptFrm.value.isTakePrint) {
          this.getPrintData(reqParams.grnId ? reqParams.grnId : res.data);
        } else {
          this.route.navigate(['/inventory/transactions/purchaseRecieptList']);
        }
      }
    });
  }

  billCalculation(list): void {
    // let prAmount = 0;
    let gstAmt = 0;
    // let discountAmt = 0;
    // let acceptQty = 0;
    let purchaseAmt = 0;

    list.forEach(element => {
      // prAmount += (+element.purchaseRate);
      gstAmt += (+element.gstAmount ? +element.gstAmount : 0);
      // discountAmt += (+element.discountAmount);
      // acceptQty += (+element.acceptedQty);
      purchaseAmt += (+element.purchaseRate - element.discountAmount) * element.acceptedQty;
    });

    this.purchaseRecieptFrm.patchValue({
      purchaseAmount: purchaseAmt,
      gstAmount: gstAmt,
      discountPercent: this.purchaseRecieptFrm.value.discountPercent ? this.purchaseRecieptFrm.value.discountPercent : 0,
      discountAmount: this.purchaseRecieptFrm.value.discountAmount ? this.purchaseRecieptFrm.value.discountAmount : 0,
    });
    const formData = this.purchaseRecieptFrm.getRawValue();
    this.purchaseRecieptFrm.patchValue({
      netAmount: (+formData.purchaseAmount + +formData.gstAmount) - +formData.discountAmount
    });
    this.totalNetAmount = this.purchaseRecieptFrm.getRawValue().netAmount;
  }

  onDelete(indx): void {
    this.prItemList.splice(indx, 1);
  }

  updateStatus(status): void {
    const msg = 'Do you really want to ' + status + ' this GRN?';
    if (status !== 'Approve') {
      this.openConfirmReasonPopup(msg, status);
      return;
    } else {
      // this.purchaseRecieptFrm.value.isApproved = true;
      this.purchaseRecieptFrm.patchValue({
        isApproved: true
      });
      this.savePurchaseReciept();
    }
  }

  openConfirmReasonPopup(msg, status, from?): void {
    const modalTitleobj = `${status} GDN`;
    const modalBodyobj = msg;
    const messageDetails = {
      modalTitle: modalTitleobj,
      modalBody: modalBodyobj,
      buttonType: 'yes_no',
    };
    const modalInstance = this.modalService.open(ConfirmationPopupWithReasonComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false
      });
    modalInstance.result.then((result) => {
      if (result.status === 'yes') {
        if (status === 'Cancel') {
          this.cancelPurchaseReceipt(result.reason);
          return;
        } else if (status === 'Reject') {
          this.rejectPurchaseReceipt(result.reason);
          return;
        }
      }
    }, () => { });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  rejectPurchaseReceipt(reason): void {
    const reqParams = {
      Id: this.purchaseRecieptFrm.value.grnId,
      remark: reason
    };
    this.transactionsService.rejectGRN(reqParams).subscribe(res => {
      if (res) {
        this.notifyAlertMessage({
          msg: 'Rejected Successfully!',
          class: 'success',
        });
        setTimeout(() => {
          this.route.navigate(['/inventory/transactions/purchaseRecieptList']);
        }, 1000);
      } else {
        this.notifyAlertMessage({
          msg: 'Something Went Wrong',
          class: 'danger',
        });
        return false;
      }
    });
  }

  cancelPurchaseReceipt(reason): void {
    const reqParams = {
      Id: this.purchaseRecieptFrm.value.grnId,
      remark: reason
    };
    this.transactionsService.cancelGRN(reqParams).subscribe(res => {
      if (res) {
        this.notifyAlertMessage({
          msg: 'Canceled Successfully!',
          class: 'Success',
        });
        setTimeout(() => {
          this.route.navigate(['/inventory/transactions/purchaseRecieptList']);
        }, 1000);
      } else {
        this.notifyAlertMessage({
          msg: 'Something Went Wrong',
          class: 'danger',
        });
        return false;
      }
    });
  }

  notifyAlertMessage(data): void {
    this.alertMsg = {
      message: data.msg,
      messageType: data.class,
      duration: Constants.ALERT_DURATION
    };
  }

  calculateGstValue(gstcode, gstPercent, gstAmount, from): any {
    if (!gstPercent || gstPercent === 0) {
      return;
    }
    const dividedValues = this.commonService.divideGstCalculations(gstcode, gstPercent);
    if (from === 'sgst') {
      return { val: (gstAmount / 2), percent: dividedValues.sgstPercent };
    }
    if (from === 'cgst') {
      return { val: (gstAmount / 2), percent: dividedValues.cgstPercent };
    }
    if (from === 'igst') {
      return { val: gstAmount, percent: dividedValues.igstPercent };
    }
    if (from === 'ugst') {
      return { val: gstAmount, percent: dividedValues.igstPercent };
    }
    return dividedValues;
  }

  openConfirmPopup(msg, from, value): void {
    const modalTitleobj = 'Confirm';
    const modalBodyobj = msg;
    const messageDetails = {
      modalTitle: modalTitleobj,
      modalBody: modalBodyobj,
      buttonType: 'yes_no'
    };
    const modalInstance = this.modalService.open(ConfirmationPopupComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false
      });
    modalInstance.result.then((result) => {
      if (result === 'yes') {
        if (from === 'poselect') {
          this.prItemList = [];
          this.poNoPreviousVal = value;
        }
        return;
      } else {
        this.purchaseRecieptFrm.patchValue({
          poId: this.poNoPreviousVal.poId
        });
        return;
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  onDiscountPerChange(event, disValue?): void {
    const discountPercent = event ? +event.target.value : disValue;
    const formData = this.purchaseRecieptFrm.getRawValue();
    const sumOfVal = _.sumBy(this.prItemList, (dt) => {
      return _.toNumber(dt.netTotalAmount);
    });
    this.purchaseRecieptFrm.patchValue({
      discountAmount: ((sumOfVal * +(discountPercent)) / 100).toFixed(2),
    });
    this.purchaseRecieptFrm.patchValue({
      netAmount: sumOfVal - +((sumOfVal * Number(discountPercent)) / 100).toFixed(2)
    });
  }

  onDiscountAmount(event, disAmount?): void {
    const discountAmount = event ? +event.target.value : disAmount;
    const formData = this.purchaseRecieptFrm.getRawValue();
    const sumOfVal = _.sumBy(this.prItemList, (dt) => {
      return _.toNumber(dt.netTotalAmount);
    });
    this.purchaseRecieptFrm.patchValue({
      discountPercent: ((discountAmount * 100) / sumOfVal).toFixed(2),
    });
    this.purchaseRecieptFrm.patchValue({
      netAmount: sumOfVal - +discountAmount
    });
  }

  getPrintData(id?) {
    const idVal = id || this.purchaseRecieptId;
    const url = environment.REPORT_API + 'Report/GRNPrint/?auth_token=' + this.authService.getAuthToken() + '&grnId=' + idVal;
    this.printData = { url: url, returnType: id ? true : false };
  }

  redirectToListPage() {
    this.route.navigate(['/inventory/transactions/purchaseRecieptList']);
  }

}
