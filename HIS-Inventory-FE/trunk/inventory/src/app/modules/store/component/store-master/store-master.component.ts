import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { IAlert } from '../../../../public/models/AlertMessage';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Constants } from '../../../../config/constants';
import { AddEditStoreMasterComponent } from '../add-edit-store-master/add-edit-store-master.component';
import { ConfirmationPopupComponent } from "../../../../shared/confirmation-popup/confirmation-popup.component";
import * as _ from 'lodash';
import { CommonService } from "../../../../public/services/common.service";
import { ActivatedRoute } from "@angular/router";
import {PermissionsConstants} from "../../../../config/PermissionsConstants";
import { MastersService } from 'src/app/modules/masters/services/masters.service';
@Component({
  selector: 'app-store-master',
  templateUrl: './store-master.component.html',
  styleUrls: ['./store-master.component.scss']
})
export class StoreMasterComponent implements OnInit, OnDestroy {
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
  constpermissionList: any = [];
  constructor(
    private mastersService: MastersService,
    private modalService: NgbModal,
    private commonService: CommonService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.defaultObject();
    this.subjectFun();
    this.getListData();
    this.showActivePopup();
    this.commonService.routeChanged(this.route);
    this.constpermissionList = PermissionsConstants;
  }

  ngOnDestroy(): void {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  defaultObject() {
    this.isFilterApply = false;
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortingObject = { sort_order: 'desc', sort_column: 'storeId' };
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
      sortOrder: this.sortingObject.sort_order,
      sortColumn: this.sortingObject.sort_column,
      pageNumber: this.page.pageNumber,
      limit: this.page.size,
      isActive: this.isActiveFilter
    };
    this.mastersService.getStoreMasterList(params).subscribe(res => {
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
    this.addUpdateStore(val);
  }

  onSetPage(pageInfo) {
    this.table.offset = pageInfo.offset - 1;
    if (this.externalPaging) {
      return;
    }
  }

  clearSearch() {
    if (this.searchString) {
      this.getListData();
    }
  }

  addUpdateStore(data?) {
    const modalInstance = this.modalService.open(AddEditStoreMasterComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      windowClass: 'custom-modal store-master',
      container: '#homeComponent'
    });
    modalInstance.componentInstance.storeData = {
      type: data ? 'edit' : 'add',
      data: data ? _.cloneDeep(data) : null,
    };
    modalInstance.result.then((result) => {
      if (result !== 'cancel') {
        this.notifyAlertMessage({
          msg: 'Details Saved Successfully',
          class: 'success',
        });
      }
      this.getListData();
    });
  }

  deleteData(rowData) {
    const modalTitleobj = 'Delete';
    const modalBodyobj = 'Do you want to delete Store <span class="font-weight-500">' + rowData.name + '</span>';
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
        this.deleteStoreById(rowData.id);
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  deleteStoreById(storeId) {
    const url = `/Master/DeleteStoreMasterById?storeId=${storeId}`;
    this.mastersService.delete(url).subscribe(res => {
      if (res) {
        this.notifyAlertMessage({
          msg: 'Store Deleted',
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

  showActivePopup() {
    this.commonService.$addPopupEvent.pipe(takeUntil(this.$destroy)).subscribe(popup => {
      if (popup && popup.redirectFromPage === '/inventory/masters/store/storeMaster') {
        this.showAddPopup = popup.isShowAddPopup;
        this.addUpdateStore();
      } else {
        this.showAddPopup = false;
      }
    });
  }

}
