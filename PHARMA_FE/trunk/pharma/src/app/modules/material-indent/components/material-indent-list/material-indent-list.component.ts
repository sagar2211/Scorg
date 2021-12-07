import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { Subject, Observable } from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Constants } from '../../../../config/constants';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/public/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/public/services/auth.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { debounceTime, takeUntil, map } from 'rxjs/operators';
import { ConfirmationPopupComponent } from 'src/app/shared/confirmation-popup/confirmation-popup.component';
import { IndentService } from '../../../indent/services/indent.service';
import { PermissionsConstants } from "../../../../config/PermissionsConstants";
import { ConfirmationPopupWithReasonComponent } from 'src/app/shared/confirmation-popup-with-reason/confirmation-popup-with-reason.component';
import {AuditLogsComponent} from "../../../../shared/audit-logs/audit-logs.component";

@Component({
  selector: 'app-material-indent-list',
  templateUrl: './material-indent-list.component.html',
  styleUrls: ['./material-indent-list.component.scss']
})
export class MaterialIndentListComponent implements OnInit, OnDestroy {
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
  constantsVal = Constants;
  indentTypesList = [];
  constpermissionList: any = [];
  constructor(
    private indentService: IndentService,
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
    this.getIndentTypesList().subscribe();
    this.subjectFun();
    this.getListData();
    this.showActivePopup();
    this.createFormFilter();
    this.commonService.routeChanged(this.route);
    this.statusListArray.push('All');
    this.statusListArray.push(Constants.inventoryStatusCreated);
    this.statusListArray.push(Constants.inventoryStatusCancel);
    this.statusListArray.push(Constants.inventoryStatusRejected);
    this.statusListArray.push(Constants.inventoryStatusApproved);
    this.statusListArray.push(Constants.inventoryStatusPartial);
    this.statusListArray.push(Constants.inventoryStatusComplete);
    this.constpermissionList = PermissionsConstants;
  }

  ngOnDestroy(): void {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  defaultObject() {
    this.isFilterApply = false;
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortingObject = { sort_order: 'desc', sort_column: 'indentId' };
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
      indentType: 'All',
    };
    if (this.indentFilterForm) {
      params.fromDate = this.indentFilterForm.value.startDate;
      params.toDate = this.indentFilterForm.value.endDate;
      params.indentType = this.indentFilterForm.value.indent ? this.indentFilterForm.value.indent.indentType : 'All';
    }
    this.indentService.getIndentList(params).subscribe(res => {
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
      if (popup && popup.redirectFromPage === '/inventory/indent/materialIndent/materialIndentList') {
        this.showAddPopup = popup.isShowAddPopup;
        this.router.navigate(['/inventory/indent/materialIndent/addMaterialIndent']);
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
      indent: [null],
    };
    this.indentFilterForm = this.fb.group(form);
    this.showFilter = true;
  }

  getIndentTypesList(): Observable<any> {
    return this.indentService.getIndentTypes().pipe(map((res: any) => {
      this.indentTypesList = [];
      this.indentTypesList.push({ indentType: 'All', description: 'All' });
      this.indentTypesList = res;
      return res;
    }));
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
    this.router.navigate(['/inventory/indent/materialIndent/updateMaterialIndent/' + row.indentId]);
  }

  deleteIndentPoup(item) {
    this.openConfirmPopup(item, 'Are you sure?', 'delete');
  }

  updateStatus(status, row) {
    const msg = 'Do you want to ' + status + ' this Indent?';
    if (status === 'Delete') {
      this.openConfirmPopup(row, msg, status);
      return;
    }
    if (status !== this.constantsVal.inventoryStatusApproved) {
      this.openConfirmReasonPopup(row, msg, status);
    } else {
      this.openConfirmPopup(row, msg, status);
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
        if (from === this.constantsVal.inventoryStatusApproved) {
          this.approveIndent(val.indentId);
        }
        if (from === 'Delete') {
          this.deleteIndent(val.indentId);
        }
        return;
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
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
        if (from === this.constantsVal.inventoryStatusCancel) {
          this.cancelIndent(result.reason, val.indentId);
          return;
        } else if (from === this.constantsVal.inventoryStatusRejected) {
          this.rejectIndent(result.reason, val.indentId);
          return;
        }
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  cancelIndent(val, id) {
    const param = {
      Id: id,
      remark: val ? val : null
    };
    this.indentService.cancelIndent(param).subscribe(res => {
      if (res.status_code === 200) {
        this.alertMsg = {
          message: 'Indent Cancel!',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
      }
    });
  }

  approveIndent(id) {
    this.indentService.approveIndent(id).subscribe(res => {
      if (res.status_code === 200) {
        this.alertMsg = {
          message: 'Indent Approved!',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
      }
    });
  }

  rejectIndent(val, id) {
    const param = {
      Id: id,
      remark: val ? val : null
    };
    this.indentService.rejectIndent(param).subscribe(res => {
      if (res.status_code === 200) {
        this.alertMsg = {
          message: 'Indent Rejected!',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
      }
    });
  }

  deleteIndent(id) {
    this.indentService.deleteIndent(id).subscribe(res => {
      if (res.status_code === 200) {
        this.alertMsg = {
          message: 'Indent Deleted!',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
      }
    });
  }

  indentyTypeUpdate(){
    // this.indentFilterForm.patchValue({
    //   indent:
    // })
    this.getListData();
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
