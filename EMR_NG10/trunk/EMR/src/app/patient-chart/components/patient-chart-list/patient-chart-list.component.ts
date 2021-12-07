import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { debounceTime, takeUntil, distinctUntilChanged, tap, switchMap, catchError, map } from 'rxjs/operators';
import { Subject, Observable, concat, of } from 'rxjs';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

import { Constants } from 'src/app/config/constants';
import { PatientChartService } from './../../patient-chart.service';
import { IAlert } from './../../../public/models/AlertMessage';
import { MappingService } from './../../../public/services/mapping.service';
import { EMRService } from './../../../public/services/emr-service';
import { CommonService } from 'src/app/public/services/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationPopupComponent } from 'src/app/shared/confirmation-popup/confirmation-popup.component';

@Component({
  selector: 'app-form-list',
  templateUrl: './patient-chart-list.component.html',
  styleUrls: ['./patient-chart-list.component.scss']
})
export class PatientChartListComponent implements OnInit, OnDestroy {

  @ViewChild(DatatableComponent, { static: false }) public table: DatatableComponent;

  searchForm: FormGroup;
  searchText: string;
  patientChartList: Array<any> = [];
  chartMenuOrders: Array<any> = [];
  page: {
    size: number, // The number of elements in the page
    totalElements: number, // The total number of elements
    totalPages: number, // The total number of pages
    pageNumber: number, // The current page number
  };
  pageSize = '15';
  sortObj: {
    sort_order: string,
    sort_column: string
  };
  externalPaging = true;

  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  patChartListEvent$: Subject<string> = new Subject();
  alertMsg: IAlert;
  isShowSearchFilter = false;

  roleList$ = new Observable<any>();
  doctorList$ = new Observable<any>();
  docListInput$ = new Subject<string>();
  serviceType$ = new Observable<any>();
  speciality$ = new Observable<any>();

