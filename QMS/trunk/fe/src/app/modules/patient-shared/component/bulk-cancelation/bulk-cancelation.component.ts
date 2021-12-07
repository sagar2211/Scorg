import { Provider } from './../../../../shared/models/provider';
import { ConfirmationPopupWithInputComponent } from './../../../../shared/components/confirmation-popup-with-input/confirmation-popup-with-input.component';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges, Output, EventEmitter, HostListener } from '@angular/core';
import { takeUntil, map } from 'rxjs/operators';
import { Subject, forkJoin, Observable } from 'rxjs';
import { IAlert } from 'src/app/models/AlertMessage';
import { AuthService } from './../../../../services/auth.service';
import { AppointmentListModel } from './../../../appointment/models/appointment.model';
import * as moment from 'moment';
import { CommonService } from '../../../../services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationPopupComponent } from 'src/app/components/confirmation-popup/confirmation-popup.component';
import * as _ from 'lodash';
import { QueueService } from './../../../qms/services/queue.service';
import { QSlotInfoDummy, QAppointmentDetails } from './../../../qms/models/q-entity-appointment-details';
import { DisplayDataByStatusPipe } from './../../../qms/pipes/display-data-by-status.pipe';
import { Constants } from 'src/app/config/constants';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { AppointmentPrint } from 'src/app/modules/qms/models/appointment-print.mode';
import { SlideInOutLogAnimation } from 'src/app/config/animations';
import { AppointmentBookLibComponent, DelayNotificationPopupLibComponent, QAppointments } from '@qms/qlist-lib';
import { environment } from 'src/environments/environment';
import { Entity } from 'src/app/modules/schedule/models/entity.model';
import { EntityBasicInfoService } from 'src/app/modules/schedule/services/entity-basic-info.service';
import { Doctor } from 'src/app/modules/schedule/models/doctor.model';
import { JointClinic } from 'src/app/modules/schedule/models/joint-clinic.model';
import { ServiceProvider } from 'src/app/modules/schedule/models/service-provider.model';
import { NgxPermissionsService } from 'ngx-permissions';
import { AppointmentService } from 'src/app/modules/appointment/services/appointment.service';
import { ApppointmentSuccessModel } from 'src/app/modules/appointment/models/appointment-success.model';
import { AddPatientComponent } from 'src/app/modules/patient-shared/component/add-patient/add-patient.component';

@Component({
  selector: 'app-bulk-cancelation',
  templateUrl: './bulk-cancelation.component.html',
  styleUrls: ['./bulk-cancelation.component.scss'],
  providers: [DisplayDataByStatusPipe],
  animations: [SlideInOutLogAnimation]
})
export class BulkCancelationComponent implements OnInit, OnDestroy, OnChanges {
  @Input() public providerDetailsFromFrontDesk: Provider;
  @Input() public isFromFrontDesk = false;
  @Input() public allAppointmentList = [];
  @Input() public isShowAllAppointment = false;
  @Input() public fdmapeduserList = [];
  @Output() public getAllAppointmentList: EventEmitter<any> = new EventEmitter();
  // @HostListener('window:scroll', ['$event']) // for window scroll events
  // -- number or string
  compInstance = this;
  startDate: Date;
  minDate: Date;
  userId: number;
  userInfo: any;
  selectAll = false;
  alertMsg: IAlert;
  timeFormateKey = '';
  selectedSlot: any;
  // -- array or object
  slotList: Array<QSlotInfoDummy> = [];
  providerDetails = null;
  printData = null;
  mapeduserList = [];
  filterAllAppointmentOnEntity = false;
  selectedAppointmentEntity: any = null;
  loganimationState = 'out';
  isShowLog = false;
  PermissionsConstantsList: any = [];
  checkqlistStatus = { checkInStatus: '', isCheckIn: false, isCheckOut: false };


  $destroy: Subject<any> = new Subject<any>();
  searchTxt = '';
  modalService: NgbModal;
  showBulkButtons = false;
  modalInstanceForAppointmentHistory;
  selectedAppointmentId = null;
  ngbPopover: NgbPopover;
  isConfirmSelected = false;
  entity: Entity;
  doctor: Doctor;
  jointClinic: JointClinic;
  serviceProvider: ServiceProvider;
  entityList: Array<Entity> = [];
  doctorList: Array<Doctor> = [];
  jointClinicList: Array<JointClinic> = [];
  serviceProviderList: Array<ServiceProvider> = [];
  viewAccessAllAppointments = false;
  isEntityLoad = false;
  cssClass: string;
  isDateSelected = false;
  selectedEntity = null;
  showAddPatientPopup = false;

  constructor(
    private queueService: QueueService,
    private authService: AuthService,
    private displayDataByStatusPipe: DisplayDataByStatusPipe,
    private modelService: NgbModal,
    private route: ActivatedRoute,
    public router: Router,
    private commonService: CommonService,
    private appointmentService: AppointmentService,
    private entityBasicInfoService: EntityBasicInfoService,
    private ngxPermissionsService: NgxPermissionsService,
    private confirmationModalService: NgbModal,
  ) {
    this.modalService = confirmationModalService;
  }

