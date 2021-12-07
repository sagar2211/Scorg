import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { IAlert } from '@qms/qlist-lib/lib/models/common.model';
import { Subject } from 'rxjs';
import { MasterMappingService } from '../../master-mapping.service';
import { AddUpdateMappingPopupComponent } from '../add-update-mapping-popup/add-update-mapping-popup.component';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { ConfirmationPopupComponent } from './../../../shared/confirmation-popup/confirmation-popup.component';
import { Constants } from 'src/app/config/constants';
import { CommonService } from 'src/app/public/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-department-to-ward',
  templateUrl: './department-to-ward.component.html',
  styleUrls: ['./department-to-ward.component.scss']
})
export class DepartmentToWardComponent implements OnInit, OnDestroy {
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
  wardDeptMappingList = [];
  $destroy: Subject<boolean> = new Subject();
  showAddPopup = false;

  constructor(
    private modalService: NgbModal,
    private masterMappingService: MasterMappingService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
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


  mappingWardDept(data?) {
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
    modalInstance.componentInstance.mappingFromObj = { mappingFromKey: 'ward', label: 'Ward', placeholder: 'Select Ward' };
    modalInstance.componentInstance.mappingToObj = { mappingToKey: 'dept', label: 'Department', placeholder: 'Select Department' };
    modalInstance.componentInstance.saveObject.subscribe((e: any) => {
      this.mappingWardToDept(e);
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
  mappingWardToDept(saveData) {
    const parms = {
      dept_id: saveData.mapTo.id,
      ward_id: saveData.mapFrom.id,
      from_date: saveData.mapFromDate,
      to_date: saveData.mapToDate,
      id: saveData.mapId ? saveData.mapId : 0
    }
    this.masterMappingService.mappingWardDept(parms).subscribe(res => {
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
    this.masterMappingService.getwardDeptMappingList(param).subscribe(res => {
      if (res.total_records > 0) {
        this.wardDeptMappingList = res.data;
        this.page.totalElements = res.total_records;
      } else {
        this.wardDeptMappingList = [];
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
    this.masterMappingService.deleteWardDeptMappingById(rowData.id).subscribe(res => {
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
      mapFrom: { id: row.ward_id, name: row.ward_name },
      mapTo: { id: row.dept_id, name: row.dept_name },
      mapFromDate: row.from_date,
      mapToDate: row.to_date,
    }
    this.mappingWardDept(obj);
  }

  clearSearch() {
    if (this.searchString) {
      this.searchString = '';
      this.getListData();
    }
  }

  showActivePopup() {
    this.commonService.$addPopupEvent.pipe(takeUntil(this.$destroy)).subscribe(popup => {
      if (popup && popup.redirectFromPage === '/emr/mapping/departmentToWard') {
        this.showAddPopup = popup.isShowAddPopup;
        this.mappingWardDept();
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