  isShowManageOrder = false;
  patientChartListForManageOrder: Array<any> = [];
  chartTypeList = [];
  $destroy: Subject<boolean> = new Subject();
  showAddPopup = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private patientChartService: PatientChartService,
    private mappingService: MappingService,
    private emrService: EMRService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
  ) { }

  ngOnInit() {
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortObj = { sort_order: 'desc', sort_column: 'chart_name' };
    this.searchText = '';
    this.searchForm = this.fb.group({
      searchText: [''],
      speciality: [null, Validators.required],
      role: [null, Validators.required],
      doctor: [null],
      serviceType: [null, Validators.required],
      chartType: ['']
    });
    this.getPatientChartList();
    this.otherEventsListen();
    this.roleList$ = this.emrService.getUserRoleTypeList();
    this.serviceType$ = this.mappingService.getServiceTypeList();
    const specialityParams = {
      search_string: '',
      page_number: 1,
      limit: 100
    };
    this.speciality$ = this.mappingService.getSpecialityList(specialityParams);
    this.loadDoctorList();
    this.chartTypeList = this.patientChartService.chartTypeList;
    this.showActivePopup();
    this.commonService.routeChanged(this.route);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.unsubscribe();
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  otherEventsListen() {
    this.patChartListEvent$.pipe(debounceTime(500), takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.page.pageNumber = 1;
      this.getPatientChartList();
    });
  }

  // -- load chart list
  getPatientChartList(): void {
    const reqParams = {
      search_keyword: this.searchText,
      service_type_id: this.searchForm.value.serviceType,
      speciality_id: this.searchForm.value.speciality,
      role_type_id: this.searchForm.value.role,
      user_id: this.searchForm.value.doctor,
      chart_type: this.searchForm.value.chartType,
      sort_order: this.sortObj.sort_order,
      sort_column: this.sortObj.sort_column,
      current_page: this.page.pageNumber,
      limit: this.page.size
    };
    this.patientChartService.getPatientChartList(reqParams).subscribe((res: any) => {
      if (res.status_message === 'Success') {
        this.patientChartList = res.data;
        this.page.totalElements = res.total_records;
      }
    });
  }

  addChart() {
    this.router.navigate([`emrSettingsApp/settings/charts/patient-chart/-1`]);
  }

  // -- on edit go to edit page
  onEditChart(item): void {
    this.router.navigate([`emrSettingsApp/settings/charts/patient-chart/${item.chart_id}`]);
  }

  onDeleteChart(val) {
    const modalTitleobj = 'Delete';
    const modalBodyobj = 'Do you want to delete this Chart - <span class="font-weight-500">' + val.chart_name + '</span>';
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
        this.deleteData(val);
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  // -- delet chart by chart_id
  deleteData(item): void {
    this.patientChartService.deletePatientChart(item.chart_id).subscribe((res: any) => {
      if (res.status_message === 'Success') {
        const indx = this.patientChartList.findIndex(p => p.chart_id === item.chart_id);
        if (indx !== -1) {
          this.patientChartList.splice(indx, 1);
          this.page.totalElements = this.page.totalElements - 1;
          this.alertMsg = {
            message: res.message,
            messageType: 'success',
            duration: Constants.ALERT_DURATION
          };
        }
      }
    });
  }

  clearForm(): void {
    this.searchForm.reset();
  }

  onPageSizeChanged(newPageSize) {
    this.page.size = Number(newPageSize);
    this.page.pageNumber = 1;
    this.getPatientChartList();
  }

  onSortChanged(event) {
    if (event.sorts.length > 0) {
      const obj = event.sorts[0];
      this.sortObj.sort_order = obj.dir;
      this.sortObj.sort_column = obj.prop;
      this.getPatientChartList();
    }
  }

  onSetPage(pageInfo) {
    this.table.offset = pageInfo.offset - 1;
    if (this.externalPaging) {
      return;
    }
  }

  onFooterPage(event): void {
    this.page.pageNumber = event.page;
    this.getPatientChartList();
  }

  onSearchForm(isFromChangeEvent?: boolean): void {
    if (this.isShowManageOrder && isFromChangeEvent) { // -- for manage
      this.getChartMenusListForManageOrders();
    } else { // -- for list
      if (!isFromChangeEvent) {
        this.getPatientChartList();
      }
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.patientChartListForManageOrder, event.previousIndex, event.currentIndex);
  }

  onToggle(): void {
    this.clearForm();
    this.isShowManageOrder = !this.isShowManageOrder;
    if (this.isShowManageOrder) {
      this.getChartMenusListForManageOrders();
    }
  }

  getChartMenusListForManageOrders(): void {
    if (this.searchForm.invalid) {
      return;
    }
    const reqParams = {
      service_type_id: this.searchForm.value.serviceType,
      speciality_id: this.searchForm.value.speciality,
      role_type_id: this.searchForm.value.role,
      user_id: this.searchForm.value.doctor,
      is_followup_chart: this.searchForm.value.isFollowupChart === null ? false : this.searchForm.value.isFollowupChart,
    };
    this.patientChartService.getPatientChartListForManageOrder(reqParams).subscribe((res: any) => {
      if (res.status_message === 'Success') {
        this.patientChartListForManageOrder = res.data;
      }
    });
  }

  private loadDoctorList(searchTxt?) {
    this.doctorList$ = concat(
      this.getDoctorList(searchTxt), // default items
      this.docListInput$.pipe(
        distinctUntilChanged(),
        switchMap(term => this.getDoctorList(term).pipe(
          catchError(() => of([])), // empty list on error
        ))
      )
    );
  }

  getDoctorList(searchText): Observable<any> {
    const reqParam = {
      search_keyword: searchText,
      dept_id: 0,
      speciality_id: 0,
      role_type_id: 0,
      limit: 0
    };
    return this.emrService.getUsersList(reqParam).pipe(map(res => res));
  }

  savePatientChartOrder(): void {
    let count = 1;
    this.patientChartListForManageOrder.forEach(res => {
      res.sequence = count;
      count++;
    });
    this.patientChartService.savePatientChartOrder(this.patientChartListForManageOrder).subscribe((res: any) => {
      if (res.status_message === 'Success') {
        this.alertMsg = {
          message: res.message,
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
      }
    });
  }

  showActivePopup() {
    this.commonService.$addPopupEvent.pipe(takeUntil(this.$destroy)).subscribe(popup => {
      if (popup && popup.redirectFromPage === '/emr/charts/patient-chart-list') {
        this.showAddPopup = popup.isShowAddPopup;
        this.addChart();
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