  ngOnInit() {
    this.commonService.routeChanged(this.route);
    this.PermissionsConstantsList = PermissionsConstants;
    const permission = this.ngxPermissionsService.getPermission(PermissionsConstants.View_Access_All_Appointments);
    this.viewAccessAllAppointments = permission ? true : false;
    if (this.router.url.includes('appointments/fduserappointmentsList')) {
      this.route.snapshot.data.breadCrumInfo.redirectTo = permission ? 'appointmentApp/appointments/searchAppointment' : this.route.snapshot.data.breadCrumInfo.redirectTo;
    } else {
      this.showActivePopup(); // Global Add button
    }
    this.startDate = new Date();

    this.commonService.sendFilterEvent.next({
      dateFlag: true
    });
    this.getAllEntityList();
    if (!_.isUndefined(this.route.snapshot.queryParams.entity_id)) {
      this.providerDetails = {};
      this.providerDetails.providerId = + this.route.snapshot.queryParams.entity_id;
      this.providerDetails.providerValueId = + this.route.snapshot.queryParams.provider_id;
      this.providerDetails.providerName = this.route.snapshot.queryParams.providerName;
    } else if (this.allAppointmentList.length === 0 && this.providerDetailsFromFrontDesk && !this.viewAccessAllAppointments) {
      this.providerDetails = this.providerDetailsFromFrontDesk;
      this.selectedAppointmentEntity = {
        entityTypeId: this.providerDetails.providerId,
        entityTypeName: this.providerDetails.providerTypeName,
        entityTypeValueId: this.providerDetails.providerValueId,
        entityTypeValueName: this.providerDetails.providerName,
        displayMapUserName: this.providerDetails.providerName + '(' + this.providerDetails.providerTypeName + ')'
      };
      this.filterAllAppointmentOnEntity = true;
      this.isEntitySelected();
    } else if (this.providerDetailsFromFrontDesk && this.viewAccessAllAppointments && this.route.snapshot.routeConfig.path === 'fduserappointmentsList') {
      this.providerDetails = this.providerDetailsFromFrontDesk;
      this.selectedAppointmentEntity = {
        entityTypeId: this.providerDetails.providerId,
        entityTypeName: this.providerDetails.providerTypeName,
        entityTypeValueId: this.providerDetails.providerValueId,
        entityTypeValueName: this.providerDetails.providerName,
        displayMapUserName: this.providerDetails.providerName + '(' + this.providerDetails.providerTypeName + ')'
      };
      this.isEntitySelected();
      this.onAllAppointmentAccess();
    } else if (this.allAppointmentList.length > 0 && !this.providerDetailsFromFrontDesk) {
      this.isEntitySelected();
      this.slotList = this.allAppointmentList;

    } else {
      this.userId = +this.authService.getLoggedInUserId();
      this.userInfo = this.authService.getUserInfoFromLocalStorage();
      this.providerDetails = this.userInfo.provider_info;
      this.providerDetails = _.find(this.providerDetails, (o) => o.providerValueId === this.userInfo.user_id && o.providerType === this.userInfo.role_type);
      // _.find(this.providerDetails, { providerValueId: this.userInfo.user_id });
    }
    this.timeFormateKey = this.authService.getUserInfoFromLocalStorage().timeFormat;
    if (this.allAppointmentList.length === 0 && this.providerDetails && (!this.viewAccessAllAppointments || this.route.snapshot.routeConfig.path === 'appointmentsList')) {
      this.getQueueAppointmentSlots();
    }

    // -- recieve events from qlist filter form
    this.commonService.$recieveFilterEvent.pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if (res.data && res.isFrom) {
        if ((!_.isEqual(this.providerDetails, res.data.providerDetails) || res.data.isLoad) && res.isFrom === 'appointmentsList') {
          this.providerDetails = res.data.providerDetails;
          this.startDate = res.data.startDate;
          this.selectedSlot = res.data.selectedSlot;
          this.getQueueAppointmentSlots();
        } else if (res.data.isLoad && res.isFrom === 'fduserappointmentsList') {
          this.providerDetails = res.data.providerDetails;
          this.startDate = res.data.startDate;
          this.selectedSlot = res.data.selectedSlot;
          this.getQueueAppointmentSlots();
        }
      }
    });
    this.commonService.$logSliderOpenClose.pipe(takeUntil(this.$destroy)).subscribe((obj: any) => {
      if (obj === 'open') {
        this.isShowLog = true;
        this.loganimationState = this.isShowLog ? 'in' : 'out';
      } else {
        this.selectedAppointmentId = null;
        this.isShowLog = false;
        this.loganimationState = 'out';
      }
    });
    this.checkqlistStatus = this.commonService.getqListStatus();
    if (this.isShowAllAppointment && !this.viewAccessAllAppointments) {
      this.cssClass = 'col-6 text-right';
    } else if (this.isShowAllAppointment && this.viewAccessAllAppointments) {
      this.cssClass = 'col-12';
    } else {
      this.cssClass = 'col-9 text-right';
    }
  }
  onAllAppointmentAccess() {
    const objEntity = {
      entity_id: this.providerDetailsFromFrontDesk.providerId,
      entity_alias: this.providerDetailsFromFrontDesk.providerTypeName.toLocaleLowerCase(),
      entity_name: this.providerDetailsFromFrontDesk.providerName
    };
    const tempEntity = new Entity();
    tempEntity.generateObject(objEntity);
    this.entity = tempEntity;
    const objSelectedEntity = {
      id: this.providerDetailsFromFrontDesk.providerValueId,
      name: this.providerDetailsFromFrontDesk.providerName
    };
    if (this.entity.key === 'service_provider') {
      const tempServiceProvider = new ServiceProvider();
      tempServiceProvider.generateObject(objSelectedEntity);
      this.serviceProvider = tempServiceProvider;
      this.isEntityLoad = true;
    } else if (this.entity.key === 'doctor') {
      const tempDoctor = new Doctor();
      tempDoctor.generateObject(objSelectedEntity);
      this.doctor = tempDoctor;
      this.isEntityLoad = true;
    } else if (this.entity.key === 'joint_clinic') {
      const tempJointClinic = new JointClinic();
      tempJointClinic.generateObject(objSelectedEntity);
      this.jointClinic = tempJointClinic;
      this.isEntityLoad = true;
    }
    // this.GetQueueAppointmentSlotOnEntityId(this.selectedAppointmentEntity);
    this.GetAllAppointmentOnEntityId();
    this.isEntitySelected();
  }
  isEntitySelected() {
    this.route.snapshot.data.breadCrumInfo.isFilter = this.selectedAppointmentEntity ? true : false;
    // this.route.snapshot.data.breadCrumInfo.isAddPopup = this.selectedAppointmentEntity ? true : false;
  }

  ngOnDestroy() {
    this.$destroy.next();
    this.$destroy.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.fdmapeduserList) {
      this.mapeduserList = this.fdmapeduserList;
    }
    if (changes.allAppointmentList) {
      this.slotList = this.allAppointmentList;
      this.sortByTime(this.slotList);
      _.forEach(this.slotList, slot => {
        slot.slotTime = this.commonService.convertTime(
          this.timeFormateKey,
          slot.slotTime);
      });
    }
    this.isEntitySelected();
  }

  GetQueueAppointmentSlotOnEntityId(event) {
    this.commonService.manageAppointmentFilterData = null; //  Default current Date apply on Filter on selction of entity
    this.selectedSlot = 'all';
    if (event) {
      this.filterAllAppointmentOnEntity = true;
      this.setProviderObject(event);
      if (!this.isDateSelected) {
        this.startDate = new Date();
      }
      this.getQueueAppointmentSlots();
    } else {
      this.providerDetails = {};
      this.filterAllAppointmentOnEntity = false;
      this.commonService.setCurrentSelectedProvider(null);
      this.commonService.currentSelectedEntity = null;
      this.commonService.sendFilterEvent.next({
        dateFlag: true
      });
      this.getAllAppointmentList.emit();
    }
    this.isEntitySelected();
  }

  setProviderObject(event) {
    this.providerDetails = {};
    if (event) {
      this.providerDetails.providerId = + event.entityTypeId;
      this.providerDetails.providerTypeName = event.entityTypeName;
      this.providerDetails.providerValueId = + event.entityTypeValueId;
      this.providerDetails.providerName = event.entityTypeValueName;
      this.commonService.setCurrentSelectedProvider(this.providerDetails);
      if (this.viewAccessAllAppointments) {
        this.selectedEntity = {};
        this.selectedEntity = _.cloneDeep(this.providerDetails);
        this.selectedEntity.providerTypeKey = this.entity.key;
        this.selectedEntity.selectedDate = this.startDate;
        this.commonService.currentSelectedEntity = this.selectedEntity;
      }
    }
  }

  getQueueAppointmentSlots() {
    if (this.selectedEntity !== null) {
      this.selectedEntity.selectedDate = this.startDate;
    }
    this.queueService.getEntityAppointmentBookingBySequence(this.providerDetails.providerValueId, this.providerDetails.providerId, this.providerDetails.providerValueId, this.startDate, null, false)
      .pipe(takeUntil(this.$destroy)).subscribe((res: Array<QAppointmentDetails>) => {
        if (res.length) {
          const indx = res.findIndex((p) => p.entityId === this.providerDetails.providerId && p.entityValueId === this.providerDetails.providerValueId);
          if (indx !== -1) {
            this.slotList = [];
            this.slotList = this.commonService.convertAppointmentDataToFlatList(res[indx].slotsDetails, this.timeFormateKey,
              res[indx].entityTag, this.providerDetails.providerName, this.providerDetails.providerId);
            this.slotList = this.displayDataByStatusPipe.transform(this.slotList, true, ['NEXT', 'SKIP', 'CALLING', 'COMPLETE'], true, true);
            const newSlot = [];
            if (this.selectedSlot && this.selectedSlot !== 'all') {
              const Tformat = 'hh:mm A';
              this.slotList.forEach(slot => {
                const time = moment(slot.slotTime, Tformat);
                const beforeTime = moment(this.selectedSlot.startTime, Tformat);
                const afterTime = moment(this.selectedSlot.endTime, Tformat);
                if (time.isBetween(beforeTime, afterTime, null, '[]')) {
                  // slot.slotTime = this.commonService.convertTime(
                  //   this.timeFormateKey,
                  //     slot.slotTime);
                  // slot.startTime = this.commonService.convertTime(this.timeFormateKey, slot.);
                  newSlot.push(slot);
                }
              });
              this.slotList = newSlot;
            }
            this.sortByTime(this.slotList);
            _.forEach(this.slotList, slot => {
              slot.slotTime = this.commonService.convertTime(
                this.timeFormateKey,
                slot.slotTime);
            });
          } else {
            this.slotList = [];
          }
        } else {
          this.slotList = [];
        }

      });
  }
  recheckAppointment(slotdetails) {
    if (_.isUndefined(this.providerDetails)) {
      this.alertMsg = {
        message: 'Please select Doctor/Service Provider / Joint Clinic .',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
      return;
    }
    const reqParams = {
      entityId: this.providerDetails.providerId,
      entityValueId: this.providerDetails.providerValueId,
      serviceId: 0,
      appTypeId: 0,
      sortingType: 'first',
      lapsedTimeSlot: false,
      timeDetailId: 0
    };
    this.queueService.getSingleAppointmentSlotByEntity(reqParams).subscribe(res => {
      const currentAvailableSlot = {
        slot: res,
        patUhid: slotdetails.patUhid,
        RecheckRefId: slotdetails.appointmentId
      };
      if (currentAvailableSlot.slot && currentAvailableSlot.slot.appt_time) {
        this.loadAppointmentConfirmationPopup('recheck', currentAvailableSlot);
      } else {
        this.alertMsg = {
          message: 'Slot not available!',
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
      }
    });
  }

  recheckbookconfirmAppointment(slotDetails) {
    // const sstartTime = this.commonService.convertTime(this.timeFormateKey, slotDetails.slot.slot_time_from);
    // const sendTime = this.commonService.convertTime(this.timeFormateKey,
    //   (slotDetails.slot.slot_time_to === '00:00:00' || slotDetails.slot.slot_time_to === '12:00 AM') ? '23:59' : slotDetails.slot.slot_time_to);

    const sTime = slotDetails.slot.appt_time ? moment(moment().format('YYYY-MM-DD') + ' ' + slotDetails.slot.appt_time).format('hh:mm A') : null;
    const endTime = slotDetails.slot.appt_time ? moment(slotDetails.slot.appt_time, 'hh:mm A').add(slotDetails.slot.default_time_per_patient, 'minutes').format('hh:mm A') : null;

    const req = {
      Pat_Uhid: slotDetails.patUhid,
      Appt_Slot_Id: slotDetails.slot.appt_slot_id,
      Token_Type: slotDetails.slot.token_type, //
      Start_Time: sTime,
      End_Time: endTime,
      Service_Duration: slotDetails.slot.default_time_per_patient,
      Remarks: '',
      Notes: '',
      Pat_Type: 'RECHECK',
      Services: [],
      Visit_Typeid: 2, // follow up
      IsBooking_FromTablet: false,
      Recheck_Ref_Id: slotDetails.RecheckRefId
    };
    this.appointmentService.savePatientAppointmentinQueue(req).subscribe((res: ApppointmentSuccessModel) => {
      if (res && res.isBooked) {
        this.getQueueAppointmentSlots();
        // this.qmsQlistLibService.prepaireBookingDataToAppHistory(this.patientData, this.selectedAppointementData, this.slotDetails);
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
    });
  }

  onDateChange(event): void {
    this.startDate = event;
    this.getQueueAppointmentSlots();
  }

  // -- check/uncheck all checkboxes
  onSelectAll() {
    this.slotList.forEach((s) => {
      if (s.bookingStatus !== 'COMPLETE') {
        s.checked = this.selectAll;
      }
    });
    // check mt one item checked
    const checkedCnt = _.filter(this.slotList, (slot) => slot.checked === true);
    this.showBulkButtons = (checkedCnt.length > 1);
  }

  isAllSelected() {
    const filterList = this.slotList.filter(r => r.bookingStatus !== 'COMPLETE');
    this.selectAll = filterList.every((item: any) => {
      return item.checked === true;
    });
    // check mt one item checked
    const checkedCnt = _.filter(this.slotList, (slot) => slot.checked === true);
    this.showBulkButtons = (checkedCnt.length > 1);
  }

  clearAllselectedCheckbox() {
    this.selectAll = false;
    this.slotList.forEach((s) => {
      s.checked = false;
    });
  }

  // -- cancel selected appointments
  bulkCancel() {
    const appIds = [];
    const filterList = this.slotList.filter(r => r.checked && r.bookingStatus !== 'COMPLETE');
    if (!filterList.length) {
      this.alertMsg = {
        message: 'Please select at least one appointment to cancel',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
      return;
    }
    const modalInstanceForCancelAllAppointment = this.modelService.open(ConfirmationPopupWithInputComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        windowClass: 'custom-modal'
      });
    modalInstanceForCancelAllAppointment.componentInstance.messageDetails = {
      modalTitle: 'CONFIRMATION',
      modalBody: 'All Appointments will be cancelled for ' + this.providerDetails.providerName,
      placeholderText: 'Add Remark',
    };
    modalInstanceForCancelAllAppointment.result.then((res1: any) => {
    }, (reason) => {
      if (reason.popupVal === 'ok') {
        filterList.forEach((val) => {
          // if (r.appointments.length) {
          //   r.appointments.forEach(a => {
          //     appIds.push(a.appointmentId);
          //   });
          // }
          appIds.push(val.appointmentId);
        });

        const reqParams = {
          date: null,
          remarks: '',
          appId: appIds
        };
        this.queueService.cancelBulkAppointments(reqParams).subscribe(res => {
          if (res.status_message === 'Success') {
            this.clearAllselectedCheckbox();
            this.showBulkButtons = false;
            filterList.forEach(f => {
              const indx = this.slotList.findIndex(s => s.slotId === f.slotId);
              if (indx !== -1) { this.slotList.splice(indx, 1); }
            });
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
        });
      }
    });
  }


  bulkDeleteConfirmation(appointmentSlot?) {
    const filterList = this.slotList.filter(r => r.checked && r.bookingStatus !== 'COMPLETE');
    if (!appointmentSlot) {
      if (!filterList.length) {
        this.alertMsg = {
          message: 'Please select at least one appointment to Delete',
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
        return;
      }
    }
    const modalTitleobj = 'CONFIRMATION';
    const modalBodyobj = 'Do you want to Delete appointments for ' + this.providerDetails.providerName;
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
        if (appointmentSlot) {
          this.bulkDeleteAppointment([appointmentSlot]);
        } else {
          this.bulkDeleteAppointment([...filterList]);
        }
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  bulkDeleteAppointment(list) {
    const appIds = [];
    list.forEach((val) => {
      appIds.push(val.appointmentId);
    });
    const reqParams = {
      appId: appIds
    };
    this.queueService.deleteBulkAppointments(reqParams).subscribe(res => {
      if (res.status_message === 'Success') {
        this.clearAllselectedCheckbox();
        this.showBulkButtons = false;
        list.forEach(f => {
          const indx = this.slotList.findIndex(s => s.slotId === f.slotId);
          if (indx !== -1) { this.slotList.splice(indx, 1); }
        });
        this.alertMsg = {
          message: 'Appointments are deleted successfully',
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
    });
  }

  // -- reschedule appointment
  onReschedule(item: QAppointments) {
    if (this.allAppointmentList.length > 0 && !this.selectedAppointmentEntity) { // all appointment list reschedule
      const obj = {
        entityTypeId: + item.queueTypeId,
        entityTypeName: item.queueType,
        entityTypeValueId: + item.queueValueId,
        entityTypeValueName: item.queueName
      };
      this.setProviderObject(obj);
    }
    let appointmentDetails: any = Object.assign(item, {
      entity_id: this.providerDetails.providerId,
      entity_value_id: this.providerDetails.providerValueId,
      entity_value_name: this.providerDetails.providerName
    });

    appointmentDetails.slot_details = appointmentDetails;
    const appList = new AppointmentListModel();
    appList.generateObj(appointmentDetails);
    appList.entity_data[0].appointment_type = appointmentDetails.appointmentType ? appointmentDetails.appointmentType : '';
    appointmentDetails = appList;
    appointmentDetails.entity_data = appointmentDetails.entity_data[0];
    appointmentDetails.entity_data.date = moment(this.startDate).format('DD-MM-YYYY');

    const modalInstanceReschedule = this.modelService.open(AppointmentBookLibComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        size: 'xl',
        container: '#homeComponent'
      });

    const modelInstance = modalInstanceReschedule.componentInstance as AppointmentBookLibComponent;
    modelInstance.patientData = {
      pat_name: item.patName,
      pat_uhid: item.patUhid,
      pat_gender: item.patGender,
      pat_Age: item.patAge, // get age with appropriate unit as a string
      pat_mobileno: item.patMobileNo,
      pat_dob: item.patDob,
    };
    modelInstance.selectedAppointementData = appointmentDetails;
    modelInstance.bookingData = item;
    modelInstance.source = 'reschedule';
    modelInstance.timeFormatKey = this.timeFormateKey;
    modelInstance.environmentDetails = environment;
    modelInstance.loginUserDetails = this.authService.getUserInfoFromLocalStorage();
    modelInstance.appointmentDate = this.startDate;
    modalInstanceReschedule.result.then((res) => {
      if (res === true) {
        this.getQueueAppointmentSlots();
      }
    }, () => { });
  }

  currentSelectedEntity($event): void {
    this.providerDetails = $event;
    // this.getQueueAppointmentSlots();
  }

  cancelAppointment(list: Array<QAppointments>, item: QAppointments): void {
    const modalInstance = this.modelService.open(ConfirmationPopupWithInputComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        windowClass: 'custom-modal'
      });
    modalInstance.componentInstance.messageDetails = {
      modalTitle: 'CONFIRMATION',
      modalBody: 'Do you want to cancel the appointment with ' + item.patName + '?',
      placeholderText: 'Add Remark'
    };
    modalInstance.result.then((res1: any) => {
    }, (reason) => {
      if (reason.popupVal === 'ok') {
        const reqParams = {
          Appt_Id: item.appointmentId,
          Appt_Date: moment(this.startDate).format('MM/DD/YYYY'), // MM/dd/yyyy
          Uhid: item.patUhid,
          Remarks: ''
        };
        this.queueService.cancelBookedAppointment(reqParams).subscribe(res => {
          if (res.status_message === 'Success') {

            const indx = this.slotList.findIndex(r => r.slotId === item.slotId);
            if (indx !== -1) {
              this.slotList.splice(indx, 1);
            }
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
        });
      }
    });

  }

  convertTime(timeVal) {
    let updateTimeVal = null;
    if (this.timeFormateKey === '12_hour' && timeVal) {
      updateTimeVal = moment(moment().format('YYYY-MM-DD') + ' ' + timeVal).format('hh:mm A');
    } else if (this.timeFormateKey === '24_hour' && timeVal) {
      updateTimeVal = moment(moment().format('YYYY-MM-DD') + ' ' + timeVal).format('HH:mm');
    }
    return updateTimeVal;
  }

  // -- confirm selected appointments
  onConfirm(): void {
    const appts = [];
    const filterList = this.slotList.filter(r => r.checked && r.bookingStatus !== 'CONFIRMED' && r.bookingStatus !== 'COMPLETE');
    filterList.forEach((r: QSlotInfoDummy) => {
      if (r.isBooked) {
        appts.push({
          appt_id: r.appointmentId,
          uhid: r.patUhid
        });
      }
    });

    const reqParams = {
      Remarks: '',
      Notes: '',
      appointments: appts
    };

    if (!appts.length) {
      this.alertMsg = {
        message: 'You have selected already confirmed appointments.',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
      return;
    }
    this.confirmBulkAppointments(reqParams);
    this.showBulkButtons = false;
    // const checkedCnt = _.filter(this.slotList, (slot) => slot.checked === true);
    // this.showBulkButtons = (checkedCnt.length > 1);
  }

  // -- confirm single appointment
  onConfirmAppointment(slot: QSlotInfoDummy): void {
    const appts = [];
    if (slot.isBooked) {
      appts.push({
        appt_id: slot.appointmentId,
        uhid: slot.patUhid,
        appt_slot_id: slot.slotId
      });
      // slot.appointments.forEach(a => {
      //   appts.push({
      //     appt_id: a.appointmentId,
      //     uhid: a.patUhid
      //   });
      // });
    }

    const reqParams = {
      Remarks: '',
      Notes: '',
      appointments: appts
    };

    if (!appts.length) {
      this.alertMsg = {
        message: 'Please select at least one appointment',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
      return;
    }
    this.confirmBulkAppointments(reqParams,slot);
    const checkedCnt = _.filter(this.slotList, (s: any) => s.checked === true);
    this.showBulkButtons = (checkedCnt.length > 1);
  }

  confirmBulkAppointments(reqParams,slot?) {
    this.appointmentService.confirmBulkBookedAppointment(reqParams).subscribe(res => {
      if (res.status_message === 'Success') {
        this.getPrintData(slot)
        if (this.allAppointmentList.length > 0 && !this.selectedAppointmentEntity) {
          this.getAllAppointmentList.emit();
        } else {
          this.getQueueAppointmentSlots();
        }
        this.clearAllselectedCheckbox();
        this.alertMsg = {
          message: 'Confirmed selected appointments',
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
    });
    const checkedCnt = _.filter(this.slotList, (slot) => slot.checked === true);
    this.showBulkButtons = (checkedCnt.length > 1);

  }
  trackByFunction = (index, item: QSlotInfoDummy) => {
    if (!item) { return null; }
    return item.appointmentId;
  }

  delayNotification(): void {
    const modalInstanceDelayNotification = this.modelService.open(DelayNotificationPopupLibComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        windowClass: 'custom-modal',
        container: '#homeComponent',
        size: 'lg'
      });
    const userList = [];
    _.map(this.mapeduserList, (v) => {
      const tempObj = {
        entity_id: v.entityTypeId,
        entity_name: v.entityTypeName,
        providerType: null,
        entity_value_id: v.entityTypeValueId,
        entity_value_name: v.entityTypeValueName
      };
      const providerData = new Provider(tempObj);
      userList.push(providerData);
    });

    modalInstanceDelayNotification.componentInstance.messageDetails = {
      modalTitle: 'Send Delay notification',
      modalBody: '',
      providerDetails: this.providerDetails
    };
    modalInstanceDelayNotification.componentInstance.environmentDetails = environment;
    modalInstanceDelayNotification.componentInstance.frontDeskProviderList = this.viewAccessAllAppointments ? [this.providerDetails] : this.isShowAllAppointment ? userList : [];
    modalInstanceDelayNotification.componentInstance.isFrontDesk = this.isShowAllAppointment;
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
            this.clearAllselectedCheckbox();
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

  loadAppointmentConfirmationPopup(confirmationFor, data?) {
    const modalTitleobj = 'CONFIRMATION';
    const modalBodyobj = confirmationFor === 'confirmAll' ? 'Do you want to confirm selected appointments for ' + this.providerDetails.providerName + ' ?' :
      confirmationFor === 'recheck' ? 'Do you want to Re check selected appointment ?' : '';
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
        if (confirmationFor === 'confirmAll') {
          this.onConfirm();
        } else if (confirmationFor === 'recheck') {
          // book appointment
          this.recheckbookconfirmAppointment(data);
        }
      }
    }, () => { });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  getPrintAppointment() {
    if (this.slotList.length > 0) {
      this.printData = null;
      const printData = {
        printFor: 'manage_appointment',
        headerColumn: Constants.APPOINTMENT_PRINT_HEAD_LIST,
        bodyData: [],
        printHeading: {
          heading: 'Appointment List',
          userData: this.providerDetails.providerName
        },
        date: this.startDate,
      };
      _.map(this.slotList, (v) => {
        const appointmentPrint = new AppointmentPrint();
        const bData = {
          slotTime: v.slotTime,
          patName: v.patTitle + '. ' + v.patName,
          patType: v.patType,
          remark: v.appointmentRemark,
          patUhid: v.patUhid,
          patGender: v.patGender,
          patDob: v.patDob,
          patAge: v.patAge,
          patContact: v.patMobileNo,
          appTakenBy: v.addedBy,
          visitType: v.visitTypeName
        };
        appointmentPrint.generateObject(bData);
        printData.bodyData.push(appointmentPrint);
      });
      this.printData = printData;
    } else {
      this.alertMsg = {
        message: 'No Appointment Found!',
        messageType: 'warning',
        duration: Constants.ALERT_DURATION
      };
    }
  }

  sortByTime(allSlots) {
    allSlots.sort((a, b) => {
      const first: any = new Date('1970/01/01 ' + a.slotTime);
      const second: any = new Date('1970/01/01 ' + b.slotTime);
      const diff: any = first - second;
      return diff;
    });
  }

  showAppointmentHistory(appointmentId) {
    // this.modalInstanceForAppointmentHistory = this.modelService.open(AppointmentHistoryComponent,
    //   {
    //     ariaLabelledBy: 'modal-basic-title',
    //     backdrop: 'static',
    //     keyboard: false,
    //     windowClass: 'custom-modal',
    //     size: 'lg',
    //     container: '#homeComponent'
    //   });
    // this.modalInstanceForAppointmentHistory.componentInstance.appointmentId = appointmentId;
    this.selectedAppointmentId = appointmentId;
    this.commonService.openCloselogSlider('open');
  }
  closeLogSlider() {
    this.commonService.openCloselogSlider('close');
  }
  onPopoverClick(ele: NgbPopover): void {
    if (ele) {
      this.ngbPopover = ele;
    }
  }
  getAllEntityList() {
    this.entityBasicInfoService.getAllEntityList().subscribe(res => {
      if (res.length > 0) {
        this.entityList = res;
      }
    });
  }
  selectEntity(e) {
    this.serviceProvider = null;
    this.doctor = null;
    this.jointClinic = null;
    this.slotList = [];
    this.filterAllAppointmentOnEntity = false;
    this.isEntityLoad = false;
    this.selectAll = false;
    this.showBulkButtons = false;
    this.selectedAppointmentEntity = null;
    this.entity = e ? e : '';
    this.commonService.currentSelectedEntity = null;
    this.updateValuesOnEntityChange(e ? e.key : '');
    this.isEntityLoad = true;
    if (e === undefined) {
      this.isDateSelected = false;
      this.startDate = new Date();
      this.commonService.manageAppointmentFilterData = null;
      this.commonService.setCurrentSelectedProvider(null);
      this.isEntitySelected();
      this.commonService.sendFilterEvent.next({
        dateFlag: true
      });
    }
  }
  selectValue(e): void {
    this.serviceProvider = null;
    this.doctor = null;
    this.jointClinic = null;
    this.slotList = [];
    this.filterAllAppointmentOnEntity = false;
    this.selectAll = false;
    this.showBulkButtons = false;
    this.selectedAppointmentEntity = null;
    if (e) {
      this.selectedAppointmentEntity = {
        displayMapUserName: e.name + (this.entity.name),
        entityTypeId: this.entity.id,
        entityTypeName: this.entity.name,
        entityTypeValueId: e.id,
        entityTypeValueName: e.name
      };
      this.isDateSelected = true;
      // this.GetQueueAppointmentSlotOnEntityId(this.selectedAppointmentEntity);
      this.GetAllAppointmentOnEntityId();
      this.isEntitySelected();
    } else {
      this.commonService.currentSelectedEntity = null;
      this.commonService.manageAppointmentFilterData = null;
      this.commonService.setCurrentSelectedProvider(null);
      this.isEntitySelected();
      this.commonService.sendFilterEvent.next({
        dateFlag: true
      });
    }
  }
  GetAllAppointmentOnEntityId() {
    this.filterAllAppointmentOnEntity = true;
    this.setProviderObject(this.selectedAppointmentEntity);
    this.getQueueAppointmentSlots();
  }
  updateValuesOnEntityChange(key) {
    if (key === 'service_provider') {
      this.getAllServiceProviderList().subscribe();
    } else if (key === 'doctor') {
      this.getAllDoctorList().subscribe();
    } else if (key === 'joint_clinic') {
      this.getAllJointClinicList().subscribe();
    }
  }

  getAllServiceProviderList(searchKey?): Observable<any> {
    const params = {
      limit: environment.limitDataToGetFromServer,
      search_text: searchKey ? searchKey : null,
      id: Constants.entitytypeserviceproviderId, // service_provider
      specialityId: null
    };
    return this.compInstance.entityBasicInfoService.getAllServiceProviderList(params).pipe(map(res => {
      if (res.length > 0) {
        return this.compInstance.serviceProviderList = res;
      } else {
        this.alertMsg = {
          message: 'no service provider data find',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
        return this.compInstance.serviceProviderList = [];
      }
    }));
  }
  getAllDoctorList(searchKey?: string): Observable<any> {
    const params = {
      limit: environment.limitDataToGetFromServer,
      search_text: searchKey ? searchKey : '',
      id: Constants.entitytypedoctorId, // doctor
      specialityId: null
    };
    return this.compInstance.entityBasicInfoService.getAllServiceProviderList(params).pipe(map(res => {
      if (res.length > 0) {
        this.compInstance.doctorList = res;
        return this.compInstance.doctorList = res;
      } else {
        return this.compInstance.doctorList = [];
      }
    }));
  }
  getAllJointClinicList(searchKey?): Observable<any> {
    const params = {
      limit: environment.limitDataToGetFromServer,
      search_text: searchKey ? searchKey : '',
      id: Constants.entitytypejointclinicId, // joint_clinic
      specialityId: null
    };
    return this.compInstance.entityBasicInfoService.getAllServiceProviderList(params).pipe(map(res => {
      if (res.length > 0) {
        return this.compInstance.jointClinicList = res;
      } else {
        this.alertMsg = {
          message: 'Joint Clinic data not find',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
        return this.compInstance.jointClinicList = [];
      }
    }));
  }
  showActivePopup() {
    this.commonService.$addPopupEvent.pipe(takeUntil(this.$destroy)).subscribe(popup => {
      if (popup && popup.redirectFromPage === '/appointmentApp/appointments/list/appointmentsList') {
        this.showAddPatientPopup = popup.isShowAddPopup;
        this.addPatientModal();
      } else {
        this.showAddPatientPopup = false;
      }
    });
  }
  addPatientModal(event?): void {
    const modalInstance = this.modelService.open(AddPatientComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        windowClass: 'custom-modal',
        size: 'xl',
        container: '#homeComponent'
      });
    modalInstance.componentInstance.isModal = true;
    modalInstance.componentInstance.newPatientDetails = event ? event.searchString : '';
    modalInstance.componentInstance.addPatModalValues.subscribe((receivedValue) => {
      // if (receivedValue.checkDefualtSelect) {
      //   this.getPatientList(receivedValue.pat_uhid).subscribe(res => {
      //     this.onSelectPatient(res[0]);
      //   });
      // } else {
      //   this.onSelectPatient(null);
      // }
    });
  }
  // checkIsConfirmCheckboxSelected(checkedList) {
  //   const checkedIndex = _.findIndex(checkedList, (o) => o.bookingStatus === 'CONFIRMED');
  //   this.isConfirmSelected = false;
  //   if (checkedIndex !== -1) {
  //     this.isConfirmSelected = true;
  //     this.alertMsg = {
  //       message: 'Some appointments are already confirmed!',
  //       messageType: 'warning',
  //       duration: Constants.ALERT_DURATION
  //     };
  //   }
  // }

  // onScroll(): void {
  //   if (this.ngbPopover) {
  //     this.ngbPopover.close();
  //   }
  // }

  getPrintData(data) {
    const url = environment.HIS_Add_PatientCommon_API + '/ShowReport/PatientAppoinmentSlip/?APPOINTMENTID=' + data.appointmentId;
    this.printData = { url: url, returnType: false };
  }
}

