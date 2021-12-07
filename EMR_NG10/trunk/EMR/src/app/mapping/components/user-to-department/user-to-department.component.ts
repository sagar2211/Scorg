import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { IAlert } from '@qms/qlist-lib/lib/models/common.model';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { MasterMappingService } from '../../master-mapping.service';
import { Constants } from 'src/app/config/constants';
import { ConfirmationPopupComponent } from './../../../shared/confirmation-popup/confirmation-popup.component';
import { AddUpdateMappingPopupComponent } from '../add-update-mapping-popup/add-update-mapping-popup.component';
import { CommonService } from 'src/app/public/services/common.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-to-department',
  templateUrl: './user-to-department.component.html',
  styleUrls: ['./user-to-department.component.scss']
})
export class UserToDepartmentComponent implements OnInit, OnDestroy {
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
  alertMsg: IAlert;
  subject: Subject<string> = new Subject();
  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  compInstance = this;
  datatableBodyElement: any;
  romdeptMappingList = [];
  setAlertMessage: IAlert;
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
    this.getListData();
    this.showActivePopup();
    this.commonService.routeChanged(this.route);
  }

  ngOnDestroy(): void {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }


  mappingRmoDept(data?) {
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
    modalInstance.componentInstance.mappingFromObj = { mappingFromKey: 'rmo', label: 'RMO', placeholder: 'Select Rmo' };
    modalInstance.componentInstance.mappingToObj = { mappingToKey: 'dept', label: 'Department', placeholder: 'Select Department' };
    modalInstance.componentInstance.saveObject.subscribe((e: any) => {
      this.mappingRmoToDept(e);
    });
    modalInstance.result.then((result) => {
      if (result === 'Ok') {
      }
    });
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
    this.sortList = { sort_order: 'desc', sort_column: 'user_name' };
    this.searchString = '';
    this.externalPaging = true;
  }
  mappingRmoToDept(saveData) {
    const parms = {
      dept_id: saveData.mapTo.id,
      user_id: saveData.mapFrom.id,
      from_date: saveData.mapFromDate,
      to_date: saveData.mapToDate,
      id: saveData.mapId ? saveData.mapId : 0
    }
    this.masterMappingService.mappingRmoDept(parms).subscribe(res => {
      if (res.data) {
        this.notifyAlertMessage({
          msg: 'Successfully Mapped!',
          class: 'success',
        });
        this.getListData();
      } else {
        this.notifyAlertMessage({
          msg: 'Somthing went wrong!',
          class: 'danger',
        });
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

  getListData() {
    const param = {
      limit_per_page: this.page.size,
      current_page: this.page.pageNumber,
      sort_order: this.sortList.sort_order,
      sort_column: this.sortList.sort_column,
      search_keyword: this.searchString
    };
    this.masterMappingService.getRmoDeptMappingList(param).subscribe(res => {
      if (res.total_records > 0) {
        this.romdeptMappingList = res.data;
        this.page.totalElements = res.total_records;
      } else {
        this.romdeptMappingList = [];
        this.page.totalElements = 0;
      }
    });
  }

  onPageSizeChanged(newPageSize) {
    this.sortList = { sort_order: 'desc', sort_column: 'vital_id' };
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
        this.deleteById(rowData);
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  deleteById(rowData) {
    this.masterMappingService.deleteRmoDeptMappingById(rowData.id).subscribe(res => {
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
    const obj = {
      mapId: row.id,
      mapFrom: { id: row.user_id, name: row.user_name },
      mapTo: { id: row.dept_id, name: row.department_name },
      mapFromDate: row.from_date,
      mapToDate: row.to_date,
    };
    this.mappingRmoDept(obj);
  }

  clearSearch() {
    if (this.searchString) {
      this.searchString = '';
      this.getListData();
    }
  }

  showActivePopup() {
    this.commonService.$addPopupEvent.pipe(takeUntil(this.$destroy)).subscribe(popup => {
      if (popup && popup.redirectFromPage === '/emr/mapping/userToDepartment') {
        this.showAddPopup = popup.isShowAddPopup;
        this.mappingRmoDept();
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
