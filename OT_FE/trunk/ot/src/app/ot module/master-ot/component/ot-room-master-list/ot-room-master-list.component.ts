import { Component, OnInit, ViewChild } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { Subject, Subscription } from 'rxjs';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/public/services/common.service';
import { Router, ActivatedRoute, Event, NavigationEnd } from '@angular/router';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Constants } from 'src/app/config/constants';
import { ConfirmationPopupComponent } from 'src/app/shared/confirmation-popup/confirmation-popup.component';
import { OtMasterService } from 'src/app/ot module/ot/services/ot-master.service';
import { OtRoomMasterComponent } from '../ot-room-master/ot-room-master.component';
import { AuthService } from 'src/app/public/services/auth.service';
import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
  selector: 'app-ot-room-master-list',
  templateUrl: './ot-room-master-list.component.html',
  styleUrls: ['./ot-room-master-list.component.scss']
})
export class OtRoomMasterListComponent implements OnInit {
  @ViewChild(DatatableComponent, { static: false }) public table: DatatableComponent;
  @ViewChild('addSectionPopover', { static: false }) public ngbAddSectionPopover: NgbPopover;
  pageSize;
  page: {
    size: number, // The number of elements in the page
    totalElements: number, // The total number of elements
    totalPages: number, // The total number of pages
    pageNumber: number, // The current page number
  };
  searchString: string;
  ngbAddSectionPopoverIsOpen = false;
  externalPaging: boolean;
  currentConstants;
  hideMiniNav = false;
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
  roomList = [];
  $destroy: Subject<boolean> = new Subject();
  showAddPopup = false;
  userId: any;
  timeFormateKey: string;
  timeFormate: string;
  showActive: boolean;
  url: string;
  currentUrl: string;
  subscription: Subscription;
  startDate: Date;
  constructor(
    private modalService: NgbModal,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private otMasterService: OtMasterService,
    private authService: AuthService,
    public router: Router,
  ) { }

  ngOnInit() {
    this.currentUrl = this.router.url;
    this.url = this.currentUrl.split('/')[this.currentUrl.split('/').length - 1];
    this.setCurrentNavAndPopup();
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.urlAfterRedirects;
        this.url = this.currentUrl.split('/')[this.currentUrl.split('/').length - 1];
        this.commonService.isAddButtonDisable = false;
        this.setCurrentNavAndPopup();
      }
    });
    this.commonService.$bookEventFromQlistForFdUser.pipe().subscribe(res => {
    });
    this.commonService.$recieveFilterEvent.pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if (res.dateFlag) {
        this.startDate = new Date();
      } else {
        this.startDate = res.data.startDate;
      }
    });
    this.updateRoute();


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

  setCurrentNavAndPopup() {
    this.subscription = this.commonService.$activatedRouteChange.subscribe((obj: ActivatedRoute) => {
      this.currentConstants = (obj.snapshot.data && obj.snapshot.data.breadCrumInfo) ? obj.snapshot.data.breadCrumInfo : '';
      this.updateRoute();
    });
  }

  updateRoute() {
    if (this.router.url.includes('otApp/ot/schedule/')) {
      this.hideMiniNav = true;
    } else if (this.router.url.includes('otApp/ot/schedule/ot-scheduler')) {
      this.hideMiniNav = true;
    } else {
      this.hideMiniNav = false;
    }
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

  addUpdateRoom(data?) {
    const addUpdateData = {
      data: data ? data : null,
      title: data ? 'UPDATE' : 'ADD'
    };
    const modalInstance = this.modalService.open(OtRoomMasterComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        windowClass: '',
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
    this.sortList = { sort_order: 'desc', sort_column: 'roomId' };
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
    this.otMasterService.getOTRoomList(param).subscribe(res => {
      if (res.total_records > 0) {
        _.map(res.data, dt => {
          dt.sTime = moment(moment().format('YYYY-MM-DD') + ' ' + dt.startTime).format(this.timeFormate);
          dt.eTime = moment(moment().format('YYYY-MM-DD') + ' ' + dt.endTime).format(this.timeFormate);
        });
        this.roomList = res.data;
        this.page.totalElements = res.total_records;
      } else {
        this.roomList = [];
        this.page.totalElements = 0;
      }
    });
  }

  onPageSizeChanged(newPageSize) {
    this.sortList = { sort_order: 'desc', sort_column: 'roomId' };
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
    const modalTitleobj = 'In Active';
    const modalBodyobj = 'Do you want to' + (rowData && rowData.isActive ? ' In ' : ' ') + 'Active this Room?';
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
    this.otMasterService.deleteOTRoomById(rowData.roomId).subscribe(res => {
      if (res && res.data) {
        this.notifyAlertMessage({
          msg: (rowData && rowData.isActive ? ' In ' : ' ') + ' Active Successfully!',
          class: 'success',
        });
        this.getListData();
      } else {
        this.notifyAlertMessage({
          msg: res.message,
          class: 'danger',
        });
      }
    });
  }
  
  editData(row) {
    this.addUpdateRoom(row);
  }

  clearSearch() {
    if (this.searchString) {
      this.searchString = '';
      this.getListData();
    }
  }

  showActivePopup() {
    this.commonService.$addPopupEvent.pipe(takeUntil(this.$destroy)).subscribe(popup => {
      if (popup && this.router.url.includes('/master/roomMasterList')) {
        this.showAddPopup = popup.isShowAddPopup;
        this.addUpdateRoom();
      } else {
        this.showAddPopup = false;
      }
    });
  }

  showHideAddSectionPopOver() {
    // // -- vikram
    // setTimeout(() => {
    //   const url = this.currentUrl.split('/')[3];
    //   this.loadComponent(url);
    // });
    if (this.url.includes('entitySettings?entity_id')) {
      this.url = 'entitySettings';
    }
    if (this.url === 'qList'
      || this.url === 'calendar'
      || this.url === 'entitySettings'
      || this.router.url.includes('/master/roomMasterList')) {
      if (this.ngbAddSectionPopover.isOpen()) {
        this.ngbAddSectionPopoverIsOpen = false;
        this.ngbAddSectionPopover.close();
      } else {
        this.ngbAddSectionPopoverIsOpen = true;
        this.ngbAddSectionPopover.open();
      }
      this.commonService.ConstantNav.isShowAddPopup = !this.commonService.ConstantNav.isShowAddPopup;
      this.commonService.setPopupFlag(this.commonService.ConstantNav.isShowAddPopup, false);
      return;
    } else {
      this.router.navigate(['/otApp/ot/patientData/addPatient']);
      // this.redirectTo(); // changes temporary saroj
    }
  }

}
