import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IAlert } from 'src/app/public/models/AlertMessage';
import * as _ from 'lodash';
import { MastersService } from 'src/app/modules/masters/services/masters.service';
import { Observable, forkJoin, of, concat, Subject } from 'rxjs';
import { map, distinctUntilChanged, switchMap, catchError, debounceTime } from 'rxjs/operators';
import { Supplier } from 'src/app/modules/masters/modals/supplier.model';
import { TransactionsService } from "../../../transactions/services/transactions.service";
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
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { type } from 'os';
import { NgSelectComponent } from '@ng-select/ng-select';
import { DxDataGridComponent } from "devextreme-angular";
import CustomStore from "devextreme/data/custom_store";
import DataSource from 'devextreme/data/data_source';
//import * as AspNetData from "devextreme-aspnet-data-nojquery";

@Component({
  selector: 'app-add-update-purchase-order',
  templateUrl: './add-update-purchase-order.component.html',
  styleUrls: ['./add-update-purchase-order.component.scss']
})
export class AddUpdatePurchaseOrderComponent implements OnInit {

  @ViewChild(DatatableComponent, { static: false }) public table: DatatableComponent;
  @ViewChild('selectItem') select: NgSelectComponent;
  @ViewChild('quantityValue', { static: false }) quantityValue: ElementRef;

  @ViewChild(DxDataGridComponent, { static: false }) public dataGrid: DxDataGridComponent;
  editorOptions: object;
  itemMasterDataSource: any;
  allowEditing = true;

  focusIndex = null;
  selectedIndex = null;

  purchaseForm: FormGroup;
  loadForm: boolean;
  alertMsg: IAlert;
  supplierList: Supplier[] = [];
  itemList = [];
  supplierItemsArray = [];
  deliverylist = [];
  payTermlist = [];
  todayDate = new Date();
  submitted: boolean;
  isEditModeEnable: boolean;
  isCopyModeEnable: boolean;
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

  // item changes code
  purchaseItemForm: FormGroup;
  loadFormItem: boolean;
  searchString = '';
  itemData;
  submittedItem = false;
  ColumnMode: ColumnMode;
  SelectionType = SelectionType;
  selected = [];
  isAddedNewRow = false;

  constructor(
    private fb: FormBuilder,
    private mastersService: MastersService,
    private transactionsService: TransactionsService,
    private modalService: NgbModal,
    private authService: AuthService,
    private router: Router,
    private commonService: CommonService,
    private route: ActivatedRoute,
  ) {
    this.editorOptions = {
      itemTemplate: "itemTemplate"
    }
    this.getItemMasterDataSource();
    this.calculateSelectedRow = this.calculateSelectedRow.bind(this);
    this.onEditorPreparing = this.onEditorPreparing.bind(this);
    this.onBlurReference = this.onBlurReference.bind(this);
    this.selected = [this.supplierItemsArray[0]];
  }

