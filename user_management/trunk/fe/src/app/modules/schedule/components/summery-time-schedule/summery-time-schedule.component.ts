import { ScheduleMakerService } from './../../services/schedule-maker.service';
import { Component, OnInit, Input, Output, EventEmitter, OnChanges, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { EntitityCommonDataService } from '../../services/entitity-common-data.service';
import { Subject, Observable } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationPopupComponent } from 'src/app/components/confirmation-popup/confirmation-popup.component';
import { tickStep } from 'd3';
import { ScheduleEndDateExtendComponent } from '../schedule-end-date-extend/schedule-end-date-extend.component';
import { IAlert } from 'src/app/models/AlertMessage';
import { Constants } from 'src/app/config/constants';
import { CommonService } from "../../../../services/common.service";
import { AuthService } from "../../../../services/auth.service";
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';

@Component({
  selector: 'app-summery-time-schedule',
  templateUrl: './summery-time-schedule.component.html',
  styleUrls: ['./summery-time-schedule.component.scss']
})
export class SummeryTimeScheduleComponent implements OnInit, OnChanges, OnDestroy {
  @Input() scheduleTimeData;
  @Input() showEditButton;
  @Input() index;
  @Input() entityId;
  @Input() providerId;
  @Output() onEditButtonClick = new EventEmitter<any>();
  @Output() onDeleteButtonClick = new EventEmitter<any>();

  lastAppointmentData;
  highlightEditedTime: boolean;
  hideDetailSection: boolean;
  destroy$ = new Subject();
  showDeleteOption: boolean;
  showEndOption: boolean;
  showEditOption: boolean;
  alertMsg: IAlert;
  timeFormatKey = '';
  permissionConstList: any = [];
  constructor(
    private scheduleMakerService: ScheduleMakerService,
    private entitityCommonDataService: EntitityCommonDataService,
    private confirmationModalService: NgbModal,
    private entityCommonDataService: EntitityCommonDataService,
    private commonService: CommonService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    const userId = +this.authService.getLoggedInUserId();
    this.permissionConstList = PermissionsConstants;
    this.lastAppointmentData = null;
    this.highlightEditedTime = false;
    this.showDeleteOption = true;
    this.showEndOption = false;
    this.showEditOption = true;
    this.hideDetailSection = false;
    this.subcriptionOfEvents();
    this.timeFormatKey = this.authService.getUserInfoFromLocalStorage().timeFormat;
  }

