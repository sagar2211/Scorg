import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Constants } from 'src/app/config/constants';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { AuthService } from 'src/app/public/services/auth.service';
import { CommonService } from 'src/app/public/services/common.service';
import { PermissionsConstants } from '../../../../config/PermissionsConstants';
import { environment } from 'src/environments/environment';
import {AuditLogsComponent} from "../../../transactions/components/audit-logs/audit-logs.component";
import { IssueService } from 'src/app/modules/issue/services/issue.service';

@Component({
  selector: 'app-store-consumption-summary',
  templateUrl: './store-consumption-summary.component.html',
  styleUrls: ['./store-consumption-summary.component.scss']
})
export class StoreConsumptionSummaryComponent implements OnInit {
  @ViewChild(DatatableComponent, { static: false }) public table: DatatableComponent;
  pageSize;
  page: {
    size: number, // The number of elements in the page
    totalElements: number, // The total number of elements
    totalPages: number, // The total number of pages
    pageNumber: number, // The current page number
  };
  searchString: string = null;
  externalPaging: boolean;
  sortingObject: { sort_order: string, sort_column: string };
  alertMsg: IAlert;
  subject: Subject<string> = new Subject();
  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  userId: number;
  fromDate: Date = new Date(moment().format('YYYY-MM-01'));
  toDate: Date = new Date();
  storeId: number;
  storeConsumptionList = [];
  // showFilter = false;
  constpermissionList: any = [];
  printData = null;
  constructor(
    private issueService: IssueService,
    private modalService: NgbModal,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.userId = this.authService.getLoggedInUserId();
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortingObject = { sort_order: 'desc', sort_column: 'consumptionNo' };
    this.externalPaging = true;
    this.storeId = this.authService.getLoginStoreId();
    this.subjectFun();
    this.getStoreConsumptionsList();
    this.commonService.routeChanged(this.route);
    this.constpermissionList = PermissionsConstants;
  }

  subjectFun(): void {
    this.subject.pipe(debounceTime(500), takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.page.pageNumber = 1;
      this.getStoreConsumptionsList();
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

  notifyAlertMessage(data): void {
    this.alertMsg = {
      message: data.msg,
      messageType: data.class,
      duration: Constants.ALERT_DURATION
    };
  }

  getStoreConsumptionsList(): void {
    const params = {
      searchKeyword: this.searchString,
      fromDate: moment(this.fromDate).format('YYYY-MM-DD'),
      toDate: moment(this.toDate).format('YYYY-MM-DD'),
      sortOrder: this.sortingObject.sort_order,
      sortColumn: this.sortingObject.sort_column,
      pageNumber: this.page.pageNumber,
      limit: this.page.size,
      storeId: this.storeId,
    };

    this.issueService.getStoreConsumptionList(params).subscribe(res => {
      if (res.status_message === 'Success') {
        this.storeConsumptionList = [...res.data];
        this.page.totalElements = res.total_records;
      } else {
        this.storeConsumptionList = [];
        this.page.totalElements = 0;
      }
    });
  }

  onPageSizeChanged(newPageSize): void {
    this.sortingObject = { sort_order: 'desc', sort_column: '' };
    this.page.size = Number(newPageSize);
    this.page.pageNumber = 1;
    this.getStoreConsumptionsList();
  }

  onFooterPage(event): void {
    this.page.pageNumber = event.page;
    this.getStoreConsumptionsList();
  }

  onSortChanged(event): void {
    if (event.sorts.length > 0) {
      const obj = event.sorts[0];
      this.sortingObject.sort_order = obj.dir;
      this.sortingObject.sort_column = this.getSortColumnName(obj.prop);
      this.getStoreConsumptionsList();
    }
  }

  getSortColumnName(clmName): string {
    if (clmName === 'consumptionId') {
      return 'consumptionNo';
    } else {
      return clmName;
    }
  }

  onSetPage(pageInfo): any {
    this.table.offset = pageInfo.offset - 1;
    if (this.externalPaging) {
      return;
    }
  }

  clearSearch(): void {
    if (this.searchString) {
      this.searchString = null;
      this.getStoreConsumptionsList();
    }
  }

  onEdit(row): void {
    this.router.navigate(['/inventory/issue/consumption/storeConsumption/', row.consumptionId]);
  }

  getPrintData(data) {
    const url = environment.REPORT_API + 'Report/ConsumptionPrint/?auth_token=' + this.authService.getAuthToken() + '&consumptionId=' + data.consumptionId;
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
      stageId: Constants.auditLogStageConstants.Consumption,
      referenceId: row.consumptionId
    };
    modalInstance.result.then((result) => {
    });
  }

}
