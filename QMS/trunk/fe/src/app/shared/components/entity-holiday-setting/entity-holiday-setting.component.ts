import { Constants } from 'src/app/config/constants';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import * as _ from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EntitityCommonDataService } from 'src/app/modules/schedule/services/entitity-common-data.service';
import { IAlert } from 'src/app/models/AlertMessage';
import { AuthService } from 'src/app/services/auth.service';
import { CommonService } from 'src/app/services/common.service';
import { EntitySettingsService } from 'src/app/modules/appointment/services/entity-settings.service';
import { ConfirmationPopupComponent } from 'src/app/components/confirmation-popup/confirmation-popup.component';
@Component({
  selector: 'app-entity-holiday-setting',
  templateUrl: './entity-holiday-setting.component.html',
  styleUrls: ['./entity-holiday-setting.component.scss']
})
export class EntityHolidaySettingComponent implements OnInit {
  userId: number;
  entityHolidaySettingForm: FormGroup;
  reorderable = true;
  swapColumns = false;
  showUserListFilter = false;
  externalPaging = false;
  alertMsg: IAlert;
  holidayList: any[] = [];
  // timeFormatkey: string;
  todayDate: Date;
  loadForm: boolean;
  page = {
    size: 1, // The number of elements in the page
    totalElements: 1, // The total number of elements
    totalPages: 1, // The total number of pages
    pageNumber: 1, // The current page number
  };
  holidayDateCustomClass;
  shoHolidayCalendar: boolean;
  userInfo: any;
  modalService: NgbModal;
  subscription: Subscription;
  hoursToArray = [];
  hoursFromArray = [];
  temphoursArray = [];
  isCurrentTimeFlag = true;
  isEntireDay = true;
  timeFormat = 'H:mm';
  IsSendNotification = false;
  NotificationDuration: any;
  toDateMin: any;
  isRequired = true;
  @Input() public selectedUserFromFrontDeskToList: any;
  @Input() public isFromFrontDesk = false;
  @Input() timeFormatkey: string;

  constructor(
    private confirmationModalService: NgbModal,
    private fb: FormBuilder,
    private authService: AuthService,
    private entitySettingsService: EntitySettingsService,
    public commonService: CommonService,
    private route: ActivatedRoute,
    private entityCommonDataService: EntitityCommonDataService,

  ) {
    this.modalService = confirmationModalService;

  }

  ngOnInit() {
    this.loadForm = false;
    this.todayDate = new Date();
    this.shoHolidayCalendar = false;
    this.holidayDateCustomClass = [];
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
    this.createForm();
    if (this.timeFormatkey === '12_hour') {
      this.temphoursArray = this.entityCommonDataService.createHoursList12HourFormat(true);
    } else if (this.timeFormatkey === '24_hour') {
      this.temphoursArray = this.entityCommonDataService.createHoursList24HourFormat(true);
    }
    this.timeFormat = this.timeFormatkey === '24_hour' ? 'HH:mm' : 'hh:mm A';
  }
  createForm() {
    this.entityHolidaySettingForm = this.fb.group({
      fromDate: [null, Validators.required],
      toDate: [null, Validators.required],
      fromTime: [null, Validators.required],
      toTime: [null, Validators.required],
      remark: [''],
      isCancelAppointment: [true],
      NotificationDuration: [3]
    });
    this.loadForm = true;
  }

