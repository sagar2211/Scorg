import { EntitityCommonDataService } from './../../../schedule/services/entitity-common-data.service';
import { Component, Input, OnInit, OnDestroy, AfterViewInit, OnChanges, Output, EventEmitter } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Constants } from '../../../../config/constants';
import * as moment from 'moment';
import { CommonService } from '../../../../services/common.service';
import { IAlert } from '../../../../models/AlertMessage';
import { QueueService } from '../../services/queue.service';
import { AuthService } from '../../../../services/auth.service';
import * as _ from 'lodash';
import { SlotInfo } from '../../../appointment/models/slot-info.model';
import { forkJoin, interval, Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { AppointmentListModel } from '../../../appointment/models/appointment.model';
import { AppointmentBookComponent } from '../../../../shared/components/appointment-book/appointment-book.component';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';

@Component({
  selector: 'app-qlist-add-section',
  templateUrl: './qlist-add-section.component.html',
  styleUrls: ['./qlist-add-section.component.scss']
})
export class QlistAddSectionComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() url: string;
  @Input() providers: any;
  alertMsg: IAlert;
  extendedHours: number;
  extendeMinute: number;
  userInfo: any = null;
  currentAvailableSlot: SlotInfo = null;
  currentAvailableSlotInfo: any;
  userId: number;
  providerDetails = null;
  appointmentSlotOrder: string;
  $destroy: Subject<boolean> = new Subject();
  timeFormateKey = '';
  currentUserSchedule = null;
  selectedSchedule = null;
  selectedScheduleIdFromQlist;
  overLappingScheduleMessage: string;
  permissions: any;
  checkqlistStatus = { checkInStatus: '', isCheckIn: false, isCheckOut: false };
  minDate: Date;
  extendHoursDate = new Date();
  isExtend = false;
  selectedModifyType = 'Extend';
  modifyType: any = ['Extend', 'Prepend', 'Modify', 'Add'];
  historyData: any;
  startTimeArray: Array<string> = [];
  endTimeHoursList: Array<string> = [];
  endTimeList: Array<string> = [];
  noScheduleFound = false;
  startTime = '';
  endTime = null;
  modalRef: any;


  constructor(
    private authService: AuthService,
    private modalService: NgbModal,
    private commonService: CommonService,
    private queueService: QueueService,
    private entityCommonDataService: EntitityCommonDataService,
    private activeModal: NgbActiveModal
  ) { }

  ngOnInit() {
    this.minDate = new Date();
    this.permissions = PermissionsConstants;
    this.userId = +this.authService.getLoggedInUserId();
    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    this.selectedScheduleIdFromQlist = this.queueService.getScheduleTimeDetailId();
    this.currentUserSchedule = this.queueService.getCurrentSchedules();
    this.checkqlistStatus = this.commonService.getqListStatus();
    console.log(this.checkqlistStatus);
    if ((!this.selectedScheduleIdFromQlist || this.selectedScheduleIdFromQlist === 0) && this.currentUserSchedule && this.currentUserSchedule.length > 0) {
      this.selectedSchedule = this.currentUserSchedule[0];
    } else if (this.selectedScheduleIdFromQlist) {
      this.selectedSchedule = _.find(this.currentUserSchedule, { formId: this.selectedScheduleIdFromQlist });
    }
    const storedProviderDetails = this.commonService.getFilterDataByUrl(this.url);
    if (storedProviderDetails) {
      this.providerDetails = storedProviderDetails.data.providerDetails;
    } else if (this.url === 'frontDesk') {
      this.providerDetails = this.providers;
    } else {
      this.providerDetails = this.userInfo.provider_info;
      this.providerDetails = _.find(this.providerDetails, { providerValueId: this.userInfo.user_id });
    }

    const getQueueSetting = this.commonService.getQueueSettings(Constants.queueSkipSettingKey);
    const getTimeFormatKeyFork = this.commonService.getQueueSettings(Constants.timeFormateKey, this.userId);

    forkJoin([getTimeFormatKeyFork, getQueueSetting]).subscribe((res: Array<any>) => {
      this.timeFormateKey = res[0].time_format_key;
      this.appointmentSlotOrder = res[1].available_slot;
      // available_slot
      // this.getImmediateAvailableSlot();
      const secondsCounter = interval(Constants.INTERVAL_TIME);
      secondsCounter.pipe(takeUntil(this.$destroy)).subscribe(res1 => {
        this.providerDetails = this.commonService.currentSelectedProvider;
        if (!this.providerDetails && this.url === 'frontDesk') {
          this.providerDetails = this.providers;
        }
        // this.getImmediateAvailableSlot();
      });
    });

    // -- recieve events from qlist filter form
    this.commonService.$recieveFilterEvent.pipe(takeUntil(this.$destroy), distinctUntilChanged()).subscribe(res => {
      if (!_.isEqual(this.providerDetails, res.data.providerDetails)) {
        this.providerDetails = res.data.providerDetails;
      }
    });
    this.getFromTimeToTime('Extend');
  }

  ngAfterViewInit() {
    this.providerDetails = this.commonService.currentSelectedProvider;
    if (!this.providerDetails && this.url === 'frontDesk') {
      this.providerDetails = this.providers;
    }
    // this.getImmediateAvailableSlot();
  }

  ngOnDestroy() {
    this.$destroy.next();
    this.$destroy.unsubscribe();
  }

  ngOnChanges() {
    this.providerDetails = this.commonService.currentSelectedProvider;
    if (!this.providerDetails && this.url === 'frontDesk') {
      this.providerDetails = this.providers;
    }
    if (this.appointmentSlotOrder) {
      // this.getImmediateAvailableSlot();
    }
  }

  getImmediateAvailableSlot() {
    if (!this.providerDetails) {
      return;
    }
    const reqParams = {
      entityId: this.providerDetails.providerId,
      entityValueId: this.providerDetails.providerValueId,
      serviceId: 0,
      appTypeId: 0,
      sortingType: this.appointmentSlotOrder
    };
    this.queueService.getSingleAppointmentSlotByEntity(reqParams).subscribe(res => {
      this.currentAvailableSlot = res;
      this.currentAvailableSlotInfo = { ...this.currentAvailableSlot };
      const slotinfo = new SlotInfo();
      slotinfo.generateObj(this.currentAvailableSlot);
      this.currentAvailableSlot = slotinfo;
      this.currentAvailableSlot.slotTime = _.clone(this.commonService.convertTime(this.timeFormateKey, this.currentAvailableSlot.slotTime));
    });
  }

  openZeroSlotsPopup(content) {
    this.modalRef = this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      container: '#homeComponent'
    });
    this.modalRef.result.then((res) => {
      if (res === 'success') {
      }
    }, (reason) => {
      this.modalRef.close();
    });
    // this.modalService.open(content, {
    //   ariaLabelledBy: 'modal-basic-title',
    //   backdrop: 'static',
    //   keyboard: false,
    //   container: '#homeComponent'
    // });
  }
  saveZeroSlots() {
    let midNightFlag = false;
    if (this.endTime === 'Mid Night') {
      this.endTime = '12:00 AM';
      midNightFlag = true;
    }
    const ExtendedForTimeDetailId = this.queueService.getScheduleTimeDetailId();
    if (!this.selectedSchedule && ExtendedForTimeDetailId === 0) {
      this.alertMsg = {
        message: 'Please select schedule time',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
      return;
    }

    if (this.selectedModifyType !== 'Modify' && this.selectedModifyType !== 'Add') {
      if (!this.extendeMinute && !this.extendedHours) {
        this.alertMsg = {
          message: 'Please add hour(s) or minute(s)',
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
        return;
      }
      if ((_.isUndefined(this.extendedHours) || (!this.extendedHours)) && !this.extendeMinute) {
        this.alertMsg = {
          message: 'Please add hour(s).',
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
        return;
      }
      if (this.extendeMinute) {
        const defaultTimeperPat = _.find(this.currentUserSchedule, { formId: this.selectedSchedule.formId }).defaultTimeperPat;
        if (+this.extendeMinute % defaultTimeperPat !== 0) {
          this.alertMsg = {
            message: 'Entity Service Time is ' + defaultTimeperPat + ' mins, please enter mins in multipler of that.',
            messageType: 'danger',
            duration: Constants.ALERT_DURATION
          };
          return;
        }
      }

      const requestParams = {
        entity_id: this.commonService.getCurrentSelectedProvider().providerId,
        entity_value_id: this.commonService.getCurrentSelectedProvider().providerValueId,
        ExtendedForTimeDetailId: this.selectedSchedule.formId,
        ExtendedForDate: moment(this.extendHoursDate, ['DD/MM/YYYY']).format('MM/DD/YYYY'),
        hours: this.extendedHours,
        minutes: this.extendeMinute ? this.extendeMinute : +0,
        is_after_Schedule: this.isExtend
      };
      this.queueService.saveZeroSlots(requestParams).subscribe(res => {
        if (res.message === '') {
          this.alertMsg = {
            message: this.selectedModifyType === 'Prepend' ? 'Prepend hour(s) updated successfully.' : 'Extend hour(s) updated successfully.',
            messageType: 'success',
            duration: Constants.ALERT_DURATION
          };
          setTimeout(() => {
            const data = { source: 'reloadSchedules' };
            // this.queueService.sendEventToGetQueueAppSlots(data);
            this.onDateChange(this.extendHoursDate);
            this.commonService.bookAppEvent.next(data);
            this.modalRef.close();
          }, 3000);
        } else {
          const message = (res.message === 'Parameters Missing or Invalid') ? 'Unable to extend hour(s).' : res.message;
          this.overLappingScheduleMessage = res.message === 'Schedule is Overlapping' ? 'Conflicting hour extension with other timing, Please select different time ' : '';
          this.alertMsg = {
            message,
            messageType: 'danger',
            duration: Constants.ALERT_DURATION
          };
        }
      });
    } else {
      if (!this.startTime || !this.endTime) {
        this.alertMsg = {
          message: 'Please select time to update schedule.',
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
        return;
      }
      if (this.selectedModifyType === 'Modify') {
        const requestParams = {
          entity_id: this.commonService.getCurrentSelectedProvider().providerId,
          entity_value_id: this.commonService.getCurrentSelectedProvider().providerValueId,
          time_detail_id: this.selectedSchedule.formId,
          Replace_for_date: moment(this.extendHoursDate, ['DD/MM/YYYY']).format('MM/DD/YYYY'),
          time_from: this.timeFormateKey === '12_hour' ? this.startTime : moment(this.startTime, 'HH:mm').format('hh:mm A'),
          time_to: this.timeFormateKey === '12_hour' ? this.endTime : moment(this.endTime, 'HH:mm').format('hh:mm A'),
        };
        if (midNightFlag) {
          requestParams.time_to = '12:00 AM';
        }
        this.queueService.updateSelectedSchedule(requestParams).subscribe(res => {
          if (res.message === '') {
            this.alertMsg = {
              message: 'Schedule hour(s) Modify successfully.',
              messageType: 'success',
              duration: Constants.ALERT_DURATION
            };
            setTimeout(() => {
              const data = { source: 'reloadSchedules' };
              this.onDateChange(this.extendHoursDate);
              // this.queueService.sendEventToGetQueueAppSlots(data);
              this.commonService.bookAppEvent.next(data);
              this.modalRef.close();
            }, 3000);
          } else {
            const message = (res.message === 'Parameters Missing or Invalid') ? 'Unable to update schedule.' : res.message;
            this.overLappingScheduleMessage = res.message === 'Schedule is Overlapping' ? 'Conflicting hour extension with other timing, Please select different time ' : '';
            this.alertMsg = {
              message,
              messageType: 'danger',
              duration: Constants.ALERT_DURATION
            };
          }
        });
      } else if (this.selectedModifyType === 'Add') {
        const requestParams = {
          entity_id: this.commonService.getCurrentSelectedProvider().providerId,
          entity_value: this.commonService.getCurrentSelectedProvider().providerValueId,
          extended_date: moment(this.extendHoursDate, ['DD/MM/YYYY']).format('MM/DD/YYYY'),
          time_from: this.timeFormateKey === '12_hour' ? this.startTime : moment(this.startTime, 'HH:mm').format('hh:mm A'),
          time_to: this.timeFormateKey === '12_hour' ? this.endTime : moment(this.endTime, 'HH:mm').format('hh:mm A'),
          appt_typeid: this.selectedSchedule.appointmentType.id,
        };
        this.queueService.AddSelectedSchedule(requestParams).subscribe(res => {
          if (res.message === '') {
            this.alertMsg = {
              message: 'Schedule hour(s) Added successfully.',
              messageType: 'success',
              duration: Constants.ALERT_DURATION
            };
            setTimeout(() => {
              const data = { source: 'reloadSchedules' };
              this.onDateChange(this.extendHoursDate);
              // this.queueService.sendEventToGetQueueAppSlots(data);
              this.commonService.bookAppEvent.next(data);
              this.modalRef.close();
            }, 3000);
          } else {
            const message = (res.message === 'Parameters Missing or Invalid') ? 'Unable to update schedule.' : res.message;
            this.overLappingScheduleMessage = res.message === 'Schedule is Overlapping' ? 'Conflicting hour extension with other timing, Please select different time ' : '';
            this.alertMsg = {
              message,
              messageType: 'danger',
              duration: Constants.ALERT_DURATION
            };
          }
        });
      }
    }
  }

  // -- book appointment for slots
  bookAppointment() {
    let appointmentDetails = Object.assign(this.currentAvailableSlotInfo, {
      entity_id: this.url === 'frontDesk' ? this.providers.providerId : this.providerDetails.providerId,
      entity_value_id: this.url === 'frontDesk' ? this.providers.providerValueId : this.providerDetails.providerValueId
    });
    appointmentDetails.slot_details = appointmentDetails;
    const appList = new AppointmentListModel();
    appList.generateObj(appointmentDetails);
    appointmentDetails = appList;
    appointmentDetails.entity_data = appointmentDetails.entity_data[0];
    appointmentDetails.entity_data.date = new Date();

    const modalInstance = this.modalService.open(AppointmentBookComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        size: 'xl',
        windowClass: 'custom-modal',
        container: '#homeComponent'
      });
    modalInstance.componentInstance.patientData = null;
    modalInstance.componentInstance.selectedAppointementData = appointmentDetails;
    modalInstance.componentInstance.slotDetails = this.currentAvailableSlot;
    modalInstance.componentInstance.source = 'queue';

    modalInstance.result.then((res: any) => {
      if (res.bookingData !== null) {
        const data = { source: 'bookAppointment' };
        // this.queueService.sendEventToGetQueueAppSlots(data);
        this.commonService.bookAppEvent.next(data);
        // this.getQueueAppointmentSlots();
      }
    }, () => { });
  }
  getPrintAppointment() {
    // this.getPrintEvent.emit(true);
    this.queueService.sendPrintOrDelayNotificationEvent('printEvent');
  }
  delayNotification() {
    this.queueService.sendPrintOrDelayNotificationEvent('delaynotificationEvent');
  }

  onDateChange($event): void {
    this.noScheduleFound = false;
    this.extendHoursDate = $event;
    const param = {
      entity_id: this.commonService.getCurrentSelectedProvider().providerId,
      entity_data_id: this.commonService.getCurrentSelectedProvider().providerValueId,
      selected_schedule_date: moment(this.extendHoursDate, ['DD/MM/YYYY']).format('MM/DD/YYYY')
    };
    this.entityCommonDataService.getScheduleHistoryDataForProvider(param).subscribe(res => {
      if (res && res.length) {
        const date = this.extendHoursDate;
        this.currentUserSchedule = null;
        const allSchedules = [];
        // const findDt = res.find(u => moment(date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()).isBetween(u.startDate, u.endDate, null, '[]'));
        // if (findDt) {
        //   this.currentUserSchedule = findDt;
        //   if (this.currentUserSchedule.appointmentTypeTimeArray) {
        //     _.map(this.currentUserSchedule.appointmentTypeTimeArray, (t) => {
        //       const checkTodayDay = _.findIndex(t.selectedDays, (v) => {
        //         return (v.isSelected && (v.key === _.toLower(moment().format('ddd'))));
        //       });
        //       if (checkTodayDay !== -1) {
        //         t.startTime = _.clone(this.convertTime(t.startTime));
        //         t.endTime = _.clone(this.convertTime(t.endTime));
        //         scheduleTimeArray.push(t);
        //       }
        //     });
        //     this.queueService.sortByTime(scheduleTimeArray, 'startTime');
        //     this.currentUserSchedule = scheduleTimeArray;
        //   }
        // }
        res.forEach(u => {
          if (moment(moment(date).format('YYYY-MM-DD')).isBetween(moment(u.startDate).format('YYYY-MM-DD'),
            (u.endDate ? moment(u.endDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')), null, '[]')) {
            // const findDt = res.find(u => moment(date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()).isBetween(u.startDate, u.endDate, null, '[]'));
            // if (findDt) {
            this.currentUserSchedule = u;
            if (this.currentUserSchedule.appointmentTypeTimeArray) {
              _.map(this.currentUserSchedule.appointmentTypeTimeArray, (t) => {
                allSchedules.push(t);
              });
            }
          }
        });
        this.queueService.sortByTime(allSchedules, 'startTime');
        const schd = [];
        _.forEach(allSchedules, (schedule) => {
          const checkTodayDay = _.findIndex(schedule.selectedDays, (v) => {
            return (v.isSelected && (v.key === _.toLower(moment(date).format('ddd'))));
          });
          if (checkTodayDay !== -1) {
            schedule.startTime = _.clone(this.convertTime(schedule.startTime));
            schedule.endTime = _.clone(this.convertTime(schedule.endTime));
            schd.push(schedule);
          }
        });
        this.currentUserSchedule = schd;
        this.noScheduleFound = this.currentUserSchedule.length === 0 ? true : false;
      } else {
        this.noScheduleFound = true;
        this.currentUserSchedule = null;
      }
    });
  }

  getFromTimeToTime(type) {
    this.isExtend = type === 'Extend' ? true : false;
    if (type === 'Modify' || type === 'Add') {
      // const serviceTime = this.historyData.basicInfo.appointmentTimeSlot;
      if (this.timeFormateKey === '12_hour') {
        // if (serviceTime === 30 || serviceTime === 90) {
        this.startTimeArray = this.endTimeHoursList = this.entityCommonDataService.createHoursList12HourFormat(true);
        //   } else {
        //     this.startTimeArray = this.entityCommonDataService.createHoursList12HourFormat(false);
        //   }
        this.generateHoursList(this.startTimeArray[0]);
      }
      if (this.timeFormateKey === '24_hour') {
        // if (serviceTime === 30 || serviceTime === 90) {
        this.startTimeArray = this.endTimeHoursList = this.entityCommonDataService.createHoursList24HourFormat(true);
        // } else {
        //   this.startTimeArray = this.entityCommonDataService.createHoursList24HourFormat(false);
        // }
        this.generateHoursList(this.startTimeArray[0]);
      }
    }
  }

  // -- generate end hours against start time
  generateHoursList(startTime) {
    const temp = [];
    // let sTime = startTime;
    this.startTime = startTime;
    this.endTimeList = [];
    const currentDate = moment();
    const timeFormat = this.timeFormateKey === '24_hour' ? 'HH:mm' : 'hh:mm A';
    _.map(this.endTimeHoursList, (o) => {
      const st = moment(moment(currentDate).format('YYYY-MM-DD') + ' ' + startTime);
      const et = moment(moment(currentDate).format('YYYY-MM-DD') + ' ' + o);
      if (moment(et, timeFormat).isAfter(moment(st, timeFormat))) {
        this.endTimeList.push(o);
      }
    });
    this.endTimeList.push('Mid Night');
    // this.endTime = this.endTimeList[0];
    this.getTimeValuesOnChange(this.endTimeList[0]);
    // let sTime = moment(startTime, 'h:mm a');
    // let eTime = moment('10:50:33 AM', 'h:mm a');

    // if (sTime.isBefore(eTime)) {
    //   console.log("Correct. Start Time is below End Time");
    // } else {
    //   console.log("Error. Start Time is more than End Time");
    // }

    // const serviceTime = this.historyData.basicInfo.appointmentTimeSlot;
    // let count = 1;
    // let currentDate = moment();

    // for (let hour = 0; hour < 23; hour++) {
    //   const timeFormat = this.timeFormateKey === '24_hour' ? 'HH:mm' : 'hh:mm A';
    //   const hrs = moment({ hour }).format(timeFormat);
    //   if (moment(hrs, timeFormat).isSameOrAfter(moment(sTime, timeFormat)) && count) {
    //     count = 0;
    //     // for (let st = hour; st < 23; st++) {
    //     const test = () => {
    //       // const endHour = moment(23, ['H']).format(timeFormat);
    //       // moment('24:00', 'h:mm').isSameOrBefore(moment('23', 'H'))
    //  sTime = moment(moment(currentDate).format('YYYY-MM-DD') + ' ' + sTime);
    // const todayEndTime = moment(moment().format('YYYY-MM-DD') + ' ' + '23:59');
    //       if (moment(sTime).isBefore(todayEndTime)) {
    //         // if ( moment(endHour, timeFormat).isSameOrAfter(moment(sTime, timeFormat)) ) {
    //         const t = moment(sTime).add(serviceTime, 'minutes');
    //         const cTtime = moment(t).format(timeFormat);
    //         temp.push(cTtime);
    //         sTime = cTtime;
    //         currentDate = t;
    //         test();
    //       } else {
    //         return;
    //       }
    //     };
    //     test();
    //   }
    // }
    // temp.pop();
    // this.endTimeHoursList = temp;
  }
  getTimeValuesOnChange(eTime) {
    let durationInMinute: number;
    const timeFormat = this.timeFormateKey === '24_hour' ? 'HH:mm' : 'hh:mm A';
    const enTime = moment(eTime, 'HH:mm');
    const sTime = moment(this.startTime, 'HH:mm');
    if (moment(sTime).isBefore(enTime)) {
      const duration = moment.duration(enTime.diff(sTime));
      durationInMinute = +duration.as('minute');
      const defaultTimeperPat = _.find(this.currentUserSchedule, { formId: this.selectedSchedule.formId }).defaultTimeperPat;
      console.log('defaulttime', defaultTimeperPat);
      console.log('reminder', +durationInMinute % defaultTimeperPat);
      const reminderMinute = +durationInMinute % defaultTimeperPat;
      if (reminderMinute > 0) {
        this.endTime = moment(enTime.add(reminderMinute, 'm')).format(timeFormat);
        this.alertMsg = {
          message: 'While modify or add end time will add ' + reminderMinute + ' mins. ' + '(' + this.endTime + ') as end time' + ', to create slot for the schedule',
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
        return;
      }
    }
  }

  convertTime(timeVal) {
    let updateTimeVal = null;
    this.timeFormateKey = this.timeFormateKey ? this.timeFormateKey : JSON.parse(localStorage.getItem('globals')).timeFormat;
    if (this.timeFormateKey === '12_hour' && timeVal) {
      updateTimeVal = moment(moment().format('YYYY-MM-DD') + ' ' + timeVal).format('h:mm A');
    } else if (this.timeFormateKey === '24_hour' && timeVal) {
      updateTimeVal = moment(moment().format('YYYY-MM-DD') + ' ' + timeVal).format('H:mm');
    }
    return updateTimeVal;
  }
  modelChangeEvent(flag) {
    if (flag === 'hours') {
      this.extendeMinute = +0;
    } else if (flag === 'minute') {
      this.extendedHours = +0;
    }
  }

  getCheckInCheckOutStatus() {
    if (this.selectedSchedule.roomMapId) {
      this.queueService.getCheckInCheckOutStatus(this.selectedSchedule.roomMapId, moment().format('MM/DD/YYYY')).subscribe((res: any) => {
        if (res.status_message === 'Success' && res.CheckinStatus) {
          const data = res.CheckinStatus;
          this.checkqlistStatus.checkInStatus = data.is_pause ? 'Pause' : data.is_resume ? 'Resume' : data.is_stop ? 'Stop' : '';
          this.checkqlistStatus.isCheckIn = data.checkin_status;
          this.checkqlistStatus.isCheckOut = data.checkout_status;
        } else {
          this.checkqlistStatus.checkInStatus = '';
          this.checkqlistStatus.isCheckIn = false;
          this.checkqlistStatus.isCheckOut = false;
        }
      });
    }
  }
}
