import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/public/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, Subject, concat, of } from 'rxjs';
import { map, distinctUntilChanged, tap, switchMap, catchError } from 'rxjs/operators';
import { IssueService } from '../../services/issue.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { Constants } from 'src/app/config/constants';
import { IAlert } from 'src/app/public/models/AlertMessage';
import * as moment from 'moment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationPopupComponent } from 'src/app/shared/confirmation-popup/confirmation-popup.component';
import { PermissionsConstants } from "../../../../config/PermissionsConstants";
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-dept-store-issue',
  templateUrl: './dept-store-issue.component.html',
  styleUrls: ['./dept-store-issue.component.scss']
})
export class DeptStoreIssueComponent implements OnInit {

  alertMsg: IAlert;
  itemForm: FormGroup;
  loadForm: boolean;
  userId;
  deptStoreObj = {
    issueId: null,
    issueDate: null,
    storeId: null,
    storeName: null,
    indentId: null,
    indentType: null,
    indentTypeName: null,
    toStoreId: null,
    toStoreName: null,
    deptId: null,
    deptName: null,
    issueNo: null,
    indentNo: null,
    remark: null,
    indentDate: null,
    itemArrayList: [],
    status: null
  };
  indentData = null;
  issueData = null;
  formLoading = false;
  editItemRowData = null;
  selectedItemStockList = [];
  addedItemStockList = [];
  constantsVal = null;
  printData = null;

  itemList$ = new Observable<any>();
  itemListInput$ = new Subject<any>();
  constpermissionList: any = [];
  pageType = null;
  submitted = false;
  constructor(
    private authService: AuthService,
    private issueService: IssueService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    this.userId = this.authService.getLoggedInUserId();
    const id = +this.route.snapshot.params.id;
    const typeVal = this.route.snapshot.params.type;
    this.constantsVal = Constants;
    this.createForm();
    if (typeVal === 'indent') {
      this.getIndentDataById(id).subscribe(res => {
        this.updateIndentData();
      });
    } else if (typeVal === 'issue') {
      this.getIssueDataById(id).subscribe(res => {
        this.getIndentDataById(this.issueData.indentId).subscribe(res => {
          this.updateIndentData();
          this.updateIssueData();
        });
      });
    }
    this.pageType = typeVal;
    this.constpermissionList = PermissionsConstants;
  }

  updateIndentData() {
    this.deptStoreObj.indentId = +this.route.snapshot.params.id;
    this.deptStoreObj.storeId = this.indentData.storeId;
    this.deptStoreObj.storeName = this.indentData.storeName;
    this.deptStoreObj.indentType = this.indentData.indentType;
    this.deptStoreObj.indentTypeName = this.indentData.indentTypeName;
    this.deptStoreObj.toStoreId = this.indentData.toStoreId;
    this.deptStoreObj.toStoreName = this.indentData.toStoreName;
    this.deptStoreObj.deptId = this.indentData.deptId;
    this.deptStoreObj.deptName = this.indentData.deptName;
    this.deptStoreObj.issueNo = null;
    this.deptStoreObj.indentNo = this.indentData.indentNo;
    this.deptStoreObj.remark = null;
    this.deptStoreObj.indentDate = this.indentData.indentDate;
    this.deptStoreObj.itemArrayList = this.indentData.indentDetailList;
  }

  updateIssueData() {
    this.deptStoreObj.indentId = this.issueData.indentId;
    this.deptStoreObj.issueId = this.issueData.issueId;
    this.deptStoreObj.issueNo = this.issueData.issueNo;
    this.deptStoreObj.issueDate = this.issueData.issueDate;
    this.deptStoreObj.remark = this.issueData.remark;
    this.deptStoreObj.status = this.issueData.issueStatus;
    this.itemForm.patchValue({ totalAmount: this.issueData.totalAmount });
    this.addedItemStockList = _.cloneDeep(this.updateIssueItemData());
  }

