import { Component, OnInit, ViewChild } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { Subject, Observable, concat, of } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/public/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { OtRegisterService } from '../../services/ot-register.service';
import { AuthService } from 'src/app/public/services/auth.service';
import { Constants } from 'src/app/config/constants';
import { debounceTime, takeUntil, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { ConfirmationPopupComponent } from 'src/app/shared/confirmation-popup/confirmation-popup.component';
import * as _ from 'lodash';
import * as moment from 'moment';
import { FormGroup, FormBuilder } from '@angular/forms';
import { OtScheduleService } from 'src/app/ot module/ot-schedule/services/ot-schedule.service';

@Component({
  selector: 'app-ot-register-list',
  templateUrl: './ot-register-list.component.html',
  styleUrls: ['./ot-register-list.component.scss']
})
export class OtRegisterListComponent implements OnInit {
  @ViewChild(DatatableComponent, { static: false }) public table: DatatableComponent;
  pageSize;
  page: {
    size: number, // The number of elements in the page
    totalElements: number, // The total number of elements
    totalPages: number, // The total number of pages
    pageNumber: number, // The current page number
  };
  filterForm: FormGroup;
  searchString: string;
  externalPaging: boolean;
  sortList: { sort_order: string, sort_column: string };
  setAlertMessage: IAlert;
  subject: Subject<string> = new Subject();
  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  compInstance = this;
  isNgSelectTypeHeadDisabled = false;
  datatableBodyElement: any;
  editPermission: boolean;
  registerList = [];
  $destroy: Subject<boolean> = new Subject();
  userId: any;
  timeFormateKey: string;
  timeFormate: string;
  isShowFilter: boolean;
  submitted: boolean;

  specialityList$ = new Observable<any>();
  specialityInput$ = new Subject<any>();

  procedureList$ = new Observable<any>();
  procedureInput$ = new Subject<any>();

  roomList$ = new Observable<any>();
  roomInput$ = new Subject<any>();

  constructor(
    private modalService: NgbModal,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private otRegisterService: OtRegisterService,
    private authService: AuthService,
    public fb: FormBuilder,
    public otScheduleService: OtScheduleService,
    public router: Router,
  ) { }

  ngOnInit() {
    this.isShowFilter = false;
    this.submitted = false;
    this.defaultObject();
    this.pageSize = '15';
    this.subjectFun();
    this.loadSpecialityList();
    this.loadRoomList();
    this.getTimeFormatKey().then(res => {
      this.generateFilterForm();
      this.getListData();
    });
    this.commonService.routeChanged(this.route);
  }

  ngOnDestroy(): void {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  getTimeFormatKey(): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      this.userId = +this.authService.getLoggedInUserId();
      this.commonService.getQueueSettings(Constants.timeFormateKey, this.userId).subscribe(res => {
        this.timeFormateKey = res.time_format_key;
        if (this.timeFormateKey === '12_hour') {
          this.timeFormate = 'hh:mm A';
        } else {
          this.timeFormate = 'HH:mm';
        }
        resolve(this.timeFormate);
      });
    });
    return promise;
  }

  showSearchFilter() {
    this.isShowFilter = !this.isShowFilter;
  }

  getFilteredData() {
    if (this.filterForm.value.from_date && !this.filterForm.value.to_date) {
      return;
    } else {
      this.showSearchFilter();
      this.getListData()
    }

  }

  addUpdateRoom(data?) {
    this.router.navigate(['/otApp/ot/register/registerPatient/' + data.appointmentId + '/update']);
  }

  viewData(data?) {
    this.router.navigate(['/otApp/ot/register/registerPatient/' + data.appointmentId + '/view']);
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
    this.sortList = { sort_order: 'desc', sort_column: 'patientName' };
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

  generateFilterForm() {
    const fromDate = new Date(moment().startOf('month').format('YYYY-MM-DD'));
    const toDate = new Date(moment().endOf('month').format('YYYY-MM-DD'));
    this.filterForm = this.fb.group({
      fromDate: fromDate,
      roomId: null,
      procedureId: null,
      specialityId: null,
      toDate: toDate,
    });
  }

  getListData() {
    const formData = this.filterForm.getRawValue();
    let fromDate = new Date(moment().startOf('month').format('YYYY-MM-DD'));
    let toDate = new Date(moment().endOf('month').format('YYYY-MM-DD'));
    if (formData.fromDate) {
      fromDate = formData.fromDate ? formData.fromDate : new Date(formData.fromDate);
    }
    if (formData.toDate) {
      toDate = formData.toDate ? formData.toDate : new Date(formData.toDate);
    }
    const params = {
      searchKeyword: this.searchString,
      roomId: formData.roomId ? formData.roomId : 0,
      specialityId: formData.specialityId ? formData.specialityId : 0,
      procedureId: formData.procedureId ? formData.procedureId : 0,
      fromDate: fromDate,
      toDate: toDate,
      sortOrder: this.sortList.sort_order,
      sortColumn: this.sortList.sort_column,
      pageNumber: this.page.pageNumber,
      limit: this.page.size,
    };
    this.otRegisterService.getOTRegisterList(params).subscribe(res => {
      if (res.total_records > 0) {
        _.map(res.data, dt => {
          dt.sTime = moment(moment().format('YYYY-MM-DD') + ' ' + dt.startTime).format(this.timeFormate);
          dt.eTime = moment(moment().format('YYYY-MM-DD') + ' ' + dt.endTime).format(this.timeFormate);
          dt.sTimeActual = moment(moment().format('YYYY-MM-DD') + ' ' + dt.actualStartTime).format(this.timeFormate);
          dt.eTimeActual = moment(moment().format('YYYY-MM-DD') + ' ' + dt.actualEndTime).format(this.timeFormate);
        });
        this.registerList = res.data;
        this.page.totalElements = res.total_records;
      } else {
        this.registerList = [];
        this.page.totalElements = 0;
      }
    });
  }

  get getFrmCntrols() {
    return this.filterForm.controls;
  }

  onPageSizeChanged(newPageSize) {
    this.sortList = { sort_order: 'desc', sort_column: 'patientName' };
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
    const modalBodyobj = 'Do you want to delete this Room?';
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
    this.otRegisterService.deleteOTRoomById(rowData.roomId).subscribe(res => {
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
    this.addUpdateRoom(row);
  }

  clearSearch() {
    if (this.searchString) {
      this.searchString = '';
      this.getListData();
    }
  }

  clearForm() {
    this.filterForm.patchValue({
      fromDate: null,
      roomId: null,
      procedureId: null,
      specialityId: null,
      toDate: null,
    });
    this.isShowFilter = false;
    this.getListData();
  }

  onSpecilityChange(event) {
    if (event) {
      this.filterForm.patchValue({
        specialityId: event.id
      });
      this.otScheduleService.selectedSpecialityId = event.id;
    } else {
      this.filterForm.patchValue({
        specialityId: null
      });
      this.otScheduleService.selectedSpecialityId = null;
    }
    this.loadProcedureList();
  }

  onProcedureChange(event) {
    if (event) {
      this.filterForm.patchValue({
        procedureId: event.id
      });
    } else {
      this.filterForm.patchValue({
        procedureId: null
      });
    }
  }

  onRoomChange(event) {
    if (event) {
      this.filterForm.patchValue({
        roomId: event.roomId
      });
    } else {
      this.filterForm.patchValue({
        roomId: null
      });
    }
  }

  private loadSpecialityList(searchTxt?) {
    this.specialityList$ = concat(
      this.otScheduleService.getOTSpecialityList(searchTxt ? searchTxt : ''),
      this.specialityInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.otScheduleService.getOTSpecialityList(term ? term : (searchTxt ? searchTxt : '')).pipe(
          catchError(() => of([]))))));
  }

  private loadProcedureList(searchTxt?) {
    this.procedureList$ = concat(
      this.otScheduleService.getOTProcedureList(searchTxt ? searchTxt : ''),
      this.procedureInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.otScheduleService.getOTProcedureList(term ? term : (searchTxt ? searchTxt : '')).pipe(
          catchError(() => of([]))))));
  }

  private loadRoomList(searchTxt?) {
    this.roomList$ = concat(
      this.otScheduleService.getOTRoomBySearchKeyword(searchTxt ? searchTxt : ''),
      this.roomInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.otScheduleService.getOTRoomBySearchKeyword(term ? term : (searchTxt ? searchTxt : '')).pipe(
          catchError(() => of([]))))));
  }
}
