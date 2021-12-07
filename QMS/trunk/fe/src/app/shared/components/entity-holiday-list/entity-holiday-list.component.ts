import { Constants } from 'src/app/config/constants';
import { takeUntil } from 'rxjs/operators';
import { Subscription, Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit, OnDestroy, Input, ViewChild, AfterViewInit, OnChanges, SimpleChange, SimpleChanges, ViewChildren } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';
import { ActivatedRoute } from '@angular/router';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxPermissionsService } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { IAlert } from 'src/app/models/AlertMessage';
import { EntitySettingsService } from 'src/app/modules/appointment/services/entity-settings.service';
import { CommonService } from 'src/app/services/common.service';
import { AuthService } from 'src/app/services/auth.service';
import { ConfirmationPopupComponent } from 'src/app/components/confirmation-popup/confirmation-popup.component';
import { CancelHolidayPopupComponent } from '../cancel-holiday-popup/cancel-holiday-popup.component';

@Component({
  selector: 'app-entity-holiday-list',
  templateUrl: './entity-holiday-list.component.html',
  styleUrls: ['./entity-holiday-list.component.scss']
})
export class EntityHolidayListComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @ViewChild(DatatableComponent, { static: false }) public table: DatatableComponent;
  subject: Subject<string> = new Subject();
  shoHolidayCalendar: boolean;
  holidayDateCustomClass;
  passedDatesCustomeClass;
  page = {
    size: 1, // The number of elements in the page
    totalElements: 1, // The total number of elements
    totalPages: 1, // The total number of pages
    pageNumber: 1, // The current page number
  };
  userInfo: any;
  swapColumns = false;
  externalPaging = true;
  alertMsg: IAlert;
  holidayList: any[] = [];
  timeFormateKey: string;
  todayDate: Date;
  // loadForm: boolean;
  reorderable = true;
  modalService: NgbModal;
  userId: number;
  pageSize: string;
  subscription: Subscription;
  $destroy: Subject<boolean> = new Subject();
  showListFilter = false;
  filterForm: FormGroup;
  SearchBY: '';
  datatableBodyElement: any;
  sortOrder = { sort_order: 'asc', sort_column: 'block_type' };
  colorSetting = {
    holiday_color: String,
    blocked_color: String
  };
  editpermission: boolean = false;
  cancelAppointmentList: any;
  cancelAppReqParam: any;

  @Input() public selectedUserFromFrontDeskToList: any;
  @Input() public isFromFrontDesk = false;
  @Input() public islistShow = false;
  @Input() timeFormatkey: string;

  constructor(
    private confirmationModalService: NgbModal,
    private entitySettingsService: EntitySettingsService,
    public commonService: CommonService,
    private authService: AuthService,
    private route: ActivatedRoute,
    public fb: FormBuilder,
    private ngxPermissionsService: NgxPermissionsService,
  ) {
    this.modalService = confirmationModalService;
  }

  ngOnInit() {
    this.todayDate = new Date();
    this.shoHolidayCalendar = false;
    this.holidayDateCustomClass = [];
    this.editpermission = _.isUndefined(this.ngxPermissionsService.getPermission(PermissionsConstants.Manage_Calendar_Update)) ? true : false;

    if (!_.isUndefined(this.route.snapshot.queryParams.entity_id)) {
      this.userInfo = {};
      this.userInfo.roletype_id = + this.route.snapshot.queryParams.entity_id;
      this.userInfo.user_id = + this.route.snapshot.queryParams.provider_id;
    } else if (this.isFromFrontDesk) {
      this.userInfo = {};
      this.userInfo.roletype_id = + this.selectedUserFromFrontDeskToList.entity_id;
      this.userInfo.user_id = + this.selectedUserFromFrontDeskToList.entity_value_id;
    } else {
      this.userId = this.authService.getLoggedInUserId();
      this.userInfo = this.authService.getUserInfoFromLocalStorage();
      // get entity id regarding this user if not find then roletype id using as it is
      this.userInfo.roletype_id = this.entitySettingsService.getRoleTypeIdFromProvidersArray(this.userInfo);
    }
    this.defaultObject();
    this.getDoctorHolidayBlockList();
    this.subscribeEvents();
    this.getColorSetting();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (!_.isUndefined(changes.islistShow) && !_.isUndefined(changes.islistShow.previousValue)) {
      if (!changes.islistShow.currentValue) {
        this.datatableBodyElement.setAttribute('style', 'height:calc(100vh - 405px)');
      } else {
        this.datatableBodyElement.setAttribute('style', 'height:calc(100vh - 279px)');
      }
    }
  }

  ngOnDestroy() {
    this.$destroy.next();
    this.$destroy.unsubscribe();
  }
  ngAfterViewInit(): void {
    this.datatableBodyElement = this.table.element.children[0].children[1];
    this.datatableBodyElement.setAttribute('style', 'height:calc(100vh - 279px)');
  }

  defaultObject(): void {
    this.pageSize = '15';
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortOrder = { sort_order: 'desc', sort_column: 'date_from' };
    this.filterForm = this.fb.group({
      from_date: '',
      to_date: '',
      block_type: '',
      is_active: ''
    });
  }
  clearSearch() {
    this.filterForm.reset({});
    this.defaultObject();
    this.getDoctorHolidayBlockList();
  }
  searchByFilter(): void {
    this.page.pageNumber = 1;
    // this.showSearchFilter();
    this.getDoctorHolidayBlockList();
  }

  subscribeEvents(): void {
    this.entitySettingsService.$holidayList.pipe(takeUntil(this.$destroy)).subscribe((res) => {
      if (res) {
        this.shoHolidayCalendar = false;
        this.getDoctorHolidayBlockList();
      }
    });
  }

  getSelectedDate(dateVal) {
    console.log(dateVal);
  }
  convertDate(value) {
    return value.split('/').reverse().join('-');
  }
  // showSearchFilter() {
  //   this.showListFilter = !this.showListFilter;
  // }

  onSortChanged(event) {
    if (event.sorts.length > 0) {
      const obj = event.sorts[0];
      this.sortOrder.sort_order = obj.dir;
      this.sortOrder.sort_column = obj.prop;
      this.getDoctorHolidayBlockList();
    }
  }
  validateToDate() {
    (this.filterForm.value.from_date) ? this.filterForm.controls.to_date.setValidators(Validators.required) : this.filterForm.controls.to_date.clearValidators();
    this.filterForm.controls.to_date.updateValueAndValidity();
  }
  validateFormDate() {
    (!this.filterForm.value.from_date && this.filterForm.value.to_date) ? this.filterForm.controls.from_date.setValidators(Validators.required) : this.filterForm.controls.from_date.clearValidators();
    this.filterForm.controls.to_date.updateValueAndValidity();
  }
  onSetPage(pageInfo) {
    this.table.offset = pageInfo.offset - 1;
    if (this.externalPaging) {
      return;
    }

  }
  onFooterPage(event): void {
    this.page.pageNumber = event.page;
    this.getDoctorHolidayBlockList();
  }
  onPageSizeChanged(newPageSize) {
    this.sortOrder = { sort_order: 'desc', sort_column: 'date_from' };
    this.page.size = Number(newPageSize);
    this.page.pageNumber = 1;
    this.getDoctorHolidayBlockList();
  }

  getDoctorHolidayBlockList() {
    const params = {
      entity_id: this.userInfo.roletype_id,
      entityvalue_id: this.userInfo.user_id,
      search_text: this.SearchBY ? this.SearchBY : '',
      limit: this.page.size,
      current_page: this.page.pageNumber,
      sort_order: this.sortOrder.sort_order,
      sort_column: this.sortOrder.sort_column,
      from_date: this.filterForm.value.from_date ? moment(this.filterForm.value.from_date).format(Constants.apiDateFormate) : '',
      to_date: this.filterForm.value.to_date ? moment(this.filterForm.value.to_date).format(Constants.apiDateFormate) : '',
      is_active: this.filterForm.value.is_active ? this.filterForm.value.is_active : null,
      block_type: this.filterForm.value.block_type
    };
    this.entitySettingsService.getDoctorHolidaySettings(params).subscribe(res => {
      this.holidayDateCustomClass = [];
      this.holidayList = !_.isUndefined(res.entityBlock_Holiday_Data) && res.entityBlock_Holiday_Data.details.length ? res.entityBlock_Holiday_Data.details : [];
      this.page.totalElements = res.total_records;
      if (this.holidayList.length) {
        this.updateCalenderClasses();
      }
      this.shoHolidayCalendar = true;
    });
  }

  updateCalenderClasses() {
    const timeFormat = this.timeFormatkey === '24_hour' ? 'HH:mm' : 'hh:mm A';
    _.map(this.holidayList, (v) => {
      v.block_type = v.block_type.toUpperCase();
      v.isValidHoliDay = moment(moment(v.date_to, 'DD/MM/YYYY').format('YYYY-MM-DD')).isBefore(moment().format('YYYY-MM-DD')) ? false : true;
      const dateAry = this.enumerateDaysBetweenDates(moment(this.convertDate(v.date_from)), moment(this.convertDate(v.date_to)));
      v.date_from = v.date_from + ' ' + moment(v.time_from, 'hh:mm:ss').format(timeFormat);
      v.date_to = v.date_to + ' ' + moment(v.time_to, 'hh:mm:ss').format(timeFormat);
      if (v.is_active) {
        _.map(dateAry, (dt) => {
          const obj = {
            date: dt,
            settingType: v.block_type,
            classes: this.getholidayCustomClass(dt, v.block_type),
            title: v.remarks
          };
          this.holidayDateCustomClass.push({ ...obj });
        });
      }
    });
  }

  getholidayCustomClass(date, holidayType) {
    const isExistdateObj = _.find(this.holidayList, (h) => {
      return (moment(moment(h.date_from, 'YYYY-MM-DD')).isSame(moment(date, 'YYYY-MM-DD')) && h.is_active);
    });
    // return (_.isUndefined(isExistdateObj) && holidayType.toLowerCase() === 'holiday') ? Constants.holidayDateCustomClass
    //   : (_.isUndefined(isExistdateObj) && holidayType.toLowerCase() === 'block') ? Constants.blockSlotCustomClass
    //     : (!_.isUndefined(isExistdateObj) && isExistdateObj.block_type.toLowerCase() === 'block') ? Constants.blockSlotCustomClass
    //       : (!_.isUndefined(isExistdateObj) && isExistdateObj.block_type.toLowerCase() === 'holiday') ? Constants.holidayDateCustomClass : '';
    return (_.isUndefined(isExistdateObj) && holidayType.toLowerCase() === 'holiday') ? this.colorSetting.holiday_color
      : (_.isUndefined(isExistdateObj) && holidayType.toLowerCase() === 'block') ? this.colorSetting.blocked_color
        : (!_.isUndefined(isExistdateObj) && isExistdateObj.block_type.toLowerCase() === 'block') ? this.colorSetting.blocked_color
          : (!_.isUndefined(isExistdateObj) && isExistdateObj.block_type.toLowerCase() === 'holiday') ? this.colorSetting.holiday_color : '';
  }

  loadConfirmationPopup(row) {
    const modalTitleobj = (row.is_active) ? 'Inactive' : 'Active';
    const modalBodyobj = 'Do you want to mark holidays status from ' + row.date_from + ' to ' + row.date_to + ' as ' + modalTitleobj + ' ?';
    const messageDetails = {
      modalTitle: modalTitleobj,
      modalBody: modalBodyobj
    };
    const modalInstance = this.confirmationModalService.open(ConfirmationPopupComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false
      });
    modalInstance.result.then((result) => {
      if (result === 'Ok') {
        if (!row.is_active) {
          // check user have appointment in between selected duration
          const requestParamsAppCheck = {
            entity_id: this.userInfo.roletype_id,
            entity_value_id: this.isFromFrontDesk ? this.userInfo.user_id : this.userId,
            from_date: moment(row.date_from, 'DD/MM/YYYY').format(Constants.apiDateFormate),
            to_date: moment(row.date_to, 'DD/MM/YYYY').format(Constants.apiDateFormate),
            from_time: moment(row.time_from, 'hh:mm:ss').format(Constants.apiTimeFormate),
            to_time: moment(row.time_to, 'hh:mm:ss').format(Constants.apiTimeFormate),
          };
          this.entitySettingsService.checkAppointmentExistOrNot(requestParamsAppCheck).subscribe(res => {
            if (res) {
              this.cancelAppointmentConfirmationPopup(row);
            } else {
              row.appointment_cancel_required = false;
              this.updateEntityHolidayStatus(row);
            }
          });
        } else {
          this.cancelAppReqParam = null;
          row.appointment_cancel_required = false;
          this.updateEntityHolidayStatus({ ...row });
          this.cancelAppReqParam = {
            entity_id: this.userInfo.roletype_id,
            entity_value_id: this.isFromFrontDesk ? this.userInfo.user_id : this.userId,
            from_date: moment(row.date_from, 'DD/MM/YYYY').format(Constants.apiDateFormate),
            to_date: moment(row.date_to, 'DD/MM/YYYY').format(Constants.apiDateFormate),
            block_from_time: moment(row.time_from, 'hh:mm:ss').format(Constants.apiTimeFormate),
            block_to_time: moment(row.time_to, 'hh:mm:ss').format(Constants.apiTimeFormate),
            send_sms: false,
            current_page: 1,
            limit: 100,
            remarks: ''
          };
        }
      }
    }, () => { });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  getAllCancelledAppointmentList() {
    this.entitySettingsService.getCancelAppointmentListOfDoctor(this.cancelAppReqParam).subscribe(response => {
      this.cancelAppointmentList = response.data;
      if (response.status_code === 200 && this.cancelAppointmentList && this.cancelAppointmentList.length) {
        const HolidaycancellationTemplateInstance = this.modalService.open(CancelHolidayPopupComponent,
          {
            ariaLabelledBy: 'modal-basic-title',
            backdrop: 'static',
            keyboard: false,
            windowClass: 'custom-modal',
            size: 'xl',
            container: '#homeComponent'
          });
        HolidaycancellationTemplateInstance.componentInstance.cancelAppointmentData = this.cancelAppointmentList;
        HolidaycancellationTemplateInstance.componentInstance.reqParams = this.cancelAppReqParam;
        HolidaycancellationTemplateInstance.componentInstance.timeFormatkey = this.timeFormatkey;
        HolidaycancellationTemplateInstance.result.then((res: any) => {
          if (res !== 'closed') {
            this.alertMsg = {
              message: res === 200 ? 'Holiday cancellation notification sent.' : 'Please Add Sms/Email template.',
              messageType: res === 200 ? 'success' : 'danger',
              duration: Constants.ALERT_DURATION
            };
          }
        });
      }
    });
  }

  cancelAppointmentConfirmationPopup(requestParams): void {
    const modalInstance = this.confirmationModalService.open(ConfirmationPopupComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        windowClass: 'custom-modal'
      });
    modalInstance.componentInstance.messageDetails = {
      modalTitle: 'Confirm',
      modalBody: 'Have Appointment in this duration, Do you want to cancel all these?',
      buttonType: 'yes_no',
    };
    modalInstance.result.then((res: any) => {
      if (res === 'yes') {
        requestParams.appointment_cancel_required = true;
        this.updateEntityHolidayStatus({ ...requestParams });
      } else if (res === 'no') {
        requestParams.appointment_cancel_required = false;
        this.updateEntityHolidayStatus({ ...requestParams });
      }
    }, () => {

    });
  }

  updateEntityHolidayStatus(row): void {
    const obj = {
      id: row.id,
      is_active: row.is_active,
      block_type: row.block_type,
      appointment_cancel_required: row.appointment_cancel_required
    };

    this.entitySettingsService.updateEntityHolidaySetting(obj).subscribe(result => {
      if (result.status_message === 'Success') {
        const tempCustomClass = _.cloneDeep(this.holidayDateCustomClass);
        _.map(this.holidayList, (v) => {
          if (v.id === row.id) {
            v.is_active = !row.is_active;
            const timeFormat = this.timeFormatkey === '24_hour' ? 'HH:mm' : 'hh:mm A';
            v.isValidHoliDay = moment(moment(v.date_to, 'DD/MM/YYYY').format('YYYY-MM-DD')).isBefore(moment().format('YYYY-MM-DD')) ? false : true;
            const dateAry = this.enumerateDaysBetweenDates(moment(this.convertDate(v.date_from.split(' ')[0])), moment(this.convertDate(v.date_to.split(' ')[0])));
            _.map(dateAry, (dt) => {
              _.remove(tempCustomClass, (o) => {
                return (moment(moment(o.date, 'YYYY-MM-DD')).isSame(moment(dt, 'YYYY-MM-DD')));
              });
              const bobject = {
                date: dt,
                settingType: v.block_type,
                classes: this.getholidayCustomClass(dt, v.block_type)
              };
              if (v.is_active) {
                tempCustomClass.push({ ...bobject });
              }
            });
          }
        });
        this.holidayDateCustomClass = [...tempCustomClass];
        const statusMsgFor = _.toLower(obj.block_type) === 'holiday' ? 'Holiday' : 'Block';
        if (obj.is_active) {
          this.getAllCancelledAppointmentList();
        } else {
          this.alertMsg = {
            message: statusMsgFor + ' Status Changed Successfully.',
            messageType: 'success',
            duration: 1000
          };
        }
      } else if (result.status_message === 'Error' && result.message === 'date and timeslot is overlapping') {
        this.alertMsg = {
          message: 'Date and timeslot is Overlapping.',
          messageType: 'danger',
          duration: 3000
        };
      } else {
        this.alertMsg = {
          message: 'Something went Wrong',
          messageType: 'danger',
          duration: 3000
        };
      }
    }, error => {
      console.log(`Error while update user status ${error}`);
    });
  }

  // updateEntityBlockStatus(row): void {
  //   const obj = {
  //     entity_blockslot_id: row.id,
  //     is_active: !row.is_active
  //   };

  //   this.entitySettingsService.updateEntityBlockSetting(obj).subscribe(result => {
  //     if (result.status_message === 'Success') {
  //       _.map(this.holidayList, (holiday) => {
  //         if (holiday.id === row.id) {
  //           holiday.is_active = !holiday.is_active;
  //         }
  //       });
  //       this.alertMsg = {
  //         message: 'Block Status Changed Successfully.',
  //         messageType: 'success',
  //         duration: 3000
  //       };
  //     } else if (result.status_message === 'Error' && result.message === 'date and timeslot is overlapping') {
  //       this.alertMsg = {
  //         message: 'Date and timeslot is Overlapping.',
  //         messageType: 'danger',
  //         duration: 3000
  //       };
  //     } else {
  //       this.alertMsg = {
  //         message: 'Something went Wrong',
  //         messageType: 'danger',
  //         duration: 3000
  //       };
  //     }
  //   }, error => {
  //     console.log(`Error while update user status ${error}`);
  //   });
  // }

  enumerateDaysBetweenDates(startDate, endDate) {
    const now = startDate.clone();
    const dates = [];
    while (now.isSameOrBefore(endDate)) {
      dates.push(now.format('DD/MM/YYYY'));
      now.add(1, 'days');
    }
    return dates;
  }

  getColorSetting() {
    this.commonService.getQueueSettings(Constants.slotColorSetting).subscribe((res) => {
      if (res) {
        if (res.holiday_color) { this.colorSetting.holiday_color = res.holiday_color; } // ? res.holiday_color : '#8506B',
        if (res.blocked_color) { this.colorSetting.blocked_color = res.blocked_color; } // ? res.blocked_color : '#2B99EA',
      }
    });
  }
}
