import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, forkJoin, of } from 'rxjs';
import { takeUntil, map, distinctUntilChanged } from 'rxjs/operators';
import * as moment from 'moment';
import * as _ from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueueService } from './../../services/queue.service';
import { AuthService } from './../../../../services/auth.service';
import { SlotInfo } from 'src/app/modules/appointment/models/slot-info.model';
import { Constants } from './../../../../config/constants';
import { IAlert } from './../../../../models/AlertMessage';
import { CommonService } from '../../../../services/common.service';
import { ConfirmationPopupComponent } from 'src/app/components/confirmation-popup/confirmation-popup.component';
import { DisplayDataByStatusPipe } from './../../pipes/display-data-by-status.pipe';
import { QAppointmentDetails, QSlotInfo, QAppointments, QSlotInfoDummy } from '../../models/q-entity-appointment-details';
import { AppointmentPrint } from '../../models/appointment-print.mode';
import { environment } from './../../../../../environments/environment';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { NgxPermissionsService } from 'ngx-permissions';

@Component({
  selector: 'app-qlist',
  templateUrl: './qlist.component.html',
  styleUrls: ['./qlist.component.scss'],
  providers: [DisplayDataByStatusPipe]
})
export class QListComponent implements OnInit, OnDestroy {

  // -- number or string
  startDate: Date;
  userId: number;
  skipTime = 10; // in min
  repeatCallingCount: number;
  isShowSlot = false;
  selectAll = false;
  showFilterMenus = false;
  appointmentSearch = '';
  isFilterSectionShow = false;
  displayType = 'grid';
  timeFormateKey = '';
  isCheckin = false;
  checkInStatus: string;
  isShowConfirmedOnly = false;
  // -- Array or objects
  alertMsg: IAlert;
  qSlotList: Array<QSlotInfoDummy> = [];
  masterQSlotList: Array<QSlotInfo> = [];
  skippedPatientsList: Array<QSlotInfoDummy> = [];
  appointmentSlots: Array<SlotInfo> = [];
  userInfo: any = null;
  currentAvailableSlot: SlotInfo = null;
  currentAvailableSlotInfo: any;
  providerDetails = null;
  loggedUserProvidersList = [];
  printData = null;
  // -- obserbales
  $destroy: Subject<boolean> = new Subject();
  qStatusList: Array<{ id: number, name: string }> = [];
  permissions: any;
  qSlotListClone: Array<QSlotInfoDummy> = [];
  selectedSchedule: any = '';
  PermissionsConstantsList: any = [];

  appointmentsCntStatus = {
    totalApptCount: 0,
    newPatientCnt: 0,
    followupPatientCnt: 0,
    inQueueCnt: 0,
    skippCnt: 0,
    completedCnt: 0,
    inConsultationCnt: 0
  };



  // @Input() isLoadFromDom: boolean;
  @Input() isCompLoadFrom: string;
  @Input() displayTypeValue: string;
  @Input() isShowEmptySlot: boolean;
  @Input() getQSlotList: Array<any>;
  @Input() getProviderDetails: any;
  @Input() frontDeskProviderList: any = [];
  @Input() filter: any = [];


  @Output() updateCount = new EventEmitter<any>();

  environment: any;
  @ViewChild('qmsLibTemplateRef', { static: false }) qmsLibTempateRef;

