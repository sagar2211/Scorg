import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IAlert } from 'src/app/public/models/AlertMessage';
import * as _ from 'lodash';
import { MastersService } from 'src/app/modules/masters/services/masters.service';
import { Observable, forkJoin, of, concat, Subject } from 'rxjs';
import { map, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { Supplier } from 'src/app/modules/masters/modals/supplier.model';
import { TransactionsService } from '../../services/transactions.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Constants } from 'src/app/config/constants';
import { AddUpdateItemPurchaseOrderComponent } from '../add-update-item-purchase-order/add-update-item-purchase-order.component';
import { ConfirmationPopupComponent } from 'src/app/shared/confirmation-popup/confirmation-popup.component';
import { AuthService } from 'src/app/public/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ConfirmationPopupWithReasonComponent } from 'src/app/shared/confirmation-popup-with-reason/confirmation-popup-with-reason.component';
import { PermissionsConstants } from "../../../../config/PermissionsConstants";
import { CommonService } from 'src/app/public/services/common.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-add-update-purchase-order',
  templateUrl: './add-update-purchase-order.component.html',
  styleUrls: ['./add-update-purchase-order.component.scss']
})
export class AddUpdatePurchaseOrderComponent implements OnInit {
  purchaseForm: FormGroup;
  loadForm: boolean;
  alertMsg: IAlert;
  compInstance = this;
  supplierList: Supplier[] = [];
  itemList = [];
  supplierItemsArray = [];
  deliverylist = [];
  payTermlist = [];
  todayDate = new Date();
  submitted: boolean;
  isEditModeEnable: boolean;
  editSupplierData = null;
  constants = null;
  userId;
  constpermissionList: any = [];
  prevSupVal = null;
  printData = null;

  suppListAll$ = new Observable<any>();
  suppListAllInput$ = new Subject<any>();
  suppListItemAll$ = new Observable<any>();
  suppListItemAllInput$ = new Subject<any>();
  constructor(
    private fb: FormBuilder,
    private mastersService: MastersService,
    private transactionsService: TransactionsService,
    private modalService: NgbModal,
    private authService: AuthService,
    private router: Router,
    private commonService: CommonService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.isEditModeEnable = false;
    this.submitted = false;
    const forkArray = [];
    this.constants = Constants;
    this.userId = this.authService.getLoggedInUserId();
    this.loadSupplierList('');
    forkArray.push(this.getGroupBySearchKeyword());
    forkArray.push(this.getPaymentTermMasterList());
    forkJoin(forkArray).subscribe(res => {
      if (this.router.url.includes('addPurchaseOrder')) {
        this.createForm();
      } else {
        this.route.paramMap.subscribe(params => {
          this.getPurchaseOrderById(params.get('purOrdrId')).subscribe(res => {
            this.editSupplierData = res.data;
            this.isEditModeEnable = true;
            this.createForm();
          });
        });
      }
    });
    this.constpermissionList = PermissionsConstants;
    this.commonService.routeChanged(this.route);
  }

  createForm(form?) {
    this.patchDefaultValue(form);
  }

  patchDefaultValue(val?) {
    const form = {
      poNo: [0],
      poDate: [new Date()],
      poId: [0],
      reference: [null],
      rateContract: [false],
      supplier: [null, Validators.required],
      fromDate: [new Date()],
      toDate: [new Date()],
      item: [null],
      delivery: [Constants.defaultDeliveryObject, Validators.required],
      payTerms: [Constants.defaultPaymentTermObject, Validators.required],
      warranty: [null],
      remarks: [null],
      createdBy: [null],
      totalAmount: [0],
      totalGstAmount: [0],
      totalNetAmount: [0],
      discountAmount: [0],
      discountPercent: [0],
      discountType: ['discountAmount'],
      grandTotal: [0],
      isApproved: [false],
      isTakePrint: [false],
    };
    this.purchaseForm = this.fb.group(form);
    if (this.isEditModeEnable) {
      this.patchFormValues();
    } else {
      this.loadForm = true;
    }
  }

