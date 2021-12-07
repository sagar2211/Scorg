import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { IAlert } from '@qms/qlist-lib/lib/models/common.model';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Constants } from 'src/app/config/constants';
import { ConfirmationPopupComponent } from './../../../../shared/confirmation-popup/confirmation-popup.component';
import { VitalsDataService } from './../../../../public/services/vitals-data.service';
import * as _ from 'lodash';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/public/services/common.service';

@Component({
  selector: 'app-vitals-list',
  templateUrl: './vitals-list.component.html',
  styleUrls: ['./vitals-list.component.scss']
})
export class VitalsListComponent implements OnInit, OnDestroy {
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
  datatableBodyElement: any;
  editPermission: boolean;
  dataList = [];
  setAlertMessage: IAlert;
  $destroy: Subject<boolean> = new Subject();
  showAddPopup = false;

  constructor(
    private modalService: NgbModal,
    private vitalsDataService: VitalsDataService,
    private router: Router,
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

  addVital(data?) {
    this.router.navigate(['/emr/vitals/addMaster']);
    // const modalInstance = this.modalService.open(VitalsMasterComponent, {
    //   ariaLabelledBy: 'modal-basic-title',
    //   backdrop: 'static',
    //   keyboard: false,
    //   windowClass: 'custom-modal',
    //   container: '#homeComponent'
    // });
    // modalInstance.componentInstance.vitalInputData = {
    //   type: data ? 'edit' : 'add',
    //   data: data ? data : null,
    // };
    // modalInstance.result.then((result) => {
    //   if (result === 'Ok') {
    //     this.notifyAlertMessage({
    //       msg: 'Vital Updated!',
    //       class: 'success',
    //     });
    //     this.getListData();
    //   }
    // });
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
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortExaminationList = { sort_order: 'desc', sort_column: 'vital_id' };
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
      page_number: this.page.pageNumber,
      sort_order: this.sortExaminationList.sort_order,
      sort_column: this.sortExaminationList.sort_column,
      search_keyword: this.searchString,
      is_active: true,
    };
    this.vitalsDataService.getVitalMasterList(param).subscribe(res => {
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
    this.sortExaminationList = { sort_order: 'desc', sort_column: 'vital_id' };
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
      this.sortExaminationList.sort_order = obj.dir;
      this.sortExaminationList.sort_column = obj.prop;
      this.getListData();
    }
  }

  editData(val) {
    this.router.navigate(['/emrSettingsApp/settings/vitals/updateMaster', val.vital_id]);
  }

  onSetPage(pageInfo) {
    this.table.offset = pageInfo.offset - 1;
    if (this.externalPaging) {
      return;
    }
  }


  deleteData(rowData) {
    const modalTitleobj = 'Delete';
    const modalBodyobj = 'Do you want to delete this Vital <span class="font-weight-500">"' + rowData.vital_name + '" </span>';
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
        this.deleteVitalById(rowData);
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  deleteVitalById(rowData) {
    this.vitalsDataService.deleteVitalById(rowData.vital_id).subscribe(res => {
      if (res) {
        this.notifyAlertMessage({
          msg: 'Vital Deleted!',
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
      if (popup && popup.redirectFromPage === '/emr/vitals/masterList') {
        this.showAddPopup = popup.isShowAddPopup;
        this.addVital();
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
