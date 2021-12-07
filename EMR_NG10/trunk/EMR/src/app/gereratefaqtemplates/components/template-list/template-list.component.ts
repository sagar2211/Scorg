import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { IAlert } from '@qms/qlist-lib/lib/models/common.model';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Constants } from 'src/app/config/constants';
import { FaqService } from '../../faq.service';
import { AddFaqTemplateComponent } from '../add-faq-template/add-faq-template.component';
import { FaqCategoriesComponent } from '../../../emr-shared/components/faq-sections/faq-categories/faq-categories.component';
import { Router, ActivatedRoute } from '@angular/router';
import { ConfirmationPopupComponent } from 'src/app/shared/confirmation-popup/confirmation-popup.component';
import { Speciality } from 'src/app/public/models/speciality.model';
import { ServiceType } from 'src/app/public/models/service-type.model';
import { CommonService } from 'src/app/public/services/common.service';

@Component({
  selector: 'app-template-list',
  templateUrl: './template-list.component.html',
  styleUrls: ['./template-list.component.scss']
})
export class TemplateListComponent implements OnInit, OnDestroy {
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
    this.getListData();
    this.showActivePopup();
    this.commonService.routeChanged(this.route);
  }

  ngOnDestroy(): void {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  addTemplate(data?) {
    const modalInstance = this.modalService.open(AddFaqTemplateComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      windowClass: 'custom-modal',
      container: '#homeComponent'
    });
    modalInstance.componentInstance.templateData = {
      type: data ? 'edit' : 'add',
      data: data ? data : null,
    };
    modalInstance.result.then((result) => {
      if (result === true) {
        this.notifyAlertMessage({
          msg: 'Template Saved',
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
    this.sortingObject = { sort_order: 'desc', sort_column: 'TEMPLATE_NAME' };
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
    const params = {
      speciality_id: 0,
      service_type_id: 0,
      search_keyword: this.searchString,
      is_generic: null,
      is_active: true,
      sort_order: this.sortingObject.sort_order,
      sort_column: this.sortingObject.sort_column,
      current_page: this.page.pageNumber,
      limit: this.page.size
    }
    this.faqService.getFaqTemplateList(params).subscribe(res => {
      if (res.count > 0) {
        this.dataList = res.data;
        this.page.totalElements = res.count;
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

  applyFilters() {
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
    const obj = this.generateEditData(val);
    this.addTemplate(obj);
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

  deleteData(rowData) {
    const modalTitleobj = 'Delete';
    const modalBodyobj = 'Do you want to delete this Template <span class="font-weight-500">' + rowData.template_name + '</span>';
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
        this.deleteTemplateById(rowData.template_id);
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  deleteTemplateById(templateId) {
    this.faqService.deleteFaqTemplateById(templateId).subscribe(res => {
      if (res) {
        this.notifyAlertMessage({
          msg: 'Template Deleted',
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

  generateEditData(val) {
    const obj = {
      templateId: val.template_id,
      serviceType: null,
      speciality: null,
      templateName: val.template_name,
      templateKey: val.template_key,
      isActive: val.is_Active
    };
    if (val.speciality_id) {
      const spec = new Speciality();
      const deptObj = {
        id: val.speciality_id,
        name: val.speciality_name
      };
      spec.generateObject(deptObj);
      obj.speciality = spec;
    }
    const serviceType = new ServiceType();
    const sTypeObj = {
      service_type_id: val.service_type_id,
      display_name: val.service_type,
      service_type: null
    };
    serviceType.generateObject(sTypeObj);
    obj.serviceType = serviceType;
    return obj;
  }

  onDetailToggle(event) {
    // console.log('Detail Toggled', event);
  }

  toggleExpandRow(row) {
    // console.log('Toggled Expand Row!', row);
    this.table.rowDetail.toggleExpandRow(row);
  }

  previewTemplate(row) {
    const templateId = row.template_id;
    const params = {
      template_ids: [templateId]
    };
    this.faqService.getFaqSectionTemplateList(params).subscribe(res => {
      if (res.length) {
        const templateObject = res[0];
        if (!templateObject.form_data.length) {
          this.notifyAlertMessage({
            msg: 'Template is Empty. Please Add Form(s)',
            class: 'danger',
          });
          return;
        }
        const modelInstance = this.modalService.open(FaqCategoriesComponent, {
          backdrop: 'static',
          keyboard: false,
          size: 'xl',
          windowClass: 'faq-modal'
        });
        modelInstance.componentInstance.faqSectionDisplaySetting = 'unClubbed';
        modelInstance.componentInstance.patientFaqSectionList = [];
        modelInstance.componentInstance.sectionData = templateObject;
        modelInstance.componentInstance.isPreview = true;
        modelInstance.result.then(res => { }, reason => { });
      }
    });
  }

  addForm(template) {
    const params = JSON.stringify(template);
    this.router.navigate([`emr/faqTemplates/createform/-1`], { skipLocationChange: true, queryParams: { data: params } });
  }

  showActivePopup() {
    this.commonService.$addPopupEvent.pipe(takeUntil(this.$destroy)).subscribe(popup => {
      if (popup && popup.redirectFromPage === '/emr/faqTemplates/list') {
        this.showAddPopup = popup.isShowAddPopup;
        this.addTemplate();
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

