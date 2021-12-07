import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { IAlert } from "../../../../public/models/AlertMessage";
import { Subject } from "rxjs";
import { FormBuilder, FormGroup } from "@angular/forms";
import { TransactionsService } from "../../services/transactions.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { CommonService } from "../../../../public/services/common.service";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../../../../public/services/auth.service";
import { debounceTime, takeUntil } from "rxjs/operators";
import { Constants } from "../../../../config/constants";
import * as moment from "moment";
import { ConfirmationPopupComponent } from "../../../../shared/confirmation-popup/confirmation-popup.component";
import { MastersService } from "../../../masters/services/masters.service";
import { PermissionsConstants } from "../../../../config/PermissionsConstants";
import { environment } from 'src/environments/environment';
import {ConfirmationPopupWithReasonComponent} from "../../../../shared/confirmation-popup-with-reason/confirmation-popup-with-reason.component";
import {AuditLogsComponent} from "../audit-logs/audit-logs.component";

@Component({
  selector: 'app-purchase-return-list',
  templateUrl: './purchase-return-list.component.html',
  styleUrls: ['./purchase-return-list.component.scss']
})
export class PurchaseReturnListComponent implements OnInit, OnDestroy {
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

  purchaseFilterForm: FormGroup;
  startDate: any;
  endDate: any;
  status = 'All';
  statusValues = ['All', 'Created', 'Cancel', 'Rejected', 'Dispatched'];
  constpermissionList: any = [];
  printData = null;
  constantsVal = null;
  constructor(
    private transactionService: TransactionsService,
    private modalService: NgbModal,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private mastersService: MastersService,
    private transactionsService: TransactionsService,
  ) { }

  ngOnInit(): void {
    this.defaultObject();
    this.setDefaultFilterValues();
    this.subjectFun();
    this.getListData();
    this.showActivePopup();
    this.commonService.routeChanged(this.route);
    this.constpermissionList = PermissionsConstants;
    this.constantsVal = Constants;
  }

  ngOnDestroy(): void {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  defaultObject() {
    this.isFilterApply = false;
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortingObject = { sort_order: 'desc', sort_column: 'gdnDate' };
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
    const params = {
      searchKeyword: this.searchString,
      fromDate: moment(this.startDate).format('YYYY-MM-DD'),
      toDate: moment(this.endDate).format('YYYY-MM-DD'),
      sortOrder: this.sortingObject.sort_order,
      sortColumn: this.sortingObject.sort_column,
      pageNumber: this.page.pageNumber,
      limit: this.page.size,
      isActive: this.isActiveFilter,
      storeId: this.authService.getLoginStoreId(),
      status: this.status
    };
    this.transactionService.getPurchaseReturnList(params).subscribe(res => {
      if (res.totalCount > 0) {
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
      this.sortingObject.sort_column = obj.prop;
      this.getListData();
    }
  }

  editData(val) {
    this.router.navigate([`/inventory/transactions/addUpdatePurchaseReturns/${val.gdnId}`]);
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
      if (popup && popup.redirectFromPage === '/inventory/transactions/purchaseReturnList') {
        this.showAddPopup = popup.isShowAddPopup;
        this.router.navigate(['/inventory/transactions/addUpdatePurchaseReturns/-1']);
        // open add popup
      } else {
        this.showAddPopup = false;
      }
      if (popup) {
        this.showFilter = true;
      } else {
        this.showFilter = false;
      }
    });
  }

  activeInactiveFilter() {
    this.showFilter = !this.showFilter;
  }

  setDefaultFilterValues() {
    this.startDate = new Date(moment().startOf('month').format('YYYY-MM-DD hh:mm'));
    this.endDate = new Date(moment().format('YYYY-MM-DD hh:mm'));
  }

  deleteData(rowData) {
    const modalTitleobj = 'Delete';
    const modalBodyobj = 'Do you want to delete this GDN?';
    const messageDetails = {
      modalTitle: modalTitleobj,
      modalBody: modalBodyobj
    };
    const modalInstance = this.modalService.open(ConfirmationPopupComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false
      });
    modalInstance.result.then((result) => {
      if (result === 'Ok') {
        this.deleteGDN(rowData.gdnId);
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  deleteGDN(gdnId) {
    const url = `/GDN/DeleteGDN?gdnId=${gdnId}`;
    this.mastersService.delete(url).subscribe(res => {
      if (res) {
        this.notifyAlertMessage({
          msg: 'GDN Deleted',
          class: 'success',
        });
        this.getListData();
      } else {
        this.notifyAlertMessage({
          msg: 'Something Went Wrong',
          class: 'danger',
        });
      }
    });
  }

  getPrintData(data) {
    const url = environment.REPORT_API + 'Report/GDNPrint/?auth_token=' + this.authService.getAuthToken() + '&gdnId=' + data.gdnId;
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
      stageId: Constants.auditLogStageConstants.GDN,
      referenceId: row.gdnId
    };
    modalInstance.result.then((result) => {
    });
  }

  rejectPurchaseReturn(reason, gdnId): void {
    const reqParams = {
      Id: gdnId,
      remark: reason
    };
    this.transactionsService.rejectGDN(reqParams).subscribe(res => {
      if (res) {
        this.notifyAlertMessage({
          msg: 'GDN Rejected Successfully!',
          class: 'Success',
        });
        this.getListData();
      } else {
        this.notifyAlertMessage({
          msg: 'Something Went Wrong',
          class: 'danger',
        });
        return false;
      }
    });
  }

  cancelPurchaseReturn(reason, gdnId): void {
    const reqParams = {
      Id: gdnId,
      remark: reason
    };
    this.transactionsService.cancelGDN(reqParams).subscribe(res => {
      if (res) {
        this.notifyAlertMessage({
          msg: 'GDN Cancelled Successfully!',
          class: 'Success',
        });
        this.getListData();
      } else {
        this.notifyAlertMessage({
          msg: 'Something Went Wrong',
          class: 'danger',
        });
        return false;
      }
    });
  }

  updateStatus(status, gdnId) {
    const msg = 'Do you really want to ' + status + ' this GDN?';
    if (status !== 'Approve') {
      this.openConfirmReasonPopup(msg, status, gdnId);
    } else {
      this.transactionService.approveGDN(gdnId).subscribe(res => {
        if (res.status_message === 'Success') {
          this.setAlertMessage = {
            message: 'GDN Approved Successfully!',
            messageType: 'success',
            duration: Constants.ALERT_DURATION
          };
          this.getListData();
        }
      });
    }
  }

  openConfirmReasonPopup(msg, status, gdnId) {
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
          this.cancelPurchaseReturn(result.reason, gdnId);
          return;
        } else if (status === 'Reject') {
          this.rejectPurchaseReturn(result.reason, gdnId);
          return;
        }
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

}
