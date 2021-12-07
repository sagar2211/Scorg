import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ConfirmationPopupComponent } from './../../../../components/confirmation-popup/confirmation-popup.component';
import { QSlotInfoDummy } from './../../models/q-entity-appointment-details';
import { CallingConfirmComponent } from './../calling-confirm/calling-confirm.component';
import { Component, OnInit, EventEmitter, Output, Input, OnDestroy, OnChanges, AfterViewInit, ViewChild } from '@angular/core';
import { forkJoin, Subject } from 'rxjs';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import * as _ from 'lodash';
import { Router } from '@angular/router';

import { IAlert } from './../../../../models/AlertMessage';
import { Constants } from './../../../../config/constants';
import { CommonService } from 'src/app/services/common.service';
import { EntitityCommonDataService } from 'src/app/modules/schedule/services/entitity-common-data.service';
import { ConfirmationPopupWithInputComponent } from 'src/app/shared/components/confirmation-popup-with-input/confirmation-popup-with-input.component';
import { PauseConfirmationComponent } from './../pause-confirmation/pause-confirmation.component';
import { QueueService } from 'src/app/modules/qms/services/queue.service';
import { ConfirmationPopupDelayNotificationComponent } from './../../../../shared/components/confirmation-popup-delay-notification/confirmation-popup-delay-notification.component';
import { AuthService } from './../../../../services/auth.service';
import { DisplayDataByStatusPipe } from './../../pipes/display-data-by-status.pipe';
import { PermissionsConstants } from './../../../../shared/constants/PermissionsConstants';

