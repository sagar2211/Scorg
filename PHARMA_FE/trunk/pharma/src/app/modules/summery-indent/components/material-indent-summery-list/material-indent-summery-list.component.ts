import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { Subject, Observable } from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/public/services/common.service';
import { AuthService } from 'src/app/public/services/auth.service';
import { Constants } from 'src/app/config/constants';
import { debounceTime, takeUntil, map } from 'rxjs/operators';
import { ConfirmationPopupComponent } from 'src/app/shared/confirmation-popup/confirmation-popup.component';
import * as _ from 'lodash';
import * as moment from 'moment';
import { IssueService } from '../../../issue/services/issue.service';
import { AuditLogsComponent } from 'src/app/shared/audit-logs/audit-logs.component';

@Component({
  selector: 'app-material-indent-summery-list',
  templateUrl: './material-indent-summery-list.component.html',
  styleUrls: ['./material-indent-summery-list.component.scss']
})
export class MaterialIndentSummeryListComponent implements OnInit, OnDestroy {
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
  indentFilterForm: FormGroup;
  selectedStatus: string = 'All';
  userId;
  constantsVal = null;
  constructor(
    private issueService: IssueService,
    private modalService: NgbModal,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.userId = this.authService.getLoggedInUserId();
    this.constantsVal = Constants;
    this.defaultObject();
    this.subjectFun();
    this.getListData();
    this.showActivePopup();
    this.createFormFilter();
    this.commonService.routeChanged(this.route);
    this.statusListArray.push('All');
    this.statusListArray.push(Constants.issueIndentStatusPartial);
    this.statusListArray.push(Constants.issueIndentStatusOpen);
    this.statusListArray.push(Constants.issueIndentStatusComplete);
  }

  ngOnDestroy(): void {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  defaultObject() {
    this.isFilterApply = false;
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortingObject = { sort_order: 'desc', sort_column: 'indentNo' };
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
      fromDate: new Date(moment().format('YYYY-MM-01')),
      toDate: new Date(moment().format('YYYY-MM-DD')),
      sortOrder: this.sortingObject.sort_order,
      sortColumn: this.sortingObject.sort_column,
      pageNumber: this.page.pageNumber,
      limit: this.page.size,
      status: this.selectedStatus === 'All' ? 'All' : this.selectedStatus,
      storeId: this.authService.getLoginStoreId(),
    };
    if (this.indentFilterForm) {
      params.fromDate = this.indentFilterForm.value.startDate;
      params.toDate = this.indentFilterForm.value.endDate;
    }
    this.issueService.getIndetnListForIssue(params).subscribe(res => {
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
      if (popup && popup.redirectFromPage === '/inventory/issue/summeryIndent/materialIndentList') {
        this.showAddPopup = popup.isShowAddPopup;
        // this.router.navigate(['/inventory/issue/summeryIndent/addIssue']);
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
    if (this.indentFilterForm) {
      this.showFilter = true;
      return;
    }
    const form = {
      startDate: [new Date(moment().format('YYYY-MM-01'))],
      endDate: [new Date(moment().format('YYYY-MM-DD'))],
    };
    this.indentFilterForm = this.fb.group(form);
    this.showFilter = true;
  }

  checkFormSubmit() {
    this.getListData();
    this.showFilter = !this.showFilter;
  }

  clearFilterFormData() {
    this.indentFilterForm.controls.startDate.patchValue(new Date(moment().startOf('month').format('YYYY-MM-DD hh:mm')));
    this.indentFilterForm.controls.endDate.patchValue(new Date(moment().format('YYYY-MM-DD hh:mm')));
  }

  redirectUpdatePage(row) {
    this.router.navigate(['/inventory/issue/summeryIndent/addUpdateIssue/' + row.indentId + '/indent']);
  }

  deleteIndentPoup(item) {
    this.openConfirmPopup(item, 'Are you sure?', 'delete');
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
        this.deleteIndent(val.indentId);
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  deleteIndent(val) {
    // this.indentService.deleteIndent(val).subscribe(res => {
    //   if (res.status_code === 200) {
    //     this.alertMsg = {
    //       message: 'Indent Deleted!',
    //       messageType: 'success',
    //       duration: Constants.ALERT_DURATION
    //     };
    //     this.getListData();
    //   }
    // });
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
      stageId: Constants.auditLogStageConstants.Indent,
      referenceId: row.indentId
    };
    modalInstance.result.then((result) => {
    });
  }

}