  clearForm() {
    this.entityHolidaySettingForm.patchValue({
      fromDate: null,
      toDate: null,
      fromTime: null,
      toTime: null,
      remark: ''
    });
  }
  setAndValidateDates(controlName, $event): void {
    if (controlName === 'fromDate') {
      this.entityHolidaySettingForm.patchValue({
        fromDate: $event,
        fromTime: null,
        toDate: null,
        toTime: null
      });
      this.toDateMin = $event;
    } else {
      this.entityHolidaySettingForm.patchValue({
        toDate: $event
      });
    }
    this.isCurrentTimeFlag = moment(moment(this.entityHolidaySettingForm.value.fromDate).format('YYYY-MM-DD')).isSame(moment().format('YYYY-MM-DD')) ? true : false;
    // set cureent Date Holiday if to date is not selected (Option to mark day holiday directly)
    const isToDateExistFlag = !this.entityHolidaySettingForm.value.toDate ? true : false;
    const isFromDateGreter = moment(moment(this.entityHolidaySettingForm.value.toDate).format('YYYY-MM-DD')).isBefore(moment(this.entityHolidaySettingForm.value.fromDate).format('YYYY-MM-DD'));
    if ((isToDateExistFlag || isFromDateGreter) && controlName === 'fromDate') {
      this.entityHolidaySettingForm.patchValue({
        //  fromDate: $event,
        //  toDate: $event
      });
      let currentTime = null;
      for (let i = 0, len = this.temphoursArray.length; i < len; i++) {
        if (moment(moment(), this.timeFormat).isBefore(moment(this.temphoursArray[i], this.timeFormat)) &&
          (moment(moment(this.entityHolidaySettingForm.value.fromDate).format('YYYY-MM-DD')).isSame(moment().format('YYYY-MM-DD')))) {
          currentTime = this.temphoursArray[i];
          break;
        }
      }
      this.entityHolidaySettingForm.patchValue({
        //  fromTime: currentTime ? currentTime : this.temphoursArray[0],
        //   toTime: this.temphoursArray.length ? this.temphoursArray[this.temphoursArray.length - 1] : null
      });
    } // end
    if (this.entityHolidaySettingForm.value.toDate
      && (moment(this.entityHolidaySettingForm.value.toDate, 'DD-MM-YYYY : hh').isBefore(moment(this.entityHolidaySettingForm.value.fromDate, 'DD-MM-YYYY hh')))) {
      this.entityHolidaySettingForm.get('toDate').setErrors({ toDate: true });
      this.entityHolidaySettingForm.get('fromDate').setErrors(null);
    } else if (this.entityHolidaySettingForm.value.todate
      && (moment(this.entityHolidaySettingForm.value.fromDate, 'DD-MM-YYYY hh').isAfter(moment(this.entityHolidaySettingForm.value.toDate, 'DD-MM-YYYY hh')))) {
      this.entityHolidaySettingForm.get('fromDate').setErrors({ fromDate: true });
      this.entityHolidaySettingForm.get('toDate').setErrors(null);
    }
    if (controlName === 'toDate') {
      if (this.entityHolidaySettingForm.value.toDate !== null && this.entityHolidaySettingForm.value.toTime !== null) {
        this.entityHolidaySettingForm.get('toDate').setErrors(null);
        this.entityHolidaySettingForm.get('toTime').setErrors(null);
      } else {
        this.entityHolidaySettingForm.get('toDate').setErrors({ required: true });
        this.entityHolidaySettingForm.get('toTime').setErrors({ required: true });
      }
    }
    this.getValidateTotimeList();
  }

  getValidateTotimeList(holidayFlag?) {
    if (this.entityHolidaySettingForm.value.toDate && this.entityHolidaySettingForm.value.fromDate) {
      this.hoursToArray = [];
      // const todate = moment(this.entityHolidaySettingForm.value.toDate).format('YYYY-MM-DD');
      // const formDate = moment(this.entityHolidaySettingForm.value.fromDate).format('YYYY-MM-DD');
      this.entityHolidaySettingForm.get('fromTime').setErrors(null); // form status change to Valid by change staus of fromTime fromTime;
      if (moment(moment(this.entityHolidaySettingForm.value.toDate).format('YYYY-MM-DD')).isSame(moment(this.entityHolidaySettingForm.value.fromDate).format('YYYY-MM-DD'))) {
        if (moment(this.entityHolidaySettingForm.value.fromTime, this.timeFormat).isSame(moment(this.entityHolidaySettingForm.value.toTime, this.timeFormat))) {
          this.entityHolidaySettingForm.get('fromTime').setErrors({ key: true }); // form status change to INVAID by change staus of fromTime fromTime;
        }
        const sTime = this.entityHolidaySettingForm.value.fromTime;
        _.map(this.temphoursArray, (t) => {
          if (moment(t, this.timeFormat).isSameOrAfter(moment(sTime, this.timeFormat))) {
            this.hoursToArray.push(t);
          }
        });
      } else {
        _.map(this.temphoursArray, (t) => {
          this.hoursToArray.push(t);
        });
      }
      if (this.hoursToArray.length) {
        this.hoursToArray[0] = 'Entire Day';
      }
    }
  }

