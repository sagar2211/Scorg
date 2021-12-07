import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject, Observable, concat, of } from 'rxjs';
import { TransactionsService } from '../../services/transactions.service';
import { distinctUntilChanged, tap, switchMap, catchError, map, takeUntil } from 'rxjs/operators';
import { SupplierItem } from '../../modals/supplier-item.modal';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PurchaseReturnItemsAddUpdateComponent } from '../purchase-return-items-add-update/purchase-return-items-add-update.component';
import * as _ from 'lodash';
import { Constants } from '../../../../config/constants';
import { ActivatedRoute, Router } from '@angular/router';
import { Supplier } from '../../../masters/modals/supplier.model';
import { MastersService } from '../../../masters/services/masters.service';
import { CommonModule } from "@angular/common";
import { CommonService } from "../../../../public/services/common.service";
import { ConfirmationPopupComponent } from "../../../../shared/confirmation-popup/confirmation-popup.component";
import { ConfirmationPopupWithReasonComponent } from "../../../../shared/confirmation-popup-with-reason/confirmation-popup-with-reason.component";
import { PermissionsConstants } from "../../../../config/PermissionsConstants";
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/public/services/auth.service';

@Component({
  selector: 'app-purchase-return-add-update',
  templateUrl: './purchase-return-add-update.component.html',
  styleUrls: ['./purchase-return-add-update.component.scss']
})
export class PurchaseReturnAddUpdateComponent implements OnInit, OnDestroy {
  purchaseReturnForm: FormGroup;
  supplierList$ = new Observable<any>();
  supplierListInput$ = new Subject<any>();
  formLoading = false;
  storeId: number;
  itemList: Array<SupplierItem> = [];
  gdnItemList: Array<any> = [];
  gdnTypeListArray: Array<any> = ['GRN', 'DIRECT'];
  setAlertMessage: any;
  gdnId: number;
  showAddPopup = false;
  $destroy: Subject<boolean> = new Subject();
  isActiveFilter = false;
  constpermissionList: any = [];
  printData = null;
  loginUserId = null;
  editMode: boolean = false;

  constructor(
    private masterService: MastersService,
    private transactionsService: TransactionsService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private router: Router,
    private commonService: CommonService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.loginUserId = this.authService.getLoggedInUserId();
    this.storeId = JSON.parse(localStorage.getItem('globals')).storeId;
    this.createPurchaseReturnForm();
    this.loadSupplierList('');
    this.gdnId = +this.route.snapshot.params.id;
    if (this.gdnId && this.gdnId > -1) {
      // get details and patch values
      this.getGDNDetailsById();
    }
    this.commonService.routeChanged(this.route);
    this.constpermissionList = PermissionsConstants;
  }

  ngOnDestroy(): void {
    this.modalService.dismissAll();
  }