  updateIssueItemData() {
    const arrayData = [];
    _.forEach(this.issueData.issueDetailList, itm => {
      const itemData = _.find(this.deptStoreObj.itemArrayList, lst => {
        return lst.itemId === itm.itemId;
      });
      const obj = {
        id: itm.id,
        itemId: itm.itemId,
        item: {
          itemId: _.cloneDeep(itm.itemId),
          itemCode: _.cloneDeep(itm.itemCode),
          itemDescription: _.cloneDeep(itm.itemDescription),
          indentBalQty: _.cloneDeep(itemData ? itemData.indentBalQty : 0),
          indentQty: _.cloneDeep(itemData ? itemData.indentQty : 0),
          units: _.cloneDeep(itemData ? itemData.units : 0),
        },
        batch: itm.batchNo,
        batchData: {
          batchNo: itm.batchNo,
          closingQty: null,
          expiryDate: itm.expiryDate,
          itemId: itm.itemId,
          mrp: null,
          netAmount: null,
          purchaseQty: null,
          salePrice: null,
          stockId: itm.stockId,
          unitRate: itm.unitRate
        },
        qty: itm.issueQty,
        rate: itm.unitRate,
        amount: itm.amount,
        tempHoldId: itm.tempHoldId,
      };
      arrayData.push(_.cloneDeep(obj));
    });
    return arrayData;
  }

  getIndentDataById(id): Observable<any> {
    return this.issueService.getIndentById(id).pipe(map((res: any) => {
      this.indentData = res;
      return res;
    }));
  }

  getIssueDataById(id): Observable<any> {
    return this.issueService.getIssueById(id, true).pipe(map((res: any) => {
      this.issueData = res;
      return res;
    }));
  }

  createForm() {
    this.patchDefaultValue();
  }

  patchDefaultValue() {
    const form = {
      id: [null],
      itemId: [null, Validators.required],
      item: [null, Validators.required],
      batch: [null, Validators.required],
      batchData: [null, Validators.required],
      qty: [null, Validators.required],
      rate: [null, Validators.required],
      tempHoldId: [null],
      amount: [null],
      totalAmount: [null],
      isTakePrint: [false],
    };
    this.itemForm = this.fb.group(form);
    this.loadForm = true;
  }

  clearItemForm() {
    this.itemForm.patchValue({
      itemId: null,
      item: null,
      batch: null,
      batchData: null,
      qty: null,
      rate: null,
      amount: null,
      tempHoldId: null,
      totalAmount: this.getSumOf('amount')
    });
    this.editItemRowData = null;
  }

  addItemValue() {
    this.submitted = true;
    if (this.itemForm.valid && this.submitted) {
      this.editItemRowData = null;
      const formVal = this.itemForm.value;
      if (formVal.id) {
        const chekEditIndex = _.findIndex(this.addedItemStockList, lst => {
          return lst.id === formVal.id;
        });
        this.addedItemStockList[chekEditIndex] = formVal;
        this.submitted = false;
        this.clearItemForm();
        return;
      }
      const chekIndex = _.findIndex(this.addedItemStockList, lst => {
        return lst.itemId === formVal.itemId && lst.batchData.stockId === formVal.batchData.stockId;
      });
      if (chekIndex === -1) {
        const holdId = (new Date()).getTime();
        this.itemForm.patchValue({
          tempHoldId: holdId
        });
        formVal.tempHoldId = holdId;
        this.holdCurrentStock().subscribe(res => {
          this.addedItemStockList.push(formVal);
          this.submitted = false;
          this.clearItemForm();
        });
      } else {
        this.holdCurrentStock().subscribe(res => {
          this.addedItemStockList[chekIndex] = formVal;
          this.submitted = false;
          this.clearItemForm();
        });
      }
      this.itemForm.patchValue({
        totalAmount: this.getSumOf('amount')
      });
    }
  }

  getSumOf(key) {
    return _.toNumber((_.sumBy(this.addedItemStockList, key).toFixed(2)));
  }

  changeItemValue(val) {
    this.itemForm.patchValue({
      item: val
    });
    this.getAvailableStock(val.itemId).subscribe();
  }

