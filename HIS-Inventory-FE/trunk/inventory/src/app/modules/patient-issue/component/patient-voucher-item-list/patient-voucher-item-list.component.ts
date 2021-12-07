import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { Subject } from 'rxjs';
import { IssueService } from 'src/app/modules/issue/services/issue.service';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/public/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/public/services/auth.service';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Constants } from 'src/app/config/constants';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';

@Component({
  selector: 'app-patient-voucher-item-list',
  templateUrl: './patient-voucher-item-list.component.html',
  styleUrls: ['./patient-voucher-item-list.component.scss']
})
export class PatientVoucherItemListComponent implements OnInit {
  @ViewChild(DatatableComponent, { static: false }) public table: DatatableComponent;
  @Input() patientData: any;
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
  patientIssueList = [];
  // showFilter = false;
  constpermissionList: any = [];
  printData = null;
  constructor(
    private issueService: IssueService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private authService: AuthService,
    public modal: NgbActiveModal
  ) { }

  ngOnInit(): void {
    this.userId = this.authService.getLoggedInUserId();
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortingObject = { sort_order: 'desc', sort_column: 'consumptionNo' };
    this.externalPaging = true;
    this.storeId = this.authService.getLoginStoreId();
    this.subjectFun();
    this.getPatientVoucherItemList();
    this.commonService.routeChanged(this.route);
    this.constpermissionList = PermissionsConstants;
  }

  subjectFun(): void {
    this.subject.pipe(debounceTime(500), takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.page.pageNumber = 1;
      this.getPatientVoucherItemList();
    });
  }

  notifyAlertMessage(data): void {
    this.alertMsg = {
      message: data.msg,
      messageType: data.class,
      duration: Constants.ALERT_DURATION
    };
  }

  getPatientVoucherItemList(): void {
    const params = {
      searchKeyword: this.searchString,
      visitType: this.patientData.visitType,
      patientId: this.patientData.patientId,
      visitNo: this.patientData.visitNo,
      sortOrder: this.sortingObject.sort_order,
      sortColumn: this.sortingObject.sort_column,
      pageNumber: this.page.pageNumber,
      limit: this.page.size,
      storeId: this.storeId,
    };

    this.issueService.getPatientConsumptionItemList(params).subscribe(res => {
      if (res.data.length > 0) {
        this.patientIssueList = res.data;
        this.page.totalElements = res.totalCount;
      } else {
        this.patientIssueList = [];
        this.page.totalElements = 0;
      }
    });
  }

  onPageSizeChanged(newPageSize): void {
    this.sortingObject = { sort_order: 'desc', sort_column: '' };
    this.page.size = Number(newPageSize);
    this.page.pageNumber = 1;
    this.getPatientVoucherItemList();
  }

  onFooterPage(event): void {
    this.page.pageNumber = event.page;
    this.getPatientVoucherItemList();
  }

  onSortChanged(event): void {
    if (event.sorts.length > 0) {
      const obj = event.sorts[0];
      this.sortingObject.sort_order = obj.dir;
      this.sortingObject.sort_column = this.getSortColumnName(obj.prop);
      this.getPatientVoucherItemList();
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
      this.getPatientVoucherItemList();
    }
  }

  closePopup() {
    this.modal.close(false);
  }

}