  patchFormValues() {
    const suppObj = {
      id: this.editSupplierData.supplierId,
      name: this.editSupplierData.supplierName,
      state: {
        id: this.editSupplierData.stateId,
        name: this.editSupplierData.stateName,
      },
      gstCode: this.editSupplierData.supplierGstCode,
      gstRegNo: this.editSupplierData.supplierGstRegNo,
    };
    const delvObj = {
      id: this.editSupplierData.deliveryId,
      description: this.editSupplierData.deleveryName,
    };
    const payTermsObj = {
      id: this.editSupplierData.paymentTermId,
      description: this.editSupplierData.paymentTermName,
    };
    this.purchaseForm.controls.poId.patchValue(this.editSupplierData.poId);
    this.purchaseForm.controls.poNo.patchValue(this.editSupplierData.poNo);
    this.purchaseForm.controls.poDate.patchValue(this.editSupplierData.poDate);
    this.purchaseForm.controls.reference.patchValue(this.editSupplierData.poReference);
    this.purchaseForm.controls.rateContract.patchValue(this.editSupplierData.rateContract);
    this.purchaseForm.controls.supplier.patchValue(suppObj);
    this.purchaseForm.controls.fromDate.patchValue(this.editSupplierData.rcValidFrom ? new Date(this.editSupplierData.rcValidFrom) : new Date());
    this.purchaseForm.controls.toDate.patchValue(this.editSupplierData.rcValidTo ? new Date(this.editSupplierData.rcValidTo) : new Date());
    this.purchaseForm.controls.delivery.patchValue(delvObj);
    this.purchaseForm.controls.payTerms.patchValue(payTermsObj);
    this.purchaseForm.controls.warranty.patchValue(this.editSupplierData.warranty);
    this.purchaseForm.controls.remarks.patchValue(this.editSupplierData.remark);
    this.purchaseForm.controls.totalAmount.patchValue(this.editSupplierData.purchaseAmount);
    this.purchaseForm.controls.totalGstAmount.patchValue(this.editSupplierData.gstAmount);
    this.purchaseForm.controls.totalNetAmount.patchValue(this.editSupplierData.netAmount);
    this.purchaseForm.controls.createdBy.patchValue(this.editSupplierData.createdBy);
    if (this.editSupplierData.discountAmount) {
      this.purchaseForm.controls.discountAmount.patchValue(this.editSupplierData.discountAmount);
    } else {
      this.purchaseForm.controls.discountAmount.patchValue(0);
    }
    if (this.editSupplierData.discountPercent) {
      this.purchaseForm.controls.discountPercent.patchValue(this.editSupplierData.discountPercent);
    } else {
      this.purchaseForm.controls.discountPercent.patchValue(0);
    }
    _.map(this.editSupplierData.itemlist, itemData => {
      const itemObj = {
        conversionFactor: itemData.conversionFactor,
        gstRate: itemData.gstPercent,
        itemCode: itemData.itemCode,
        itemId: itemData.itemId,
        itemName: itemData.itemName,
        purchaseUnitId: itemData.purchaseUnitId,
        purchaseUnitName: itemData.purchaseUnitName
      };
      const obj = {
        detailId: itemData.detailId ? itemData.detailId : 0,
        item: itemObj,
        qty: itemData.qty ? itemData.qty : 0,
        freeQty: itemData.freeQty ? itemData.freeQty : 0,
        totalQty: itemData.totalQty ? itemData.totalQty : 0,
        rate: itemData.rate ? itemData.rate : 0,
        amount: itemData.amount ? itemData.amount : 0,
        discountPercent: itemData.discountPercent ? itemData.discountPercent : 0,
        discountAmount: itemData.discountAmount ? itemData.discountAmount : 0,
        gstCode: itemData.gstCode ? itemData.gstCode : null,
        gstPercent: itemData.gstPercent ? itemData.gstPercent : 0,
        gstAmount: itemData.gstAmount ? itemData.gstAmount : 0,
        netAmount: itemData.netAmount ? itemData.netAmount : 0,
        mrp: itemData.mrp ? itemData.mrp : 0,
        unitRate: itemData.unitRate ? itemData.unitRate : 0,
        remark: itemData.remark ? itemData.remark : null,
        discountType: null
      };
      // if (obj.discountPercent) {
      //   obj.discountType = 'discountPercent';
      //   obj.discountAmount = _.toNumber(((itemData.rate * itemData.discountPercent) / 100).toFixed(2));
      // } else {
      //   obj.discountType = 'discountAmount';
      //   obj.discountPercent = _.toNumber(((itemData.discountAmount * 100) / itemData.rate).toFixed(2));
      // }
      obj.discountType = 'discountAmount';
      obj.discountPercent = _.toNumber(((itemData.discountAmount * 100) / itemData.rate).toFixed(2));
      this.supplierItemsArray.push(_.cloneDeep(obj));
    });
    this.loadForm = true;
    this.calculateOnItemArrayTotal();
    this.loadItemList('');
  }

