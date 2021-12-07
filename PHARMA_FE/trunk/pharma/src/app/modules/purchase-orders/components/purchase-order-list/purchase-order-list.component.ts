import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { IAlert } from '../../../../public/models/AlertMessage';
import { Subject } from 'rxjs';
import { Constants } from '../../../../config/constants';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { ConfirmationPopupComponent } from '../../../../shared/confirmation-popup/confirmation-popup.component';
import { CommonService } from '../../../../public/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MastersService } from "../../../masters/services/masters.service";
import { TransactionsService } from "../../../transactions/services/transactions.service";
import { FormGroup, FormBuilder } from '@angular/forms';
import * as moment from 'moment';
import { AuthService } from 'src/app/public/services/auth.service';
import * as _ from 'lodash';
import { PermissionsConstants } from "../../../../config/PermissionsConstants";
import { ConfirmationPopupWithReasonComponent } from 'src/app/shared/confirmation-popup-with-reason/confirmation-popup-with-reason.component';
import { environment } from 'src/environments/environment';
import { AuditLogsComponent } from 'src/app/shared/audit-logs/audit-logs.component';

@Component({
  selector: 'app-purchase-order-list',
  templateUrl: './purchase-order-list.component.html',
  styleUrls: ['./purchase-order-list.component.scss']
})
export class PurchaseOrderListComponent implements OnInit, OnDestroy {
  @ViewChild(DatatableComponent, { static: false }) public table: DatatableComponent;
  pageSize;
  page: {
    size: number, // The number of elements in the page
    totalElements: number, // The total number of elements
    totalPages: number, // The total number of pages
    pageNumber: number, // The current page number
  };
  searchString: string;
  externalPaging: boolean;
  sortingObject: { sort_order: string, sort_column: string };
  alertMsg: IAlert;
  subject: Subject<string> = new Subject();
  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  compInstance = this;
  showFilter: boolean;
  isFilterApply: boolean;
  datatableBodyElement: any;
  editPermission: boolean;
  dataList = [];
  setAlertMessage: IAlert;
  showActive: boolean;
  isActiveFilter = true;
  showAddPopup = false;
  $destroy: Subject<boolean> = new Subject();
  statusListArray = [];
  purchaseFilterForm: FormGroup;
  selectedStatus: string = 'All';
  userId;
  constantsVal = Constants;
  constpermissionList: any = [];
  printData = null;
  constructor(
    private transactionService: TransactionsService,
    private modalService: NgbModal,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.userId = this.authService.getLoggedInUserId();
    this.defaultObject();
    this.subjectFun();
    this.getListData();
    this.showActivePopup();
    this.createFormFilter();
    this.commonService.routeChanged(this.route);
    this.statusListArray.push('All');
    this.statusListArray.push(Constants.purchaseOrderStatusCreated);
    this.statusListArray.push(Constants.purchaseOrderStatusCancel);
    this.statusListArray.push(Constants.purchaseOrderStatusRejected);
    this.statusListArray.push(Constants.purchaseOrderStatusApproved);
    this.statusListArray.push(Constants.purchaseOrderStatusClosed);
    this.constpermissionList = PermissionsConstants;
  }

  ngOnDestroy(): void {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  defaultObject() {
    this.isFilterApply = false;
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortingObject = { sort_order: 'desc', sort_column: 'poId' };
    this.searchString = '';
    this.externalPaging = true;
    this.showFilter = false;
    this.showActive = true;
  }

  subjectFun() {
    // -- Subscribe to the subject, which is triggered from search input and when section clicked
    // -- When the debounce time has passed, we call getActiveScheduleData()
    this.subject
      .pipe(debounceTime(500), takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.page.pageNumber = 1;
        this.getListData();
      }
      );
  }

  notifyAlertMessage(data): void {
    this.setAlertMessage = {
      message: data.msg,
      messageType: data.class,
      duration: Constants.ALERT_DURATION
    };
  }

  getListData() {
    // console.log(this.selectedStatus);
    const params = {
      searchKeyword: this.searchString,
      fromDate: new Date(moment().format('YYYY-MM-01')),
      toDate: new Date(moment().format('YYYY-MM-DD')),
      sortOrder: this.sortingObject.sort_order,
      sortColumn: this.sortingObject.sort_column,
      pageNumber: this.page.pageNumber,
      limit: this.page.size,
      status: this.selectedStatus === 'All' ? 'All' : this.selectedStatus,
      storeId: this.authService.getLoginStoreId(),
    };
    if (this.purchaseFilterForm) {
      params.fromDate = this.purchaseFilterForm.value.startDate;
      params.toDate = this.purchaseFilterForm.value.endDate;
    }
    this.transactionService.getPurchaseOrderList(params).subscribe(res => {
      if (res.totalCount > 0) {
        _.map(res.data, dt => {
          if (dt.discountPercent) {
            dt.discountAmount = _.toNumber(((dt.netAmount * dt.discountPercent) / 100).toFixed(2));
          } else if (dt.discountAmount) {
            dt.discountPercent = _.toNumber(((dt.discountAmount / dt.netAmount) * 100).toFixed(2));
          }
        });
        this.dataList = res.data;
        this.page.totalElements = res.totalCount;
      } else {
        this.dataList = [];
        this.page.totalElements = 0;
      }
    });
  }