  updateAmount() {
    let formVal = this.itemForm.value;
    let activeQty = 0;
    let curQty = 0;
    if (formVal.id) {
      activeQty = formVal.qty - this.editItemRowData.qty;
      if (activeQty >= 0) {
        curQty = activeQty;
      } else {
        curQty = 0;
      }
    } else {
      curQty = formVal.qty;
    }
    const addedTotalQty = this.getAddedQtyForStock(formVal.itemId);
    const chkQty = formVal.id ? formVal.item.indentBalQty : formVal.item.indentBalQty - addedTotalQty;
    if (curQty > formVal.batchData.closingQty) {
      this.alertMsg = {
        message: 'Quantity should be less/equal current batch available quatity (' + formVal.batchData.closingQty + ').',
        messageType: 'warning',
        duration: Constants.ALERT_DURATION
      };
      this.itemForm.patchValue({
        qty: formVal.id ? this.editItemRowData.qty : null
      });
    } else if (curQty > formVal.item.indentBalQty) {
      this.alertMsg = {
        message: 'Quantity should be less than or equal to Indent Qty (' + formVal.batchData.closingQty + ').',
        messageType: 'warning',
        duration: Constants.ALERT_DURATION
      };
      this.itemForm.patchValue({
        qty: formVal.id ? this.editItemRowData.qty : null
      });
    } else if (chkQty < curQty && formVal.id) {
      this.alertMsg = {
        message: 'please check total asked quantity.',
        messageType: 'warning',
        duration: Constants.ALERT_DURATION
      };
      this.itemForm.patchValue({
        qty: formVal.id ? this.editItemRowData.qty : null
      });
    }
    formVal = this.itemForm.value;
    const amt = _.toNumber(((formVal.qty ? formVal.qty : 0) * (formVal.rate ? formVal.rate : 0)).toFixed(2));
    this.itemForm.patchValue({
      amount: amt
    });
  }

  getAddedQtyForStock(itemId) {
    const ttlQtyAray = _.filter(this.addedItemStockList, stk => {
      return stk.itemId === itemId;
    });
    const ttl = ttlQtyAray.length > 0 ? this.getSumOf('qty') : 0;
    return ttl;
  }

  getAvailableStock(val): Observable<any> {
    const param = {
      storeId: this.authService.getLoginStoreId(),
      itemId: val
    };
    return this.issueService.getItemStockById(param).pipe(map((res: any) => {
      this.selectedItemStockList = res;
      return res;
    }));
  }

  selectBatchValue(batch) {
    this.itemForm.patchValue({
      batchData: batch,
      qty: this.getQuantity(batch, this.itemForm.value.item),
      rate: batch.unitRate
    });
    this.updateAmount();
  }

  getQuantity(batch, item) {
    let qty = item.indentBalQty;
    qty = qty > batch.closingQty ? batch.closingQty : qty;
    return qty;
  }

  holdCurrentStock(): Observable<any> {
    const formVal = this.itemForm.value;
    const param = {
      storeId: this.deptStoreObj.toStoreId,
      itemId: formVal.itemId,
      tempHoldId: formVal.tempHoldId,
      holdQty: formVal.qty,
      stockId: formVal.batchData.stockId
    };
    return this.issueService.itemStockHold(param).pipe(map((res: any) => {
      return res;
    }));
  }

  releaseStock(): Observable<any> {
    const param = [];
    return this.issueService.itemStockRelease(param).pipe(map((res: any) => {
      return res;
    }));
  }

  get itemFormControl() {
    return this.itemForm.controls;
  }