  generateItemVal() {
    const objArray = [];
    _.map(this.supplierItemsArray, dt => {
      const obj = _.cloneDeep(dt);
      obj.itemId = _.cloneDeep(dt.item.itemId);
      // if (obj.discountType === 'discountAmount') {
      //   obj.discountPercent = 0;
      // } else if (obj.discountType === 'discountPercent') {
      //   obj.discountAmount = 0;
      // }
      objArray.push(obj);
    });
    return objArray;
  }

  saveValue() {
    this.submitted = true;
    if (this.purchaseForm.valid && this.submitted) {
      if (this.supplierItemsArray.length > 0) {
        const formVal = this.purchaseForm.value;
        const param = {
          poId: formVal.poId,
          poDate: new Date(),
          indentId: 1,
          rateContract: formVal.rateContract,
          rcValidFrom: (formVal.rateContract && formVal.fromDate) ? formVal.fromDate : null,
          rcValidTo: (formVal.rateContract && formVal.toDate) ? formVal.toDate : null,
          storeId: this.authService.getLoginStoreId(),
          supplierId: formVal.supplier ? formVal.supplier.id : null,
          poReference: formVal.reference ? formVal.reference : null,
          purchaseAmount: formVal.totalAmount ? formVal.totalAmount : 0,
          gstAmount: formVal.totalGstAmount ? formVal.totalGstAmount : 0,
          discountPercent: (formVal.discountPercent)
            ? formVal.discountPercent : 0, // formVal.discountType === 'discountPercent' &&
          discountAmount: (formVal.discountAmount)
            ? formVal.discountAmount : 0, // formVal.discountType === 'discountAmount' &&
          netAmount: formVal.totalNetAmount ? formVal.totalNetAmount : 0,
          paymentTermId: formVal.payTerms ? formVal.payTerms.id : 0,
          deliveryId: formVal.delivery ? formVal.delivery.id : 0,
          warranty: formVal.warranty ? formVal.warranty : null,
          remark: formVal.remarks ? formVal.remarks : null,
          isApproved: formVal.isApproved,
          itemlist: this.generateItemVal()
        };
        if (!param.rateContract) {
          param.rcValidFrom = null;
          param.rcValidTo = null;
        }
        this.transactionsService.savePurchaseOrderData(param).subscribe(response => {
          if (response.data) {
            this.alertMsg = {
              message: response.message,
              messageType: 'success',
              duration: Constants.ALERT_DURATION
            };
            if (formVal.isTakePrint) {
              this.getPrintData(formVal.poId ? formVal.poId : response.data);
            } else {
              this.navigateToListPage();
            }

          } else {
            this.alertMsg = {
              message: response.message,
              messageType: 'warning',
              duration: Constants.ALERT_DURATION
            };
          }
        });
      } else {
        this.alertMsg = {
          message: 'Please Add Items!',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
      }
    }
  }

  deleteItemFromArray(item, index) {
    this.openConfirmPopup(index, 'Are you sure?', 'item');
  }

  updateItemFromArray(item, index) {
    this.openPopup(item, 'update');
  }

  openConfirmPopup(val, msg, from) {
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
        if (from === 'supplier') {
          this.compInstance.purchaseForm.controls.supplier.patchValue(null);
          this.compInstance.purchaseForm.controls.item.patchValue(null);
          this.supplierItemsArray = [];
        }
        if (from === 'item') {
          this.supplierItemsArray.splice(val, 1);
          this.calculateOnItemArrayTotal();
        }
        if (from === this.constants.purchaseOrderStatusApproved) {
          this.approveOrder();
        }
        if (from === 'Delete') {
          this.deleteOrder();
        }
        return;
      } else {
        if (from === 'supplier') {
          this.compInstance.purchaseForm.controls.supplier.patchValue(val);
          this.loadItemList('');
        }
        return;
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  openPopup(val, forVal) {
    val.gstCode = this.compInstance.purchaseForm.value.supplier.gstCode;
    const itemData = {
      item: val,
      type: forVal
    };
    const modalInstance = this.modalService.open(AddUpdateItemPurchaseOrderComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        windowClass: 'custom-modal add-update',
        container: '#homeComponent'
      });
    modalInstance.result.then((result) => {
      if (result.type === 'close') {
        this.addItems(result.data, result.forVal);
      }
    }, (dis) => {
      this.compInstance.purchaseForm.controls.item.patchValue(null);
    });
    modalInstance.componentInstance.itemData = itemData;
  }

  addItems(itemData, forVal) {
    const obj = {
      detailId: itemData.detailId ? itemData.detailId : 0,
      item: itemData.item ? itemData.item : null,
      itemId: itemData.item ? itemData.item.itemId : 0,
      qty: itemData.qty ? itemData.qty : 0,
      freeQty: itemData.freeQty ? itemData.freeQty : 0,
      totalQty: itemData.totalQty ? itemData.totalQty : 0,
      rate: itemData.rate ? itemData.rate : 0,
      amount: itemData.amount ? itemData.amount : 0,
      discountPercent: itemData.discountPercent ? itemData.discountPercent : 0,
      discountAmount: itemData.discountAmount ? itemData.discountAmount : 0,
      discountType: itemData.discountType ? itemData.discountType : null,
      gstCode: itemData.gstCode ? itemData.gstCode : null,
      gstPercent: itemData.gstPercent ? itemData.gstPercent : 0,
      gstAmount: itemData.gstAmount ? itemData.gstAmount : 0,
      netAmount: itemData.netAmount ? itemData.netAmount : 0,
      mrp: itemData.mrp ? itemData.mrp : 0,
      unitRate: itemData.unitRate ? itemData.unitRate : 0,
      remark: itemData.remark ? itemData.remark : null,
    };
    if (forVal === 'add') {
      this.supplierItemsArray.push(_.cloneDeep(obj));
    } else {
      obj.item = itemData.item;
      obj.itemId = itemData.item.itemId;
      const findIndex = _.findIndex(this.supplierItemsArray, itm => {
        return itm.detailId === obj.detailId && itm.item.itemId === itemData.item.itemId;
      });
      if (findIndex !== -1) {
        this.supplierItemsArray[findIndex] = _.cloneDeep(obj);
      }
    }
    this.compInstance.purchaseForm.controls.item.patchValue(null);
    this.calculateOnItemArrayTotal();
  }

  calculateOnItemArrayTotal() {
    if (this.supplierItemsArray.length) {
      this.compInstance.purchaseForm.controls.totalAmount.patchValue(this.getSumOf('amount'));
      this.compInstance.purchaseForm.controls.totalGstAmount.patchValue(this.getSumOf('gstAmount'));
      this.compInstance.purchaseForm.controls.totalNetAmount.patchValue(this.getSumOf('netAmount'));
      this.updateItemCaluLation(this.compInstance.purchaseForm.value.discountType);
    } else {
      this.compInstance.purchaseForm.controls.totalAmount.patchValue(0);
      this.compInstance.purchaseForm.controls.totalGstAmount.patchValue(0);
      this.compInstance.purchaseForm.controls.totalNetAmount.patchValue(0);
      this.compInstance.purchaseForm.controls.discountPercent.patchValue(0);
      this.compInstance.purchaseForm.controls.discountAmount.patchValue(0);
      this.compInstance.purchaseForm.controls.grandTotal.patchValue(0);
    }
  }

  getGroupBySearchKeyword(): Observable<any> {
    return this.mastersService.getDeliveryMasterList().pipe(map(res => {
      this.deliverylist = res;
      return this.deliverylist;
    }));
  }

  getPurchaseOrderById(id): Observable<any> {
    return this.transactionsService.getPurchaseOrderById(id).pipe(map(res => {
      // console.log(res);
      return res;
    }));
  }

  getPaymentTermMasterList(): Observable<any> {
    return this.mastersService.getPaymentTermMasterList().pipe(map(res => {
      this.payTermlist = res;
      return this.payTermlist;
    }));
  }

  onDeliveryChange(dlvry) {
    // console.log(dlvry);
  }

  onPaymentTermChange(pt) {
    // console.log(pt);
  }

  getSumOf(key) {
    return _.toNumber((_.sumBy(this.supplierItemsArray, key).toFixed(2)));
  }

  get purchaseFormControl() {
    return this.purchaseForm.controls;
  }

  updateItemCaluLation(key?) {
    const formVal = this.purchaseForm.value;
    let discountAmount = _.cloneDeep(formVal.discountAmount);
    let discountPercent = _.cloneDeep(formVal.discountPercent);
    const totalNetAmount = _.cloneDeep(formVal.totalNetAmount);
    let netAmount = 0;
    this.compInstance.purchaseForm.controls.discountType.patchValue(key);
    if (key && key === 'discountAmount') {
      discountPercent = _.toNumber(((discountAmount / totalNetAmount) * 100).toFixed(2));
      this.compInstance.purchaseForm.controls.discountPercent.patchValue(discountPercent);
    } else if (key && key === 'discountPercent') {
      discountAmount = _.toNumber(((totalNetAmount * discountPercent) / 100).toFixed(2));
      this.compInstance.purchaseForm.controls.discountAmount.patchValue(discountAmount);
    }
    netAmount = totalNetAmount - discountAmount;
    this.compInstance.purchaseForm.controls.grandTotal.patchValue(netAmount);
  }

  updateStatus(status) {
    const msg = 'Do you want to ' + status + ' this Order?';
    if (status === 'Delete') {
      this.openConfirmPopup(null, msg, status);
      return;
    }
    if (status !== this.constants.purchaseOrderStatusApproved) {
      this.openConfirmReasonPopup(msg, status);
    } else {
      this.openConfirmPopup(null, msg, status);
    }
  }

  cancelOrder(val) {
    const param = {
      Id: this.compInstance.purchaseForm.value.poId,
      remark: val ? val : null
    };
    this.transactionsService.cancelPurchaseOrder(param).subscribe(res => {
      if (res.status_code === 200) {
        this.alertMsg = {
          message: 'Order Cancel!',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        setTimeout(() => {
          this.navigateToListPage();
        }, 1000);
      }
    });
  }

  approveOrder() {
    const param = {
      poId: this.compInstance.purchaseForm.value.poId
    };
    this.transactionsService.approvePurchaseOrder(param).subscribe(res => {
      if (res.status_code === 200) {
        this.alertMsg = {
          message: 'Order Approved!',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        setTimeout(() => {
          this.navigateToListPage();
        }, 1000);
      }
    });
  }

  rejectOrder(val) {
    const param = {
      Id: this.compInstance.purchaseForm.value.poId,
      remark: val ? val : null
    };
    this.transactionsService.rejectPurchaseOrder(param).subscribe(res => {
      if (res.status_code === 200) {
        this.alertMsg = {
          message: 'Order Rejected!',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        setTimeout(() => {
          this.navigateToListPage();
        }, 1000);
      }
    });
  }

  deleteOrder() {
    this.transactionsService.deletePurchaseOrder(this.compInstance.purchaseForm.value.poId).subscribe(res => {
      if (res.status_code === 200) {
        this.alertMsg = {
          message: 'Order Deleted!',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        setTimeout(() => {
          this.navigateToListPage();
        }, 1000);
      }
    });
  }

  openConfirmReasonPopup(msg, from) {
    const modalTitleobj = 'Confirm';
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
        if (from === this.constants.purchaseOrderStatusCancel) {
          this.cancelOrder(result.reason);
          return;
        } else if (from === this.constants.purchaseOrderStatusRejected) {
          this.rejectOrder(result.reason);
          return;
        }
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  navigateToListPage() {
    this.router.navigate(['/inventory/transactions/purchaseOrders']);
  }

  onitemChange(val) {
    if (_.isEmpty(val)) {
      this.compInstance.purchaseForm.controls.item.patchValue(null);
      return;
    }
    const findIndex = _.findIndex(this.supplierItemsArray, itm => {
      return itm.item.itemId === val.itemId;
    });
    if (findIndex !== -1) {
      this.alertMsg = {
        message: 'Item Already Added!',
        messageType: 'warning',
        duration: Constants.ALERT_DURATION
      };
      this.compInstance.purchaseForm.controls.item.patchValue(null);
      return;
    }
    this.compInstance.purchaseForm.controls.item.patchValue(val);
    this.openPopup(val, 'add');
  }

  onsupplierChange(val) {
    if (this.prevSupVal && this.supplierItemsArray.length > 0) {
      this.openConfirmPopup(this.prevSupVal, 'items will also removed if remove Supplier, Are you sure?', 'supplier');
      return;
    }
    if (_.isEmpty(val)) {
      this.compInstance.purchaseForm.controls.supplier.patchValue(null);
      return;
    }
    this.compInstance.purchaseForm.controls.supplier.patchValue(val);
    this.prevSupVal = _.cloneDeep(val);
    this.loadItemList('');
  }

  private loadSupplierList(searchTxt?): void {
    this.suppListAll$ = concat(
      this.mastersService.getSupplierBySearchKeyword(searchTxt ? searchTxt : '', true), // default items
      this.suppListAllInput$.pipe(
        distinctUntilChanged(),
        switchMap(term => this.mastersService.getSupplierBySearchKeyword(term, true).pipe(
          catchError(() => of([])), // empty list on error
        ))
      )
    );
  }

  private loadItemList(searchTxt?): void {
    this.suppListItemAll$ = concat(
      this.transactionsService.getSupplierItemsListNgSelect(searchTxt ? searchTxt : '', this.purchaseForm.value.supplier.id), // default items
      this.suppListItemAllInput$.pipe(
        distinctUntilChanged(),
        switchMap(term => this.transactionsService.getSupplierItemsListNgSelect(term, this.purchaseForm.value.supplier.id).pipe(
          catchError(() => of([])), // empty list on error
        ))
      )
    );
  }

  calculateGstValue(gstcode, gstPercent, gstAmount, from) {
    if (!gstPercent || gstPercent === 0) {
      return { val: 0, percent: 0 };
    }
    const dividedValues = this.commonService.divideGstCalculations(gstcode, gstPercent);
    if (from === 'sgst') {
      return { val: (gstAmount * dividedValues.sgstPercent) / 100, percent: dividedValues.sgstPercent };
    }
    if (from === 'cgst') {
      return { val: (gstAmount * dividedValues.cgstPercent) / 100, percent: dividedValues.cgstPercent };
    }
    if (from === 'igst') {
      return { val: (gstAmount * dividedValues.igstPercent) / 100, percent: dividedValues.igstPercent };
    }
    if (from === 'ugst') {
      return { val: (gstAmount * dividedValues.igstPercent) / 100, percent: dividedValues.igstPercent };
    }
    return dividedValues;
  }

  getPrintData(id?) {
    const idVal = id || this.editSupplierData.poId;
    const url = environment.REPORT_API + 'Report/PurchaseOrderPrint/?auth_token=' + this.authService.getAuthToken() + '&poId=' + idVal;
    this.printData = { url: url, returnType: id ? true : false };
  }

}