  ngOnChanges() {
    if (this.entityId && this.providerId) {
      this.getLastAppointmentSchedule();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  editScheduleData(val, flag, type) {
    if (type === 'add_new') {
      this.addNewTimeSlotSchedule(val, flag, type);
    } else if (type === 'edit_existing') {
      this.deleteAndAddNewTimeSlotSchedule(val, flag, type);
    }
  }

  addNewTimeSlotSchedule(val, flag, type) {
    const data = {
      data: val,
      key: flag,
      typeEdit: type,
      index: this.index,
    };
    this.highlightEditedTime = true;
    this.onEditButtonClick.emit(data);
  }

  checkConfirmation(otherData, messageDetails) {
    const modalInstance = this.confirmationModalService.open(ConfirmationPopupComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false
    });
    modalInstance.result.then((result) => {
      if (result !== 'Ok') {
        return false;
      } else {
        if (otherData.from === 'edit_appointment' || otherData.from === 'edit_schedule_no_app') {
          // call end schedule function
          // this.scheduleEndAfterConfirm().subscribe(res => {
          const data = {
            data: otherData.val,
            key: otherData.flag,
            typeEdit: otherData.type,
            index: this.index
          };
          this.highlightEditedTime = true;
          this.onEditButtonClick.emit(data);
          // });
        } else if (otherData.from === 'end_schedule') {
          // call end schedule function
          this.scheduleEndAfterConfirm(true).subscribe();
        }
      }
    }, (reason) => {
      return false;
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  endSchedule() {
    const messageDetails = {
      modalTitle: 'Confirm',
      modalBody: 'Do you want to <b>End All</b> schedule?'
    };
    const otherData = { from: 'end_schedule' };
    this.checkConfirmation(otherData, messageDetails);
  }

  deleteAndAddNewTimeSlotSchedule(val, flag, type) {
    // check if have last appointment date then end all schedule first
    // then send this data with updating new dates
    if (this.lastAppointmentData) {
      let appdate = moment(moment(this.lastAppointmentData.app_date, 'DD/MM/YYYY').format('YYYY/MM/DD'));
      let endSchDate = moment(moment(appdate).add(1, 'day').format('YYYY/MM/DD'));
      const todayDate = moment(moment().format('YYYY/MM/DD'));
      let appDateMsg = '';
      let endSchDateMsg = '';
      if (appdate.isBefore(moment(moment().format('YYYY/MM/DD')))) {
        endSchDate = moment(moment().format('YYYY/MM/DD'));
      }
      if (appdate.isSameOrBefore(moment(moment().format('YYYY/MM/DD')))) {
        appdate = moment(moment().format('YYYY/MM/DD'));
      }
      if (appdate.isSame(todayDate)) {
        appDateMsg = 'Today';
      } else {
        appDateMsg = moment(appdate).format('DD/MM/YYYY');
      }
      if (endSchDate.isSame(todayDate)) {
        endSchDateMsg = 'Today';
      } else {
        endSchDateMsg = moment(endSchDate).format('DD/MM/YYYY');
      }
      const messageDetails = {
        modalTitle: 'Confirm',
        modalBody: 'All Schedule(s) will end on <b>' + appDateMsg + '</b>, and new Schedule will start from <b>' + endSchDateMsg + '</b>'
      };
      const otherData = { ... { 'flag': flag }, 'val': val, type, 'app_date': this.lastAppointmentData.app_date, from: 'edit_appointment' };
      this.checkConfirmation(otherData, messageDetails);
    } else {
      const messageDetails = {
        modalTitle: 'Confirm',
        modalBody: 'All schedule will end <b>Today</b>, and New Schedule will start from <b>' + moment().add(1, 'day').format('DD/MM/YYYY') + '</b>'
      };
      const otherData = { ... { 'flag': flag }, 'val': val, type, 'app_date': new Date(moment().add(1, 'day').format('YYYY/MM/DD')), from: 'edit_schedule_no_app' };
      this.checkConfirmation(otherData, messageDetails);
    }
  }

  getLastAppointmentSchedule() {
    const param = {
      entity_id: this.entityId,
      entity_data_id: this.providerId
    };
    this.scheduleMakerService.getLastAppointmentData(param).subscribe(res => {
      this.lastAppointmentData = res.Last_Appointment;
      if (this.lastAppointmentData) {
        this.lastAppointmentData.app_date = moment(moment(this.lastAppointmentData.app_date, 'DD/MM/YYYY').format('YYYY/MM/DD'));
        if (this.lastAppointmentData.app_date.isSameOrAfter(moment(this.scheduleTimeData.startDate))) {
          this.showDeleteOption = false;
        }
        if (this.lastAppointmentData.app_date.isSame(moment(this.scheduleTimeData.endDate))) {
          this.showEditOption = false;
        }
        if (!this.scheduleTimeData.endDate && this.lastAppointmentData.app_date.isAfter(moment(this.scheduleTimeData.startDate))) {
          this.showEndOption = true;
        } else if (this.scheduleTimeData.endDate && this.lastAppointmentData.app_date.isSame(moment(this.scheduleTimeData.endDate))) {
          this.showEndOption = false;
        } else if (this.lastAppointmentData.app_date.isBetween(moment(this.scheduleTimeData.startDate), moment(this.scheduleTimeData.endDate), null, '[]')) {
          this.showEndOption = true;
        }
      } else {
        if (moment(this.scheduleTimeData.endDate).isSame(moment(moment().format('YYYY/MM/DD')))) {
          this.showEditOption = false;
        }
        if (!this.scheduleTimeData.endDate && moment(moment().format('YYYY/MM/DD')).isAfter(moment(this.scheduleTimeData.startDate))) {
          this.showEndOption = true;
        } else if (moment(moment().format('YYYY/MM/DD')).isBetween(moment(this.scheduleTimeData.startDate), moment(this.scheduleTimeData.endDate), null, '[]')) {
          this.showEndOption = true;
        }
      }
    });
  }

  deleteScheduleData(data, index, subIndex, key) {
    const emitData = {
      'data': data,
      'index': index,
      'subIndex': subIndex,
      'key': key
    };
    this.onDeleteButtonClick.emit(emitData);
  }

  scheduleEndAfterConfirm(showMsg?): Observable<any> {
    const param = {
      entity_id: this.entityId,
      entity_value_id: this.providerId
    };
    return this.scheduleMakerService.endAllSchedule(param).pipe(map(res => {
      if (res) {
        this.scheduleMakerService.updateAllHistoryData();
        if (showMsg) {
          this.alertMsg = {
            message: 'Schedule End Successfully',
            messageType: 'success',
            duration: Constants.ALERT_DURATION
          };
        }
      }
      return res;
    }));
  }

  extendEndDate(scheduleData) {
    scheduleData.endDate = scheduleData.endDate ? new Date(scheduleData.endDate) : null;
    const messageDetails = {
      modalTitle: 'Extend Schedule',
      modalBody: '',
      scheduleData: scheduleData,
      entity_id: this.entityId,
      entity_value_id: this.providerId
    };
    const modalInstance = this.confirmationModalService.open(ScheduleEndDateExtendComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      container: '#homeComponent'
    });
    modalInstance.result.then((result) => {
      if (result !== 'ok') {
        return false;
      } else {
        // this.alertMsg = {
        //   message: 'End Date Updated',
        //   messageType: 'success',
        //   duration: Constants.ALERT_DURATION
        // };
      }
    }, (reason) => {
      return false;
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  getSelectedDays(array) {
    return _.filter(array, (v) => {
      return v.isSelected === true;
    });
  }

  checkCurrent(sDate, eDate, NewSlotTime) {
    const todayDate = moment(moment().format('YYYY/MM/DD'));
    const dateStart = moment(sDate);
    if (!NewSlotTime) {
      if (eDate) {
        const dateEnd = moment(eDate);
        if (todayDate.isBetween(dateStart, dateEnd, null, '[]')) {
          return true;
        } else {
          return false;
        }
      } else {
        if (dateStart.isAfter(todayDate)) {
          return false;
        } else {
          return true;
        }
      }
    } else {
      return false;
    }
  }

  checkEndDate(sDate, eDate) {
    let stringData = '';
    const todayDate = moment();
    const dateStart = moment(sDate);
    if (todayDate.isSameOrAfter(dateStart)) {
      stringData = 'Till Now';
    } else if (todayDate.isSameOrBefore(dateStart)) {
      stringData = '---';
    }
    return stringData;
  }

  toggelDetailSection() {
    this.hideDetailSection = !this.hideDetailSection;
  }

  subcriptionOfEvents() {
    this.entitityCommonDataService.$subcEnableDisableEditButtonTimeSchedule.pipe(takeUntil(this.destroy$)).subscribe(data => {
      if (data !== this.index) {
        this.showEditButton = true;
      } else {
        this.showEditButton = false;
      }
    });
  }

  getTimeByTimeFormatSetting(time) {
    return this.commonService.convertTime(this.timeFormatKey, time);
  }

}