  private loadSupplierList(searchTxt?): void {
    this.supplierList$ = concat(
      this.transactionsService.getSupplierBySearchKeyword(''), // default items
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

  createPurchaseReturnForm(): void {
    this.purchaseReturnForm = this.fb.group({
      gdnId: [0, Validators.required],
      gdnType: [null, Validators.required],
      gatepassNo: ['', Validators.required],
      status: [''],
      supplierId: [null, Validators.required],
      supplierState: [{ value: '', disabled: true }],
      supplierGstRegNo: [{ value: '', disabled: true }],
      gdnAmount: [0, Validators.min(1)],
      storeId: [this.storeId, Validators.required],
      remark: [''],
      isApproved: [false],
      isTakePrint: [false],
      createdBy: [null],
    });
  }

  onSupplierChange(event): void {
    this.purchaseReturnForm.patchValue({
      supplierState: (event) ? event.state : '',
      supplierGstRegNo: (event) ? event.gstRegNo : '',
    });
  }

  // -- called when supplier select
  getSupplierItemsList(): void {
    const reqParams = {
      supplierId: this.purchaseReturnForm.value.supplierId,
      searchKeyword: ''
    };
    this.transactionsService.getSupplierItemsList(reqParams).subscribe((res: any) => {
      if (res.status_message === 'Success') {
        this.itemList = res.data;
      } else {
        this.itemList = [];
      }
    });
  }

  notifyAlertMessage(data): void {
    this.setAlertMessage = {
      message: data.msg,
      messageType: data.class,
      duration: Constants.ALERT_DURATION
    };
  }

  savePurchaseReturnForm(isApprove?): void {
    if (!this.gdnItemList.length) {
      this.notifyAlertMessage({
        msg: 'Please Add Item(s)',
        class: 'danger',
      });
      return;
    } else if (!this.purchaseReturnForm.valid) {
      this.notifyAlertMessage({
        msg: 'Please Check Fields',
        class: 'danger',
      });
      return;
    }
    const reqParams = {
      gdnId: this.purchaseReturnForm.value.gdnId,
      gatepassNo: this.purchaseReturnForm.value.gatepassNo,
      supplierId: this.purchaseReturnForm.value.supplierId,
      gdnAmount: this.purchaseReturnForm.value.gdnAmount,
      remark: this.purchaseReturnForm.value.remark,
      storeId: this.storeId,
      gdnItemlist: this.gdnItemList,
      isApproved: this.purchaseReturnForm.value.isApproved
    };
    this.transactionsService.saveGDN(reqParams, true).subscribe(res => {
      if (res) {
        this.notifyAlertMessage({
          msg: 'Data Saved Successfully!',
          class: 'Success',
        });
        if (this.purchaseReturnForm.value.isTakePrint) {
          this.getPrintData(this.purchaseReturnForm.value.gdnId ? this.purchaseReturnForm.value.gdnId : res.data);
        } else {
          this.navigateToList();
        }
      } else {
        this.notifyAlertMessage({
          msg: 'Something Went Wrong',
          class: 'danger',
        });
        return false;
      }
    });
  }

  addItemDetails(data?): void {
    const modalInstance = this.modalService.open(PurchaseReturnItemsAddUpdateComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        size: 'lg'
      });
    modalInstance.result.then((result) => {
      if (result !== null && !_.isEmpty(result)) {
        // check item id exist
        const itemIndex = _.findIndex(this.gdnItemList, (o) => o.itemId === result.itemId);
        if (itemIndex === -1) {
          this.gdnItemList.push(result);
        } else {
          this.gdnItemList[itemIndex] = result;
        }
        // calculate  total
        this.calculateTotalAmount();
      }
    });
    (modalInstance.componentInstance as PurchaseReturnItemsAddUpdateComponent).prData = this.purchaseReturnForm.value;
    (modalInstance.componentInstance as PurchaseReturnItemsAddUpdateComponent).itemEditData = {
      type: data ? 'edit' : 'add',
      data: data ? data : null,
    };

  }

  calculateTotalAmount(): void {
    // total
    let total = 0.00;
    _.forEach(this.gdnItemList, (o) => {
      total = (total + parseFloat(o.amount));
    });
    this.purchaseReturnForm.patchValue({ gdnAmount: total.toFixed(2) });
  }

  editItem(item): void {
    this.addItemDetails(item);
  }

  deleteItem(item): void {
    const itemIndex = _.findIndex(this.gdnItemList, (o) => item.id === o.id);
    if (itemIndex !== -1) {
      this.gdnItemList.splice(itemIndex, 1);
      this.calculateTotalAmount();
    }
  }

  confirmDelete(item): void {
    const modalTitleobj = 'Delete Item';
    const modalBodyobj = 'Do you really want to delete this Item?';
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
        this.deleteItem(item);
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  getGDNDetailsById(): void {
    const reqParams = {
      storeId: this.storeId,
      gdnId: this.gdnId
    };
    this.transactionsService.getGDNDetailsById(reqParams).subscribe((res: any) => {
      if (res.status_message === 'Success') {
        this.editMode = true;
        this.purchaseReturnForm.controls['gdnType'].disable();
        this.patchDefaultValues(res.data);
      }
    });
  }

  patchDefaultValues(gdnObject): void {
    this.purchaseReturnForm.patchValue({
      gdnId: gdnObject.gdnId,
      gdnType: this.getGdnType(gdnObject),
      gatepassNo: gdnObject.gatepassNo,
      status: gdnObject.status,
      supplierId: gdnObject.supplierId,
      gdnAmount: gdnObject.gdnAmount,
      storeId: gdnObject.storeId,
      remark: gdnObject.remark,
      createdBy: gdnObject.createdBy
    });
    this.gdnItemList = gdnObject.gdnItemlist;
    this.getSupplierById(gdnObject.supplierId);
  }

  getSupplierById(supplierId): void {
    this.masterService.getSupplierById(supplierId).subscribe(res => {
      if (!_.isEmpty(res)) {
        this.purchaseReturnForm.patchValue({
          supplierState: res.stateName,
          supplierGstRegNo: res.gstRegNo,
        });
      }
    });
  }

  rejectPurchaseReturn(reason): void {
    const reqParams = {
      Id: this.purchaseReturnForm.value.gdnId,
      remark: reason
    };
    this.transactionsService.rejectGDN(reqParams).subscribe(res => {
      if (res) {
        this.notifyAlertMessage({
          msg: 'Data Saved Successfully!',
          class: 'Success',
        });
        this.navigateToList();
      } else {
        this.notifyAlertMessage({
          msg: 'Something Went Wrong',
          class: 'danger',
        });
        return false;
      }
    });
  }

  cancelPurchaseReturn(reason): void {
    const reqParams = {
      Id: this.purchaseReturnForm.value.gdnId,
      remark: reason
    };
    this.transactionsService.cancelGDN(reqParams).subscribe(res => {
      if (res) {
        this.notifyAlertMessage({
          msg: 'Data Saved Successfully!',
          class: 'Success',
        });
        this.navigateToList();
      } else {
        this.notifyAlertMessage({
          msg: 'Something Went Wrong',
          class: 'danger',
        });
        return false;
      }
    });
  }

  updateStatus(status) {
    const msg = 'Do you really want to ' + status + ' this GDN?';
    if (status !== 'Approve') {
      this.openConfirmReasonPopup(msg, status);
    } else {
      this.savePurchaseReturnForm(1);
    }
  }

  openConfirmReasonPopup(msg, status) {
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
          this.cancelPurchaseReturn(result.reason);
          return;
        } else if (status === 'Reject') {
          this.rejectPurchaseReturn(result.reason);
          return;
        }
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  // showActivePopup() {
  //   this.commonService.$addPopupEvent.pipe(takeUntil(this.$destroy)).subscribe(popup => {
  //     if (popup && popup.redirectFromPage === `/inventory/transactions/addUpdatePurchaseReturns/${this.gdnId}`) {
  //       this.showAddPopup = popup.isShowAddPopup;
  //       // open add popup
  //     } else {
  //       this.showAddPopup = false;
  //     }
  //   });
  // }

  getGdnType(obj): string {
    if (!obj.gdnItemlist.length) {
      return '';
    }
    const grnId = obj.gdnItemlist[0].grnId;
    return (grnId === 0) ? 'DIRECT' : 'GRN';
  }

  navigateToList(): void {
    this.router.navigate(['/inventory/transactions/purchaseReturnList']);
  }

  getPrintData(id?) {
    const idVal = id || this.purchaseReturnForm.value.gdnId;
    const url = environment.REPORT_API + 'Report/GDNPrint/?auth_token=' + this.authService.getAuthToken() + '&gdnId=' + idVal;
    this.printData = { url: url, returnType: id ? true : false };
  }
}
