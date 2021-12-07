import { Component, OnInit, ViewChild } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MasterMappingService } from '../../master-mapping.service';
import { CommonService } from 'src/app/public/services/common.service';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Constants } from 'src/app/config/constants';
import { ConfirmationPopupComponent } from 'src/app/shared/confirmation-popup/confirmation-popup.component';
import { AddUpdateMappingPopupComponent } from '../add-update-mapping-popup/add-update-mapping-popup.component';

@Component({
  selector: 'app-user-to-nursing-station-list',
  templateUrl: './user-to-nursing-station-list.component.html',
  styleUrls: ['./user-to-nursing-station-list.component.scss']
})
export class UserToNursingStationListComponent implements OnInit {
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
  subject: Subject<string> = new Subject();
  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  compInstance = this;
  datatableBodyElement: any;
  userNursingStationMappingList = [];
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

  openNurseToNursingStationPopup(data?) {
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
    modalInstance.componentInstance.mappingFromObj = { mappingFromKey: 'nurse', label: 'Nurse', placeholder: 'Select Nurse' };
    modalInstance.componentInstance.mappingToObj = { mappingToKey: 'nursingStation', label: 'Nursing Station', placeholder: 'Select Nursing Station' };
    modalInstance.componentInstance.saveObject.subscribe((e: any) => {
      this.mappingNurseToNursingStation(e);
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
    this.sortList = { sort_order: 'desc', sort_column: 'nursingStation' };
    this.searchString = '';
    this.externalPaging = true;
  }

  mappingNurseToNursingStation(saveData) {
    const parms = {
      nursingStationId: saveData.mapTo.id,
      userId: saveData.mapFrom.id,
      fromDate: saveData.mapFromDate,
      toDate: saveData.mapToDate,
      id: saveData.mapId ? saveData.mapId : 0
    }
    this.masterMappingService.saveNurseToNursingStationMapping(parms).subscribe(res => {
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
      limit: this.page.size,
      currentPage: this.page.pageNumber,
      sortOrder: this.sortList.sort_order,
      sortColumn: this.sortList.sort_column,
      searchKeyword: this.searchString
    };
    this.masterMappingService.getUserNursingStationMappingList(param).subscribe(res => {
      if (res.total_records > 0) {
        this.userNursingStationMappingList = res.data;
        this.page.totalElements = res.total_records;
      } else {
        this.userNursingStationMappingList = [];
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
    this.masterMappingService.deleteNursingNursingStationMappingById(rowData.id).subscribe(res => {
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
      mapFrom: { id: row.userId, name: row.userName },
      mapTo: { id: row.nursingStationId, name: row.nursingStation },
      mapFromDate: row.fromDate,
      mapToDate: row.toDate,
    }
    this.openNurseToNursingStationPopup(obj);
  }

  clearSearch() {
    if (this.searchString) {
      this.searchString = '';
      this.getListData();
    }
  }

  showActivePopup() {
    this.commonService.$addPopupEvent.pipe(takeUntil(this.$destroy)).subscribe(popup => {
      if (popup && popup.redirectFromPage === '/emr/mapping/nurseToNursingStation') {
        this.showAddPopup = popup.isShowAddPopup;
        this.openNurseToNursingStationPopup();
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
