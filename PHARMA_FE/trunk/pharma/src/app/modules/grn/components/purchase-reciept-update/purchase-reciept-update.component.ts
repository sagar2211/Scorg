import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Subject, Observable, concat, of } from 'rxjs';
import { TransactionsService } from "../../../transactions/services/transactions.service";
import { distinctUntilChanged, tap, switchMap, catchError, map, debounceTime, takeUntil } from 'rxjs/operators';
import { IPOList } from '../../../transactions/modals/po-list.modal';
import { SupplierItem } from '../../../transactions/modals/supplier-item.modal';
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
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'app-purchase-reciept-update',
  templateUrl: './purchase-reciept-update.component.html',
  styleUrls: ['./purchase-reciept-update.component.scss']
})
export class PurchaseRecieptUpdateComponent implements OnInit {

  @ViewChild('polistComp') polistSelect: NgSelectComponent;
  @ViewChild('suppInvoice') suppInvoiceComp: ElementRef;
  purchaseRecieptFrm: FormGroup;
  supplierList$ = new Observable<any>();
  supplierListInput$ = new Subject<any>();
  formLoading = false;
  poList: Array<IPOList> = [];
  storeId: number;
  itemList: Array<SupplierItem> = [];
  itemListClone: Array<SupplierItem> = [];
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