  ngOnInit(): void {
    this.isEditModeEnable = false;
    this.isCopyModeEnable = false;
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
        //this.itemInit();
      } else if (this.router.url.includes('addCopyPurchaseOrder')) {
        this.route.paramMap.subscribe(params => {
          this.getPurchaseOrderById(params.get('purOrdrId')).subscribe(res => {
            this.editSupplierData = res.data;
            this.isCopyModeEnable = true;
            this.createForm();
            setTimeout(() => {
              this.initDataGrid();
            }, 1000);
            //this.itemInit();
          });
        });
      } else {
        this.route.paramMap.subscribe(params => {
          this.getPurchaseOrderById(params.get('purOrdrId')).subscribe(res => {
            this.editSupplierData = res.data;
            this.isEditModeEnable = true;
            this.allowEditing = this.editSupplierData.status == Constants.purchaseOrderStatusCreated;
            this.createForm();
            setTimeout(() => {
              this.initDataGrid();
            }, 1000);
            //this.itemInit();
          });
        });
      }
    });
    this.constpermissionList = PermissionsConstants;
    this.commonService.routeChanged(this.route);
  }

  checkGridData() {
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
      compObj.mastersService.getSupplierItemsListOnSettings(searchValue, supplierId).subscribe(result => {
        resolve(result);
      });
    });
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
      showTotal: [false],
      isTakePrint: [false],
    };
    this.purchaseForm = this.fb.group(form);
    if (this.isEditModeEnable || this.isCopyModeEnable) {
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
    if (this.isEditModeEnable) {
      this.purchaseForm.controls.poId.patchValue(this.editSupplierData.poId);
      this.purchaseForm.controls.poNo.patchValue(this.editSupplierData.poNo);
    } else if (this.isCopyModeEnable) {
      this.purchaseForm.controls.poId.patchValue(0);
      this.purchaseForm.controls.poNo.patchValue(null);
    }
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
    _.map(this.editSupplierData.itemlist, (itemData, indx) => {
      const itemObj = {
        conversionFactor: itemData.conversionFactor,
        gstRate: itemData.gstPercent,
        itemCode: itemData.itemCode,
        itemId: itemData.itemId,
        itemName: itemData.itemName,
        purchaseUnitId: itemData.purchaseUnitId,
        purchaseUnitName: itemData.purchaseUnitName
      };
      let detId = 0;
      if (this.isEditModeEnable) {
        detId = itemData.detailId ? itemData.detailId : 0;
      } else if (this.isCopyModeEnable) {
        detId = 0;
      }
      const obj = {
        tempId: Math.random(),
        detailId: detId,
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
        discountType: null,
        indexFocus: indx,
        indexSelected: indx
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
      obj.itemId = dt.item ? _.cloneDeep(dt.item.itemId) : null;
      // if (obj.discountType === 'discountAmount') {
      //   obj.discountPercent = 0;
      // } else if (obj.discountType === 'discountPercent') {
      //   obj.discountAmount = 0;
      // }
      obj.detailId = obj.detailId ? obj.detailId : 0;
      obj.freeQty = obj.freeQty ? obj.freeQty : 0;

      if (obj.itemId && obj.qty && parseFloat(obj.amount || 0) > 0
        && parseFloat(obj.netAmount || 0) > 0) {
          objArray.push(obj);
      }
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
          showTotal: false,
          itemlist: this.generateItemVal()
        };
        if (!param.itemlist.length) {
          this.alertMsg = {
            message: 'Please add atleast one valid item for purchase order.',
            messageType: 'warning',
            duration: Constants.ALERT_DURATION
          };
          return false;
        }

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
          this.purchaseForm.controls.supplier.patchValue(null);
          this.purchaseForm.controls.item.patchValue(null);
          this.supplierItemsArray = [];
          //this.purchaseItemForm.reset();
        }
        if (from === 'item') {
          this.supplierItemsArray.splice(val, 1);
          this.selectedIndex = null;
          this.focusIndex = null;
          this.calculateOnItemArrayTotal();
          if (this.supplierItemsArray.length === 0) {
            this.addItemInArray(null, null);
          }
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
          this.purchaseForm.controls.supplier.patchValue(val);
          this.loadItemList('');
        }
        return;
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  openPopup(val, forVal) {
    val.gstCode = this.purchaseForm.value.supplier.gstCode;
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
      this.purchaseForm.controls.item.patchValue(null);
    });
    modalInstance.componentInstance.itemData = itemData;
  }

  addItems(itemData, forVal) {
    const obj = {
      tempId: Math.random(),
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
    this.purchaseForm.controls.item.patchValue(null);
    this.calculateOnItemArrayTotal();
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
    this.purchaseForm.controls.discountType.patchValue(key);
    if (key && key === 'discountAmount') {
      discountPercent = _.toNumber(((discountAmount / totalNetAmount) * 100).toFixed(2));
      this.purchaseForm.controls.discountPercent.patchValue(discountPercent);
    } else if (key && key === 'discountPercent') {
      discountAmount = _.toNumber(((totalNetAmount * discountPercent) / 100).toFixed(2));
      this.purchaseForm.controls.discountAmount.patchValue(discountAmount);
    }
    netAmount = totalNetAmount - discountAmount;
    this.purchaseForm.controls.grandTotal.patchValue(netAmount);
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
      Id: this.purchaseForm.value.poId,
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
      poId: this.purchaseForm.value.poId
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
      Id: this.purchaseForm.value.poId,
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
    this.transactionsService.deletePurchaseOrder(this.purchaseForm.value.poId).subscribe(res => {
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
    this.router.navigate(['/inventory/transactions/po/purchaseOrders']);
  }

  onsupplierChange(val) {
    if (this.prevSupVal && this.supplierItemsArray.length > 0) {
      this.openConfirmPopup(this.prevSupVal, 'items will also removed if remove Supplier, Are you sure?', 'supplier');
      return;
    }
    if (_.isEmpty(val)) {
      this.purchaseForm.controls.supplier.patchValue(null);
      return;
    }
    this.purchaseForm.controls.supplier.patchValue(val);
    this.prevSupVal = _.cloneDeep(val);
    this.loadItemList('');
    this.addItemInArray(null, null);
    this.initDataGrid();
    this.focusIndex = 0;
    this.selectedIndex = 0;
  }

  private loadSupplierList(searchTxt?): void {
    this.suppListAll$ = concat(
      this.mastersService.getSupplierBySearchKeyword(searchTxt ? searchTxt : '', true), // default items
      this.suppListAllInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.mastersService.getSupplierBySearchKeyword(term, true).pipe(
          catchError(() => of([])), // empty list on error
        ))
      )
    );
  }

  private loadItemList(searchTxt?): void {
    this.suppListItemAll$ = concat(
      this.mastersService.getSupplierItemsListOnSettings(searchTxt ? searchTxt : '', this.purchaseForm.value.supplier.id), // default items
      this.suppListItemAllInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.mastersService.getSupplierItemsListOnSettings(term, this.purchaseForm.value.supplier.id).pipe(
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

  addItemInArray(item, index = null) {
    if (index !== null) {
      this.selectedIndex = null;
      this.focusIndex = null;
      //this.clearItemForm()
    }
    if ((item && item.totalQty && item.mrp) || index === null) {
      const form = {
        tempId: Math.random(),
        detailId: null,
        item: null,
        qty: null,
        freeQty: null,
        totalQty: null,
        rate: null,
        amount: null,
        discountPercent: null,
        discountAmount: null,
        discountType: null,
        gstCode: null,
        gstPercent: null,
        gstAmount: null,
        netAmount: null,
        mrp: null,
        unitRate: null,
        remark: null,
        indexFocus: (index !== null) ? (index + 1) : 0,
        indexSelected: (index !== null) ? (index + 1) : 0,
      };
      this.supplierItemsArray.push({ ...form });
      this.selectedIndex = (index !== null) ? (index + 1) : 0;
      // this.purchaseItemForm.controls.indexSelected.patchValue(this.selectedIndex);
      // this.purchaseItemForm.controls.indexFocus.patchValue(this.selectedIndex);
      this.isAddedNewRow = true;
      setTimeout(() => {
        this.select ? this.select.focus() : '';
      }, 500);
    }
  }

  // deleteItemFromArray(item, index) {
  //   if ((this.selectedIndex === index && this.purchaseItemForm.value[index].item === null)
  //     || (this.selectedIndex !== index && this.supplierItemsArray[index].item === null)) {
  //     this.supplierItemsArray.splice(index, 1);
  //     this.selectedIndex = null;
  //     this.focusIndex = null;
  //     this.calculateOnItemArrayTotal();
  //     if (this.supplierItemsArray.length === 0) {
  //       this.addItemInArray(null, null);
  //     }
  //     return;
  //   }
  //   this.openConfirmPopup(index, 'Are you sure?', 'item');
  // }

  // updateItemDataOnSelection() {
  //   _.map(this.editSupplierData.itemlist, (itemData, indx) => {
  //     if (indx !== this.selectedIndex) {
  //       return;
  //     }
  //     const itemObj = {
  //       conversionFactor: itemData.conversionFactor,
  //       gstRate: itemData.gstPercent,
  //       itemCode: itemData.itemCode,
  //       itemId: itemData.itemId,
  //       itemName: itemData.itemName,
  //       purchaseUnitId: itemData.purchaseUnitId,
  //       purchaseUnitName: itemData.purchaseUnitName
  //     };
  //     let detId = 0;
  //     if (this.isEditModeEnable) {
  //       detId = itemData.detailId ? itemData.detailId : 0;
  //     } else if (this.isCopyModeEnable) {
  //       detId = 0;
  //     }
  //     //this.purchaseItemForm.controls.item.patchValue(itemObj);
  //   });
  // }

  // item changes code
  // itemInit() {
  //   this.createFormItem();
  // }

  // createFormItem(form?): void {
  //   this.patchDefaultValueItem(form);
  // }

  // patchDefaultValueItem(val?): void {
  //   const form = {
  //     tempId: [Math.random()],
  //     detailId: [null],
  //     item: [null],
  //     qty: [null, Validators.required],
  //     freeQty: [null],
  //     totalQty: [null],
  //     rate: [null, Validators.required],
  //     amount: [null],
  //     discountPercent: [null],
  //     discountAmount: [null],
  //     discountType: [null],
  //     gstCode: [val && val.gstCode ? val.gstCode : null],
  //     gstPercent: [val && val.gstRate ? val.gstRate : null],
  //     gstAmount: [null],
  //     netAmount: [null],
  //     mrp: [null],
  //     unitRate: [null],
  //     remark: [null],
  //     indexSelected: [0],
  //     indexFocus: [0],
  //   };
  //   // if (this.purchaseItemForm) {
  //   //   this.purchaseItemForm.patchValue(form);
  //   // } else {
  //   //   this.purchaseItemForm = this.fb.group(form);
  //   // }
  //   this.purchaseItemForm = this.fb.group(form);
  //   this.loadForm = true;
  // }

  // patchEditValue(val): void {
  //   if (val.qty) {
  //     this.purchaseItemForm.controls.item.patchValue(val.item);
  //     this.purchaseItemForm.controls.tempId.patchValue(Math.random());
  //     this.purchaseItemForm.controls.detailId.patchValue(val.detailId);
  //     this.purchaseItemForm.controls.qty.patchValue(val.qty);
  //     this.purchaseItemForm.controls.freeQty.patchValue(val.freeQty);
  //     this.purchaseItemForm.controls.totalQty.patchValue(val.totalQty);
  //     this.purchaseItemForm.controls.rate.patchValue(val.rate);
  //     this.purchaseItemForm.controls.amount.patchValue(val.amount);
  //     this.purchaseItemForm.controls.discountPercent.patchValue(val.discountPercent);
  //     this.purchaseItemForm.controls.discountAmount.patchValue(val.discountAmount);
  //     this.purchaseItemForm.controls.discountType.patchValue(val.discountType);
  //     this.purchaseItemForm.controls.gstPercent.patchValue(val.gstPercent);
  //     this.purchaseItemForm.controls.gstAmount.patchValue(val.gstAmount);
  //     this.purchaseItemForm.controls.netAmount.patchValue(val.netAmount);
  //     this.purchaseItemForm.controls.mrp.patchValue(val.mrp);
  //     this.purchaseItemForm.controls.unitRate.patchValue(val.unitRate);
  //     this.purchaseItemForm.controls.remark.patchValue(val.remark);
  //   } else {
  //     this.purchaseItemForm.controls.item.patchValue(val);
  //     this.purchaseItemForm.controls.gstPercent.patchValue(val.gstRate);
  //     this.purchaseItemForm.controls.gstCode.patchValue(val.gstCode);
  //   }
  // }

  // onitemChange(val) {
  //   if (_.isEmpty(val)) {
  //     this.purchaseItemForm.controls.item.patchValue(null);
  //     return;
  //   }
  //   let findIndex = _.findIndex(this.supplierItemsArray, itm => {
  //     return itm.item && (itm.item.itemId === val.itemId);
  //   });
  //   if ((this.isEditModeEnable || this.isCopyModeEnable) && this.selectedIndex !== null) {
  //     findIndex = _.findIndex(this.supplierItemsArray, itm => {
  //       return itm.item && (itm.item.itemId === val.itemId) && itm.detailId !== null;
  //     });
  //   }
  //   if (findIndex !== -1) {
  //     // if edit or copy mode on, and also have data for this row then update last one data
  //     if ((this.isEditModeEnable || this.isCopyModeEnable) && this.selectedIndex !== null) {
  //       this.updateItemDataOnSelection();
  //     } else {
  //       this.clearItemForm();
  //     }
  //     this.alertMsg = {
  //       message: 'Item Already In List',
  //       messageType: 'warning',
  //       duration: Constants.ALERT_DURATION
  //     };
  //     this.updateItemValueOnRowUpdate();
  //     return;
  //   }
  //   this.purchaseItemForm.controls.item.patchValue(val);
  //   // this.openPopup(val, 'add');
  //   this.itemData = this.purchaseItemForm.value.item;
  //   this.itemData.gstCode = this.purchaseForm.value.supplier.gstCode;
  //   this.patchEditValue(this.itemData);
  //   this.quantityValue.nativeElement.focus();
  // }

  // updateFormValueCalculation(formKey): void {
  //   const formval = _.cloneDeep(this.purchaseItemForm.value);
  //   if (formval.qty || formval.freeQty) {
  //     const ttlVal = (formval.qty ? formval.qty : 0) + (formval.freeQty ? formval.freeQty : 0);
  //     this.purchaseItemForm.controls.totalQty.patchValue(ttlVal);
  //   } else {
  //     this.purchaseItemForm.controls.totalQty.patchValue(0);
  //   }
  //   if (formval.qty && formval.rate) {
  //     const amount = (formval.qty ? formval.qty : 0) * (formval.rate ? formval.rate : 0);
  //     this.purchaseItemForm.controls.amount.patchValue(amount);
  //   } else {
  //     this.purchaseItemForm.controls.amount.patchValue(0);
  //   }
  //   if (formKey === 'discountPercent' || formKey === 'discountAmount') {
  //     this.purchaseItemForm.controls.discountType.patchValue(formKey);
  //     if (formKey === 'discountPercent' && formval.discountPercent > 100) {
  //       this.alertMsg = {
  //         message: 'Discount % can not be more then 100',
  //         messageType: 'warning',
  //         duration: Constants.ALERT_DURATION
  //       };
  //       this.purchaseItemForm.controls.discountAmount.patchValue(0);
  //       this.purchaseItemForm.controls.discountPercent.patchValue(0);
  //     }
  //     if (formKey === 'discountAmount' && formval.discountAmount > formval.rate) {
  //       this.alertMsg = {
  //         message: 'Discount can not be more then Rate (' + formval.rate + ')',
  //         messageType: 'warning',
  //         duration: Constants.ALERT_DURATION
  //       };
  //       this.purchaseItemForm.controls.discountAmount.patchValue(0);
  //       this.purchaseItemForm.controls.discountPercent.patchValue(0);
  //     }
  //   }
  //   this.calculateDiscount(formKey, formval);
  // }

  // calculateDiscount(formKey, formval?): void {
  //   formval = formval ? formval : _.cloneDeep(this.purchaseItemForm.value);
  //   let perVal = formval.discountPercent ? formval.discountPercent : 0;
  //   let amtVal = formval.discountAmount ? formval.discountAmount : 0;
  //   this.purchaseItemForm.controls.discountPercent.patchValue(0);
  //   this.purchaseItemForm.controls.discountAmount.patchValue(0);
  //   amtVal = (formKey === 'discountPercent' && !formval.discountPercent) ? 0 : amtVal;
  //   if (formKey === 'discountPercent' && (formval.discountPercent)) {
  //     amtVal = _.toNumber(((formval.rate * formval.discountPercent) / 100).toFixed(2));
  //     this.purchaseItemForm.controls.discountAmount.patchValue(amtVal);
  //     this.purchaseItemForm.controls.discountPercent.patchValue(formval.discountPercent);
  //   } else if (formKey === 'discountAmount' && (formval.discountAmount)) {
  //     perVal = _.toNumber(((formval.discountAmount * 100) / formval.rate).toFixed(2));
  //     this.purchaseItemForm.controls.discountAmount.patchValue(formval.discountAmount);
  //     this.purchaseItemForm.controls.discountPercent.patchValue(perVal);
  //   }
  //   const gstAmount = _.toNumber(((((formval.rate - amtVal) * formval.gstPercent) / 100) * formval.qty).toFixed(2));
  //   const netAmount = _.toNumber((((formval.rate - amtVal) * formval.qty) + gstAmount).toFixed(2));
  //   const netPurAmount = _.toNumber((((formval.rate - amtVal) * formval.qty)).toFixed(2));
  //   const unitRate = _.toNumber((netAmount / formval.totalQty).toFixed(2));
  //   this.purchaseItemForm.controls.gstAmount.patchValue(gstAmount);
  //   this.purchaseItemForm.controls.netAmount.patchValue(netAmount);
  //   this.purchaseItemForm.controls.amount.patchValue(netPurAmount);
  //   this.purchaseItemForm.controls.unitRate.patchValue(unitRate);
  //   this.purchaseItemForm.controls.mrp.patchValue(unitRate);
  //   this.updateItemValueOnRowUpdate();
  // }

  // onMrpUpdate() {
  //   const formval = this.purchaseItemForm.value;
  //   if (formval.unitRate > formval.mrp) {
  //     this.alertMsg = {
  //       message: 'MRP should be Equal/Greter Then Unit Price',
  //       messageType: 'warning',
  //       duration: Constants.ALERT_DURATION
  //     };
  //     this.purchaseItemForm.controls.mrp.patchValue(formval.unitRate);
  //   }
  //   this.updateItemValueOnRowUpdate();
  // }

  // get purchaseFormControlItem() {
  //   return this.purchaseItemForm.controls;
  // }

  // updateItemValueOnRowUpdate() {
  //   if (this.selectedIndex !== null) {
  //     this.supplierItemsArray[this.selectedIndex] = { ...this.purchaseItemForm.value };
  //     this.calculateOnItemArrayTotal();
  //   }
  // }



  // clearItemForm() {
  //   this.purchaseItemForm.controls.item.patchValue(null);
  //   this.purchaseItemForm.controls.tempId.patchValue(Math.random());
  //   this.purchaseItemForm.controls.detailId.patchValue(null);
  //   this.purchaseItemForm.controls.qty.patchValue(null);
  //   this.purchaseItemForm.controls.freeQty.patchValue(null);
  //   this.purchaseItemForm.controls.totalQty.patchValue(null);
  //   this.purchaseItemForm.controls.rate.patchValue(null);
  //   this.purchaseItemForm.controls.amount.patchValue(null);
  //   this.purchaseItemForm.controls.discountPercent.patchValue(null);
  //   this.purchaseItemForm.controls.discountAmount.patchValue(null);
  //   this.purchaseItemForm.controls.discountType.patchValue(null);
  //   this.purchaseItemForm.controls.gstPercent.patchValue(null);
  //   this.purchaseItemForm.controls.gstAmount.patchValue(null);
  //   this.purchaseItemForm.controls.netAmount.patchValue(null);
  //   this.purchaseItemForm.controls.mrp.patchValue(null);
  //   this.purchaseItemForm.controls.unitRate.patchValue(null);
  //   this.purchaseItemForm.controls.remark.patchValue(null);
  // }

  @HostListener('document:keyup', ['$event'])
  handleDeleteKeyboardEvent(event: KeyboardEvent) {
    // if (event.key === 'Delete') {
    //   if (this.selectedIndex !== null) {
    //     this.deleteItemFromArray(this.supplierItemsArray[this.selectedIndex], this.selectedIndex);
    //   }
    // }
  }

  onToolbarPreparing(e) {
    // e.toolbarOptions.items[0].showText = 'always';
    // e.toolbarOptions.items.push({
    //     location: "after",
    //     template: "deleteButton"
    // });
  }

  initDataGrid() {
    let el = this.dataGrid.instance.getCellElement(0, 'item');
    this.dataGrid.instance.focus(el);
    this.dataGrid.tabIndex = 3;
    this.dataGrid.keyboardNavigation.enabled = true;
    //this.dataGrid.focusStateEnabled = true;
  }

  calculateCellValue(rowData: any): void {
    console.log('calculateCellValue', rowData);
  }
  allowDeleting(e) {
    return e.component.totalCount() == 1 ? e.row.rowIndex != 0 : true;
  }

  onEditorPrepared(evt: any) {
    if((evt.dataField !== 'item' && evt.dataField !== 'qty' && evt.dataField !== 'freeQty' && evt.dataField !== 'totalQty' && evt.dataField !== 'mrp') && evt.row.data[evt.dataField] === 0){
      this.supplierItemsArray[evt.row.rowIndex][evt.dataField] = null;
      this.dataGrid.instance.refresh();
    }
    
  }

  onEditorPreparing(evt: any): void {
    if (evt.parentType == "dataRow") {
      evt.editorOptions.onKeyDown = (arg) => {
          if (evt.dataField == "qty"  && arg.event.keyCode == 9 && parseFloat(arg.component.option("text") || 0) <= 0) {
            this.showValidationMsg('Qty should be not be empty');
            arg.event.preventDefault();
          } else if (evt.dataField == "mrp" && arg.event.keyCode == 9 && parseFloat(arg.component.option("text") || 0) <= 0) {
            this.showValidationMsg('MRP should be not be empty');
            arg.event.preventDefault();
          } else if (evt.dataField == "rate" && arg.event.keyCode == 9 && parseFloat(arg.component.option("text") || 0) <= 0) {
            this.showValidationMsg('Rate should be not be empty');
            arg.event.preventDefault();
          } if (evt.dataField == "remark" && arg.event.keyCode == 9
            && (evt.row.dataIndex == (this.supplierItemsArray.length - 1))) {
              let isValidDataField = this.validateRowDetail(evt.row.rowIndex);
              if (!isValidDataField) {
                this.addNewEmptyRow();
                //evt.component.addRow();
              } else {
                let el = evt.component.getCellElement(evt.row.rowIndex, isValidDataField);
                evt.component.focus(el);
              }
              arg.event.preventDefault();
              //evt.element.find(".dx-datagrid-addrow-button").focus();
          }
      }
    }

    evt.editorOptions.onValueChanged = (e: any) => {
      evt.setValue(e.value);

      this.selectedIndex = evt.row.rowIndex;
      let rowIndex = e.row && e.row.rowIndex;
      let component = e.component;
      let rowObj = this.supplierItemsArray[evt.row.rowIndex];
      rowObj.gstCode = this.purchaseForm.value.supplier.gstCode;
      //let rowObj = evt.row.data;

      // on qty change update total qty, amount, net amount
      if (evt.dataField == 'item') {
        const isExist = _.find(this.supplierItemsArray,(item, indx)=>{
          return (item.item?.itemId === e.value.itemId && indx !== evt.row.rowIndex)
        })
        if(isExist){
          this.notifyAlertMessage({
            msg: 'Item is already added...',
            class: 'danger',
          });
          rowObj.item = null;
          rowObj.qty= null;
          rowObj.freeQty= null;
          rowObj.totalQty= null;
          rowObj.rate= null;
          rowObj.amount= null;
          rowObj.discountPercent= null;
          rowObj.discountAmount= null;
          rowObj.discountType= null;
          rowObj.gstCode= null;
          rowObj.gstPercent= null;
          rowObj.gstAmount= null;
          rowObj.netAmount= null;
          rowObj.mrp= null;
          rowObj.unitRate= null;
          rowObj.remark= null;
          this.dataGrid.instance.refresh();
          return
        }
        rowObj.item = e.value;

        // var item = e.component.option("selectedItem");
        // gst percent
        rowObj.gstPercent = _.toNumber(parseFloat(e.value.gstRate || 0).toFixed(2));
        rowObj.rate = _.toNumber(parseFloat(e.value.lastPurchaseRate || 0).toFixed(2));
        rowObj.unitRate = 0;
        rowObj.mrp = _.toNumber(parseFloat(e.value.lastMRP || 0).toFixed(2));


        let el = this.dataGrid.instance.getCellElement(evt.row.rowIndex, 'qty');
        this.dataGrid.instance.focus(el);
      } else if (evt.dataField == 'qty') {
        rowObj.qty = _.toNumber(parseFloat(e.value || 0).toFixed(2));
        this.validateRowDetail(evt.row.rowIndex, 'qty');
      } else if (evt.dataField == 'freeQty') {
        rowObj.freeQty = _.toNumber(parseFloat(e.value || 0).toFixed(2));
      } else if (evt.dataField == 'rate') {
        rowObj.rate = _.toNumber(parseFloat(e.value || 0).toFixed(2));
        this.validateRowDetail(evt.row.rowIndex, 'rate');
      } else if (evt.dataField == 'discountPercent') {
        rowObj.discountType = 'discountPercent';
        rowObj.discountPercent = _.toNumber(parseFloat(e.value || 0).toFixed(2));
      } else if (evt.dataField == 'discountAmount') {
        rowObj.discountType = 'discountAmount'
        rowObj.discountAmount = _.toNumber(parseFloat(e.value || 0).toFixed(2));
      }

      // calculate total qty
      rowObj.totalQty = _.toNumber((parseFloat(rowObj.freeQty || 0) + parseFloat(rowObj.qty || 0)).toFixed(2)) || 0;

      // discount amount and percent calculation
      if (rowObj.discountType == 'discountPercent') {
        rowObj.discountAmount = _.toNumber(((rowObj.rate * rowObj.discountPercent) / 100).toFixed(2)) || 0;
      } else if (rowObj.discountType != 'discountPercent') {
        rowObj.discountType = 'discountAmount'
        rowObj.discountPercent = _.toNumber(((rowObj.discountAmount * 100) / rowObj.rate).toFixed(2)) || 0;
        rowObj.discountAmount = rowObj.discountAmount || 0;
      }

      // purchase amount
      rowObj.amount = _.toNumber((((rowObj.rate - rowObj.discountAmount) * rowObj.qty)).toFixed(2)) || 0;

      // gst, purchase amount, unit rate and mrp calculation
      rowObj.gstAmount = _.toNumber(((rowObj.amount * rowObj.gstPercent) / 100).toFixed(2)) || 0;
      rowObj.netAmount = _.toNumber((((rowObj.rate - rowObj.discountAmount) * rowObj.qty) + rowObj.gstAmount).toFixed(2)) || 0;

      if ((evt.dataField != 'item')) {
        rowObj.unitRate = _.toNumber((rowObj.netAmount / rowObj.totalQty).toFixed(2)) || 0;
        // rowObj.mrp = _.toNumber((rowObj.netAmount / rowObj.totalQty).toFixed(2)) || 0;
      }

      if (evt.dataField == 'mrp') {
        const mrp = _.toNumber(parseFloat(e.value || 0).toFixed(2));
        if (rowObj.unitRate > mrp) {
          this.alertMsg = {
            message: 'MRP should be Equal/Greter Then Unit Price',
            messageType: 'warning',
            duration: Constants.ALERT_DURATION
          };
          rowObj.mrp = _.toNumber((rowObj.netAmount / rowObj.totalQty).toFixed(2)) || 0;
          evt.setValue(rowObj.mrp);
        }
        this.validateRowDetail(evt.row.rowIndex, 'mrp');
      }

      this.calculateOnItemArrayTotal();
    }

    evt.editorOptions.onOpened = (arg) => {
      var popupInstance = arg.component._popup;
      popupInstance.option('width', 700);
      popupInstance.off("optionChanged", this.optionChangedHandler);
      popupInstance.on("optionChanged", this.optionChangedHandler);
    }
  }

  optionChangedHandler(args) {
    if (args.name == "width" && args.value < 700) {
      args.component.option("width", 700);
    }
  }

  notifyAlertMessage(data): void {
    this.alertMsg = {
      message: data.msg,
      messageType: data.class,
      duration: Constants.ALERT_DURATION
    };
  }

  updateItem(newData,value, currentRowData){
    const isExist = _.find(this.supplierItemsArray,(item, indx)=>{
      return (item.item?.itemId === value.itemId)
    })
    if(isExist){
      this.notifyAlertMessage({
        msg: 'Item is already added...',
        class: 'danger',
      });
      currentRowData.item = null;
      this.dataGrid.instance.refresh();
    }
  }

  showValidationMsg(msg) {
    this.alertMsg = {
      message: msg,
      messageType: 'warning',
      duration: Constants.ALERT_DURATION
    };
  }

  validateRowDetail(rowIndex, dataField?) {
    let flag = '';
    let rowObj = this.supplierItemsArray[rowIndex];
    if ((dataField == 'item' || !dataField) && (!rowObj.item || (rowObj.item && !rowObj.item.itemId))) {
      this.showValidationMsg('Item name is required');
      flag = 'item';
    } else if ((dataField == 'qty' || !dataField) && (!rowObj.qty || parseFloat(rowObj.qty || 0) <= 0)) {
      this.showValidationMsg('Qty is required');
      flag = 'qty';
    } else if ((dataField == 'mrp' || !dataField) && (!rowObj.mrp || parseFloat(rowObj.mrp || 0) <= 0)) {
      this.showValidationMsg('MRP is required');
      flag = 'mrp';
    } else if ((dataField == 'rate' || !dataField) && (!rowObj.rate || parseFloat(rowObj.rate || 0) <= 0)) {
      this.showValidationMsg('Trade Rate is required');
      flag = 'rate';
    } else if ((dataField == 'rate' || !dataField) && (parseFloat(rowObj.mrp || 0) < parseFloat(rowObj.rate || 0))) {
      this.showValidationMsg('Trade Rate should be < MRP');
      flag = 'rate';
    }
    return flag;
  }

  calculateOnItemArrayTotal() {
    if (this.supplierItemsArray.length) {
      this.purchaseForm.controls.totalAmount.patchValue(this.getSumOf('amount'));
      this.purchaseForm.controls.totalGstAmount.patchValue(this.getSumOf('gstAmount'));
      this.purchaseForm.controls.totalNetAmount.patchValue(this.getSumOf('netAmount'));
      this.updateItemCaluLation(this.purchaseForm.value.discountType);
    } else {
      this.purchaseForm.controls.totalAmount.patchValue(0);
      this.purchaseForm.controls.totalGstAmount.patchValue(0);
      this.purchaseForm.controls.totalNetAmount.patchValue(0);
      this.purchaseForm.controls.discountPercent.patchValue(0);
      this.purchaseForm.controls.discountAmount.patchValue(0);
      this.purchaseForm.controls.grandTotal.patchValue(0);
    }
  }

  calculateSelectedRow(options) {
    if (options.name === "totalAmountSummary") {
        if (options.summaryProcess === "start") {
            options.totalValue = 0;
        } else if (options.summaryProcess === "calculate") {
          options.totalValue = _.toNumber(parseFloat(this.purchaseForm.value.totalAmount).toFixed(2));
          //options.totalValue = _.toNumber(parseFloat(options.totalValue + options.value.amount).toFixed(2));
        }
    } else if (options.name === "totalGstAmountSummary") {
      if (options.summaryProcess === "start") {
          options.totalValue = 0;
      } else if (options.summaryProcess === "calculate") {
        options.totalValue = _.toNumber(parseFloat(this.purchaseForm.value.totalGstAmount).toFixed(2));
        //options.totalValue = _.toNumber(parseFloat(options.totalValue + options.value.gstAmount).toFixed(2));
      }
    } else if (options.name === "totalNetAmountSummary") {
      if (options.summaryProcess === "start") {
          options.totalValue = 0;
      } else if (options.summaryProcess === "calculate") {
        options.totalValue = _.toNumber(parseFloat(this.purchaseForm.value.totalNetAmount).toFixed(2));
        //options.totalValue = _.toNumber(parseFloat(options.totalValue + options.value.netAmount).toFixed(2));
      }
    }  else if (options.name === "grandTotalSummary") {
      if (options.summaryProcess === "start") {
          options.totalValue = 0;
      } else if (options.summaryProcess === "calculate") {
        options.totalValue = _.toNumber(parseFloat(this.purchaseForm.value.grandTotal).toFixed(2));
        //options.totalValue = _.toNumber(parseFloat(options.totalValue + options.value.netAmount).toFixed(2));
      }
    }
  }

  decimalWithPrecision(data: any) {
    return parseFloat(data.value || 0).toFixed(2);
  }

  addNewEmptyRow() {
    let index = this.supplierItemsArray.length - 1;
    const form = {
      tempId: Math.random(),
      detailId: null,
      item: null,
      qty: null,
      freeQty: null,
      totalQty: null,
      rate: null,
      amount: null,
      discountPercent: null,
      discountAmount: null,
      discountType: null,
      gstCode: null,
      gstPercent: null,
      gstAmount: null,
      netAmount: null,
      mrp: null,
      unitRate: null,
      remark: null,
      indexFocus: (index !== null) ? (index + 1) : 0,
      indexSelected: (index !== null) ? (index + 1) : 0,
    };
    this.supplierItemsArray.push({ ...form });
  }

  onBlurReference(evt){
    setTimeout(() => {
      this.dataGrid.instance.editCell(0,'item');
    }, 400);
  }
}