  constructor(
    private queueService: QueueService,
    private authService: AuthService,
    private modelService: NgbModal,
    private commonService: CommonService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.environment = environment;
    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    this.commonService.routeChanged(this.route);
    this.PermissionsConstantsList = this.commonService.getuserpermissionForlib();
    // this.startDate = new Date();
    // this.userId = +this.authService.getLoggedInUserId();
    // this.userInfo = this.authService.getUserInfoFromLocalStorage();
    // this.qStatusList = this.queueService.queueStatusList;
    // this.loggedUserProvidersList = this.userInfo.provider_info;
    // this.providerDetails = _.find(this.loggedUserProvidersList, { providerValueId: this.userInfo.user_id });

    // if (this.isCompLoadFrom === 'frontDesk') {
    //   this.displayType = this.displayTypeValue;
    //   this.isShowSlot = this.isShowEmptySlot;
    //   this.qSlotList = this.getQSlotList;
    //   this.qSlotListClone = [...this.qSlotList];
    //   this.providerDetails = this.getProviderDetails;
    //   if (this.getProviderDetails.providerTypeName === 'JOINT_CLINIC' || this.getProviderDetails.providerTypeName === 'SERVICE_PROVIDER') {
    //     this.loggedUserProvidersList.push(this.getProviderDetails);
    //   }
    //   // this.providerDetails = this.loggedUserProvidersList;
    // } else if (this.isCompLoadFrom === 'doctorDashboard') {
    //   this.displayType = this.displayTypeValue;
    //   this.isShowSlot = this.isShowEmptySlot;
    //   this.providerDetails = this.getProviderDetails;
    // }


    // const getQueueSetting = this.commonService.getQueueSettings(Constants.queueSkipSettingKey);
    // const getQlistFilterFork = this.commonService.getQueueSettings(Constants.QLIST_FILTER, this.userInfo.user_id);
    // const getTimeFormatKeyFork = this.commonService.getQueueSettings(Constants.timeFormateKey, this.userId);

    // forkJoin([getQueueSetting, getQlistFilterFork, getTimeFormatKeyFork]).subscribe((res: Array<any>) => {
    //   this.repeatCallingCount = +res[0].no_of_repeat_calling;
    //   this.isShowConfirmedOnly = res[0].is_booking_confirmed;
    //   if (!this.isCompLoadFrom || this.isCompLoadFrom === 'doctorDashboard') {
    //     this.displayType = res[1].displayType;
    //     this.isShowSlot = res[1].isShowSlot;
    //     this.getQueueAppointmentSlots();
    //   }
    //   this.timeFormateKey = res[2].time_format_key;
    // });

    // -- recieve events from qlist filter form
    this.commonService.$recieveFilterEvent.pipe(takeUntil(this.$destroy), distinctUntilChanged()).subscribe(res => {
      // if (!_.isEqual(this.providerDetails, res.data.providerDetails)) {
      //   this.providerDetails = res.data.providerDetails;
      //   this.getQueueAppointmentSlots();
      // }
      this.displayType = res.data.displayType;
      this.isShowSlot = res.data.isShowSlot;
    });

    this.queueService.$receiveprintAnddelayNotificationEvent.pipe().subscribe(res => {
      if (res === 'printEvent') {
        this.getPrintAppointment();
      }
    });

    const sub = this.commonService.$receiveBookAppEvent.pipe(takeUntil(this.$destroy)).subscribe(res => {
      if (res.source === 'bookAppointment' && !res.errorMsg) {
        // this.getQueueAppointmentSlots();
        this.qmsLibTempateRef.getQueueAppointmentSlots();
        // sub.unsubscribe();
      } else if (res.source === 'bookAppointment' && res.errorMsg) {
        this.alertMsg = {
          message: 'Slot not available!',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
      }
    });
  }

  ngOnDestroy() {
    this.$destroy.next();
    this.$destroy.unsubscribe();
    // this.modelService.dismissAll();
  }

  getQueueAppointmentSlots() {
    let id = this.providerDetails.providerValueId ? this.providerDetails.providerValueId : this.userId;
    let includeEmptySlots = true;
    if (this.isCompLoadFrom === 'frontDesk') {
      id = this.providerDetails.providerValueId;
      includeEmptySlots = false;
    }
    this.queueService.getEntityAppointmentBookingBySequence(id, this.providerDetails.providerId, this.providerDetails.providerValueId, this.startDate,
      this.providerDetails.providerType, includeEmptySlots).pipe(takeUntil(this.$destroy)).subscribe((res: Array<QAppointmentDetails>) => {
        if (res.length) {
          const indx = res.findIndex((p) => p.entityId === this.providerDetails.providerId && p.entityValueId === this.providerDetails.providerValueId);
          if (indx !== -1) {
            this.qSlotList = [];
            this.qSlotList = this.commonService.convertAppointmentDataToFlatList(res[indx].slotsDetails, this.timeFormateKey);

            // -- scroll to particular slot
            if (this.qSlotList.length) {
              const data = this.qSlotList.filter(s => {
                return moment(moment(s.slotTime, 'hh:mm A')).isAfter(moment(moment().format('hh:mm A'), 'hh:mm A'));
              })[0];
              if (data && document.getElementById(`${data.slotId}`)) {
                setTimeout(() => {
                  document.getElementById(`${data.slotId}`).scrollIntoView();
                });
              }
            }


          } else {
            this.qSlotList = [];
          }
        } else {
          this.qSlotList = [];
        }
        this.qSlotListClone = _.cloneDeep(this.qSlotList);
        this.onFilterSlots(this.selectedSchedule);


        this.updateApptCntStatus();

      });
  }

  // -- Skip patient
  onSkip(currentItem: QSlotInfoDummy) {
    if (!this.isCheckin) {
      this.alertMsg = {
        message: 'Please check In',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
      return;
    }
    const slotIndx = this.qSlotList.findIndex(l => l.appointmentId === currentItem.appointmentId);
    currentItem.skippedCount = currentItem.skippedCount === undefined ? 0 : currentItem.skippedCount;
    if (currentItem.skippedCount < this.repeatCallingCount) { // -- data interchange
      currentItem.skippedCount = +currentItem.skippedCount + 1;
      if (this.qSlotList[slotIndx + 1]) {
        const data = this.nextValidAppointment(slotIndx + 1); // -- it gives next validate appointment
        // this.qSlotList[slotIndx] = data.item; // -- assinged next appointment
        // this.qSlotList[data.i] = currentItem; // --assigned current item to next slot
        this.updateQueueSequence(currentItem.slotId, data.item.slotId, true, currentItem);
      }
    } else {
      // this.updateQueueSequence(currentItem.slotId, data.item.slotId, true, currentItem);
      this.updateAppointentStatus(currentItem, 7, 0, true).subscribe(res1 => { // -- update skip queue status
      });
    }
  }

  nextValidAppointment(indx): { i: number, item: QSlotInfoDummy } {
    let temp = {
      i: 0,
      item: null
    };
    if (this.qSlotList[indx].queueStatus === 'NEXT') {
      temp = {
        i: indx,
        item: this.qSlotList[indx]
      };
      return temp;
    } else {
      for (let j = indx; j <= this.qSlotList.length; j++) {
        if (this.qSlotList[j] && this.qSlotList[j].queueStatus === 'NEXT') {
          temp = {
            i: j,
            item: this.qSlotList[j]
          };
          return temp;
        }
      }
    }
  }

  updateAppointentStatus(item: QSlotInfoDummy, status, roomId?, isSkip?: boolean): Observable<any> {
    if (!status) {
      return of();
    }
    let nextPatientQueueId = 0;
    if (status === 2) { // -- send next queue id when calling patient
      const slotIndx = this.qSlotList.findIndex(l => l.appointmentId === item.appointmentId);
      const data = this.nextValidAppointment(slotIndx + 1); // -- it gives next validate appointment
      if (data) {
        nextPatientQueueId = data.item.queueId;
      }
    }

    const reqParams = {
      queue_main_id: item.queueId,
      status_id: +status, // -- CALLING,
      cater_room_id: (+status === 2) ? roomId : 0,
      mark_as_skip: (status === 7) ? isSkip : false,
      next_patient_queueid: (+status === 2) ? nextPatientQueueId : 0,
    };

    return this.queueService.updateAppointmentQueue(reqParams).pipe(map(res => {
      if (res.status_message === 'Success') {
        item.queueStatusId = +status;
        item.skippedCount = (status === 7) ? isSkip ? 0 : item.skippedCount : item.skippedCount;
        item.queueStatus = (status === 7) ? isSkip ?
          this.qStatusList[this.qStatusList.findIndex(r => r.id === +status)].name : item.queueStatus : this.qStatusList[this.qStatusList.findIndex(r => r.id === +status)].name;
        this.alertMsg = {
          message: 'Status updated succesfully',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        this.updateApptCntStatus();
      } else {
        this.alertMsg = {
          message: res.message,
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
      }
    }));


  }

  // -- Cancel appointments of patient
  cancelAppointment(item: QAppointments): void {
    const modalInstance = this.modelService.open(ConfirmationPopupComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        windowClass: 'custom-modal'
      });
    modalInstance.componentInstance.messageDetails = {
      modalTitle: 'Do you want to cancel?',
      modalBody: item.patName
    };
    modalInstance.result.then((res1: any) => {
      const reqParams = {
        Appt_Id: item.appointmentId,
        Appt_Date: moment(this.startDate).format('MM/DD/YYYY'), // MM/dd/yyyy
        Uhid: item.patUhid,
        Remarks: ''
      };
      this.queueService.cancelBookedAppointment(reqParams).subscribe(res => {
        if (res.status_message === 'Success') {
          const indx = this.qSlotList.findIndex(r => r.appointmentId === item.appointmentId);
          if (indx !== -1) {
            this.qSlotList.splice(indx, 1);
          }
          this.alertMsg = {
            message: res.message,
            messageType: 'success',
            duration: Constants.ALERT_DURATION
          };
          this.updateApptCntStatus();
        } else {
          this.alertMsg = {
            message: res.message,
            messageType: 'danger',
            duration: Constants.ALERT_DURATION
          };
        }
      });
    }, () => { });
  }

  // -- when any status updates
  onCheckInStatus(event): void {
    this.checkInStatus = event;
    if (this.isCheckin && this.checkInStatus === 'Stop') {
      if (this.isCompLoadFrom === 'frontDesk') {
        // this.qSlotList = this.getQSlotList;
        this.providerDetails = this.getProviderDetails;
        this.getQueueAppointmentSlots();
      } else {
        this.getQueueAppointmentSlots();
      }
    }
  }

  onProviderSelect($event): void {
    if (!_.isEqual(this.providerDetails, $event)) {
      this.providerDetails = $event;
      this.getQueueAppointmentSlots();
    }
  }

  getPrintAppointment() {
    this.printData = null;
    if (this.qSlotList.length > 0) {
      const printData = {
        printFor: 'qList_appointment',
        headerColumn: Constants.APPOINTMENT_PRINT_HEAD_LIST,
        bodyData: [],
        printHeading: {
          heading: 'Appointment List',
          userData: this.providerDetails.providerName
        },
        date: null,
      };
      _.map(this.qSlotList, (v) => {
        if (v.isBooked && v.queueId) {
          const appointmentPrint = new AppointmentPrint();
          const bData = {
            slotTime: v.slotTime,
            patName: v.patTitle + '. ' + v.patName,
            patType: v.patType,
            remark: v.appointmentRemark,
            patUhid: v.patUhid,
            patGender: v.patGender,
            patAge: v.patAge,
            patContact: v.patMobileNo,
            appTakenBy: v.addedBy
          };
          appointmentPrint.generateObject(bData);
          printData.bodyData.push(appointmentPrint);
        }
      });
      this.printData = printData;
    } else {
      this.alertMsg = {
        message: 'No Appointment Found!',
        messageType: 'warning',
        duration: Constants.ALERT_DURATION
      };
      this.printData = null;
    }
  }

  onFilterSlots(selectedSlot) {
    const newSlot = [];
    if (selectedSlot && selectedSlot !== 'all') {
      if (selectedSlot.endTime === '12:00 AM' || selectedSlot.endTime === '00:00') {
        selectedSlot.endTime = '11:59 PM';
      }
      const Tformat = 'hh:mm A';
      this.qSlotListClone.forEach(slot => {

        const time = moment(slot.slotTime, Tformat);
        const beforeTime = moment(selectedSlot.startTime, Tformat);
        const afterTime = moment(selectedSlot.endTime, Tformat);
        // if (time.isBetween(beforeTime, afterTime, null, '[]')) {
        //   newSlot.push(slot);
        // }

        if (moment(time).isSameOrAfter(beforeTime) && moment(time).isBefore(afterTime)) {
          newSlot.push(slot);
        }

      });
      this.qSlotList = newSlot;
    } else {
      this.qSlotList = _.cloneDeep(this.qSlotListClone);
    }
    _.forEach(this.qSlotList, slot => {
      slot.slotTime = this.commonService.convertTime(
        this.timeFormateKey,
        slot.slotTime);
    });
  }

  updateQueueSequence(fromSlotId, toSlotId, isFromSkip?, dataOfSkip?): void {
    const reqParams = {
      from_slot: fromSlotId,
      to_slot: toSlotId
    };
    this.queueService.updateQueueSequence(reqParams).subscribe(res => {
      if (res.status_code === 200 && res.status_message === 'Success') {
        if (isFromSkip) {
          this.updateAppointentStatus(dataOfSkip, 7).subscribe(res1 => { // -- update skip queue status
            this.getQueueAppointmentSlots();
          });
        } else {
          this.getQueueAppointmentSlots();
        }
      }
    });
  }

  setSelectedSchedule(selectedSchedule): void {
    this.selectedSchedule = selectedSchedule;
    this.onFilterSlots(selectedSchedule);
  }

  updateApptCntStatus(): void {
    this.appointmentsCntStatus.totalApptCount = _.filter(this.qSlotList, (mdoc) =>
      mdoc.bookingStatus !== null && mdoc.bookingStatus === "CONFIRMED" && mdoc.queueStatus !== 'ABSENT').length;//this.qSlotList.length;
    this.appointmentsCntStatus.inQueueCnt = _.filter(this.qSlotList, (mdoc) =>
      mdoc.bookingStatus !== null && mdoc.bookingStatus === "CONFIRMED" && (mdoc.queueStatus === 'NEXT' || mdoc.queueStatus === 'CALLING')).length;
    this.appointmentsCntStatus.completedCnt = _.filter(this.qSlotList, (mdoc) =>
      mdoc.bookingStatus != null && mdoc.bookingStatus === "CONFIRMED" && mdoc.queueStatus === 'COMPLETE').length;
    this.appointmentsCntStatus.skippCnt = _.filter(this.qSlotList, (mdoc) =>
      mdoc.bookingStatus != null && mdoc.bookingStatus === "CONFIRMED" && mdoc.queueStatus === 'SKIP').length;
    this.appointmentsCntStatus.followupPatientCnt = _.filter(this.qSlotList, (mdoc) =>
      mdoc.bookingStatus != null && mdoc.bookingStatus === "CONFIRMED" && mdoc.queueStatus !== 'ABSENT' && mdoc.isFollowUp === true).length;
    this.appointmentsCntStatus.newPatientCnt = _.filter(this.qSlotList, (mdoc) =>
      mdoc.bookingStatus != null && mdoc.bookingStatus === "CONFIRMED" && mdoc.queueStatus !== 'ABSENT' && mdoc.isFollowUp === false).length;
    this.appointmentsCntStatus.inConsultationCnt = _.filter(this.qSlotList, (mdoc) =>
      mdoc.bookingStatus != null && mdoc.bookingStatus === "CONFIRMED" && mdoc.queueStatus === 'INCONSULTATION').length;

    this.updateCount.emit({
      appointmentsCntStatus: this.appointmentsCntStatus
    });
  }

}