  saveSetting() {
    this.checkForEntireDay();
    const requestParams = {
      entity_id: this.userInfo.roletype_id,
      entityvalue_id: this.userInfo.user_id,
      from_date: (moment(this.entityHolidaySettingForm.value.fromDate, [Constants.apiDateFormate]).format(Constants.apiDateFormate)),
      to_date: (moment(this.entityHolidaySettingForm.value.toDate, [Constants.apiDateFormate]).format(Constants.apiDateFormate)),
      from_time: (this.entityHolidaySettingForm.value.fromTime != null) ? moment(this.entityHolidaySettingForm.value.fromTime, this.timeFormat).format(Constants.apiTimeFormate) : (moment('0').format(Constants.apiTimeFormate)),
      to_time: (this.entityHolidaySettingForm.value.toTime != null) ? moment(this.entityHolidaySettingForm.value.toTime, this.timeFormat).format(Constants.apiTimeFormate) : (moment('0').format(Constants.apiTimeFormate)),
      notes: '',
      remarks: this.entityHolidaySettingForm.value.remark,
      is_active: true,
      appointment_cancel_required: this.entityHolidaySettingForm.value.isCancelAppointment,
    };
    // check user have appointment in between selected duration
    const requestParamsAppCheck = {
      entity_id: requestParams.entity_id,
      entity_value_id: requestParams.entityvalue_id,
      from_date: requestParams.from_date,
      from_time: requestParams.from_time,
      to_date: requestParams.to_date,
      to_time: requestParams.to_time,
    };

    const duration = this.entityHolidaySettingForm.value.NotificationDuration;
    const currentDate = moment(requestParams.from_date);
    let notificationDuration = moment(currentDate).subtract(duration, 'M');
    const futureMonthEnd = moment(notificationDuration).endOf('month');

    if (currentDate.date() !== notificationDuration.date() && notificationDuration.isSame(futureMonthEnd.format('YYYY-MM-DD'))) {
      notificationDuration = notificationDuration.subtract(1, 'd');
    }
    const requestParamsSendNotification = {
      entity_id: requestParams.entity_id,
      entity_value_id: requestParams.entityvalue_id,
      from_date: notificationDuration.format(Constants.apiDateFormate),
      holiday_id: 0
    };

    this.entitySettingsService.checkAppointmentExistOrNot(requestParamsAppCheck).subscribe(res => {
      if (res) {
        this.cancelAppointmentConfirmationPopup(requestParams, this.timeFormat, requestParamsSendNotification);
      } else {
        requestParams.appointment_cancel_required = false;
        this.cancelAppointmentConfirmationPopup(requestParams, this.timeFormat, requestParamsSendNotification);
      }
    });
  }

