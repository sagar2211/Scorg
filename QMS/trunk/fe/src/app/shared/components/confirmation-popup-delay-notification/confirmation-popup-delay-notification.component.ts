import { IAlert } from './../../../models/AlertMessage';
import { EntitityCommonDataService } from './../../../modules/schedule/services/entitity-common-data.service';
import { forkJoin, Observable } from 'rxjs';
import { Constants } from './../../../config/constants';
import { CommonService } from './../../../services/common.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit, Input } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';
import { map } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { QueueService } from 'src/app/modules/qms/services/queue.service';

@Component({
  selector: 'app-confirmation-popup-delay-notification',
  templateUrl: './confirmation-popup-delay-notification.component.html',
  styleUrls: ['./confirmation-popup-delay-notification.component.scss']
})
export class ConfirmationPopupDelayNotificationComponent implements OnInit {

  @Input() messageDetails: any;
  @Input() selectedScheduleData: any;

  minDate = new Date();
  startDate = new Date();
  sendSmsConfirmation: boolean;
  messageText: boolean;
  confirmationMsg: string;
  selectedSchedule: any = '';
  scheduleTimeArray = [];
  timeFormateKey = '';
  providerDetails: any;
  userScheduleData: any = null;
  alertMsg: IAlert;
  delayMinutes: number;
  isSelectedScheduleValid = true;
  historyData = null;
  isShowDelayHistoryActive = false;
  historyButton = 'Show History';
  isCheckedIn = false;
  constructor(
    public modal: NgbActiveModal,
    private commonService: CommonService,
    private entitityCommonDataService: EntitityCommonDataService,
    private authService: AuthService,
    private queueService: QueueService
  ) { }

  ngOnInit() {
    this.messageText = false;
    this.sendSmsConfirmation = true;
    this.confirmationMsg = null;
    this.providerDetails = this.messageDetails.providerDetails;
    const userId = +this.authService.getLoggedInUserId();
    this.timeFormateKey = this.authService.getUserInfoFromLocalStorage().timeFormat;
    this.getScheduleTimes().subscribe(res => {
      if (this.selectedScheduleData) {
        const indx = this.scheduleTimeArray.findIndex(r => r.formId === this.selectedScheduleData.formId);
        if (indx !== -1) {
          this.selectedSchedule = this.scheduleTimeArray[indx];
        } else {
          this.selectedSchedule = 'all';
        }
      } else {
        this.selectedSchedule = 'all';
      }
    });
  }

  dismissModel(check: string): void {
    if (this.sendSmsConfirmation && !this.confirmationMsg && check === 'ok') {
      this.messageText = true;
      return;
    }
    const sendData = {
      entity_id: this.providerDetails.providerId,
      entity_value_id: this.providerDetails.providerValueId,
      timeDetailId: this.selectedSchedule.formId,
      smsCheck: this.sendSmsConfirmation,
      smsMsg: this.confirmationMsg,
      popupVal: check ? check : 'ok',
      minutes: this.delayMinutes,
      // roomMapingId: this.selectedSchedule.roomMapId,
      delayDate: moment(this.startDate).format('MM/DD/YYYY')
    };
    this.modal.dismiss(sendData);
  }

  getScheduleTimes(): Observable<any> {
    const reqParams = {
      entity_id: this.providerDetails.providerId,
      entity_data_id: this.providerDetails.providerValueId
    };
    return this.entitityCommonDataService.getScheduleForDelayNotification(reqParams).pipe(map(res => {
      if (res.length) {
        res.forEach(el => {
          if (el.endDate === null) { el.endDate = new Date(); }
        });
        let date = new Date();
        const findDt = res.find(u => moment(date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()).isBetween(u.startDate, u.endDate, null, '[]'));
        if (findDt) {
          this.userScheduleData = findDt;
          if (this.userScheduleData.appointmentTypeTimeArray) {
            _.map(this.userScheduleData.appointmentTypeTimeArray, (t) => {
              const checkTodayDay = _.findIndex(t.selectedDays, (v) => {
                return (v.isSelected && (v.key === _.toLower(moment().format('ddd'))));
              });
              if (checkTodayDay !== -1) {
                t.startTime = _.clone(this.convertTime(t.startTime));
                t.endTime = _.clone(this.convertTime(t.endTime));
                this.scheduleTimeArray.push(t);
              }
            });
            this.queueService.sortByTime(this.scheduleTimeArray, 'startTime');

          }
        }
      } else {
        this.alertMsg = {
          message: 'No Schedules found....',
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
        this.userScheduleData = null;
      }
      return res;
    }));
  }


  convertTime(timeVal) {
    let updateTimeVal = null;
    if (this.timeFormateKey === '12_hour' && timeVal) {
      updateTimeVal = moment(moment().format('YYYY-MM-DD') + ' ' + timeVal).format('h:mm A');
    } else if (this.timeFormateKey === '24_hour' && timeVal) {
      updateTimeVal = moment(moment().format('YYYY-MM-DD') + ' ' + timeVal).format('H:mm');
    }
    return updateTimeVal;
  }

  onSlotChange() {
    // if (this.selectedSchedule.roomMapId === 0) {
    //   this.alertMsg = {
    //     message: 'No room is mapped with the entity....',
    //     messageType: 'warning',
    //     duration: Constants.ALERT_DURATION
    //   };
    //   return;
    // }
    this.isSelectedScheduleValid = this.selectedSchedule === 'all' ? false : true;
    if (this.isSelectedScheduleValid) {
      const date = moment(this.startDate).format('MM/DD/YYYY');
      this.queueService.getCheckInCheckOutStatus(this.selectedSchedule.roomMapId, date).subscribe(res => {
        if (res.CheckinStatus !== null) {
          this.isCheckedIn = true;
          if (res.CheckinStatus.checkin_status && !res.CheckinStatus.checkout_status) {
            this.alertMsg = {
              message: 'User Already Checked In for Selected Time',
              messageType: 'danger',
              duration: Constants.ALERT_DURATION
            }
          } else {
            this.alertMsg = {
              message: 'User Already Checked Out for Selected Time',
              messageType: 'danger',
              duration: Constants.ALERT_DURATION
            }
          }
        } else {
          this.isCheckedIn = false;
        }
      });

    }
  }

  onDateChange($event): void {
    this.startDate = $event;
  }

  getDelayedHistoryForToday() {
    const param = {
      entity_id: this.providerDetails.providerId,
      entity_value_id: this.providerDetails.providerValueId,
      date: moment(this.startDate).format('MM/DD/YYYY'),
      time_detail_id: this.selectedSchedule !== 'all' ? this.selectedSchedule.formId : 0
    };
    this.queueService.getDelayedHistoryForToday(param).subscribe(response => {
      this.historyData = response;
      this.showDelayHistory();
    });

  }
  showDelayHistory() {
    this.isShowDelayHistoryActive = !this.isShowDelayHistoryActive;
    if (this.isShowDelayHistoryActive) {
      this.historyButton = 'Back';
    } else {
      this.historyButton = 'Show History';
    }
  }
}
