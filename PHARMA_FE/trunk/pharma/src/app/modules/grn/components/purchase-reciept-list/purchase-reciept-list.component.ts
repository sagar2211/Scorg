import { OnInit, ViewChild, Component } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { TransactionsService } from "../../../transactions/services/transactions.service";
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { Constants } from 'src/app/config/constants';
import { CommonService } from 'src/app/public/services/common.service';
import { PermissionsConstants } from '../../../../config/PermissionsConstants';
import { ConfirmationPopupWithReasonComponent } from 'src/app/shared/confirmation-popup-with-reason/confirmation-popup-with-reason.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/public/services/auth.service';
import { AuditLogsComponent } from "../audit-logs/audit-logs.component";

@Component({
  selector: 'app-purchase-reciept-list',
  templateUrl: './purchase-reciept-list.component.html',
  styleUrls: ['./purchase-reciept-list.component.scss']
})
export class PurchaseRecieptListComponent implements OnInit {
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
  purchaseRecieptList: Array<any> = [];
  subject: Subject<string> = new Subject();
  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  fromDate = new Date(moment().format('YYYY-MM-01'));
  toDate = new Date();
  storeId: number;
  // showFilter = false;
  constpermissionList: any = [];
  status = 'All';
  statusValues = ['All', 'Created', 'Cancel', 'Rejected', 'Approved'];
  printData = null;
  constructor(
    private transactionService: TransactionsService,
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private commonService: CommonService,
    private modalService: NgbModal,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.storeId = JSON.parse(localStorage.getItem('globals')).storeId;
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortingObject = { sort_order: 'desc', sort_column: 'grnId' };
    this.searchString = '';
    this.externalPaging = true;
    this.getPurchaseRecieptList();
    this.subjectFun();
    this.commonService.routeChanged(this.activatedRoute);
    this.constpermissionList = PermissionsConstants;
  }

  getPurchaseRecieptList(): void {
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

    this.transactionService.getGRNList(params).subscribe(res => {
      if (res.total_records > 0) {
        this.purchaseRecieptList = [...res.data];
        this.page.totalElements = res.total_records;
      } else {
        this.purchaseRecieptList = [];
        this.page.totalElements = 0;
      }
    });
  }

  subjectFun(): void {
    this.subject.pipe(debounceTime(500), takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.page.pageNumber = 1;
      this.getPurchaseRecieptList();
    });

    // this.commonService.$addPopupEvent.pipe(takeUntil(this.ngUnsubscribe)).subscribe(popup => {
    //     // if (popup && popup.redirectFromPage === '/inventory/transactions/purchaseReturnList') {
    //     //   // this.showAddPopup = popup.isShowAddPopup;
    //     //   // this.router.navigate(['/inventory/transactions/addUpdatePurchaseReturns/-1']);
    //     //   // open add popup
    //     // } else {
    //     //   this.showAddPopup = false;
    //     // }
    //     if (popup) {
    //         this.showFilter = !popup.isShowFilterPopup;
    //     } else {
    //         this.showFilter = false;
    //     }
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
      this.getPurchaseRecieptList();
    }
  }

  onPageSizeChanged(newPageSize): void {
    this.sortingObject = { sort_order: 'desc', sort_column: '' };
    this.page.size = Number(newPageSize);
    this.page.pageNumber = 1;
    this.getPurchaseRecieptList();
  }

  onFooterPage(event): void {
    this.page.pageNumber = event.page;
    this.getPurchaseRecieptList();
  }

  onEdit(row): void {
    this.route.navigate(['/inventory/transactions/grn/purchaseRecieptUpdate/', row.grnId]);
  }

  onDelete(row): void {
    this.transactionService.deleteGRN(row.grnId).subscribe(res => {
      if (res.status_code === 200) {
        this.setAlertMessage = {
          message: 'GRN Deleted!',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        this.getPurchaseRecieptList();
      }
    });
  }

  updateStatus(status, row): void {
    const msg = 'Do you really want to ' + status + ' this GRN?';
    if (status !== 'Approve') {
      this.openConfirmReasonPopup(msg, status, row);
      return;
    } else {
      const reqParams = { grnId: row.grnId };
      this.transactionService.approveGRN(reqParams).subscribe(res => {
        if (res.status_message === 'Success') {
          this.setAlertMessage = {
            message: 'GRN Approved Successfully!',
            messageType: 'success',
            duration: Constants.ALERT_DURATION
          };
          this.getPurchaseRecieptList();
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
          this.cancelPurchaseReceipt(result.reason, row);
          return;
        } else if (status === 'Reject') {
          this.rejectPurchaseReceipt(result.reason, row);
          return;
        }
      }
    }, () => { });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  rejectPurchaseReceipt(reason, row): void {
    const reqParams = {
      Id: row.grnId,
      remark: reason
    };
    this.transactionService.rejectGRN(reqParams).subscribe(res => {
      if (res) {
        this.notifyAlertMessage({
          msg: 'GRN Rejected Successfully!',
          class: 'Success',
        });
        this.getPurchaseRecieptList();
      } else {
        this.notifyAlertMessage({
          msg: 'Something Went Wrong',
          class: 'danger',
        });
        return false;
      }
    });
  }

  cancelPurchaseReceipt(reason, row): void {
    const reqParams = {
      Id: row.grnId,
      remark: reason
    };
    this.transactionService.cancelGRN(reqParams).subscribe(res => {
      if (res) {
        this.notifyAlertMessage({
          msg: 'GRN Cancelled Successfully!',
          class: 'Success',
        });
        this.getPurchaseRecieptList();
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
    const url = environment.REPORT_API + 'Report/GRNPrint/?auth_token=' + this.authService.getAuthToken() + '&grnId=' + data.grnId;
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
      stageId: Constants.auditLogStageConstants.GRN,
      referenceId: row.grnId
    };
    modalInstance.result.then((result) => {
    });
  }

  onCopy(row) {
    this.route.navigate(['/inventory/transactions/grn/purchaseRecieptCopy/', row.grnId]);
  }

}
