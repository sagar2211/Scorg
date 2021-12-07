import { CommonService } from './../../../public/services/common.service';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import * as _ from 'lodash';
import { IAlert } from '@qms/qlist-lib/lib/models/common.model';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MasterMappingService } from '../../master-mapping.service';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { AddUpdateMappingPopupComponent } from '../add-update-mapping-popup/add-update-mapping-popup.component';
import { Constants } from 'src/app/config/constants';
import { ConfirmationPopupComponent } from './../../../shared/confirmation-popup/confirmation-popup.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-to-doctor',
  templateUrl: './rmo-to-doctor.component.html',
  styleUrls: ['./rmo-to-doctor.component.scss']
})
export class RmoToDoctorComponent implements OnInit, OnDestroy {
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
  sortUserList: { sort_order: string, sort_column: string };
  alertMsg: IAlert;
  subject: Subject<string> = new Subject();
  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  compInstance = this;
  isNgSelectTypeHeadDisabled = false;
  showFilter: boolean;
  isFilterApply: boolean;
  datatableBodyElement: any;
  editPermission: boolean;
  mappedDataList = [];
  $destroy: Subject<boolean> = new Subject();
  showAddPopup = false;

  constructor(
    private modalService: NgbModal,
    private masterMappingService: MasterMappingService,
    private commonService: CommonService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.defaultObject();
    this.pageSize = '15';
    this.subjectFun();
    this.getRmoDeptMappingList();
    this.showActivePopup();
    this.commonService.routeChanged(this.route);
  }

  ngOnDestroy(): void {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  subjectFun() {
    // -- Subscribe to the subject, which is triggered from search input and when section clicked
    // -- When the debounce time has passed, we call getActiveScheduleData()
    this.subject
      .pipe(debounceTime(500), takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.page.pageNumber = 1;
        this.getRmoDeptMappingList();
      }
      );
  }
  openPopup(data?) {
    const modalInstance = this.modalService.open(AddUpdateMappingPopupComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      windowClass: 'custom-modal',
      container: '#homeComponent'
    });
    modalInstance.componentInstance.addEditObj = {
      type: data ? 'edit' : 'add',
      data: data ? data : null,
    };
    modalInstance.componentInstance.mappingFromObj = { mappingFromKey: 'doctor', label: 'Doctor', placeholder: 'Select Doctor' };
    modalInstance.componentInstance.mappingToObj = { mappingToKey: 'rmo', label: 'RMO', placeholder: 'Select Rmo', isMultipleSeletion: true };
    modalInstance.componentInstance.isDateRequire = false;
    modalInstance.componentInstance.saveObject.subscribe((e: any) => {
      this.saveMappingData(e);
    });
    modalInstance.result.then((result) => {
      if (result === 'Ok') {
      }
    });
  }

  defaultObject() {
    this.isFilterApply = false;
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortUserList = { sort_order: 'desc', sort_column: 'DoctorName' };
    this.searchString = '';
    this.externalPaging = true;
    this.showFilter = false;
  }

  getRmoDeptMappingList() {
    const params = {
      search_keyword: this.searchString,
      limit: this.page.size,
      page_number: this.page.pageNumber,
      sort_order: this.sortUserList.sort_order,
      sort_column: 'DoctorName',
      is_active: true
    };
    this.page.totalElements = 1;
    this.masterMappingService.getRmoDoctorMappingList(params).subscribe(res => {
      if (res.data.length) {
        this.mappedDataList = res.data;
      } else {
        this.mappedDataList = [];
      }
      this.page.totalElements = res.total_records;
    });
  }

  onPageSizeChanged(newPageSize) {
    this.sortUserList = { sort_order: 'desc', sort_column: 'DoctorName' };
    this.page.size = Number(newPageSize);
    this.page.pageNumber = 1;
    this.getRmoDeptMappingList();
  }

  onFooterPage(event): void {
    this.page.pageNumber = event.page;
    this.getRmoDeptMappingList();
  }

  onSortChanged(event) {
    if (event.sorts.length > 0) {
      const obj = event.sorts[0];
      this.sortUserList.sort_order = obj.dir;
      this.sortUserList.sort_column = 'DoctorName';
      this.getRmoDeptMappingList();
    }
  }

  onSetPage(pageInfo) {
    this.table.offset = pageInfo.offset - 1;
    if (this.externalPaging) {
      return;
    }
  }

  getSelected(val) {
    console.log(val);
  }
  saveMappingData(data) {
    const userIds = [];
    _.map(data.mapTo, (v) => {
      userIds.push(v.id);
    });
    const params = {
      doctor_id: data.mapFrom.id,
      user_ids: userIds
    };
    this.page.totalElements = 1;
    this.masterMappingService.saveUserDoctorMapping(params).subscribe(res => {
      if (res.status_code === 200) {
        this.notifyAlertMessage({
          msg: 'Successfully saved',
          class: 'success',
        });
        this.getRmoDeptMappingList();
      } else {
        this.notifyAlertMessage({
          msg: res.message,
          class: 'danger',
        });
      }
      this.page.totalElements = res.total_records;
    });
  }

  editMappedData(val) {
    const users = [];
    _.map(val.mapped_users, (v) => {
      const user = {
        id: v.user_id,
        name: v.user_name
      };
      users.push(user);
    });
    const obj = {
      mapFrom: { id: val.doctor_id, name: val.doctor_name },
      mapTo: users,
    };
    this.openPopup(obj);
  }
  deleteMappedData(val) {
    const modalTitleobj = 'Delete';
    const modalBodyobj = 'Do you want to delete this Map?';
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
        this.deleteMappingById(val);
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  deleteMappingById(rowData) {
    this.masterMappingService.deleteRmoDoctorMappingById(rowData.doctor_id).subscribe(res => {
      if (res) {
        this.notifyAlertMessage({
          msg: 'Deleted Successfully!',
          class: 'success',
        });
        this.getRmoDeptMappingList();
      } else {
        this.notifyAlertMessage({
          msg: 'Someting Went Wrong!',
          class: 'danger',
        });
      }
    });
  }

  notifyAlertMessage(data): void {
    this.alertMsg = {
      message: data.msg,
      messageType: data.class,
      duration: Constants.ALERT_DURATION
    };
  }

  showActivePopup() {
    this.commonService.$addPopupEvent.pipe(takeUntil(this.$destroy)).subscribe(popup => {
      if (popup && popup.redirectFromPage === '/emr/mapping/userToWard') {
        this.showAddPopup = popup.isShowAddPopup;
        this.openPopup();
      } else {
        this.showAddPopup = false;
      }
      // if (popup) {
      //   this.showFilter = !popup.isShowFilterPopup;
      // } else {
      //   this.showFilter = false;
      // }
    });
  }
}

