import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Subject, Observable, concat, of } from 'rxjs';
import { TransactionsService } from '../../../transactions/services/transactions.service';
import { distinctUntilChanged, switchMap, catchError, debounceTime } from 'rxjs/operators';
import { IPOList } from '../../../transactions/modals/po-list.modal';
import { SupplierItem } from '../../../transactions/modals/supplier-item.modal';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { Constants } from 'src/app/config/constants';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationPopupWithReasonComponent } from 'src/app/shared/confirmation-popup-with-reason/confirmation-popup-with-reason.component';
import { PermissionsConstants } from '../../../../config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { ConfirmationPopupComponent } from 'src/app/shared/confirmation-popup/confirmation-popup.component';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/public/services/auth.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { NgSelectComponent } from '@ng-select/ng-select';

//import by sagar bhujbal
import { DxDataGridComponent } from "devextreme-angular";
import CustomStore from "devextreme/data/custom_store";
import { MastersService } from 'src/app/modules/masters/services/masters.service';

@Component({
  selector: 'app-purchase-reciept-add',
  templateUrl: './purchase-reciept-add.component.html',
  styleUrls: ['./purchase-reciept-add.component.scss']
})
export class PurchaseRecieptAddComponent implements OnInit {

  @ViewChild('selectItem') select: NgSelectComponent;
  @ViewChild('quantityValue', { static: false }) quantityValue: ElementRef;
  @ViewChild(DxDataGridComponent, { static: false }) public dataGrid: DxDataGridComponent;

  @ViewChild('polistComp') polistSelect: NgSelectComponent;
  @ViewChild('suppInvoice') suppInvoiceComp: ElementRef;
  purchaseRecieptFrm: FormGroup;
  purchaseForm: FormGroup;
  supplierList$ = new Observable<any>();
  supplierListInput$ = new Subject<any>();
  suppListAllInput$ = new Subject<any>();
  poListAllInput$ = new Subject<any>();
  destroy$ = new Subject<any>();

  itemMasterCache: any = [];
  poList: Array<IPOList> = [];
  itemList: Array<SupplierItem> = [];
  itemListClone: Array<SupplierItem> = [];
  supplierItemsArray = [];
  rowUpdateArray = [];
  poItemArray = [];
  constpermissionList: any = [];
  supplierItemList = [];
  supplierList: Array<any>;
  alertMsg: IAlert;
  purchaseRecieptId: number;
  storeId: number;
  itemMasterDataSource: any;
  selectedItemKeys: any;
  totalNetAmount = 0.00;
  lastIndex = 0;

  formLoading = false;
  isAddedNewRow = false;
  submittedItem = false;
  isCopyModeOn = false;
  submitted = false;
  loadForm = false;

  allowEditing = true;
  focusIndex = null;
  selectedIndex = null;
  prevSupVal = null;
  loginUserId = null;
  printData = null;
  poNoPreviousVal: any = {};
  editorOptions: object;
  formTableRows;
  public challanQty;
  public receivedQty;
  public acceptedQty;
  public freeQty;
  TooltipTarget: any;
  ToolTipText: string;
  isVisible = false;