  onPageSizeChanged(newPageSize) {
    this.sortingObject = { sort_order: 'desc', sort_column: '' };
    this.page.size = Number(newPageSize);
    this.page.pageNumber = 1;
    this.getListData();
  }

  onFooterPage(event): void {
    this.page.pageNumber = event.page;
    this.getListData();
  }

  onSortChanged(event) {
    if (event.sorts.length > 0) {
      const obj = event.sorts[0];
      this.sortingObject.sort_order = obj.dir;
      this.sortingObject.sort_column = this.getSortColumnName(obj.prop);
      this.getListData();
    }
  }

  getSortColumnName(clmName) {
    if (clmName === 'id') {
      return 'poId';
    } else {
      return clmName;
    }
  }

  onSetPage(pageInfo) {
    this.table.offset = pageInfo.offset - 1;
    if (this.externalPaging) {
      return;
    }
  }

  clearSearch() {
    if (this.searchString) {
      this.searchString = null;
      this.getListData();
    }
  }

  showActivePopup() {
    this.commonService.$addPopupEvent.pipe(takeUntil(this.$destroy)).subscribe(popup => {
      if (popup && popup.redirectFromPage === '/inventory/transactions/po/purchaseOrders') {
        this.showAddPopup = popup.isShowAddPopup;
        this.router.navigate(['/inventory/transactions/po/addPurchaseOrder']);
      } else {
        this.showAddPopup = false;
      }
      if (popup) {
        this.showFilter = !popup.isShowFilterPopup;
      } else {
        this.showFilter = false;
      }
    });
  }

  activeInactiveFilter() {
    this.showFilter = !this.showFilter;
  }

  createFormFilter() {
    this.patchDefaultValue();
  }

  patchDefaultValue() {
    if (this.purchaseFilterForm) {
      this.showFilter = true;
      return;
    }
    const form = {
      startDate: [new Date(moment().format('YYYY-MM-01'))],
      endDate: [new Date(moment().format('YYYY-MM-DD'))],
    };
    this.purchaseFilterForm = this.fb.group(form);
    this.showFilter = true;
  }

  checkFormSubmit() {
    this.getListData();
    this.showFilter = !this.showFilter;
  }

  clearFilterFormData() {
    this.purchaseFilterForm.controls.startDate.patchValue(new Date(moment().startOf('month').format('YYYY-MM-DD hh:mm')));
    this.purchaseFilterForm.controls.endDate.patchValue(new Date(moment().format('YYYY-MM-DD hh:mm')));
  }

  redirectUpdatePage(row, type) {
    if (type === 'edit') {
      this.router.navigate(['/inventory/transactions/po/editPurchaseOrder/' + row.id]);
    } else {
      this.router.navigate(['/inventory/transactions/po/addCopyPurchaseOrder/' + row.id]);
    }
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
        if (from === 'Delete') {
          this.deleteOrderData(val.id);
        }
        if (from === 'Approved') {
          this.approveOrder(val.id);
        }
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  deleteOrderData(id) {
    this.transactionService.deletePurchaseOrder(id).subscribe(res => {
      if (res.status_code === 200) {
        this.alertMsg = {
          message: 'Order Deleted!',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        this.getListData();
      }
    });
  }

  updateStatus(status, row) {
    const msg = 'Do you want to ' + status + ' this Order?';
    if (status === 'Delete') {
      this.openConfirmPopup(row, msg, status);
      return;
    }
    if (status !== this.constantsVal.purchaseOrderStatusApproved) {
      this.openConfirmReasonPopup(row, msg, status);
    } else {
      this.openConfirmPopup(row, msg, status);
    }
  }

  openConfirmReasonPopup(val, msg, from) {
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
        if (from === this.constantsVal.purchaseOrderStatusCancel) {
          this.cancelOrder(result.reason, val.id);
          return;
        } else if (from === this.constantsVal.purchaseOrderStatusRejected) {
          this.rejectOrder(result.reason, val.id);
          return;
        }
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  cancelOrder(val, id) {
    const param = {
      Id: id,
      remark: val ? val : null
    };
    this.transactionService.cancelPurchaseOrder(param).subscribe(res => {
      if (res.status_code === 200) {
        this.alertMsg = {
          message: 'Order Cancel!',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        this.getListData();
      }
    });
  }

  approveOrder(id) {
    const param = {
      poId: id
    };
    this.transactionService.approvePurchaseOrder(param).subscribe(res => {
      if (res.status_code === 200) {
        this.alertMsg = {
          message: 'Order Approved!',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        this.getListData();
      }
    });
  }

  rejectOrder(val, id) {
    const param = {
      Id: id,
      remark: val ? val : null
    };
    this.transactionService.rejectPurchaseOrder(param).subscribe(res => {
      if (res.status_code === 200) {
        this.alertMsg = {
          message: 'Order Rejected!',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        this.getListData();
      }
    });
  }

  getPrintData(data) {
    const url = environment.REPORT_API + 'Report/PurchaseOrderPrint/?auth_token=' + this.authService.getAuthToken() + '&poId=' + data.id;
    this.printData = { url: url, returnType: false };
  }

  showAuditLog(row): void {
    const modalInstance = this.modalService.open(AuditLogsComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      size: 'xl',
      // windowClass: 'audit-logs',
      container: '#homeComponent'
    });
    modalInstance.componentInstance.inputData = {
      stageId: Constants.auditLogStageConstants.PurchaseOrder,
      referenceId: row.id
    };
    modalInstance.result.then((result) => {
    });
  }

}