  loadForm = false;
  formTableRows;
  destroy$ = new Subject<any>();
  submittedItem = false;
  isCopyModeOn = false;
  lastIndex = 0;
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
    if (this.route.url.includes('purchaseRecieptCopy')) {
      this.isCopyModeOn = true;
    }
    this.activatedRoute.paramMap.subscribe(data => {
      this.purchaseRecieptId = +data.get('id');
      if (this.purchaseRecieptId !== -1) { // update mode
        this.itemList = [];
        this.transactionsService.getGRNById(this.purchaseRecieptId).subscribe((res1: any) => {
          this.updateForm(res1.data);
          // this.prItemList = res1.data.receiptItemList;
          // this.loadSupplierList(res1.data.supplierName);
          this.getPoListBySupplier(res1.data.supplierId);
        });
        if (!this.isCopyModeOn) {
          this.purchaseRecieptFrm.get('supplierId').disable();
        }
      } else { // -- add mode
        this.itemList = [];
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
    this.destroy$.next();
    this.destroy$.unsubscribe();
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
    let grnId = 0;
    let grnNo = 0;
    let billNo = 0;
    let grnDate = new Date();
    let receivedDate = new Date();
    let billDate = new Date();
    if (this.isCopyModeOn) {
      grnId = 0;
      grnNo = 0;
      billNo = null;
      grnDate = new Date();
      receivedDate = new Date();
      billDate = new Date();
    } else {
      grnId = updateData.grnId ? updateData.grnId : 0;
      grnNo = updateData.grnNo ? updateData.grnNo : 0;
      billNo = updateData.billNo ? updateData.billNo : null;
      receivedDate = updateData.ReceivedDate ? new Date(updateData.ReceivedDate) : new Date();
      grnDate = updateData.grnDate ? new Date(updateData.grnDate) : new Date();
      billDate = updateData.billDate ? new Date(updateData.billDate) : null;
    }
    this.purchaseRecieptFrm.patchValue({
      grnId: grnId,
      grnNo: grnNo,
      grnDate: grnDate,
      receivedDate: receivedDate,
      supplierId: updateData.supplierId ? updateData.supplierId : null,
      billNo: billNo,
      billDate: billDate,
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
    if (!this.isCopyModeOn) {
      this.purchaseRecieptFrm.get('poId').disable();
    }
    const formValues = this.purchaseRecieptFrm.getRawValue();
    if (formValues.poId && formValues.supplierId) {
      this.getPurchaseOrdersById(updateData);
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
      createdBy: [null],
      poItemList: this.fb.array([]),
    });
    this.purchaseRecieptFrm.get('grnNo').disable();
    this.purchaseRecieptFrm.get('purchaseAmount').disable();
    this.purchaseRecieptFrm.get('gstAmount').disable();
    this.purchaseRecieptFrm.get('netAmount').disable();
    this.purchaseRecieptFrm.get('rateContract').disable();
  }

  private loadSupplierList(searchTxt?): void {
    this.supplierList$ = concat(
      this.transactionsService.getSupplierBySearchKeyword(searchTxt ? searchTxt : ''), // default items
      this.supplierListInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.transactionsService.getSupplierBySearchKeyword(term).pipe(
          catchError(() => of([])), // empty list on error
        ))
      )
    );
  }

  // private loadSupplierList(searchTxt?): void {
  //   this.supplierList$ = concat(
  //     this.transactionsService.getSupplierBySearchKeyword(searchTxt = searchTxt ? searchTxt : '').pipe(map(res => {
  //       this.supplierList = res;
  //       const index = this.supplierList.findIndex((o) => o.supplierId === this.purchaseRecieptFrm.getRawValue().supplierId);
  //       if (index > -1) {
  //         const suppObject = this.supplierList[index];
  //         this.purchaseRecieptFrm.patchValue({
  //           gstCode: suppObject.gstCode
  //         });
  //       }
  //       return res;
  //     })), // default items
  //     this.supplierListInput$.pipe(
  //       distinctUntilChanged(),
  //       tap(() => this.formLoading = true),
  //       switchMap(term => this.transactionsService.getSupplierBySearchKeyword(term).pipe(
  //         catchError(() => of([])), // empty list on error
  //         tap(() => this.formLoading = false)
  //       ))
  //     )
  //   );
  // }

  onSupplierChange(event): void {
    this.purchaseRecieptFrm.reset();
    this.poItemList.clear();
    this.purchaseRecieptId = -1;
    if (event) {
      this.purchaseRecieptFrm.patchValue({
        supplierId: event.supplierId,
        billDate: new Date()
      });
      this.getPoListBySupplier(event.supplierId);
      // this.getSupplierItemsList();
      this.polistSelect.focus();
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
  getPurchaseOrdersById(updateData?): void {
    const formValues = this.purchaseRecieptFrm.getRawValue();
    const POID = formValues.poId ? formValues.poId : 0;
    if (POID === 0) {
      this.purchaseRecieptFrm.patchValue({
        poDate: null,
        rateContract: null,
        rcValidFrom: null,
        rcValidTo: null
      });
      this.itemList = this.supplierItemList;
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
      if (this.purchaseRecieptId === -1) {
        this.createFormItem();
      } else {
        this.updatePoItemList(updateData.receiptItemList);
        this.billCalculation(this.poItemList.value);
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
        // this.prItemList[index] = result;
      } else {
        // this.prItemList.push(result);
        // this.billCalculation(this.prItemList);
        // this.purchaseRecieptFrm.patchValue({
        //   itemDetails: null
        // });
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
      if (this.poNoPreviousVal && this.poNoPreviousVal.poNo !== event.poNo && this.poItemList.value.length) {
        this.openConfirmPopup('all selected items will clear', 'poselect', event);
        return;
      } else {
        this.poNoPreviousVal = event.poNo;
      }
      this.purchaseRecieptFrm.patchValue({
        grnDate: new Date(event.poDate)
      });
      this.suppInvoiceComp.nativeElement.focus();
      this.poItemList.clear();
    } else {
      this.poNoPreviousVal = '';
      this.itemList = _.filter(this.supplierItemList, dt => +dt.balQty > 0);
    }
    this.getPurchaseOrdersById();
  }

  savePurchaseReciept(): void {
    this.submitted = true;
    this.submittedItem = true;
    if (!this.poItemList.value.length) {
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
    reqParams.grnItemList = this.poItemList.value.filter(d => d.isActive);
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
          this.route.navigate(['/inventory/transactions/grn/purchaseRecieptList']);
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
      if (!element.isActive) {
        return;
      }
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
          this.route.navigate(['/inventory/transactions/grn/purchaseRecieptList']);
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
          this.route.navigate(['/inventory/transactions/grn/purchaseRecieptList']);
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
    const sumOfVal = _.sumBy(this.poItemList.value, (dt) => {
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
    const sumOfVal = _.sumBy(this.poItemList.value, (dt) => {
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
    this.route.navigate(['/inventory/transactions/grn/purchaseRecieptList']);
  }

  // Change reated to item list //

  customSearchFn(term: string, item) {
    term = term.toLocaleLowerCase();
    return (item.poNo.toLocaleLowerCase().indexOf(term) > -1 ||
      moment(item.poDate).format('DD-MM-YYYY').indexOf(term) > -1 ||
      ("" + item.poAmount).indexOf(term) > -1);
  }

  createFormItem(form?) {
    this.updatePoItemList();
  }

  get poItemList() {
    return this.purchaseRecieptFrm.get('poItemList') as FormArray;
  }

  updatePoItemList(valList?) {
    const list = valList || this.itemList;
    list.map((data: any, index) => {
      this.updatePoItemData(data, index);
    });
    this.commonFieldCalculation();
    this.billCalculation(this.poItemList.value);
    if (this.purchaseRecieptId !== -1 && this.itemList.length !== this.poItemList.value.length) {
      this.itemList.map((d, i) => {
        const data = this.poItemList.value.filter((pd, pi) => {
          return pd.itemId === d.itemId;
        });
        if (data.length === 0) {
          d['isActive'] = false;
          this.updatePoItemData(d, i);
        }
      });
    }
    this.formTableRows = (this.purchaseRecieptFrm.get("poItemList") as FormArray).controls;
    this.billCalculation(this.poItemList.value);
    this.loadForm = true;
  }

  updatePoItemData(data, index) {
    const challanQty = data.balQty ? data.balQty : (data.challanQty ? data.challanQty : 0)
    const receivedQty = data.balQty ? data.balQty : (data.receivedQty ? data.receivedQty : 0);
    const acceptedQty = data.balQty ? data.balQty : (data.acceptedQty ? data.acceptedQty : 0);
    const totalQty = acceptedQty + data.freeQty;
    let grnDetId = 0;
    if (this.isCopyModeOn) {
      grnDetId = 0;
    } else {
      grnDetId = data.grnDetailId ? data.grnDetailId : 0;
    }
    const obj = {
      grnDetailId: grnDetId,
      itemId: data.itemId,
      itemName: data.itemName,
      itemCode: data.itemCode,
      itemCf: data.conversionFactor ? data.conversionFactor : null,
      itemUnit: data.purchaseUnitName ? data.purchaseUnitName : null,
      batchNo: data.batchNo ? data.batchNo : '',
      expiryDate: null,
      poQty: data.balQty ? data.balQty : 0,
      challanQty: challanQty,
      receivedQty: receivedQty,
      acceptedQty: acceptedQty,
      freeQty: data.freeQty,
      totalQty: totalQty,
      purchaseRate: data.rate || data.purchaseRate,
      isDiscountInPercent: data.discountPercent ? true : false,
      discountAmount: data.discountAmount ? data.discountAmount : 0,
      discountPercent: data.discountPercent ? data.discountPercent : 0,
      gstCode: data.gstCode,
      gstPercent: data.gstRate || data.gstPercent,
      gstAmount: data.gstAmount ? data.gstAmount : 0,
      unitRate: data.unitRate ? data.unitRate : 0,
      mrp: data.mrp ? data.mrp : 0,
      saleUnitPrice: data.unitRate ? data.unitRate : 0,
      netTotalAmount: data.netAmount ? data.netAmount : data.netTotalAmount ? data.netTotalAmount : 0,
      remark: '',
      isActive: _.isUndefined(data.isActive) ? false : data.isActive,
      // for index
      challanQtyIndex: index === 0 ? 6 : this.lastIndex + 1,
      receivedQtyIndex: index === 0 ? 7 : this.lastIndex + 2,
      acceptedQtyIndex: index === 0 ? 8 : this.lastIndex + 3,
      freeQtyIndex: index === 0 ? 9 : this.lastIndex + 4,
      batchNoIndex: index === 0 ? 10 : this.lastIndex + 5,
      discountPercentIndex: index === 0 ? 11 : this.lastIndex + 6,
      discountAmountIndex: index === 0 ? 12 : this.lastIndex + 7,
      mrpIndex: index === 0 ? 13 : this.lastIndex + 2,
      saleUnitPriceIndex: index === 0 ? 14 : this.lastIndex + 8,
      isActiveIndex: index === 0 ? 15 : this.lastIndex + 9,
    };
    this.lastIndex = index === 0 ? 15 : this.lastIndex + 9;
    if (this.purchaseRecieptId === -1) {
      obj.isActive = true;
    }
    if (obj.isActive) {
      obj.batchNo = [data.batchNo ? data.batchNo : '', Validators.required];
      obj.expiryDate = [data.expiryDate ? new Date(data.expiryDate) : null, Validators.required];
      obj.acceptedQty = [acceptedQty, Validators.required];
      obj.purchaseRate = [data.rate || data.purchaseRate, Validators.required];
    } else {
      obj.expiryDate = data.expiryDate ? new Date(data.expiryDate) : null
    }
    this.poItemList.push(this.fb.group({ ...obj }));
  }

  commonFieldCalculation(): void {
    this.poItemList.controls.map((dt, i) => {
      const formData = this.poItemList.controls[i].value;
      const gstAmt = (((+formData.purchaseRate - +formData.discountAmount) * +formData.gstPercent) / 100) * +formData.acceptedQty;
      const netAmt = (formData.acceptedQty * (+formData.purchaseRate - +formData.discountAmount)) + (gstAmt);
      this.poItemList.controls[i].patchValue({
        gstAmount: gstAmt.toFixed(2),
        netTotalAmount: netAmt.toFixed(2),
      });
      this.poItemList.controls[i].patchValue({
        unitRate: (+netAmt / formData.totalQty).toFixed(2),
        mrp: (+netAmt / formData.totalQty).toFixed(2),
        saleUnitPrice: (+netAmt / formData.totalQty).toFixed(2)
      });
    });
  }

  updateTotalQty(index) {
    this.poItemList.at(index).patchValue({
      totalQty: (+this.poItemList.at(index).value.freeQty + +this.poItemList.at(index).value.acceptedQty)
    });
    const formData = this.poItemList.at(index).value;
    const fc = this.poItemList.at(index).get('acceptedQty');
    if (+formData.acceptedQty > +formData.receivedQty || +formData.acceptedQty > +formData.challanQty) {
      fc.setErrors({ isAcceptedQtyLess: true });
    } else {
      fc.setErrors(null);
    }
    const chln = this.poItemList.at(index).get('challanQty');
    const challanQty = +formData.challanQty;
    if (!(+challanQty < +formData.receivedQty
      || +challanQty < +formData.acceptedQty
      || (formData.poQty ? +challanQty > +formData.poQty : false))) {
      chln.setErrors(null);
    }
    this.commonFieldCalculation();
    this.billCalculation(this.poItemList.value);
  }

  onRcvQtyChange(index) {
    this.submittedItem = true;
    const formData = this.poItemList.at(index).value;
    const fc = this.poItemList.at(index).get('receivedQty');
    if (formData.receivedQty > +formData.challanQty) {
      fc.setErrors({ isRecievedQtyGreater: true });
    } else {
      fc.setErrors(null);
    }
    const chln = this.poItemList.at(index).get('challanQty');
    const challanQty = +formData.challanQty;
    if ((+challanQty < +formData.receivedQty
      || +challanQty < +formData.acceptedQty
      || (formData.poQty ? +challanQty > +formData.poQty : false))) {
      chln.setErrors({ isChalanQtyLess: true });
    } else {
      chln.setErrors(null);
    }
    const acceptedQty = +formData.acceptedQty;
    const acp = this.poItemList.at(index).get('acceptedQty');
    if (+acceptedQty > +formData.receivedQty || +acceptedQty > +formData.challanQty) {
      acp.setErrors({ isAcceptedQtyLess: true });
    } else {
      acp.setErrors(null);
    }
    this.billCalculation(this.poItemList.value);
    this.commonFieldCalculation();
  }

  onChlnQtyChange(index) {
    this.submittedItem = true;
    const formData = this.poItemList.at(index).value;
    const fc = this.poItemList.at(index).get('challanQty');
    const challanQty = formData.challanQty;
    if (+formData.poQty < +formData.challanQty && (this.purchaseRecieptFrm.value && this.purchaseRecieptFrm.value.poId)) {
      fc.setErrors({ isChallanQtyGreaterPo: true });
    } else if (+challanQty < +formData.receivedQty
      || +challanQty < +formData.acceptedQty
      || (formData.poQty ? +challanQty > +formData.poQty : false)) {
      fc.setErrors({ isChalanQtyLess: true });
    } else {
      fc.setErrors(null);
    }
    const receivedQty = +formData.receivedQty;
    const rcv = this.poItemList.at(index).get('receivedQty');
    if (+receivedQty > +formData.challanQty) {
      rcv.setErrors({ isRecievedQtyGreater: true });
    } else {
      rcv.setErrors(null);
    }
    const acceptedQty = +formData.acceptedQty;
    const acp = this.poItemList.at(index).get('acceptedQty');
    if (+acceptedQty > +formData.receivedQty || +acceptedQty > +formData.challanQty) {
      acp.setErrors({ isAcceptedQtyLess: true });
    } else {
      acp.setErrors(null);
    }
    this.billCalculation(this.poItemList.value);
    this.commonFieldCalculation();
  }

  onMrpChange(index) {
    const formData = this.poItemList.at(index).value;
    const fc = this.poItemList.at(index).get('mrp');
    if (+formData.mrp >= +formData.unitRate) {
      fc.setErrors(null);
    } else {
      fc.setErrors({ isLessThenUnitRate: true });
    }
    this.billCalculation(this.poItemList.value);
    this.commonFieldCalculation();
  }

  onSaleUnitPriceChange(index) {
    const formData = this.poItemList.at(index).value;
    const fc = this.poItemList.at(index).get('saleUnitPrice');
    if (+formData.saleUnitPrice >= +formData.mrp) {
      fc.setErrors(null);
    } else {
      fc.setErrors({ isGreateThenMrp: true });
    }
    this.billCalculation(this.poItemList.value);
    this.commonFieldCalculation();
  }

  onDiscountPercentChange(index, event, disValue?) {
    const formData = this.poItemList.at(index).value;
    const fc = this.poItemList.at(index).get('discountPercent');
    if (+formData.discountPercent > 100) {
      fc.setErrors({ isGreateThenPR: true });
    } else {
      fc.setErrors(null);
    }
    const discountPercent = event ? +event.target.value : disValue;
    this.poItemList.at(index).patchValue({
      discountAmount: ((Number(formData.purchaseRate) * Number(discountPercent)) / 100).toFixed(2),
    });
    this.billCalculation(this.poItemList.value);
    this.commonFieldCalculation();
  }

  onDiscountAmountChange(index, event, disAmount?) {
    const formData = this.poItemList.at(index).value;
    const fc = this.poItemList.at(index).get('discountAmount');
    if (+formData.discountAmount > formData.purchaseRate) {
      fc.setErrors({ isGreateThenPR: true });
    } else {
      fc.setErrors(null);
    }
    const discountAmount = event ? +event.target.value : disAmount;
    this.poItemList.at(index).patchValue({
      discountPercent: ((discountAmount * 100) / +formData.purchaseRate).toFixed(2),
    });
    this.billCalculation(this.poItemList.value);
    this.commonFieldCalculation();
  }

  updateRowActivInactive(index) {
    if (this.poItemList.at(index).value.isActive) {
      const copyAll = [...this.poItemList.value];
      const copyActive = copyAll.filter(d => d.isActive);
      const copyInActive = copyAll.filter(d => !d.isActive);
      copyAll.map((d, i) => this.poItemList.removeAt(i));
      copyActive.map(d => {
        this.poItemList.push(this.fb.group({ ...d }));
      });
      copyInActive.map(d => {
        this.poItemList.push(this.fb.group({ ...d }));
      });
    } else {
      const copyVal = { ...this.poItemList.at(index).value };
      this.poItemList.removeAt(index);
      this.poItemList.push(this.fb.group({ ...copyVal }));
      this.billCalculation(this.poItemList.value);
      this.commonFieldCalculation();
    }
  }

  getRowClass = (row) => {
    return row.value.isActive ? { 'row-strick-out': false } : { 'row-strick-out': true };
  }

}

