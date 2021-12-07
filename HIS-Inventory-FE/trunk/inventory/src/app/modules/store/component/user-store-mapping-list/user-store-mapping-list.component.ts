import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { Subject, Observable, concat, of } from 'rxjs';
import { CommonService } from 'src/app/public/services/common.service';
import { ActivatedRoute } from '@angular/router';
import { NgxPermissionsService } from 'ngx-permissions';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { debounceTime, takeUntil, distinctUntilChanged, tap, switchMap, catchError } from 'rxjs/operators';
import { ConfirmationPopupComponent } from 'src/app/shared/confirmation-popup/confirmation-popup.component';
import { Constants } from 'src/app/config/constants';
import * as _ from 'lodash';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { UserStoreAddUpdateMappingComponent } from '../user-store-add-update-mapping/user-store-add-update-mapping.component';
import { MastersService } from 'src/app/modules/masters/services/masters.service';

@Component({
  selector: 'app-user-store-mapping-list',
  templateUrl: './user-store-mapping-list.component.html',
  styleUrls: ['./user-store-mapping-list.component.scss']
})
export class UserStoreMappingListComponent implements OnInit, OnDestroy {
  @ViewChild(DatatableComponent, { static: false }) public table: DatatableComponent;
  pageSize;
  mappingList = [];
  page: {
    size: number, // The number of elements in the page
    totalElements: number, // The total number of elements
    totalPages: number, // The total number of pages
    pageNumber: number, // The current page number
  };
  searchString: any;
  externalPaging: boolean;
  sortUserList: { sort_order: string, sort_column: string };
  alertMsg: IAlert;
  subject: Subject<string> = new Subject();
  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  compInstance = this;
  isNgSelectTypeHeadDisabled = false;
  isFilterApply: boolean;
  datatableBodyElement: any;
  editPermission: boolean;
  PermissionConstantList: any = [];
  isActive: boolean;
  $destroy: Subject<boolean> = new Subject();
  showAddPopup = false;
  formLoading = false;
  loadForm = false;


  constructor(
    private commonService: CommonService,
    private route: ActivatedRoute,
    private mastersService: MastersService,
    private ngxPermissionsService: NgxPermissionsService,
    public modalService: NgbModal,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.PermissionConstantList = PermissionsConstants;
    this.defaultObject();
    this.pageSize = '15';
    this.subjectFun();
    this.getUserStoreMappingListData();
    this.commonService.routeChanged(this.route);
    this.showActivePopup();
  }

  ngOnDestroy(): void {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  ngOnChanges() {
    this.getUserStoreMappingListData();
  }

  defaultObject() {
    this.isFilterApply = false;
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortUserList = { sort_order: 'desc', sort_column: 'userId' };
    this.searchString = null;
    this.externalPaging = true;
    this.isActive = true;
  }

  subjectFun() {
    // -- Subscribe to the subject, which is triggered from search input and when section clicked
    // -- When the debounce time has passed, we call getActiveScheduleData()
    this.subject
      .pipe(debounceTime(500), takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.page.pageNumber = 1;
        this.getUserStoreMappingListData();
      }
      );
  }

  getUserStoreMappingListData() {
    const param = {
      limit: this.page.size,
      pageNumber: this.page.pageNumber,
      sortOrder: this.sortUserList.sort_order,
      sortColumn: this.sortUserList.sort_column,
      searchKeyword: this.searchString,
    };
    this.mastersService.getUserStoreMappingList(param).subscribe(res => {
      if (res.data.length > 0) {
        this.mappingList = res.data;
        this.page.totalElements = res.totalCount ? res.totalCount : res.data.length;
      } else {
        this.mappingList = [];
        this.page.totalElements = 0;
      }
    });
  }

  getUserList() {
    const param = {
      limit: this.page.size,
      pageNumber: this.page.pageNumber,
      sortOrder: this.sortUserList.sort_order,
      sortColumn: this.sortUserList.sort_column,
      searchKeyword: this.searchString,
    };
    this.mastersService.getUserList(param).subscribe(res => {
      if (res.data.length > 0) {
        this.mappingList = res.data;
        this.page.totalElements = res.totalCount ? res.totalCount : res.data.length;
      } else {
        this.mappingList = [];
        this.page.totalElements = 0;
      }
    });
  }

  onPageSizeChanged(newPageSize) {
    this.sortUserList = { sort_order: 'desc', sort_column: 'userId' };
    this.page.size = Number(newPageSize);
    this.page.pageNumber = 1;
    this.getUserStoreMappingListData();
  }

  onFooterPage(event): void {
    this.page.pageNumber = event.page;
    this.getUserStoreMappingListData();
  }

  onSortChanged(event) {
    if (event.sorts.length > 0) {
      const obj = event.sorts[0];
      this.sortUserList.sort_order = obj.dir;
      this.sortUserList.sort_column = this.getSortColumnName(obj.prop);
      this.getUserStoreMappingListData();
    }
  }

  getSortColumnName(clmName) {
    return clmName;
  }

  onSetPage(pageInfo) {
    this.table.offset = pageInfo.offset - 1;
    if (this.externalPaging) {
      return;
    }
  }

  clearSearchString() {
    this.searchString = null;
    this.getUserStoreMappingListData();
  }

  deleteMainGrpMaster(row) {
    const modalTitleobj = 'Delete';
    const modalBodyobj = 'Do you want to delete this Primary Group <span class="font-weight-500"> (' + row.name + ') </span>';
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
        this.mastersService.deleteMainGroupDataById(row.id).subscribe(response => {
          if (response.status_code === 200 && response.status_message === 'Success') {
            this.getUserStoreMappingListData();
            this.alertMsg = {
              message: response.message,
              messageType: 'success',
              duration: Constants.ALERT_DURATION
            };
          } else {
            this.alertMsg = {
              message: response.message,
              messageType: 'warning',
              duration: Constants.ALERT_DURATION
            };
          }
        });
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  editMapping(row) {
    const obj = {
      user_id: row.userId,
      user_name: row.userName
    };
    this.openPopup(obj);
  }

  openPopup(val) {
    const detail = {
      data: val,
      type: val ? 'edit' : 'add'
    };
    const modalInstance = this.modalService.open(UserStoreAddUpdateMappingComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        windowClass: 'custom-modal',
        container: '#homeComponent'
      });
    modalInstance.result.then((result) => {
      if (result === 'save') {
        this.alertMsg = {
          message: 'Value Saved Successfully',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        this.getUserStoreMappingListData();
      }
    }, (dis) => {

    });
    modalInstance.componentInstance.popupDetails = detail;
  }

  updateDataTable() {
    this.getUserStoreMappingListData();
  }

  showActivePopup() {
    this.commonService.$addPopupEvent.pipe(takeUntil(this.$destroy)).subscribe(popup => {
      if (popup && popup.redirectFromPage === '/inventory/masters/store/userStoreMapping') {
        this.showAddPopup = popup.isShowAddPopup;
        this.openPopup(null);
      } else {
        this.showAddPopup = false;
      }
    });
  }
}