  checkForEntireDay(): void {
    if (this.entityHolidaySettingForm.value.toTime === 'Entire Day' && this.entityHolidaySettingForm.value.fromTime === 'Entire Day') {
      this.entityHolidaySettingForm.patchValue({
        fromTime: '00:30',
        toTime: '23:59'
      });
    } else if (this.entityHolidaySettingForm.value.toTime === 'Entire Day') {
      this.entityHolidaySettingForm.patchValue({
        toTime: '23:59'
      });
    } else if (this.entityHolidaySettingForm.value.fromTime === 'Entire Day' && this.entityHolidaySettingForm.value.toTime === null) {
      this.entityHolidaySettingForm.patchValue({
        fromTime: '00:30',
        toDate: this.entityHolidaySettingForm.value.fromDate,
        toTime: '23:59'
      });
    } else if (this.entityHolidaySettingForm.value.fromTime === 'Entire Day' && this.entityHolidaySettingForm.value.toTime !== null) {
      this.entityHolidaySettingForm.patchValue({
        fromTime: '00:30'
      });
    }
  }

  cancelAppointmentConfirmationPopup(requestParams, inputTimeFormat, requestParamsSendNotification): void {
    const modalInstance = this.confirmationModalService.open(ConfirmationPopupComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        windowClass: 'custom-modal'
      });
    modalInstance.componentInstance.messageDetails = {
      modalTitle: 'Confirm',
      modalBody: 'Are you want to save all changes?',
      buttonType: 'yes_no',
    };
    modalInstance.result.then((res: any) => {
      if (res === 'yes') {
        this.holidaySettingAfterConfirmation(requestParams, inputTimeFormat, requestParamsSendNotification);
      } else if (res === 'no') {
        modalInstance.dismiss();
        // requestParams.appointment_cancel_required = false;
        // this.holidaySettingAfterConfirmation(requestParams, inputTimeFormat);
      }
    }, () => {

    });
  }
  sendNotificationToPatient(requestParamsSendNotification) {
    this.entitySettingsService.sendNotificationToPatient(requestParamsSendNotification).subscribe(res => { });
  }
  holidaySettingAfterConfirmation(requestParams, inputTimeFormat, requestParamsSendNotification?) {
    this.entitySettingsService.saveDoctorHolidaySettings(requestParams).subscribe(res => {
      if (res.status_message === 'Success') {
        const objCurrent = {
          date_from: moment(this.entityHolidaySettingForm.value.fromDate).format('DD/MM/YYYY') + ' ' + moment(requestParams.from_time, inputTimeFormat).format('hh:mm A'),
          date_to: moment(this.entityHolidaySettingForm.value.toDate, ['DD/MM/YYYY']).format('DD/MM/YYYY') + ' ' + moment(requestParams.to_time, inputTimeFormat).format('hh:mm A'),
          remarks: requestParams.remarks,
          is_active: true
        };
        this.entitySettingsService.setHoildayListData(objCurrent);
        this.alertMsg = {
          message: 'Setting Saved Successfully.',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        this.sendSelectedSetting('holiday');
        if (this.IsSendNotification) {
          requestParamsSendNotification.holiday_id = res.entity_holiday_id;
          this.sendNotificationToPatient(requestParamsSendNotification);
        }
        this.clearForm();
      } else if (res.status_message === 'Error' && res.message === 'date and timeslot is overlapping') {
        this.alertMsg = {
          message: 'Date and timeslot is Overlapping.',
          messageType: 'danger',
          duration: 3000
        };
      } else {
        this.alertMsg = {
          message: 'Unable to save setting.',
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
      }
    });
  }

  // getDoctorHolidayList() {
  //   const params = {
  //     entity_id: this.userInfo.roletype_id,
  //     entityvalue_id: this.userInfo.user_id
  //   };
  //   this.entitySettingsService.getDoctorHolidaySettings(params).subscribe(res => {
  //     this.holidayList = (!_.isUndefined(res.EntityHolidayDetails)
  // && res.EntityHolidayDetails.length) ? !_.isUndefined(res.EntityHolidayDetails[0].holiday_details) ? res.EntityHolidayDetails[0].holiday_details : [] : [];
  //     this.page.totalElements = this.holidayList.length;
  //     console.log('holiday list');
  //     console.log(moment);
  //     if (this.holidayList.length) {
  //       _.map(this.holidayList, (v) => {
  //         const dateAry = this.enumerateDaysBetweenDates(moment(this.convertDate(v.date_from)), moment(this.convertDate(v.date_to)));
  //         v.date_from = v.date_from + ' ' + moment(v.time_from, 'hh:mm:ss').format('h:mm A');
  //         v.date_to = v.date_to + ' ' + moment(v.time_to, 'hh:mm:ss').format('h:mm A');
  //         _.map(dateAry, (dt) => {
  //           const obj = {
  //             date: dt,
  //             classes: Constants.holidayDateCustomClass
  //           };
  //           this.holidayDateCustomClass.push(obj);
  //         });
  //       });
  //     }
  //     this.shoHolidayCalendar = true;
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

  convertDate(value) {
    return value.split('/').reverse().join('-');
  }

  onSortChanged(row) {

  }

  onSetPage(row) {

  }

  // editHolidayRow(row) {
  //   this.entityHolidaySettingForm.patchValue({
  //     fromDate: moment(row.date_from, 'DD/MM/YYYY').toDate(),
  //     fromTime: moment(row.date_from).format('h:mm A'),
  //     toTime: moment(row.date_from).format('h:mm A'),
  //     toDate: moment(row.date_to, 'DD/MM/YYYY').toDate(),
  //     remark: row.remarks,
  //   });
  // }

  getSelectedDate(dateVal) {
    console.log(dateVal);
  }
  checkTimeValuesOnChange(val, key) {
    this.toDateMin = this.entityHolidaySettingForm.value.fromDate;
    this.isRequired = true;
    if (key === 'fromTime') {
      this.entityHolidaySettingForm.patchValue({ fromTime: val });
    } else {
      this.entityHolidaySettingForm.patchValue({ toTime: val });
    }
    const toDate = this.entityHolidaySettingForm.get('toDate');
    const toTime = this.entityHolidaySettingForm.get('toTime');

    if (key === 'fromTime' && val === 'Entire Day') {
      toDate.setValidators(null);
      toTime.setValidators(null);
      this.isRequired = false;
      this.entityHolidaySettingForm.patchValue({
        toDate: null,
        toTime: null
      });
    } else {
      toDate.setErrors({ required: true });
      toTime.setErrors({ required: true });
    }
    if (this.entityHolidaySettingForm.value.fromDate !== null && this.entityHolidaySettingForm.value.fromTime !== null
      && this.entityHolidaySettingForm.value.toDate && this.entityHolidaySettingForm.value.toTime) {
      toDate.setErrors(null);
      toTime.setErrors(null);
    }
    if (this.entityHolidaySettingForm.value.fromTime === 'Entire Day') {
      this.toDateMin = moment(this.entityHolidaySettingForm.value.fromDate).add(1, 'days').toDate();
    }
    this.getValidateTotimeList();
  }

  loadConfirmationPopup(row, type) {
    const modalTitleobj = (row.status === 'Active') ? 'Inactive' : 'Active';
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
        this.updateEntityHolidayStatus(row);
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  updateEntityHolidayStatus(row): void {
    const obj = {
      entity_holiday_id: row.holiday_id,
      is_active: !row.is_active
    };

    this.entitySettingsService.updateEntityHolidaySetting(obj).subscribe(result => {
      if (result.status_message === 'Success') {
        _.map(this.holidayList, (holiday) => {
          if (holiday.holiday_id === row.holiday_id) {
            holiday.is_active = !holiday.is_active;
          }
        });
        this.alertMsg = {
          message: 'Holiday Status Changed Successfully.',
          messageType: 'success',
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

  sendSelectedSetting(settingFor) {
    this.commonService.entitySettingPopUpValue(settingFor);
  }
  onSendNotification($event) {
    this.IsSendNotification = $event.target.checked;
  }
  ChangingNotificationValue($event) {
    this.NotificationDuration = $event.target.value;
  }
}
