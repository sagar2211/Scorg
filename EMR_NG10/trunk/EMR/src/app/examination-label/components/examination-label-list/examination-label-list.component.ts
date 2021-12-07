import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { IAlert } from './../../../public/models/AlertMessage';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from './../../../public/services/common.service';
import { ExaminationLabelsService } from './../../../public/services/examination-labels.service';
import { ExaminationLabelAddUpdateComponent } from '../examination-label-add-update/examination-label-add-update.component';
import { Constants } from 'src/app/config/constants';
import { ConfirmationPopupComponent } from './../../../shared/confirmation-popup/confirmation-popup.component';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-examination-label-list',
  templateUrl: './examination-label-list.component.html',
  styleUrls: ['./examination-label-list.component.scss']
})
export class ExaminationLabelListComponent implements OnInit, OnDestroy {
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
  sortExaminationList: { sort_order: string, sort_column: string };
  alertMsg: IAlert;
  subject: Subject<string> = new Subject();
  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  compInstance = this;
  isNgSelectTypeHeadDisabled = false;
  showFilter: boolean;
  isFilterApply: boolean;
  datatableBodyElement: any;
  editPermission: boolean;
  dataList = [];
  selectedSpeciality: any;
  selectedServicesType: any;
  selectedExaminationType: any;
  setAlertMessage: IAlert;
  showActive: boolean;
  $destroy: Subject<boolean> = new Subject();
  showAddPopup = false;

  constructor(
    private modalService: NgbModal,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private examinationLabelsService: ExaminationLabelsService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.defaultObject();
    this.pageSize = '15';
    this.clearFilters('init');
    this.subjectFun();
    this.getListData();
    this.showActivePopup();
    this.commonService.routeChanged(this.route);
  }

  ngOnDestroy(): void {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }


  addExamination(data?) {
    const modalInstance = this.modalService.open(ExaminationLabelAddUpdateComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      windowClass: 'custom-modal',
      container: '#homeComponent'
    });
    modalInstance.componentInstance.examinationData = {
      type: data ? 'edit' : 'add',
      data: data ? data : null,
    };
    modalInstance.result.then((result) => {
      if (result === 'Ok') {
        this.notifyAlertMessage({
          msg: 'Exmination Updated!',
          class: 'success',
        });
        this.getListData();
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
      }
      );
  }

  defaultObject() {
    this.isFilterApply = false;
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortExaminationList = { sort_order: 'desc', sort_column: 'room_id' };
    this.searchString = '';
    this.externalPaging = true;
    this.showFilter = true;
    this.showActive = true;
  }

  notifyAlertMessage(data): void {
    this.setAlertMessage = {
      message: data.msg,
      messageType: data.class,
      duration: Constants.ALERT_DURATION
    };
  }

  clearFilters(callFrom?: string) {
    this.selectedServicesType = null;
    this.selectedExaminationType = null;
    this.selectedSpeciality = null;
    if (callFrom && callFrom !== 'init') {
      this.getListData();
    }
  }

  getListData() {
    const param = {
      limit: this.page.size,
      current_page: this.page.pageNumber,
      sort_order: this.sortExaminationList.sort_order,
      sort_column: this.sortExaminationList.sort_column,
      search_keyword: this.searchString,
      is_active: this.showActive,
      service_type_id: null,
      dept_id: null,
      exam_type_id: null
    };
    if (this.selectedServicesType) {
      param.service_type_id = this.selectedServicesType.id;
    }
    if (this.selectedExaminationType) {
      param.exam_type_id = this.selectedExaminationType.id;
    }
    if (this.selectedSpeciality) {
      param.dept_id = this.selectedSpeciality.id;
    }
    this.examinationLabelsService.getExaminationLabelList(param).subscribe(res => {
      if (res.totalRecord > 0) {
        this.dataList = res.data;
        this.page.totalElements = res.totalRecord;
      } else {
        this.dataList = [];
        this.page.totalElements = 0;
      }
    });
  }

  onPageSizeChanged(newPageSize) {
    this.sortExaminationList = { sort_order: 'desc', sort_column: 'exam_head_id' };
    this.page.size = Number(newPageSize);
    this.page.pageNumber = 1;
    this.getListData();
  }

  onFooterPage(event): void {
    this.page.pageNumber = event.page;
    this.getListData();
  }

  applyFilters() {
    if (this.selectedServicesType || this.selectedSpeciality || this.selectedExaminationType) {
      this.getListData();
      this.showFilter = false;
    }
  }

  onSortChanged(event) {
    if (event.sorts.length > 0) {
      const obj = event.sorts[0];
      this.sortExaminationList.sort_order = obj.dir;
      this.sortExaminationList.sort_column = obj.prop;
      this.getListData();
    }
  }

  editData(val) {
    const obj = this.examinationLabelsService.generateExaminationData(val);
    this.addExamination(obj);
  }

  onSetPage(pageInfo) {
    this.table.offset = pageInfo.offset - 1;
    if (this.externalPaging) {
      return;
    }
  }

  activeInactiveFilter() {
    this.showFilter = !this.showFilter;
    this.commonService.setPopupFlag(false, this.showFilter);

  }

  getSelectedSpeciality(val) {
    this.selectedSpeciality = val;
  }

  getSelectedServiceType(val) {
    this.selectedServicesType = val;
  }

  getSelectedExaminationType(val) {
    this.selectedExaminationType = val;
  }

  deleteData(rowData) {
    const modalTitleobj = 'Delete';
    const modalBodyobj = 'Do you want to delete this Examination <span class="font-weight-500">"' + rowData.display_name + '" </span>';
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
        this.deleteExaminationById(rowData);
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  deleteExaminationById(rowData) {
    this.examinationLabelsService.deleteExaminationLabelById(rowData.exam_head_id).subscribe(res => {
      if (res) {
        this.notifyAlertMessage({
          msg: 'Exmination Deleted!',
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

  clearSearch() {
    if (this.searchString) {
      this.searchString = '';
      this.getListData();
    }
  }

  showActivePopup() {
    this.commonService.$addPopupEvent.pipe(takeUntil(this.$destroy)).subscribe(popup => {
      if (popup && popup.redirectFromPage === '/emr/examinationLabel/list') {
        this.showAddPopup = popup.isShowAddPopup;
        this.addExamination();
      } else {
        this.showAddPopup = false;
      }
      if (popup) {
        this.showFilter = !popup.isShowFilterPopup;
      } else {
        this.showFilter = true;
      }
    });
  }

}
