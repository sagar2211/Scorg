import { Component, OnInit, HostListener, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { QueueSlots, QAppointmentDetails } from '@qms/qlist-lib';
import { IAlert } from './../../../public/models/AlertMessage';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from './../../../public/services/common.service';
import { AuthService } from './../../../public/services/auth.service';
import { QueueService } from './../../../public/services/queue.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { PermissionsConstants } from './../../../config/PermissionsConstants';
import { Constants } from 'src/app/config/constants';
import * as moment from 'moment';
import * as _ from 'lodash';
import { takeUntil, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { PatientService } from './../../../public/services/patient.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CustomEventLibServices } from '@qms/qlist-lib';
import { UsersService } from './../../../public/services/users.service';
import { ModifyScheduleComponent, DelayNotificationPopupLibComponent } from '@qms/qlist-lib';
import { DashBoardService } from './../../services/dashboard.service';
import { EncounterPatient } from 'src/app/public/models/encounter-patient.model';

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.scss'],
  providers: [DashBoardService]
})
export class DoctorDashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  providerDetails = null;
  userInfo: any = null;
  userId: number;
  loggedUserProvidersList = [];
  startDate: Date;
  timeFormateKey = '';
  $destroy: Subject<boolean> = new Subject();
  qSlotList: Array<QueueSlots> = [];
  isShowSlot = false;
  hideActions: true;
  filter = ['NEXT', 'CALLING', 'INCONSULTATION', 'SKIP', 'COMPLETE'];
  isClicked = 'all';
  alertMsg: IAlert;
  permissionConstList: any = [];
  appointmentsCntStatus = {
    total_app: 0,
    total_ConfirmedApp: 0,
    total_TentitiveApp: 0,
    total_FollowPatient: 0,
    total_NewPatient: 0
  };
  baseUrlQms: any;
  displayTypeQlist: string;
  isShowEmptySlotQlist: boolean;
  imageUrl: string;
  favoriteTabView = '';
  activeTab = '';
  @ViewChild('tab', { static: true }) tab: any;
  modalRef: any;
  PermissionsConstantsListforLib: any = [];
  isOpenNotificaton = true;

  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
    private authService: AuthService,
    private queueService: QueueService,
    private router: Router,
    private ngxPermissionsService: NgxPermissionsService,
    private patientService: PatientService,
    private customEventLibServices: CustomEventLibServices,
    private userService: UsersService,
    private qmsDashboardService: DashBoardService,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.imageUrl = './assets/img/profile.svg';
    this.baseUrlQms = environment;
    this.displayTypeQlist = 'grid';
    this.isShowEmptySlotQlist = true;
    this.startDate = new Date();
    this.permissionConstList = PermissionsConstants;
    this.commonService.routeChanged(this.route);
    this.userId = +this.authService.getLoggedInUserId();
    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    this.loggedUserProvidersList = this.userInfo.provider_info;
    this.PermissionsConstantsListforLib = this.commonService.getuserpermissionForlib();
    this.providerDetails = _.find(this.loggedUserProvidersList, { providerValueId: this.userInfo.user_id });
    this.getPatientDataForOPD();
    this.getUserData();
    this.getDocDashboardFavTabSettings().subscribe(res => {
      if (this.activeTab === 'appointment') {
        this.getTodaysApptSummery();
      }
    });
    this.commonService.$changeEvent.pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      this.isOpenNotificaton = res.title === 'Notification' && res.isOpen ? true : false;
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  ngAfterViewInit() {
    this.tab.activeId = this.activeTab;
  }

  navigateTo(param1, pram2) {

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

  getQueueAppointmentSlots() {
    const id = this.providerDetails.providerValueId ? this.providerDetails.providerValueId : this.userId;
    const includeEmptySlots = false;
    this.queueService.getEntityAppointmentBookingBySequence(id, this.providerDetails.providerId,
      this.providerDetails.providerValueId, this.startDate, this.providerDetails.providerType, includeEmptySlots)
      .pipe(takeUntil(this.$destroy))
      .subscribe((res: Array<any>) => {
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
      this.router.navigate(['/qms/appointments/appointmentsList']);
    } else {
      this.displayErrorMsg('Do not have Permission', 'danger');
    }
  }

  HolidayList() {
    if (!_.isUndefined(this.ngxPermissionsService.getPermission(PermissionsConstants.View_Manage_Calendar))) {
      this.router.navigate(['/qms/appointments/entitySettings']);
    } else {
      this.displayErrorMsg('Do not have Permission', 'danger');
    }
  }

  CalenderView() {
    if (!_.isUndefined(this.ngxPermissionsService.getPermission(PermissionsConstants.View_Calendar_View))) {
      this.router.navigate(['/qms/appointments/calendar']);
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

  switchNgBTab(id: string) {
    this.tab.activeId = id;
  }

  loadData($event) {
    this.activeTab = $event.nextId;
    // if ($event.nextId === 'admitted') {
    //   // load admitted patient data
    //   this.getAdmittedPatientData();
    // }
  }

  ModifySchedule() {
    this.modalRef = this.modalService.open(ModifyScheduleComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      container: '#homeComponent',
      size: 'lg'
    });
    this.modalRef.componentInstance.providers = this.providerDetails;
    this.modalRef.componentInstance.scheduleList = [];
    this.modalRef.componentInstance.environmentDetails = environment;
    this.modalRef.componentInstance.loginUserDetails = this.authService.getUserInfoFromLocalStorage();
    this.modalRef.result.then((res) => {
      if (res === 'success') {
      }
    }, (reason) => {
      this.modalRef.close();
    });
  }

  getPatientDataForOPD() {
    const sub = this.customEventLibServices.$obsPatientClickFrmQGrid.pipe(takeUntil(this.$destroy)).subscribe(res => {
      this.redirctPatient(res.patUhid);
    });
  }

  redirctPatient(patientId: string) {
    this.patientService.getPatientActiveVisitDetail(patientId).subscribe(res => {
      if (res) {
        this.selectedPatient(res[0]);
      } else {
        this.displayErrorMsg('This patient has no IP/OP record.', 'danger');
      }
    });
  }

  selectedPatient(patient) {
    patient.type = patient.serviceType.name.toLowerCase();
    patient.loadFrom = 'OPERATIVE_NOTES';
    this.commonService.setActivePatientList(patient, 'add');
    if (this.commonService.getActivePatientList(patient).length <= 5) {
      const obj = {
        type: 'add',
        data: patient,
        sourc: 'doctor_dashboard'
      };
      this.commonService.updateActivePatientList(obj);
      this.router.navigate(['/emr/patient/dashboard/', patient.patientData.id]);
    } else {
      this.displayErrorMsg('Max 5 Patient Allowed', 'danger');
    }
  }

  setViewFavorite(viewName) {
    const setFavViewObj = {
      favTabView: viewName,
    };
    const queSettingObj = JSON.stringify(setFavViewObj);
    const userId = this.userId;
    this.commonService.SaveQueueSettings(Constants.EMR_DOC_DASHBOARD_FAV_TAB_SETTING, queSettingObj, userId).subscribe((res) => {
      if (res != null && res === 'Success') {
        this.favoriteTabView = viewName;
      }
    });
  }

  getDocDashboardFavTabSettings(): Observable<any> {
    const userId = this.userId;
    return this.commonService.getQueueSettings(Constants.EMR_DOC_DASHBOARD_FAV_TAB_SETTING, userId).pipe(
      map((res: any) => {
        this.activeTab = (res && res.favTabView) ? res.favTabView : 'admitted';
        this.favoriteTabView = (res && res.favTabView) ? res.favTabView : '';
        // this.switchNgBTab(this.activeTab);
      }));
  }

  getTodaysApptSummery() {
    if (this.providerDetails) {
      const param = {
        EntityId: this.providerDetails.providerId,
        EntityValueId: this.providerDetails.providerValueId
      };
      this.qmsDashboardService.getTodaysApptSummery(param).subscribe(response => {
        if (response) {
          this.appointmentsCntStatus = response;
        }
      });
    }
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
      providerDetails: this.providerDetails
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
