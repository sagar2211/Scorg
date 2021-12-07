import { Component, OnInit,  HostListener, Output, EventEmitter} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../../../services/common.service';
import { AuthService } from 'src/app/services/auth.service';
import { QueueService } from 'src/app/modules/qms/services/queue.service';
import { takeUntil, distinctUntilChanged } from 'rxjs/operators';
import { Subject, forkJoin } from 'rxjs';
import { QAppointmentDetails, QSlotInfoDummy } from 'src/app/modules/qms/models/q-entity-appointment-details';
import { environment } from './../../../../../environments/environment';

import * as moment from 'moment';
import * as _ from 'lodash';
import { Constants } from 'src/app/config/constants';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { NgxPermissionsService } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { IAlert } from 'src/app/models/AlertMessage';
import { DashBoardService } from '../../services/dashboard.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModifyScheduleComponent, DelayNotificationPopupLibComponent, QmsQlistLibService } from '@qms/qlist-lib';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.scss']
})
export class DoctorDashboardComponent implements OnInit {

  providerDetails = null;
  userInfo: any = null;
  userId: number;
  loggedUserProvidersList = [];
  startDate: Date;
  timeFormateKey = '';
  $destroy: Subject<boolean> = new Subject();
  qSlotList: Array<QSlotInfoDummy> = [];
  isShowSlot = false;
  hideActions: true;
  filter = ['NEXT', 'CALLING', 'INCONSULTATION', 'SKIP', 'COMPLETE'];
  isClicked = 'all';
  checkScreenSize = false;
  alertMsg: IAlert;
  permissionConstList: any = [];
  PermissionsConstantsListforLib: any = [];
  weeklyData: any = {
    Weekly_OPD_Count: 0,
    WeekWisePercentageNewPatients: 0,
    todays_Patient_Count: 0,
    weekly_NewPatient_average: 0,
    WeekWisePercentageOPDPatients: 0,
    weekly_booking_average: 0,
    lastweek_start_date: null,
    current_date: null
  };
  appointmentsCntStatus = {
    total_app: 0,
    total_ConfirmedApp: 0,
    total_TentitiveApp: 0,
    total_FollowPatient: 0,
    total_NewPatient: 0
  };
  environment: any;
  modalRef: any;
  imageUrl: string;
  IseditfromDoctorDashBoard = false;

  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
    private authService: AuthService,
    private queueService: QueueService,
    private router: Router,
    private ngxPermissionsService: NgxPermissionsService,
    private dashboardService: DashBoardService,
    private userService: UsersService,
    private modalService: NgbModal,
    private qmsQlistLibService: QmsQlistLibService
  ) { }

  ngOnInit() {
    this.imageUrl = './assets/img/profile.svg';
    this.startDate = new Date();
    this.permissionConstList = PermissionsConstants;
    this.PermissionsConstantsListforLib = this.commonService.getuserpermissionForlib();
    this.commonService.routeChanged(this.route);
    this.userId = +this.authService.getLoggedInUserId();
    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    // let provider = this.commonService.getCurrentSelectedProvider();
    this.loggedUserProvidersList = this.userInfo.provider_info;
    this.providerDetails = _.find(this.loggedUserProvidersList, { providerValueId: this.userInfo.user_id });
    this.environment = environment;
    this.getTodaysApptSummery();
    this.getWeeklySummery();
    this.getUserData();
  }

  editfromDoctorDashBoard($event): void{
    if ($event) {
      this.getTodaysApptSummery();
    }
  }
  getUserData() {
    this.userService.getUserImageById(this.userId, true).subscribe(imageResult => {
      if (imageResult.status_code === 200 && imageResult.userImageDetail && imageResult.userImageDetail.userImagePath != null) {
        this.showProfileImage(imageResult.userImageDetail, this.userId);
      }
    });
  }

  showProfileImage(ImageData, userId) {
    if (ImageData != null && ImageData.userImagePath !== '#') {
      this.imageUrl = null;
      this.imageUrl = ImageData.userImagePath + '?time=' + new Date().getTime();
    }
  }

  navigateTo(param1, pram2) {

  }

  getQueueAppointmentSlots() {
    const id = this.providerDetails.providerValueId ? this.providerDetails.providerValueId : this.userId;
    const includeEmptySlots = false;
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
      });
  }

  setFilter(buttonId) {
    switch (buttonId) {
      case 'all':
        {
          this.filter = ['NEXT', 'CALLING', 'INCONSULTATION', 'SKIP', 'COMPLETE'];
          this.isClicked = 'all';
        }
        break;
      case 'queue':
        {
          this.filter = ['NEXT', 'CALLING'];
          this.isClicked = 'queue';
        }
        break;
      case 'consultation':
        {
          this.filter = ['INCONSULTATION'];
          this.isClicked = 'consultation';
        }
        break;
      case 'skipped':
        {
          this.filter = ['SKIP'];
          this.isClicked = 'skipped';
        }
        break;
      case 'completed':
        {
          this.filter = ['COMPLETE'];
          this.isClicked = 'completed';
        }
        break;
      default:
    }
  }

  ManageAppointment() {
    if (!_.isUndefined(this.ngxPermissionsService.getPermission(PermissionsConstants.View_Manage_Appointment))) {
      this.router.navigate(['appointmentApp/appointments/appointmentsList']);
    } else {
      this.displayErrorMsg('Do not have Permission', 'danger');
    }
  }

  HolidayList() {
    if (!_.isUndefined(this.ngxPermissionsService.getPermission(PermissionsConstants.View_Manage_Calendar))) {
      this.router.navigate(['appointmentApp/appointments/entitySettings']);
    } else {
      this.displayErrorMsg('Do not have Permission', 'danger');
    }
  }

  CalenderView() {
    if (!_.isUndefined(this.ngxPermissionsService.getPermission(PermissionsConstants.View_Calendar_View))) {
      this.router.navigate(['appointmentApp/appointments/calendar']);
    } else {
      this.displayErrorMsg('Do not have Permission', 'danger');
    }
  }

  displayErrorMsg(message: string, messageType: string): void {
    this.alertMsg = { message, messageType, duration: Constants.ALERT_DURATION };
  }

  updateApptCntStatus(apptCntStatusObj) {
    this.appointmentsCntStatus = apptCntStatusObj;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.checkScreenSize = window.innerWidth < 1300 ? true : false;
  }

  getTodaysApptSummery() {
    if (this.providerDetails) {
      const param = {
        EntityId: this.providerDetails.providerId,
        EntityValueId: this.providerDetails.providerValueId
      }
      this.dashboardService.getTodaysApptSummery(param).subscribe(response => {
        if (response) {
          this.appointmentsCntStatus = response;
        }
      });
    }
  }
  getWeeklySummery() {
    const param = {
      EntityId: this.providerDetails.providerId,
      EntityValueId: this.providerDetails.providerValueId
    }
    this.dashboardService.getApptWeeklyData(param).subscribe(response => {
      this.weeklyData = response;
    });
  }
  ModifySchedule() {
    this.modalRef = this.modalService.open(ModifyScheduleComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      container: '#homeComponent',
      size: 'lg'
    });
    this.modalRef.componentInstance.providers = this.qmsQlistLibService.getCurrentSelectedProvider() ? this.qmsQlistLibService.getCurrentSelectedProvider() : this.providerDetails;
    // this.modalRef.componentInstance.scheduleList = [];
    this.modalRef.componentInstance.environmentDetails = environment;
    this.modalRef.componentInstance.loginUserDetails = this.authService.getUserInfoFromLocalStorage();
    this.modalRef.result.then((res) => {
      if (res === 'success') {
      }
    }, (reason) => {
      this.modalRef.close();
    });
  }

  delayNotification(): void {
    const modalInstanceDelayNotification = this.modalService.open(DelayNotificationPopupLibComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        windowClass: 'custom-modal',
        container: '#homeComponent',
        size: 'lg'
      });
    modalInstanceDelayNotification.componentInstance.messageDetails = {
      modalTitle: 'Send Delay notification',
      modalBody: '',
      providerDetails: this.qmsQlistLibService.getCurrentSelectedProvider() ? this.qmsQlistLibService.getCurrentSelectedProvider() : this.providerDetails
    };
    modalInstanceDelayNotification.componentInstance.environmentDetails = environment;
    modalInstanceDelayNotification.componentInstance.loginUserDetails = this.authService.getUserInfoFromLocalStorage();
    modalInstanceDelayNotification.result.then((res1: any) => {
    }, (reason) => {
      if (reason.popupVal === 'ok') {
        const reqParams = {
          entity_id: reason.entity_id,
          entity_value_id: reason.entity_value_id,
          time_detail_id: reason.timeDetailId,
          // room_map_id: reason.roomMapingId,
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
              message: res.message ? res.message : 'Somthing went wrong!',
              messageType: 'danger',
              duration: Constants.ALERT_DURATION
            };
          }
        });
      }
    });
  }

}
