import { Component, Input, OnChanges, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Constants } from 'src/app/config/constants';
import { FaqService } from '../../faq.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ConfirmationPopupComponent } from 'src/app/shared/confirmation-popup/confirmation-popup.component';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { CommonService } from 'src/app/public/services/common.service';

@Component({
  selector: 'app-template-form-list',
  templateUrl: './form-list.component.html',
  styleUrls: ['./form-list.component.scss']
})
export class FormListComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild(DatatableComponent, { static: false }) public table: DatatableComponent;
  @Input() templateData: any;
  pageSize;
  page: {
    size: number, // The number of elements in the page
    totalElements: number, // The total number of elements
    totalPages: number, // The total number of pages
    pageNumber: number, // The current page number
  };
  searchString: string;
  externalPaging: boolean;
  sortingObject: { sortOrder: string, sortColumn: string };
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
  $destroy: Subject<boolean> = new Subject();
  showAddPopup = false;

  constructor(
    private modalService: NgbModal,
    private faqService: FaqService,
    private router: Router,
    private commonService: CommonService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.defaultObject();
    this.subjectFun();
    this.showActivePopup();
    this.commonService.routeChanged(this.route);
  }

  ngOnDestroy(): void {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  ngOnChanges() {
    if (this.templateData) {
      this.getListData();
    }
  }
  addForm(data?) {
    const params = JSON.stringify(this.templateData);
    this.router.navigate([`emrSettingsApp/settings/faqTemplates/createform/-1`], { skipLocationChange: true, queryParams: { data: params } });
  }

  previewForm(data?) {
    // const modalInstance = this.modalService.open(componet, {
    //   ariaLabelledBy: 'modal-basic-title',
    //   backdrop: 'static',
    //   keyboard: false,
    //   windowClass: 'custom-modal',
    //   container: '#homeComponent'
    // });
    // modalInstance.componentInstance.examinationData = {
    //   type: data ? 'edit' : 'add',
    //   data: data ? data : null,
    // };
    // modalInstance.result.then((result) => {
    //   if (result === 'Ok') {
    //     this.notifyAlertMessage({
    //       msg: 'Exmination Updated!',
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
    this.isFilterApply = false;
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortingObject = { sortOrder: 'asc', sortColumn: 'FORM_NAME' };
    this.searchString = '';
    this.externalPaging = true;
    this.showFilter = false;
    this.showActive = true;
  }

  notifyAlertMessage(data): void {
    this.setAlertMessage = {
      message: data.msg,
      messageType: data.class,
      duration: Constants.ALERT_DURATION
    };
  }

  getListData() {
    // const params = {
    //   searchKeyword: this.searchString,
    //   isActive: true,
    //   sortOrder: this.sortingObject.sortOrder,
    //   sortColumn: this.sortingObject.sortColumn,
    //   currentPage: this.page.pageNumber,
    //   limit: this.page.size
    // }
    this.faqService.GetTemplateFormListByTemplateId(this.templateData.template_id).subscribe(res => {
      if (res && res.data && res.data.length > 0) {
        this.dataList = res.data;
        this.page.totalElements = res.data.length;
      } else {
        this.dataList = [];
        this.page.totalElements = 0;
      }
    });
  }

  onPageSizeChanged(newPageSize) {
    this.sortingObject = { sortOrder: 'asc', sortColumn: '' };
    this.page.size = Number(newPageSize);
    this.page.pageNumber = 1;
    this.getListData();
  }

  onFooterPage(event): void {
    this.page.pageNumber = event.page;
    this.getListData();
  }

  applyFilters() {
  }

  onSortChanged(event) {
    if (event.sorts.length > 0) {
      const obj = event.sorts[0];
      this.sortingObject.sortOrder = obj.dir;
      this.sortingObject.sortColumn = obj.prop;
      this.getListData();
    }
  }

  editData(val) {
    const formID = val.formID;
    const params = JSON.stringify(this.templateData);
    this.router.navigate([`emrSettingsApp/settings/faqTemplates/createform/${formID}`], { skipLocationChange: true, queryParams: { data: params } });
  }
  deleteData(val) {
    const modalTitleobj = 'Delete';
    const modalBodyobj = 'Do you want to delete this Form - <span class="font-weight-500">' + val.formName + '</span>';
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
        this.deleteFormById(val.formID);
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  onSetPage(pageInfo) {
    this.table.offset = pageInfo.offset - 1;
    if (this.externalPaging) {
      return;
    }
  }

  activeInactiveFilter() {
  }
  clearSearch() {
    if (this.searchString) {
      this.getListData();
    }
  }

  deleteFormById(formId) {
    this.faqService.deleteFaqFormById(formId).subscribe(res => {
      if (res) {
        this.notifyAlertMessage({
          msg: 'Form Deleted',
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

  getRowHeight(row) {
    if (!row) {
      return 35;
    }
    if (row.height === undefined) {
      return 35;
    }
    return row.height;
  }

  showActivePopup() {
    this.commonService.$addPopupEvent.pipe(takeUntil(this.$destroy)).subscribe(popup => {
      if (popup && popup.redirectFromPage === '/emr/faqTemplates/list') {
        this.showAddPopup = popup.isShowAddPopup;
        this.addForm();
      } else {
        this.showAddPopup = false;
      }
      // if (popup) {
      //   this.isShowSearchFilter = !popup.isShowFilterPopup;
      // } else {
      //   this.isShowSearchFilter = false;
      // }
    });
  }
}
