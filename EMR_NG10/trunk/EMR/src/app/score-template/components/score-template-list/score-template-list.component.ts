import { PreviewScoreTemplateComponent } from './../../../emr-shared/components/score-template/preview-score-template/preview-score-template.component';
import { Constants } from './../../../config/constants';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationPopupComponent } from './../../../shared/confirmation-popup/confirmation-popup.component';
import { MappingService } from './../../../public/services/mapping.service';
import { Router, ActivatedRoute } from '@angular/router';
import { debounceTime, takeUntil, map } from 'rxjs/operators';
import { IAlert } from './../../../public/models/AlertMessage';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { ScoreTemplateService } from './../../../public/services/score-template.service';
import { Subject, Observable } from 'rxjs';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonService } from 'src/app/public/services/common.service';

@Component({
  selector: 'app-score-template-list',
  templateUrl: './score-template-list.component.html',
  styleUrls: ['./score-template-list.component.scss']
})
export class ScoreTemplateListComponent implements OnInit, OnDestroy {
  @ViewChild(DatatableComponent, { static: false }) public table: DatatableComponent;
  searchString: string;
  subject: Subject<string> = new Subject();
  subjectUnsubscribe: Subject<boolean> = new Subject<boolean>();
  sortingObject: { sort_order: string, sort_column: string };
  scoreTemplateList = [];
  pageSize;
  page: {
    size: number, // The number of elements in the page
    totalElements: number, // The total number of elements
    totalPages: number, // The total number of pages
    pageNumber: number, // The current page number
  };
  externalPaging: boolean;
  isFilterApply: boolean;
  showFilter: boolean;
  showActive: boolean;
  setAlertMessage: IAlert;
  isShowSearchFilter = false;
  searchData = {
    serviceType: 0,
    speciality: 0
  };
  serviceType$ = new Observable<any>();
  speciality$ = new Observable<any>();
  //scoreTemplatePreviewData = { selectedTemplate: null, isPreview: false };
  selectedTemplate: any = null;
  isPreview: boolean = false;
  $destroy: Subject<boolean> = new Subject();
  showAddPopup = false;
  modelInstance: any;

  constructor(
    private scoreTemplateService: ScoreTemplateService,
    private router: Router,
    private mappingService: MappingService,
    private confirmationModalService: NgbModal,
    private commonService: CommonService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.setDefaultObject();
    this.subjectDebounceFun();
    this.serviceType$ = this.mappingService.getServiceTypeList();
    const specialityParams = {
      search_string: '',
      page_number: 1,
      limit: 100
    };
    this.speciality$ = this.mappingService.getSpecialityList(specialityParams);
    this.getListData();
    this.showActivePopup();
    this.commonService.routeChanged(this.route);
  }

  ngOnDestroy(): void {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  setDefaultObject() {
    this.isFilterApply = false;
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortingObject = { sort_order: 'desc', sort_column: 'service_type' };
    this.searchString = '';
    this.externalPaging = true;
    this.showFilter = false;
    this.showActive = true;
  }

  subjectDebounceFun() {
    // -- Subscribe to the subject, which is triggered from search input and when section clicked
    // -- When the debounce time has passed, we call getActiveScheduleData()
    this.subject
      .pipe(debounceTime(500), takeUntil(this.subjectUnsubscribe))
      .subscribe(() => {
        this.page.pageNumber = 1;
        this.getListData();
      }
      );
  }

  addScoreTemplate(data?) {
    this.router.navigate(['emrSettingsApp/settings/scoreTemplate/template/add']);
  }

  onPageSizeChanged(newPageSize) {
    this.sortingObject = { sort_order: 'desc', sort_column: '' };
    this.page.size = Number(newPageSize);
    this.page.pageNumber = 1;
    this.getListData();
  }
  getListData() {
    const params = {
      speciality_id: this.searchData.speciality,
      service_type_id: this.searchData.serviceType,
      search_keyword: this.searchString,
      is_active: true,
      sort_order: this.sortingObject.sort_order,
      sort_column: this.sortingObject.sort_column,
      page_number: this.page.pageNumber,
      limit: this.page.size
    };
    this.scoreTemplateService.getScoreTemplateList(params).subscribe(res => {
      if (res.total_records > 0) {
        this.scoreTemplateList = res.data;
        this.page.totalElements = res.total_records;
      } else {
        this.scoreTemplateList = [];
        this.page.totalElements = 0;
      }
    });
  }

  onSortChanged(event) {
    if (event.sorts.length > 0) {
      const obj = event.sorts[0];
      this.sortingObject.sort_order = obj.dir;
      this.sortingObject.sort_column = obj.prop;
      this.getListData();
    }
  }

  onSetPage(pageInfo) {
    this.table.offset = pageInfo.offset - 1;
    if (this.externalPaging) {
      return;
    }
  }

  editScoreTemplate(val) {
    // const obj = this.examinationLabelsService.generateExaminationData(val);
    // this.addExamination(obj);
    this.router.navigate([`emrSettingsApp/settings/scoreTemplate/template/add/${val.score_template_id}`]);
  }

  deleteScoreTemplate(val, index) {
    const modalTitleobj = 'Confirmation Required';
    const modalBodyobj = 'Are you sure you want to delete this template ?'
    const messageDetails = {
      modalTitle: modalTitleobj,
      buttonType: 'yes_no',
      modalBody: modalBodyobj
    };
    const modalInstance = this.confirmationModalService.open(ConfirmationPopupComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false
      });
    modalInstance.result.then((result) => {
      if (result === 'yes') {
          this.scoreTemplateList.splice(index, 1);
          this.scoreTemplateService.deleteScoreTemplateById(val.score_template_id).subscribe((res: any) => {
            if (res.status_message === 'Success') {
              const setAlertMessage = {
                message: res.message,
                messageType: 'success',
                duration: Constants.ALERT_DURATION
              };
            }
          });
      } else {
        return;
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  onFooterPageChange(event): void {
    this.page.pageNumber = event.page;
    this.getListData();
  }
  clearSearch(): void {
    this.searchData = {
      serviceType: 0,
      speciality: 0
    };
    this.getListData();
  }

  previewScoreTemplate(rowData) {
    this.isPreview = true;
    this.getPreviewScoreTemplate(rowData.score_template_id).subscribe(res => {

    });
  }

  getPreviewScoreTemplate(scoreTemplateId): Observable<any> {
    return this.scoreTemplateService.getScoreTemplateById(scoreTemplateId).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        this.selectedTemplate = res.data;
        this.modelInstance = this.confirmationModalService.open(PreviewScoreTemplateComponent, {
          ariaLabelledBy: 'modal-basic-title',
          backdrop: 'static',
          keyboard: false,
          windowClass: 'custom-modal',
          size: 'xl',
          container: '#homeComponent',
        });
        this.modelInstance.componentInstance.parentComponetInstance = this;
      }
      return res;
    }));
  }

  showActivePopup() {
    this.commonService.$addPopupEvent.pipe(takeUntil(this.$destroy)).subscribe(popup => {
      if (popup && popup.redirectFromPage === '/emrSettingsApp/settings/scoreTemplate/list') {
        this.showAddPopup = popup.isShowAddPopup;
        this.addScoreTemplate();
      } else {
        this.showAddPopup = false;
      }
      if (popup) {
        this.isShowSearchFilter = !popup.isShowFilterPopup;
      } else {
        this.isShowSearchFilter = false;
      }
    });
  }
}
