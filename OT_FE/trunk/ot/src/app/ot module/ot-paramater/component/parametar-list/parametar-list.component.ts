import { Component, OnInit, ViewChild } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/public/services/common.service';
import { ActivatedRoute } from '@angular/router';
import { OtMasterService } from 'src/app/ot module/ot/services/ot-master.service';
import { AuthService } from 'src/app/public/services/auth.service';
import { Constants } from 'src/app/config/constants';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { ConfirmationPopupComponent } from 'src/app/shared/confirmation-popup/confirmation-popup.component';
import * as _ from 'lodash';
import * as moment from 'moment';
import { ParametarComponent } from '../parametar/parametar.component';

@Component({
  selector: 'app-parametar-list',
  templateUrl: './parametar-list.component.html',
  styleUrls: ['./parametar-list.component.scss']
})
export class ParametarListComponent implements OnInit {
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
  sortList: { sort_order: string, sort_column: string };
  setAlertMessage: IAlert;
  subject: Subject<string> = new Subject();
  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  compInstance = this;
  isNgSelectTypeHeadDisabled = false;
  showFilter: boolean;
  isFilterApply: boolean;
  datatableBodyElement: any;
  editPermission: boolean;
  paramList = [];
  $destroy: Subject<boolean> = new Subject();
  showAddPopup = false;
  userId: any;
  timeFormateKey: string;
  timeFormate: string;
  showActive: boolean;
  constructor(
    private modalService: NgbModal,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private otMasterService: OtMasterService,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.showActive = true;
    this.defaultObject();
    this.pageSize = '15';
    this.subjectFun();
    this.getTimeFormatKey().then(res => {
      this.getListData();
    });
    this.showActivePopup();
    this.commonService.routeChanged(this.route);
  }

  ngOnDestroy(): void {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  getTimeFormatKey(): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      this.userId = +this.authService.getLoggedInUserId();
      this.commonService.getQueueSettings(Constants.timeFormateKey, this.userId).subscribe(res => {
        this.timeFormateKey = res.time_format_key;
        if (this.timeFormateKey === '12_hour') {
          this.timeFormate = 'hh:mm A';
        } else {
          this.timeFormate = 'HH:mm';
        }
        resolve(this.timeFormate);
      });
    });
    return promise;
  }

  addUpdateParametar(data?) {
    const addUpdateData = {
      data: data ? data : null,
      title: data ? 'UPDATE' : 'ADD'
    };
    const modalInstance = this.modalService.open(ParametarComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        windowClass: 'custom-modal',
        container: '#homeComponent',
        size: 'lg'
      });
    modalInstance.result.then((result) => {
      if (result === 'yes') {
        this.getListData();
      }
    });
    modalInstance.componentInstance.addUpdateData = addUpdateData;
  }

  subjectFun() {
    // -- Subscribe to the subject, which is triggered from search input and when section clicked
    // -- When the debounce time has passed, we call getActiveScheduleData()
    this.subject
      .pipe(debounceTime(500), takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.page.pageNumber = 1;
        this.getListData();
      });
  }

  defaultObject() {
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortList = { sort_order: 'desc', sort_column: 'parameterId' };
    this.searchString = '';
    this.externalPaging = true;
  }

  notifyAlertMessage(data): void {
    this.setAlertMessage = {
      message: data.msg,
      messageType: data.class,
      duration: Constants.ALERT_DURATION
    };
  }

  getListData() {
    const param = {
      limit: this.page.size,
      pageNumber: this.page.pageNumber,
      sortOrder: this.sortList.sort_order,
      sortColumn: this.sortList.sort_column,
      searchKeyword: this.searchString,
      isActive: this.showActive,
    };
    this.otMasterService.getOTParameterList(param).subscribe(res => {
      if (res.total_records > 0) {
        this.paramList = res.data;
        this.page.totalElements = res.total_records;
      } else {
        this.paramList = [];
        this.page.totalElements = 0;
      }
    });
  }

  onPageSizeChanged(newPageSize) {
    this.sortList = { sort_order: 'desc', sort_column: 'parameterId' };
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
      this.sortList.sort_order = obj.dir;
      this.sortList.sort_column = obj.prop;
      this.getListData();
    }
  }

  onSetPage(pageInfo) {
    this.table.offset = pageInfo.offset - 1;
    if (this.externalPaging) {
      return;
    }
  }

  deleteData(rowData) {
    const modalTitleobj = 'Delete';
    const modalBodyobj = 'Do you want to delete this Parametar?';
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
        this.deleteById(rowData);
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  deleteById(rowData) {
    this.otMasterService.deleteOTParameterById(rowData.parameterId).subscribe(res => {
      if (res) {
        this.notifyAlertMessage({
          msg: 'Deleted Successfully!',
          class: 'success',
        });
        this.getListData();
      } else {
        this.notifyAlertMessage({
          msg: 'Someting Went Wrong!',
          class: 'danger',
        });
      }
    });
  }
  editData(row) {
    this.addUpdateParametar(row);
  }

  clearSearch() {
    if (this.searchString) {
      this.searchString = '';
      this.getListData();
    }
  }

  showActivePopup() {
    this.commonService.$addPopupEvent.pipe(takeUntil(this.$destroy)).subscribe(popup => {
      if (popup && popup.redirectFromPage === '/otApp/ot/parameter/list') {
        this.showAddPopup = popup.isShowAddPopup;
        this.addUpdateParametar();
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
}