@Component({
  selector: 'app-qlist-search',
  templateUrl: './qlist-search.component.html',
  styleUrls: ['./qlist-search.component.scss']
})
export class QlistSearchComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  searchTxt = '';
  userScheduleData: any = null;
  selectedSchedule: any = '';
  scheduleTimeArray = [];
  timeFormateKey = '';
  alertMsg: IAlert;
  isCheckIn = false;
  isCheckOut = false;
  checkInStatus = ''; // Pause,Resume,Stop
  $destroy: Subject<boolean> = new Subject();
  userInfo = null;
  isShowAddBtn: boolean;
  selectedAppointment = null;
  selectRoomIdOfPatient = -1;
  permissions: any;

  @Input() providerDetails: any;
  @Input() isCompLoadFrom: string;
  @Input() public loggedUserProvidersList: Array<any> = [];
  @Input() appointmentSlots: Array<QSlotInfoDummy> = [];
  @Input() frontDeskProviderList: Array<any> = [];

  @Output() public searchTxtValue = new EventEmitter<string>();
  @Output() public isCheckinEvent = new EventEmitter<boolean>();
  @Output() public checkInStatusVal = new EventEmitter<string>();
  @Output() selectedProviderDetails = new EventEmitter<any>();
  // @Output() getPrintFirstChildEvent = new EventEmitter<any>();
  @Output() updateStatus = new EventEmitter<any>();
  @Input() public firstSelectedProvider: any;
  @ViewChild('p', { static: false }) ngbPopover: NgbPopover;
  @ViewChild('qlistAddSectionPopover', { static: false }) public ngbAddSectionPopover: NgbPopover;
  @Output() updateSlot = new EventEmitter();
  constructor(
    private entitityCommonDataService: EntitityCommonDataService,
    private commonService: CommonService,
    private queueService: QueueService,
    private modelService: NgbModal,
    private authService: AuthService,
    private displayDataByStatusPipe: DisplayDataByStatusPipe,
    private router: Router
  ) { }

  ngOnInit() {
    this.isShowAddBtn = this.isCompLoadFrom === 'frontDesk' ? true : false;
    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    const userId = +this.authService.getLoggedInUserId();
    const getTimeFormatKeyFork = this.commonService.getQueueSettings(Constants.timeFormateKey, userId);
    forkJoin([getTimeFormatKeyFork]).subscribe(res => {
      this.timeFormateKey = res[0].time_format_key;
    });
    this.permissions = PermissionsConstants;

    // -- get event from qlist-add-section comp
    this.commonService.$receiveBookAppEvent.subscribe(res => {
      if (res.source === 'reloadSchedules') {
        this.getScheduleTimes();
        // sub.unsubscribe();
      }
    });
    this.queueService.$receiveprintAnddelayNotificationEvent.pipe().subscribe(res => {
      if (res === 'delaynotificationEvent') {
        this.delayNotification();
      }
    });
  }

  ngOnChanges() {
    // this.getScheduleTimes();
  }

  ngOnDestroy() {
    this.$destroy.next();
    this.$destroy.unsubscribe();
    // this.modelService.dismissAll();
  }

  ngAfterViewInit() {
    this.getScheduleTimes();
  }

  getScheduleTimes(): void {
    if (!this.providerDetails) {
      return;
    }
    const reqParams = {
      entity_id: this.providerDetails.providerId,
      entity_data_id: this.providerDetails.providerValueId
    };
    this.entitityCommonDataService.getScheduleHistoryDataForProvider(reqParams).subscribe(res => {
      this.scheduleTimeArray = [];
      if (res.length) {
        const allSchedules = []
        res.forEach(u => {
          if (moment(moment().format('YYYY-MM-DD')).isBetween(moment(u.startDate).format('YYYY-MM-DD'),
            (u.endDate ? moment(u.endDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')), null, '[]')) {
            this.userScheduleData = u;
            if (this.userScheduleData.appointmentTypeTimeArray) {
              // let checkTime = true;
              _.map(this.userScheduleData.appointmentTypeTimeArray, (t) => {
                allSchedules.push(t);
                // const checkTodayDay = _.findIndex(t.selectedDays, (v) => {
                //   return (v.isSelected && (v.key === _.toLower(moment().format('ddd'))));
                // });
                // if (checkTodayDay !== -1) {
                //   t.startTime = _.clone(this.convertTime(t.startTime));
                //   t.endTime = _.clone(this.convertTime(t.endTime));
                //   this.scheduleTimeArray.push(t);
                //   // const curtime = moment();
                //   // const sTime = moment(moment().format('YYYY-MM-DD') + ' ' + t.startTime);
                //   // const eTime = moment(moment().format('YYYY-MM-DD') + ' ' + t.endTime);
                //   // if (curtime.isBetween(sTime, eTime, null, '()') && checkTime) {
                //   //   this.selectedSchedule = 'all';
                //   //   checkTime = false;
                //   // }
                //   this.selectedSchedule = 'all';
                // }
              });


              // this.queueService.setCurrentSchedules(this.scheduleTimeArray);
              // if (checkTime) {
              //   this.getNearByslot();
              // } else {
              // this.onSelectSchedule();
              // }
              // this.onSelectSchedule();
            }
          }
        });
        this.queueService.sortByTime(allSchedules, 'startTime');
        // allSchedules.sort((a, b) => {
        //   const first: any = new Date('1970/01/01 ' + a.TimeDetail_Starttime);
        //   const second: any = new Date('1970/01/01 ' + b.TimeDetail_Starttime);
        //   const diff: any = first - second;
        //   return diff;
        // });
        _.forEach(allSchedules, (schedule) => {
          const checkTodayDay = _.findIndex(schedule.selectedDays, (v) => {
            return (v.isSelected && (v.key === _.toLower(moment().format('ddd'))));
          });
          if (checkTodayDay !== -1) {
            schedule.startTime = _.clone(this.convertTime(schedule.startTime));
            schedule.endTime = _.clone(this.convertTime(schedule.endTime));
            this.scheduleTimeArray.push(schedule);
            // const curtime = moment();
            // const sTime = moment(moment().format('YYYY-MM-DD') + ' ' + t.startTime);
            // const eTime = moment(moment().format('YYYY-MM-DD') + ' ' + t.endTime);
            // if (curtime.isBetween(sTime, eTime, null, '()') && checkTime) {
            //   this.selectedSchedule = 'all';
            //   checkTime = false;
            // }
            this.selectedSchedule = 'all';
          }
        });

        // const findDt = res.find(u => moment(moment().format('YYYY-MM-DD')).isBetween(moment(u.startDate).format('YYYY-MM-DD'),
        //   (u.endDate ? moment(u.endDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')), null, '[]'));
        // if (findDt) {
        //   this.userScheduleData = findDt;
        //   if (this.userScheduleData.appointmentTypeTimeArray) {
        //     let checkTime = true;
        //     _.map(this.userScheduleData.appointmentTypeTimeArray, (t) => {
        //       const checkTodayDay = _.findIndex(t.selectedDays, (v) => {
        //         return (v.isSelected && (v.key === _.toLower(moment().format('ddd'))));
        //       });
        //       if (checkTodayDay !== -1) {
        //         t.startTime = _.clone(this.convertTime(t.startTime));
        //         t.endTime = _.clone(this.convertTime(t.endTime));
        //         this.scheduleTimeArray.push(t);
        //         // const curtime = moment();
        //         // const sTime = moment(moment().format('YYYY-MM-DD') + ' ' + t.startTime);
        //         // const eTime = moment(moment().format('YYYY-MM-DD') + ' ' + t.endTime);
        //         // if (curtime.isBetween(sTime, eTime, null, '()') && checkTime) {
        //         //   this.selectedSchedule = 'all';
        //         //   checkTime = false;
        //         // }
        //         this.selectedSchedule = 'all';
        //       }
        //     });
        //     this.queueService.setCurrentSchedules(this.scheduleTimeArray);
        //     // if (checkTime) {
        //     //   this.getNearByslot();
        //     // } else {
        //     //this.onSelectSchedule();
        //     // }
        //     this.onSelectSchedule();
        //   }
        // }
        this.queueService.setCurrentSchedules(this.scheduleTimeArray);
        this.onSelectSchedule();
      } else {
        this.alertMsg = {
          message: 'No Schedules found....',
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
        this.userScheduleData = null;
        this.selectedSchedule = 'all';
      }
    });
  }

  convertTime(timeVal) {
    let updateTimeVal = null;
    this.timeFormateKey = this.timeFormateKey ? this.timeFormateKey : JSON.parse(localStorage.getItem('globals')).timeFormat;
    if (this.timeFormateKey === '12_hour' && timeVal) {
      updateTimeVal = moment(moment().format('YYYY-MM-DD') + ' ' + timeVal).format('h:mm A');
    } else if (this.timeFormateKey === '24_hour' && timeVal) {
      updateTimeVal = moment(moment().format('YYYY-MM-DD') + ' ' + timeVal).format('HH:mm');
    }
    return updateTimeVal;
  }

  onSelectSchedule() {
    if (this.selectedSchedule) {
      this.getCheckInCheckOutStatus();
      this.queueService.setScheduleTimeDetailId(this.selectedSchedule.formId);
      if (this.selectedSchedule === 'all') {
        this.updateSlot.next(this.selectedSchedule);
      } else {
        this.updateSlot.next({ ...this.selectedSchedule });
      }
    } else {
      this.queueService.setScheduleTimeDetailId(0);
      this.updateSlot.next({ ...this.selectedSchedule });

    }
  }

  getCheckInCheckOutStatus() {
    if (this.selectedSchedule.roomMapId) {
      this.queueService.getCheckInCheckOutStatus(this.selectedSchedule.roomMapId, moment().format('MM/DD/YYYY')).subscribe((res: any) => {
        if (res.status_message === 'Success' && res.CheckinStatus) {
          const data = res.CheckinStatus;
          this.checkInStatus = data.is_pause ? 'Pause' : data.is_resume ? 'Resume' : data.is_stop ? 'Stop' : '';
          this.isCheckIn = data.checkin_status;
          this.isCheckOut = data.checkout_status;
          this.commonService.checkInStatus.next(this.checkInStatus);
        } else {
          this.checkInStatus = '';
          this.isCheckIn = false;
          this.isCheckOut = false;
          this.commonService.checkInStatus.next(this.checkInStatus);
        }
        this.doUpdateStatus();
      });
    } else if (this.selectedSchedule !== 'all') {
      this.alertMsg = {
        message: 'Please map room for this schedule',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
    }
  }

  // getNearByslot() {
  //   _.map(this.userScheduleData.appointmentTypeTimeArray, (t) => {
  //     const checkTodayDay = _.findIndex(t.selectedDays, (v) => {
  //       return (v.isSelected && (v.key === _.toLower(moment().format('ddd'))));
  //     });
  //     if (checkTodayDay !== -1) {
  //       const curtime = moment();
  //       const sTime = moment(moment().format('YYYY-MM-DD') + ' ' + t.startTime);
  //       const eTime = moment(moment().format('YYYY-MM-DD') + ' ' + t.endTime);
  //       const pastTimeAry = [];
  //       const futureTimeAry = [];
  //       if (curtime.isSameOrBefore(sTime)) {
  //         pastTimeAry.push(t);
  //       } else if (curtime.isSameOrAfter(eTime)) {
  //         futureTimeAry.push(t);
  //       }
  //       if (futureTimeAry.length > 0) {
  //         this.selectedSchedule = futureTimeAry[0];
  //       } else if (pastTimeAry.length > 0) {
  //         this.selectedSchedule = pastTimeAry[pastTimeAry.length - 1];
  //       }
  //       this.onSelectSchedule();
  //     }
  //   });
  // }

  checknInDoctor(): void {
    this.queueService.checknInDoctor(this.selectedSchedule.roomMapId).subscribe((res: any) => {
      if (res.status_message === 'Success' && res.id) {
        this.isCheckIn = true;
        this.isCheckOut = false;
        this.checkInStatus = 'Resume'; // Pause,Resume,Stop
        this.alertMsg = {
          message: res.message,
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
      } else {
        this.alertMsg = {
          message: res.message,
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
      }
      this.doUpdateStatus();
    });
  }

  checkOutDoctor(): void {
    if (this.selectedSchedule.roomMapId) {

      const modalTitleobj = 'Check Out';
      const modalBodyobj = 'Do you want to check out for ' + this.selectedSchedule.startTime + ' - ' + this.selectedSchedule.endTime + ' schedule?';
      const messageDetails = {
        modalTitle: modalTitleobj,
        modalBody: modalBodyobj
      };
      const modalInstanceOnCheckOut = this.modelService.open(ConfirmationPopupComponent,
        {
          ariaLabelledBy: 'modal-basic-title',
          backdrop: 'static',
          keyboard: false
        });
      modalInstanceOnCheckOut.result.then((result) => {
        if (result === 'Ok') {
          this.queueService.checkOutDoctor(this.selectedSchedule.roomMapId).subscribe((res: any) => {
            if (res.status_message === 'Success') {
              this.isCheckIn = false;
              this.isCheckOut = true;
              this.checkInStatus = ''; // Pause,Resume,Stop
              this.alertMsg = {
                message: 'Doctor checkout successfully',
                messageType: 'success',
                duration: Constants.ALERT_DURATION
              };
            } else {
              this.isCheckIn = false;
              this.isCheckOut = true;
              this.checkInStatus = ''; // Pause,Resume,Stop
              this.alertMsg = {
                message: res.message,
                messageType: 'danger',
                duration: Constants.ALERT_DURATION
              };
            }
            this.doUpdateStatus();
          });
        }
      });
      modalInstanceOnCheckOut.componentInstance.messageDetails = messageDetails;
    }
  }

  // -- Open popup model
  pause(): void {
    const modalInstance = this.modelService.open(PauseConfirmationComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        container: '#homeComponent'
      });
    modalInstance.componentInstance.selectedSchedule = this.selectedSchedule;
    modalInstance.result.then((res: any) => {
      this.checkInStatus = res.checkInStatus;
      this.alertMsg = {
        message: res.message,
        messageType: 'success',
        duration: Constants.ALERT_DURATION
      };
    }, (res) => {
      if (!res) {
        return;
      }
      // this.checkInStatus = res.checkInStatus;
      this.alertMsg = {
        message: res.message,
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
    });
  }

  updateCheckInStatus(status) {
    if (status === 'Stop') {
      const filteredAppList = this.displayDataByStatusPipe.transform(this.appointmentSlots, true, ['INCONSULTATION'], true);
      let isDoneOpdCheck = false;
      if (filteredAppList.length !== 0) {
        isDoneOpdCheck = true;
      }
      const modalInstance = this.modelService.open(ConfirmationPopupWithInputComponent,
        {
          ariaLabelledBy: 'modal-basic-title',
          backdrop: 'static',
          keyboard: false,
          windowClass: 'custom-modal'
        });
      modalInstance.componentInstance.messageDetails = {
        modalTitle: 'Do you want to Stop',
        modalBody: 'All Appointments will be cancelled',
        isDoneOpdCheck
      };
      modalInstance.result.then((res1: any) => {

      }, (reason) => {
        if (reason.popupVal === 'ok') {
          if (reason.doneOpdCheck) {
            // tslint:disable-next-line: prefer-for-of
            for (let i = 0; i < filteredAppList.length; i++) {
              this.updateAppointentStatus(filteredAppList[i], 5, null);
            }
          }
          this.saveCheckInStatus(status, reason.smsCheck, reason.smsMsg);
        }
      });
    } else {
      this.saveCheckInStatus(status);
    }
  }

  saveCheckInStatus(status, smsCheck?: boolean, smsMsg?: string) {
    const reqParams = {
      room_mapping_id: this.selectedSchedule.roomMapId,
      staus: status,
      pause_time: 0,
      stop_reason: smsMsg ? smsMsg : '',
      isSendStopNotification: smsCheck ? smsCheck : false
    };
    this.queueService.saveCheckInCheckOutStatus(reqParams).subscribe((res: any) => {
      this.checkInStatus = status;
      if (res.status_message === 'Success') {
        this.alertMsg = {
          message: res.message,
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
      } else {
        this.alertMsg = {
          message: res.message,
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
      }
      this.checkInStatusVal.next(this.checkInStatus);
      // this.checkInStatusVal.unsubscribe();
    });
  }

  toggleqList() {
    if (this.ngbAddSectionPopover.isOpen()) {
      this.ngbAddSectionPopover.close();
    } else {
      this.ngbAddSectionPopover.open();
    }
  }

  redirectToAppointmentBooking() {
    // this.router.navigate(['app/qms/appointments/quickbookappointment',
    //   this.providerDetails.providerId,
    //   this.providerDetails.providerValueId]);
    this.commonService.eventFromQlistForFdUser();
  }

  doUpdateStatus(): void {
    this.isCheckinEvent.next(this.isCheckIn = this.isCheckIn ? this.isCheckOut ? false : this.isCheckIn : this.isCheckIn);
    this.checkInStatusVal.next(this.checkInStatus);
    // this.checkInStatusVal.unsubscribe();
    this.commonService.setqListStatus({ checkInStatus: this.checkInStatus, isCheckIn: this.isCheckIn, isCheckOut: this.isCheckOut });
  }

  delayNotification(): void {
    const modalInstanceDelayNotification = this.modelService.open(ConfirmationPopupDelayNotificationComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        windowClass: 'custom-modal',
        container: '#homeComponent'
      });
    modalInstanceDelayNotification.componentInstance.selectedScheduleData = this.selectedSchedule;
    modalInstanceDelayNotification.componentInstance.messageDetails = {
      modalTitle: 'Send Delay notification',
      modalBody: '',
      providerDetails: this.providerDetails,
    };
    modalInstanceDelayNotification.result.then((res1: any) => {
    }, (reason) => {
      if (reason.popupVal === 'ok') {
        const reqParams = {
          room_map_id: reason.roomMapingId,
          date: moment(reason.delayDate).format('MM/DD/YYYY'),
          late_minute: reason.minutes,
          remarks: reason.smsMsg,
          notes: '',
          is_active: true
        };
        this.queueService.saveDelayNotification(reqParams).subscribe(res => {
          if (res.status_message === 'Success') {
            this.alertMsg = {
              message: 'SMS sent successfully!',
              messageType: 'success',
              duration: Constants.ALERT_DURATION
            };
          } else {
            this.alertMsg = {
              message: 'Something went wrong!',
              messageType: 'danger',
              duration: Constants.ALERT_DURATION
            };
          }
        });
      }
    });
  }

  currentSelectedEntity($event): void {
    this.providerDetails = $event;
    this.selectedProviderDetails.emit($event);
    this.getScheduleTimes();
  }

  openCallingPopup(): void {
    let list = [];
    let queueList = [];
    const appList = this.displayDataByStatusPipe.transform(this.appointmentSlots, true, ['INCONSULTATION', 'CALLING'], true);
    const queueAppointments = this.displayDataByStatusPipe.transform(this.appointmentSlots, true, ['NEXT'], true);
    if (!appList.length && queueAppointments.length) {
      this.updateAppointentStatus(queueAppointments[0], 2, queueAppointments[0].roomDetails[0].roomId);
      return;
    } else {
      list = appList;
      queueList = queueAppointments;
    }

    const modalInstance = this.modelService.open(CallingConfirmComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        container: '#homeComponent'
      });
    (modalInstance.componentInstance as CallingConfirmComponent).appointmentSlots = list;
    // (modalInstance.componentInstance as CallingConfirmComponent).queueList = queueList;
    (modalInstance.componentInstance as CallingConfirmComponent).callingLimit = Constants.CALLING_LIMIT;
    (modalInstance.componentInstance as CallingConfirmComponent).selectedAppointment = this.selectedAppointment;
    (modalInstance.componentInstance as CallingConfirmComponent).selectRoomIdOfPatient = this.selectRoomIdOfPatient;
    (modalInstance.componentInstance as CallingConfirmComponent).updateStatusEvent.subscribe(res => {
      this.updateAppointentStatus(res.item, res.status, res.roomId, res.isSkip);
    });
  }

  updateAppointentStatus(slot, status, roomId?, isSkip?): void {
    if (+status === 2) {
      this.updateStatus.next({ slot, status, roomId });
    } else {
      this.updateStatus.next({ slot, status, roomId, isSkip });
    }
  }

  // -- click on nbgPopover
  onPopover(): void {
    const isOpen = this.findNextQueueAppointment();
    if (isOpen) {
    } else {
      if (this.selectedAppointment.roomDetails.length) {
        if (this.selectedAppointment.roomDetails.length === 1) {
          this.updateAppointentStatus(this.selectedAppointment, 2, this.selectedAppointment.roomDetails[0].roomId);
        } else {
          if (this.ngbPopover.isOpen()) {
            this.ngbPopover.close();
          } else {
            this.ngbPopover.open();
          }
        }
      } else {
        this.alertMsg = {
          message: 'No Rooms available',
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
      }
    }
  }

  findNextQueueAppointment(): boolean {
    let isOpenModal = false;
    const appList = this.displayDataByStatusPipe.transform(this.appointmentSlots, true, ['INCONSULTATION', 'CALLING'], true);
    const queueAppointments = this.displayDataByStatusPipe.transform(this.appointmentSlots, true, ['NEXT'], true);
    if (!appList.length && queueAppointments.length) {
      this.selectedAppointment = queueAppointments.length ? queueAppointments[0] : null;
      isOpenModal = false;
    } else {
      this.selectedAppointment = queueAppointments.length ? queueAppointments[0] : null;
      if (this.ngbPopover.isOpen()) {
        this.ngbPopover.close();
      } else {
        if (this.selectedAppointment) {
          this.ngbPopover.open();
        }
      }
      isOpenModal = true;
    }
    return isOpenModal;
  }

  onRoomSelect(roomId): void {
    this.selectRoomIdOfPatient = roomId;
    this.openCallingPopup();
  }

  // getPrintAppointment() {
  //   this.getPrintFirstChildEvent.emit(true);
  // }
}
