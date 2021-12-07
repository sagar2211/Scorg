import { ActivatedRoute, Router } from '@angular/router';
import { Constants } from './../../../config/constants';
import { IAlert } from './../../../models/AlertMessage';
import { QueueService } from './../../../modules/qms/services/queue.service';
import { EntitityCommonDataService } from './../../../modules/schedule/services/entitity-common-data.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonService } from './../../../services/common.service';
import { AuthService } from 'src/app/services/auth.service';
import * as moment from 'moment';
import { takeUntil, map, distinctUntilChanged } from 'rxjs/operators';
import { Observable, forkJoin } from 'rxjs';
import * as _ from 'lodash';

@Component({
  selector: 'app-bulk-filter',
  templateUrl: './bulk-filter.component.html',
  styleUrls: ['./bulk-filter.component.scss']
})
export class BulkFilterComponent implements OnInit {
  minDate: Date;
  startDate = new Date();
  userInfo: any = null;
  providerDetails = null;
  userScheduleData: any = null;
  selectedSchedule: any = '';
  timeFormateKey = '';
  oldDate: Date;
  loadAppData: boolean;
  alertMsg: IAlert;
  repeatCalling: number;
  appointmentSlotOrder: string;
  displayType: string;
  isShowSlot = false;
  scheduleTimeArray = [];
  selectedDate = new Date();
  @Input() url: string;
  @Input() public selectedUserFromFrontDeskToList: any;
  @Input() public isFromFrontDesk = false;
  @Output() public getfilterDate = new EventEmitter<any>();
  constructor(
    private authService: AuthService,
    private commonService: CommonService,
    private entitityCommonDataService: EntitityCommonDataService,
    private queueService: QueueService,
    private route: ActivatedRoute,
    public router: Router,
  ) { }

  ngOnInit() {
    this.minDate = new Date();
    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    if (this.url === 'fduserappointmentsList') {
      this.providerDetails = this.commonService.getCurrentSelectedProvider();
      this.currentSelectedEntity(this.providerDetails);
    }
  }

  onDateChange($event): void {
    this.startDate = $event;
    this.getfilterDate.emit(this.startDate);
    this.loadAppData = moment(moment(this.startDate).format('YYYY-MM-DD')).isSame(moment(this.oldDate).format('YYYY-MM-DD')) ? false : true;
    this.sendEventToQlist();
    this.saveFilterSetting();
    this.scheduleTimeArray = [];
    this.selectedDate = _.cloneDeep($event);
    this.getScheduleTimes().subscribe();
  }

  onSlotChange(): void {
    this.loadAppData = true;
    this.sendEventToQlist();
    this.saveFilterSetting();
  }

  currentSelectedEntity($event): void {
    const res = this.commonService.manageAppointmentFilterData;
    if (res && _.isEqual(this.providerDetails, $event)) {
      this.scheduleTimeArray = res.scheduleTimeArray;
      this.userScheduleData = res.userScheduleData;
      this.selectedSchedule = res.selectedSchedule === 'all' ? res.selectedSchedule : _.find(res.scheduleTimeArray, { formId: res.selectedSchedule.formId });
      this.providerDetails = $event;
      this.startDate = res.startDate;
      this.sendEventToQlist();
    } else {
      this.providerDetails = $event;
      const userId = +this.authService.getLoggedInUserId();
      this.selectedSchedule = 'all';
      this.timeFormateKey = this.authService.getUserInfoFromLocalStorage().timeFormat;
      this.scheduleTimeArray = [];
      this.getScheduleTimes().subscribe();
      this.sendEventToQlist();
    }
    this.saveFilterSetting();
  }

  sendEventToQlist() {
    const data = {
      providerDetails: this.providerDetails,
      startDate: this.startDate,
      isLoad: this.loadAppData,
      selectedSlot: this.selectedSchedule
    };
    if (this.providerDetails || !(moment(moment(this.startDate).format('YYYY-MM-DD')).isSame(moment(this.oldDate).format('YYYY-MM-DD')))) {
      this.oldDate = this.startDate;
      this.commonService.sendFilterEvent.next({
        isFrom: this.url,
        data
      });
    }
  }

  getScheduleTimes(): Observable<any> {
    const reqParams = {
      entity_id: this.providerDetails.providerId,
      entity_data_id: this.providerDetails.providerValueId,
      selected_schedule_date: moment(this.selectedDate).format('MM/DD/YYYY')
    };
    return this.entitityCommonDataService.getScheduleHistoryDataForProvider(reqParams).pipe(map(res => {
      if (res.length) {

        res.forEach(u => {
          if (moment(moment().format('YYYY-MM-DD')).isBetween(moment(u.startDate).format('YYYY-MM-DD'),
            (u.endDate ? moment(u.endDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')), null, '[]')) {
            this.userScheduleData = u;
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
            }
          }
        });
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

  saveFilterSetting() {
    const tempObj = {
      selectedSchedule: this.selectedSchedule,
      // providerDetails: this.providerDetails,
      userScheduleData: this.userScheduleData,
      scheduleTimeArray: this.scheduleTimeArray,
      startDate: this.startDate
    };
    this.commonService.manageAppointmentFilterData = tempObj;
    // this.commonService.SaveQueueSettings(this.settingKey, JSON.stringify(tempObj), this.providerDetails.providerValueId).subscribe();
  }
  clearFilterSetting() {
    this.selectedSchedule = 'all';
    this.startDate = new Date();
    this.sendEventToQlist();
    this.saveFilterSetting();
    const tempObj = {
      selectedSchedule: this.selectedSchedule,
      providerDetails: this.providerDetails,
      userScheduleData: this.userScheduleData,
      scheduleTimeArray: this.scheduleTimeArray,
      startDate: this.startDate
    };
    this.commonService.manageAppointmentFilterData = tempObj;
    // this.commonService.SaveQueueSettings(this.settingKey, JSON.stringify(tempObj), this.providerDetails.providerValueId).subscribe();
  }
}