  constructor(
    private transactionsService: TransactionsService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private commonService: CommonService,
    private authService: AuthService,
    private mastersService: MastersService,
    private cd: ChangeDetectorRef
  ) {
    this.editorOptions = {
      itemTemplate: "itemTemplate"
    }
    // this.calculateSelectedRow = this.calculateSelectedRow.bind(this);
    this.savePurchaseReciept = this.savePurchaseReciept.bind(this);
    this.validateReceivedQty = this.validateReceivedQty.bind(this);
    this.validateAcceptedQty = this.validateAcceptedQty.bind(this);
    this.onEditorPreparing = this.onEditorPreparing.bind(this);
    this.billCalculation = this.billCalculation.bind(this);
    this.getItemMasterDataSource();
    this.onDelete = this.onDelete.bind(this);
  }

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
      }
    });
    this.constpermissionList = PermissionsConstants;
  }

  ngOnDestroy(): void {
    this.modalService.dismissAll();
    this.destroy$.next();
    this.destroy$.unsubscribe();
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
      createdBy: updateData.createdBy,
      isGenerateBarCode: updateData.isGenerateBarCode ? true : false,
    });

    const formValues = this.purchaseRecieptFrm.getRawValue();
    if (formValues.poId && formValues.supplierId) {
      this.getPurchaseOrdersById(updateData);
    } else {
      if (updateData) {
        _.map(updateData.receiptItemList, (item, index) => {
          this.updatePoItemData(item, index);
        })
      } else {
        this.onSupplierChange(this.purchaseRecieptFrm.getRawValue(), updateData);
      }
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
      isGenerateBarCode: [false],
      // poItemList: this.fb.array([]),
    });
    this.purchaseRecieptFrm.get('grnNo').disable();
    this.purchaseRecieptFrm.get('purchaseAmount').disable();
    // this.purchaseRecieptFrm.get('gstAmount').disable();
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
        this.billCalculation(this.poItemArray);
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

  onPOSelect(event): void {
    if (event) {
      this.purchaseRecieptFrm.patchValue({
        grnDate: new Date(event.poDate)
      });
      this.suppInvoiceComp.nativeElement.focus();
      // this.poItemList.clear();
      this.poItemArray = [];
    } else {
      this.poItemArray = [];
      this.addItemInArray(null, null);
      this.initDataGrid();
      this.poNoPreviousVal = '';
      this.itemList = _.filter(this.supplierItemList, dt => +dt.balQty > 0);
    }
    this.getPurchaseOrdersById();
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
    const sumOfVal = _.sumBy(this.poItemArray, (dt) => {
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
    const sumOfVal = _.sumBy(this.poItemArray, (dt) => {
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
    this.billCalculation(this.poItemArray);
    if (this.purchaseRecieptId !== -1 && this.itemList.length !== this.poItemArray.length) {
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

    this.billCalculation(this.poItemArray);
    this.loadForm = true;
  }

  updatePoItemData(data, index) {
    const poQty = data.balQty ? data.balQty : (data.poQty ? data.poQty : 0)
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
      item: data.item,
      itemId: data.itemId,
      itemName: data.itemName,
      itemCode: data.itemCode,
      itemCf: data.conversionFactor ? data.conversionFactor : null,
      itemUnit: data.purchaseUnitName ? data.purchaseUnitName : null,
      batchNo: data.batchNo ? data.batchNo : '',
      expiryDate: data.expiryDate,
      poQty: data.poQty ? data.poQty : poQty,
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
      saleUnitPrice: data.saleUnitPrice ? data.saleUnitPrice : 0,
      netTotalAmount: data.netAmount ? data.netAmount : data.netTotalAmount ? data.netTotalAmount : 0,
      remark: '',
      isActive: _.isUndefined(data.isActive) ? false : data.isActive,
      isDelete: false,
      indexFocus: index,
      indexSelected: index,
      scanCode: data.scanCode ? data.scanCode : null,
      sslCode: data.sslCode ? data.sslCode : null,
    };
    this.poItemArray.push(obj);
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
    this.billCalculation(this.poItemArray);
  }

  getRowClass = (row) => {
    return row.value.isActive ? { 'row-strick-out': false } : { 'row-strick-out': true };
  }

  //code written by SB
  initDataGrid() {
    let el = this.dataGrid.instance.getCellElement(0, 'item');
    this.dataGrid.instance.focus(el);
    this.dataGrid.tabIndex = 3;
    this.dataGrid.keyboardNavigation.enabled = true;
    //this.dataGrid.focusStateEnabled = true;

  }

  onBlurSuppInvoice(evt) {
    setTimeout(() => {
      this.dataGrid.instance.editRow(0);
    }, 500);
  }

  calculateSelectedRow(options) {
    if (options.name === "totalAmountSummary") {
      if (options.summaryProcess === "start") {
        options.totalValue = 0;
      } else if (options.summaryProcess === "calculate") {
        options.totalValue = _.toNumber(parseFloat(this.purchaseForm.value.totalAmount).toFixed(2));
      }
    } else if (options.name === "totalGstAmountSummary") {
      if (options.summaryProcess === "start") {
        options.totalValue = 0;
      } else if (options.summaryProcess === "calculate") {
        options.totalValue = _.toNumber(parseFloat(this.purchaseForm.value.totalGstAmount).toFixed(2));
      }
    } else if (options.name === "totalNetAmountSummary") {
      if (options.summaryProcess === "start") {
        options.totalValue = 0;
      } else if (options.summaryProcess === "calculate") {
        options.totalValue = _.toNumber(parseFloat(this.purchaseForm.value.totalNetAmount).toFixed(2));
      }
    } else if (options.name === "grandTotalSummary") {
      if (options.summaryProcess === "start") {
        options.totalValue = 0;
      } else if (options.summaryProcess === "calculate") {
        options.totalValue = _.toNumber(parseFloat(this.purchaseForm.value.grandTotal).toFixed(2));
      }
    }
  }

  getItemMasterDataSource() {
    let compObj = this;
    this.itemMasterDataSource = new CustomStore({
      key: "itemCode",
      load: function (loadOptions: any) {
        return compObj.getSupplierItemsListPromise(compObj, loadOptions.searchValue).then((result) => {
          return result;
        });
      },
      // Needed to process selected value(s) in the SelectBox, Lookup, Autocomplete, and DropDownBox
      byKey: (key) => {
        return compObj.getSupplierItemsListPromise(compObj, key).then((result) => {
          return result;
        });
      }
    });
  }
  getSupplierItemsListPromise(compObj, searchValue) {
    return new Promise((resolve, reject) => {
      let supplierId = compObj.purchaseForm && compObj.purchaseForm.value && compObj.purchaseForm.value.supplier ? compObj.purchaseForm.value.supplier.id : 3;
      const dataArray = _.find(this.itemMasterCache, (o) => { return _.isEqual(o.request, { searchValue, supplierId }); });
      if (dataArray && dataArray.result && dataArray.result.length > 0) {
        resolve(dataArray.result);
      } else {
        compObj.mastersService.getSupplierItemsListOnSettings(searchValue, supplierId).subscribe(result => {
          this.itemMasterCache.push({
            request: { searchValue, supplierId },
            result: result
          });
          resolve(result);
        });
      }
    });
  }

  onSupplierChange(event, updateData?): void {
    if (this.prevSupVal && this.supplierItemsArray.length > 0) {
      this.openConfirmPopup(this.prevSupVal, 'items will also removed if remove Supplier, Are you sure?', 'supplier');
      return;
    }
    this.purchaseRecieptFrm.reset();
    this.purchaseRecieptId = -1;
    if (event) {
      this.purchaseRecieptFrm.patchValue({
        supplierId: event.supplierId,
        grnNo: 0,
        billDate: new Date(),
        receivedDate: new Date(),
        grnDate: updateData?.grnDate ? new Date(updateData.grnDate) : new Date()
      });
      this.getPoListBySupplier(event.supplierId);
      this.addItemInArray(null, null);
      this.initDataGrid();
      this.polistSelect.focus();
    } else {
      this.poItemArray = [];
    }
  }

  addItemInArray(item, index = null) {
    if (index !== null) {
      this.selectedIndex = null;
      this.focusIndex = null;
    }
    if ((item && item.totalQty && item.mrp) || index === null) {
      const form = {
        tempId: Math.random(),
        itemName: null,
        poQty: null,
        challanQty: null,
        receivedQty: null,
        acceptedQty: null,
        freeQty: null,
        totalQty: null,
        batchNo: null,
        expiryDate: null,
        mrp: null,
        purchaseRate: null,
        discountPercent: null,
        discountAmount: null,
        gstAmount: null,
        unitRate: null,
        saleUnitPrice: null,
        netTotalAmount: null,
        discountType: null,
        detailId: null,
        item: null,
        qty: null,
        rate: null,
        amount: null,
        gstCode: null,
        gstPercent: null,
        remark: null,
        indexFocus: (index !== null) ? (index + 1) : 0,
        indexSelected: (index !== null) ? (index + 1) : 0,
        scanCode: null,
        sslCode: null
      };
      this.poItemArray.push(form);
      this.selectedIndex = (index !== null) ? (index + 1) : 0;
      this.isAddedNewRow = true;
      setTimeout(() => {
        this.select ? this.select.focus() : '';
      }, 500);
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

  showValidationMsg(msg) {
    this.alertMsg = {
      message: msg,
      messageType: 'warning',
      duration: Constants.ALERT_DURATION
    };
  }

  //Return true if the value is valid; otherwise, false.
  validateChallanQty(options) {
    let rowObj = options.data;
    let updatedChallanQty = options.value;
    if (updatedChallanQty <= rowObj.poQty) {
      return true;
    } else {
      return false;
    }
  }

  validateReceivedQty(options) {
    let rowObj = options.data;
    let updatedReceivedQty = options.value;
    if (updatedReceivedQty && updatedReceivedQty <= rowObj.challanQty) {
      return true;
    } else {
      return false;
    }
  }

  validateAcceptedQty(options) {
    let rowObj = options.data;
    let updatedAcceptedQty = options.value;
    if (updatedAcceptedQty && updatedAcceptedQty <= rowObj.receivedQty) {
      return true;
    } else {
      return false;
    }
  }

  validateTotalQty(options) {
    let rowObj = options.data;
    let updatedTotalQty = parseFloat(options.value || 0);
    if (updatedTotalQty && updatedTotalQty <= parseFloat(rowObj.poQty || 0)) {
      return true;
    } else {
      return false;
    }
  }

  validateMRP(options) {
    let rowObj = options.data;
    let updatedMrp = parseFloat(options.value || 0);
    if (updatedMrp && updatedMrp >= parseFloat(rowObj.unitRate || 0)) {
      return true;
    } else {
      return false;
    }
  }

  validateSalePrice(options) {
    let rowObj = options.data;
    let updatedSalePrice = parseFloat(options.value || 0);
    if (updatedSalePrice && updatedSalePrice <= parseFloat(rowObj.mrp || 0)) {
      return true;
    } else {
      return false;
    }
  }

  savePurchaseReciept(): void {
    this.submitted = true;
    this.submittedItem = true;
    if (this.dataGrid.editing.changes.length > 0 && this.purchaseRecieptFrm.value.poId) {
      this.notifyAlertMessage({
        msg: 'Please save modified change row.',
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

    _.remove(this.poItemArray, function (item) {
      if (item.isDelete === true || (!item.itemName
        && !item.challanQty && !item.receivedQty && !item.acceptedQty && !item.batchNo
        && !item.expiryDate && !item.saleUnitPrice && !item.mrp)) {
        return item;
      }
    });
    let checkFormValid = this.checkValidEntries(this.poItemArray);

    if (checkFormValid.length > 0) {
      this.notifyAlertMessage({
        msg: 'Please check entered fields is not valid or empty.',
        class: 'danger',
      });
      return;
    }

    const reqParams = this.purchaseRecieptFrm.getRawValue();
    reqParams.grnId = reqParams.grnId ? reqParams.grnId : 0;
    reqParams.discountAmount = reqParams.discountAmount ? reqParams.discountAmount : 0;
    reqParams.discountPercent = reqParams.discountPercent ? reqParams.discountPercent : 0;
    reqParams.gstAmount = reqParams.gstAmount ? reqParams.gstAmount : 0;
    reqParams.netAmount = reqParams.netAmount ? reqParams.netAmount : 0;
    reqParams.purchaseAmount = reqParams.purchaseAmount ? reqParams.purchaseAmount : 1;
    reqParams.billNo = reqParams.billNo ? reqParams.billNo : 1;
    reqParams.isApproved = reqParams.isApproved ? reqParams.isApproved : false;
    reqParams.storeId = this.storeId;
    reqParams.billDate = moment(reqParams.billDate).format('YYYY-MM-DD');
    reqParams.grnDate = moment(reqParams.grnDate).format('YYYY-MM-DD');
    reqParams.receivedDate = moment(reqParams.receivedDate).format('YYYY-MM-DD');
    reqParams.isGenerateBarCode = reqParams.isGenerateBarCode ? reqParams.isGenerateBarCode : false;
    reqParams.grnItemList = [];

    _.map(this.poItemArray, elmt => {
      let data = elmt;
      data.poQty = _.isNumber(data.poQty) ? data.poQty : 0;
      data.item = data.item;
      data.itemId = _.isObject(data.itemName) ? (data.itemName.itemId ? data.itemName.itemId : 1) : data.itemId;
      data.itemName = _.isObject(data.itemName) ? data.itemName.itemName : data.itemName;
      data.freeQty = data.freeQty ? data.freeQty : 0;
      data.batchNo = data.batchNo ? data.batchNo : "0";
      data.gstPercent = _.isNumber(data.gstPercent) ? data.gstPercent : 0;
      data.gstAmount = _.isNumber(data.gstAmount) ? data.gstAmount : 0;
      data.netTotalAmount = _.isNumber(data.netTotalAmount) ? data.netTotalAmount : 0;
      data.purchaseRate = _.isNumber(data.purchaseRate) ? data.purchaseRate : 0;
      data.totalQty = _.isNumber(data.totalQty) ? data.totalQty : 0;
      data.unitRate = _.isNumber(data.unitRate) ? data.unitRate : 0;
      data.gstCode = _.isNumber(data.gstCode) ? data.gstCode : 0;
      data.scanCode = data.scanCode ? data.scanCode : null;
      reqParams.grnItemList.push(data);
    })
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

  checkValidEntries(data) {
    let dataValidation = _.filter(data, item => {
      return ((!item.itemName || !item.challanQty || !item.receivedQty || !item.acceptedQty
        || !item.batchNo || !item.expiryDate || !item.saleUnitPrice || !item.mrp)
        || (this.purchaseRecieptFrm.value.poId && ((item.challanQty > item.poQty) || (item.receivedQty > item.challanQty) || (item.acceptedQty > item.receivedQty)))
        || (!this.purchaseRecieptFrm.value.poId && ((item.receivedQty > item.challanQty) || (item.acceptedQty > item.receivedQty))))
    })
    return dataValidation
  }

  onDelete(e) {
    let rowIndex = e.row.rowIndex;
    _.map(this.poItemArray, (elmt, indx) => {
      if (rowIndex === indx) {
        elmt.isDelete = true;
      }
    })
    this.dataGrid.instance.refresh();
  }

  onRowPrepared(e) {
    if (e.rowType === "data" && e.data.isDelete === true && e.isEditing === false) {
      let classString = e.rowElement.className;
      let isClassExist = classString.indexOf("inactive-row") !== -1;
      if (!isClassExist) {
        e.rowElement.className += " inactive-row";
      }
    } else if (e.isEditing) {
      let classString = e.rowElement.className;
      let isClassExist = classString.indexOf("inactive-row") !== -1;
      if (isClassExist) {
        classString.replace(' inactive-row', '');
      }
    }
  }

  onCellClick(evt) {
    if (evt.rowType === "data" && evt.data.isDelete !== true) {
      evt.component.editRow(evt.row.rowIndex);
      let el = evt.component.getCellElement(evt.row.rowIndex);
      evt.component.focus(el);
    }
  }

  onEditorPreparing(evt: any): void {
    let rowObj = this.poItemArray[evt.row.rowIndex];
    if (evt.parentType == "dataRow") {
      evt.editorOptions.onKeyDown = (arg) => {
        if (evt.dataField == "sslCode" && !this.purchaseRecieptFrm.value.poId) {//&& arg.event.keyCode == 11
          let isValidDataField = this.validateRowDetail(evt.row.rowIndex);
          if (!isValidDataField) {
            setTimeout(() => {
              if (evt.row.rowIndex === this.poItemArray.length - 1) {
                this.addNewEmptyRow();
              }
            }, 1000)

            setTimeout(() => {
              evt.component.editRow(evt.row.rowIndex + 1)
              let el = evt.component.getCellElement(evt.row.rowIndex + 1, isValidDataField);
              evt.component.focus(el);
            }, 1200);
          } else {
            let el = evt.component.getCellElement(evt.row.rowIndex + 1, isValidDataField);
            evt.component.focus(el);
          }
        }
      }

      evt.editorOptions.onValueChanged = (e: any) => {
        if (evt.dataField == 'itemName') {
          // let date = moment('31-12-2099').toISOString();
          rowObj.expiryDate = moment(new Date('31-Dec-2099')).toISOString();//'Thu Dec 31 2099 00:00:00 GMT+0530 (India Standard Time)';
          if (!this.purchaseRecieptFrm.value.poId) {
            rowObj.gstPercent = e.value.gstRate;
          }
          const isExist = _.find(this.poItemArray, (item, indx) => {
            return (item.itemId === e.value.itemId && indx !== evt.row.rowIndex)
          })
          if (isExist) {
            this.notifyAlertMessage({
              msg: 'Item is already added...',
              class: 'danger',
            });
            rowObj.item = {};
            rowObj.itemId = '';
            rowObj.itemName = '';

            this.dataGrid.instance.refresh();
            return
          }
          rowObj.item = e.value;
          rowObj.itemName = e.value.itemName;
          rowObj.itemId = e.value.itemId;
        } else if (evt.dataField == 'challanQty') {
          rowObj.challanQty = e.value;
        } else if (evt.dataField == 'receivedQty') {
          rowObj.receivedQty = e.value;
        } else if (evt.dataField == 'acceptedQty') {
          rowObj.acceptedQty = e.value;
        } else if (evt.dataField == 'freeQty') {
          rowObj.freeQty = e.value;
        } else if (evt.dataField == 'totalQty') {
          rowObj.totalQty = e.value;
        } else if (evt.dataField == 'batchNo') {
          rowObj.batchNo = e.value;
        } else if (evt.dataField == 'expiryDate') {
          rowObj.expiryDate = e.value.toISOString();
        } else if (evt.dataField == 'mrp') {
          rowObj.mrp = e.value;
        } else if (evt.dataField == 'purchaseRate') {
          rowObj.purchaseRate = (+e.value).toFixed(2);
        } else if (evt.dataField == 'gstPercent') {
          rowObj.gstPercent = e.value;
        } else if (evt.dataField == 'discountPercent') {
          rowObj.discountAmount = ((rowObj.purchaseRate * e.value) / 100).toFixed(2);
          rowObj.discountPercent = e.value;
          rowObj.netTotalAmount = (+rowObj.purchaseRate - +rowObj.discountAmount).toFixed(2);
        } else if (evt.dataField == 'discountAmount') {
          const discPerMain = ((e.value * 100) / +rowObj.purchaseRate).toFixed(2);
          rowObj.discountAmount = e.value;
          rowObj.discountPercent = discPerMain;
          rowObj.netTotalAmount = (+rowObj.purchaseRate - +rowObj.discountAmount).toFixed(2);
        } else if (evt.dataField == 'saleUnitPrice') {
          rowObj.saleUnitPrice = e.value;
        } else if (evt.dataField == 'scanCode') {
          rowObj.scanCode = e.value;
        }
        evt.setValue(e.value);
        rowObj.totalQty = parseFloat(rowObj.acceptedQty || 0) + parseFloat(rowObj.freeQty || 0);
        this.commonFieldCalculation();
        this.dataGrid.instance.refresh();
        this.billCalculation(this.poItemArray);
      }
      evt.editorOptions.onOpened = (arg) => {
        var popupInstance = arg.component._popup;
        if (evt.dataField === 'itemName') {
          popupInstance.option('width', 700);
          popupInstance.off("optionChanged", this.optionChangedHandler);
          popupInstance.on("optionChanged", this.optionChangedHandler);
        }
      }
    }
  }

  optionChangedHandler(args) {
    if (args.name == "width" && args.value < 700) {
      args.component.option("width", 700);
    }
  }

  updateMRP(newData, value, currentRowData) {
    currentRowData.mrp = parseFloat(value).toFixed(2);
  }

  updateTradeRate(newData, value, currentRowData) {
    currentRowData.purchaseRate = parseFloat(value).toFixed(2);
  }

  updateDiscountPercent(newData, value, currentRowData) {
    currentRowData.discountAmount = ((currentRowData.purchaseRate * value) / 100).toFixed(2);
    currentRowData.discountPercent = value;
    currentRowData.netTotalAmount = (+currentRowData.purchaseRate - +currentRowData.discountAmount).toFixed(2);
  }

  updateDiscountAmt(newData, value, currentRowData) {
    const discPerMain = ((value * 100) / +currentRowData.purchaseRate).toFixed(2);
    currentRowData.discountAmount = value;
    currentRowData.discountPercent = discPerMain;
    currentRowData.netTotalAmount = (+currentRowData.purchaseRate - +currentRowData.discountAmount).toFixed(2);
  }

  commonFieldCalculation(): void {
    this.poItemArray.map((dt, i) => {
      const formData = dt;
      const gstAmt = (((+formData.purchaseRate - +formData.discountAmount) * +formData.gstPercent) / 100) * +formData.acceptedQty;
      const netAmt = (formData.acceptedQty * (+formData.purchaseRate - +formData.discountAmount)) + (gstAmt);
      dt.gstAmount = gstAmt;
      dt.netTotalAmount = netAmt;
      const unitRate = (+netAmt / formData.totalQty).toFixed(2);
      dt.unitRate = (parseFloat(unitRate) || 0);
      const mrp = (+netAmt / formData.totalQty).toFixed(2);
      dt.mrp = (parseFloat(mrp) || 0);
      const saleUnitPrice = (+netAmt / formData.totalQty).toFixed(2);
      dt.saleUnitPrice = (parseFloat(saleUnitPrice) || 0);
    });
  }

  billCalculation(list): void {
    let prAmount = 0;
    let gstAmt = 0;
    let discountAmt = 0;
    let acceptQty = 0;
    let purchaseAmt = 0;

    list.forEach(element => {
      if (element.isDelete === true) {
        return;
      }
      prAmount += (+element.purchaseRate);
      gstAmt += (+element.gstAmount ? +element.gstAmount : 0);
      discountAmt += (+element.discountAmount);
      acceptQty += (+element.acceptedQty);

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
    this.dataGrid.instance.refresh();
  }

  validateRowDetail(rowIndex, dataField?) {
    let flag = '';
    // let rowObj = this.supplierItemsArray[rowIndex];
    let rowObj = this.poItemArray[rowIndex];
    if (!rowObj.itemName) {
      flag = 'item';
    } else if (rowObj.receivedQty > rowObj.challanQty) {
      flag = 'receivedQty';
    } else if (rowObj.acceptedQty > rowObj.receivedQty) {
      flag = 'acceptedQty';
    } else if (!rowObj.batchNo) {
      flag = 'batchNo';
    } else if (!rowObj.expiryDate) {
      flag = 'expiryDate';
    } else if (!rowObj.mrp) {
      flag = 'mrp';
    } else if (rowObj.saleUnitPrice > rowObj.mrp) {
      flag = 'saleUnitPrice';
    }
    return flag;
  }

  addNewEmptyRow() {
    let index = this.poItemArray.length - 1;
    const form = {
      tempId: Math.random(),
      itemName: null,
      poQty: null,
      challanQty: null,
      receivedQty: null,
      acceptedQty: null,
      freeQty: null,
      totalQty: null,
      batchNo: null,
      expiryDate: null,
      mrp: null,
      purchaseRate: null,
      discountPercent: null,
      discountAmount: null,
      gstAmount: null,
      unitRate: null,
      saleUnitPrice: null,
      netTotalAmount: null,
      discountType: null,
      detailId: null,
      item: null,
      qty: null,
      rate: null,
      amount: null,
      gstCode: null,
      gstPercent: null,
      remark: null,
      indexFocus: (index !== null) ? (index + 1) : 0,
      indexSelected: (index !== null) ? (index + 1) : 0,
    };
    this.poItemArray.push(form);
  }

  decimalWithPrecision(data: any) {
    return parseFloat(data.value || 0).toFixed(2);
  }
}
