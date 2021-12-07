import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Constants } from 'src/app/config/constants';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { CommonService } from 'src/app/public/services/common.service';
import { TransactionsService } from '../../services/transactions.service';
import { PermissionsConstants } from '../../../../config/PermissionsConstants';
import { ConfirmationPopupWithReasonComponent } from 'src/app/shared/confirmation-popup-with-reason/confirmation-popup-with-reason.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/public/services/auth.service';
import {AuditLogsComponent} from "../audit-logs/audit-logs.component";

@Component({
  selector: 'app-purchase-invoice-list',
  templateUrl: './purchase-invoice-list.component.html',
  styleUrls: ['./purchase-invoice-list.component.scss']
})
export class PurchaseInvoiceListComponent implements OnInit {
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
  setAlertMessage: IAlert;
  purchaseInvoiceList: Array<any> = [];
  subject: Subject<string> = new Subject();
  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  fromDate = new Date(moment().format('YYYY-MM-01'));
  toDate = new Date();
  storeId: number;
  // showFilter = false;
  constpermissionList: any = [];
  status = 'All';
  statusValues = ['All', 'Created', 'Cancel', 'Rejected', 'Dispatched'];
  printData = null;

  constructor(
    private transactionService: TransactionsService,
    private route: Router,
    private commonService: CommonService,
    private activatedRoute: ActivatedRoute,
    private modalService: NgbModal,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.storeId = JSON.parse(localStorage.getItem('globals')).storeId;
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortingObject = { sort_order: 'desc', sort_column: 'invoiceNo' };
    this.searchString = '';
    this.externalPaging = true;
    this.subjectFun();
    this.commonService.routeChanged(this.activatedRoute);
    this.getPurchaseInvoiceList();
    this.constpermissionList = PermissionsConstants;
  }

  getPurchaseInvoiceList(): void {
    const params = {
      searchKeyword: this.searchString,
      storeId: this.storeId,
      status: this.status,
      fromDate: moment(this.fromDate).format('YYYY-MM-DD'),
      toDate: moment(this.toDate).format('YYYY-MM-DD'),
      sortOrder: this.sortingObject.sort_order,
      sortColumn: this.sortingObject.sort_column,
      pageNumber: this.page.pageNumber,
      limit: this.page.size,
    };

    this.transactionService.getInvoiceList(params).subscribe(res => {
      if (res.total_records > 0) {
        this.purchaseInvoiceList = [...res.data];
        this.page.totalElements = res.total_records;
      } else {
        this.purchaseInvoiceList = [];
        this.page.totalElements = 0;
      }
    });
  }

  subjectFun(): void {
    this.subject.pipe(debounceTime(500), takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.page.pageNumber = 1;
      this.getPurchaseInvoiceList();
    });

    // this.commonService.$addPopupEvent.pipe(takeUntil(this.ngUnsubscribe)).subscribe(popup => {
    //   // if (popup && popup.redirectFromPage === '/inventory/transactions/purchaseReturnList') {
    //   //   // this.showAddPopup = popup.isShowAddPopup;
    //   //   // this.router.navigate(['/inventory/transactions/addUpdatePurchaseReturns/-1']);
    //   //   // open add popup
    //   // } else {
    //   //   this.showAddPopup = false;
    //   // }
    //   if (popup) {
    //     this.showFilter = !popup.isShowFilterPopup;
    //   } else {
    //     this.showFilter = false;
    //   }
    // });
  }

  onSetPage(pageInfo): any {
    this.table.offset = pageInfo.offset - 1;
    if (this.externalPaging) {
      return;
    }
  }

  onSortChanged(event): void {
    if (event.sorts.length > 0) {
      const obj = event.sorts[0];
      this.sortingObject.sort_order = obj.dir;
      this.sortingObject.sort_column = obj.prop;
      this.getPurchaseInvoiceList();
    }
  }

  onPageSizeChanged(newPageSize): void {
    this.sortingObject = { sort_order: 'desc', sort_column: '' };
    this.page.size = Number(newPageSize);
    this.page.pageNumber = 1;
    this.getPurchaseInvoiceList();
  }

  onFooterPage(event): void {
    this.page.pageNumber = event.page;
    this.getPurchaseInvoiceList();
  }

  onEdit(row): void {
    this.route.navigate(['/inventory/transactions/purchaseInvoiceAddUpdate/', row.invoiceId]);
  }

  onDelete(row): void {
    this.transactionService.deleteInvoice(row.invoiceId).subscribe(res => {
      if (res.status_code === 200) {
        this.setAlertMessage = {
          message: 'Invoice Deleted!',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        this.getPurchaseInvoiceList();
      }
    });
  }

  updateStatus(status, row): void {
    const msg = 'Do you really want to ' + status + ' this Invoice?';
    if (status !== 'Approve') {
      this.openConfirmReasonPopup(msg, status, row);
      return;
    } else {
      this.transactionService.approveInvoice(row.invoiceId).subscribe(res => {
        if (res.status_message === 'Success') {
          this.notifyAlertMessage({
            msg: 'Data Saved Successfully!',
            class: 'Success',
          });
        }
      });
    }
  }

  openConfirmReasonPopup(msg, status, row): void {
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
          this.cancelInvoice(result.reason, row);
          return;
        } else if (status === 'Reject') {
          this.rejectInvoice(result.reason, row);
          return;
        }
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  rejectInvoice(reason, row): void {
    const reqParams = {
      Id: row.invoiceId,
      remark: reason
    };
    this.transactionService.rejectInvoice(reqParams).subscribe(res => {
      if (res) {
        this.notifyAlertMessage({
          msg: 'Data Saved Successfully!',
          class: 'Success',
        });
        this.route.navigate(['/inventory/transactions/purchaseInvoiceList']);
      } else {
        this.notifyAlertMessage({
          msg: 'Something Went Wrong',
          class: 'danger',
        });
        return false;
      }
    });
  }

  cancelInvoice(reason, row): void {
    const reqParams = {
      Id: row.invoiceId,
      remark: reason
    };
    this.transactionService.cancelInvoice(reqParams).subscribe(res => {
      if (res) {
        this.notifyAlertMessage({
          msg: 'Data Saved Successfully!',
          class: 'Success',
        });
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
    this.setAlertMessage = {
      message: data.msg,
      messageType: data.class,
      duration: Constants.ALERT_DURATION
    };
  }

  getPrintData(data) {
    const url = environment.REPORT_API + 'Report/InvoicePrint/?auth_token=' + this.authService.getAuthToken() + '&invoiceId=' + data.invoiceId;
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
      stageId: Constants.auditLogStageConstants.Invoice,
      referenceId: row.invoiceId
    };
    modalInstance.result.then((result) => {
    });
  }

}