  saveIndentItemValues() {
    if (!this.deptStoreObj.remark) {
      this.alertMsg = {
        message: 'please Add Remark.',
        messageType: 'warning',
        duration: Constants.ALERT_DURATION
      };
    } else if (this.addedItemStockList.length === 0) {
      this.alertMsg = {
        message: 'please Add Items.',
        messageType: 'warning',
        duration: Constants.ALERT_DURATION
      };
    } else {
      const param = {
        issueId: this.deptStoreObj.issueId ? this.deptStoreObj.issueId : 0,
        indentId: this.deptStoreObj.indentId,
        issueType: this.deptStoreObj.indentType,
        indentDeptId: this.deptStoreObj.deptId,
        indentStoreId: this.deptStoreObj.storeId,
        issueStoreId: this.deptStoreObj.toStoreId,
        totalAmount: this.itemForm.value.totalAmount,
        remark: this.deptStoreObj.remark,
        issueItemList: this.getItemValuesForSave()
      };
      this.issueService.saveIssueData(param).subscribe(res => {
        this.alertMsg = {
          message: 'Value Saved!',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        if (this.itemForm.value.isTakePrint) {
          this.getPrintData(this.deptStoreObj.issueId ? this.deptStoreObj.issueId : res.data);
        } else {
          setTimeout(() => {
            this.redirectToListPage();
          }, 1000);
        }
      });
    }
  }

  getItemValuesForSave() {
    const arrayVal = [];
    _.map(this.addedItemStockList, stk => {
      const obj = {
        id: stk.id ? stk.id : 0,
        tempHoldId: stk.tempHoldId,
        stockId: stk.batchData.stockId,
        itemId: stk.itemId,
        batchNo: stk.batchData.batchNo,
        expiryDate: stk.batchData.expiryDate,
        issueQty: stk.qty,
        unitRate: stk.rate,
        amount: stk.amount
      };
      arrayVal.push(obj);
    });
    return arrayVal;
  }

  redirectToListPage() {
    const typeVal = this.route.snapshot.params.type;
    if (typeVal === 'indent') {
      this.router.navigate(['/inventory/issue/summeryIndent']);
    } else {
      this.router.navigate(['/inventory/issue/summeryIssue']);
    }
  }

  editItemValue(item) {
    this.getAvailableStock(item.itemId).subscribe(res => {
      this.selectedItemStockList = res;
      const batchDataIndex = _.findIndex(res, stk => {
        return stk.stockId === item.batchData.stockId;
      });
      let batchData = null;
      if (batchDataIndex !== -1) {
        batchData = {
          batchNo: item.batchData.batchNo,
          closingQty: res[batchDataIndex].closingQty,
          expiryDate: item.batchData.expiryDate,
          itemId: item.batchData.itemId,
          mrp: res[batchDataIndex].mrp,
          netAmount: res[batchDataIndex].netAmount,
          purchaseQty: res[batchDataIndex].purchaseQty,
          salePrice: res[batchDataIndex].salePrice,
          stockId: item.batchData.stockId,
          unitRate: item.batchData.unitRate
        };
      }
      this.itemForm.patchValue({
        id: item.id,
        itemId: item.itemId,
        item: item.item,
        batch: item.batch,
        batchData: batchData ? batchData : item.batchData,
        qty: item.qty,
        rate: item.rate,
        amount: item.amount,
        tempHoldId: item.tempHoldId
      });
      this.editItemRowData = _.cloneDeep(item);
    });
  }

  deleteItemValue(item, index) {
    const msg = 'Do you want to Delete this Item?';
    this.openConfirmPopup(index, msg, status);
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
        // release stock by tempHoldId
        const data = this.addedItemStockList[val];
        const reqParams = [data.tempHoldId];
        this.issueService.itemStockRelease(reqParams).subscribe();
        // remove from grid
        this.addedItemStockList.splice(val, 1);
        // update total amount
        this.itemForm.patchValue({
          totalAmount: this.getSumOf('amount')
        });
        return;
      } else {
        return;
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  redirectUpdatePage() {
    this.router.navigate(['/inventory/issue/summeryIssue']);
  }

  getPrintData(id) {
    const idVal = id || +this.route.snapshot.params.id;
    const url = environment.REPORT_API + 'Report/IssuePrint/?auth_token=' + this.authService.getAuthToken() + '&issueId=' + idVal;
    this.printData = { url: url, returnType: id ? true : false };
  }

}
