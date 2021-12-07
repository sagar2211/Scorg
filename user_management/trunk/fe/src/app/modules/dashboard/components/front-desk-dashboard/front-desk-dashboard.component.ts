import { environment } from './../../../../../environments/environment';
import { ConfirmationPopupDelayNotificationComponent } from './../../../../shared/components/confirmation-popup-delay-notification/confirmation-popup-delay-notification.component';
import { Provider } from './../../../../shared/models/provider';
import { DashBoardService } from './../../services/dashboard.service';
import { AppointmentListModel } from './../../../appointment/models/appointment.model';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { Constants } from 'src/app/config/constants';
import { IAlert } from './../../../../models/AlertMessage';
import { AuthService } from './../../../../services/auth.service';
import { QueueService } from 'src/app/modules/qms/services/queue.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from './../../../../services/common.service';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { FrontDeskDashboardData } from '../../../qms/models/front-desk.model';
import { QSlotInfoDummy, QAppointmentDetails } from '../../../qms/models/q-entity-appointment-details';
import { takeUntil, switchMap, map } from 'rxjs/operators';
import { Subject, forkJoin, scheduled, Subscription, timer, Observable } from 'rxjs';
import { AppointmentService } from 'src/app/modules/appointment/services/appointment.service';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { ModifyScheduleComponent, QmsQlistLibService, DelayNotificationPopupLibComponent } from '@qms/qlist-lib';
import { EntitySettingsService } from 'src/app/modules/appointment/services/entity-settings.service';
import { SlideInOutAnimation } from 'src/app/config/animations';

@Component({
  selector: 'app-front-desk-dashboard',
  templateUrl: './front-desk-dashboard.component.html',
  styleUrls: ['./front-desk-dashboard.component.scss'],
  animations: [SlideInOutAnimation]
})
export class FrontDeskDashboardComponent implements OnInit, OnDestroy {
  userInfo = null;
  alertMsg: IAlert;
  dashboardData: FrontDeskDashboardData = null;
  appointmentData = null;
  providerDetails = null;
  UserDetails = null;

  // ngx-table related
  page = null;
  sortDoctorMappingList: { sort_order: string; sort_column: string; };
  qSlotList: Array<QSlotInfoDummy> = [];
  timeFormateKey = '';
  serviceDetailsModel;
  searchText = '';
  initialDashboardData: FrontDeskDashboardData = null;
  $destroy: Subject<boolean> = new Subject();
  frontDeskProviderList: any = [];
  allowlapsedtime = true;
  PermissionsConstantsList: any = [];
  environment: any;
  serviceProviderDetailsData: any;
  isShowInstruction: boolean;
  animationState = 'out';
  ngbPopover: NgbPopover;
  entityName: string;
  PermissionsConstantsListforLib: any = [];
  subscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
    private queueService: QueueService,
    private authService: AuthService,
    public modalService: NgbModal,
    private dashBoardService: DashBoardService,
    private appointmentService: AppointmentService,
    private entitySettingsService: EntitySettingsService,
    private router: Router,
    private qmsQlistLibService: QmsQlistLibService
  ) { }

  ngOnInit() {
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortDoctorMappingList = { sort_order: 'asc', sort_column: 'user' };
    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    this.commonService.routeChanged(this.route);
    this.commonService.setCurrentSelectedProvider(null);
    this.PermissionsConstantsList = PermissionsConstants;
    this.timeFormateKey = this.authService.getUserInfoFromLocalStorage().timeFormat;
    const lapsTimeSetting = this.commonService.getQueueSettings(Constants.allowLapsedTimeBooking);
    this.PermissionsConstantsListforLib = this.commonService.getuserpermissionForlib();

    forkJoin([lapsTimeSetting]).subscribe(res => {
      this.allowlapsedtime = res[0];
    });
    this.timerSubscribeEvents();

    this.commonService.$subInstructionSliderOpenClose.pipe(takeUntil(this.$destroy)).subscribe((obj: any) => {
      if (obj === 'open') {
        this.isShowInstruction = true;
        this.animationState = this.isShowInstruction ? 'in' : 'out';
      } else {
        this.isShowInstruction = false;
        this.animationState = 'out';
      }
    });

    this.subscribeEvents();
    this.environment = environment;
  }

  timerSubscribeEvents() {
    this.subscription = timer(0, 120000).pipe(
      switchMap(() => this.getDashboardData())
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.modalService.dismissAll();
    this.$destroy.next();
    this.$destroy.unsubscribe();
    this.subscription.unsubscribe();
  }
  getDashboardData(): Observable<any> {
    return this.dashBoardService.getFrontDeskDashboardData(this.userInfo.user_id, this.allowlapsedtime).pipe(map((res: FrontDeskDashboardData) => {
      if (res) {
        this.dashboardData = res;
        // set front desk provider list
        _.forEach(this.dashboardData.entityTimeData, (d) => {
          d.startTime = _.clone(this.convertTime(d.startTime));
          d.endTime = _.clone(this.convertTime(d.endTime));
          const tempObj = {
            entity_id: d.entityId,
            entity_name: d.entityName,
            providerType: null,
            entity_value_id: d.entityValueId,
            entity_value_name: d.entityValueName
          };
          const providerData = new Provider(tempObj);
          this.frontDeskProviderList.push(providerData);
        });

        this.initialDashboardData = _.cloneDeep(this.dashboardData);
        // this.alertMsg = {
        //   message: 'Data loaded successfully',
        //   messageType: 'success',
        //   duration: Constants.ALERT_DURATION
        // };
      } else {
        // this.alertMsg = {
        //   message: 'No records found',
        //   messageType: 'danger',
        //   duration: Constants.ALERT_DURATION
        // };
      }
      return this.dashboardData;
    }));
  }

  onSortChanged(event): void {
    if (event.sorts.length > 0) {
      const obj = event.sorts[0];
      this.sortDoctorMappingList.sort_order = obj.dir;
    }
  }

  getDetails(row, serviceDetailsTemplate): void {

    const tempObj = {
      config_id: row.configId,
      entity_id: row.entityId,
      entity_value_id: row.entityValueId,
      entity_value_name: row.entityValueName,
      slot_details: {
        appointment_type: '',
        appointment_type_id: row.appointemntTypeId,
        appt_date: new Date(),
        end_time: row.endTime,
        start_time: row.startTime,
        time_detail_id: row.timeDetailId,
        total_available_count: row.slotAvailable,
        total_slot_count: row.totalSlotCount,
        used_slot_count: 0,
        slot_data: [],
      },
      time_subdetail_id: '',
      token_type: row.token_type,
      parallel_booking_allow: row.parallel_booking_allow,
      parallel_max_patients: row.parallel_max_patients,
      default_time_per_patient: row.defaultTimePerPatient
    };
    const app = new AppointmentListModel();
    app.generateObj(tempObj);
    app.entity_data = app.entity_data[0];
    this.appointmentData = app;

    this.router.navigate(['appointmentApp/appointments/book/quickbookappointment',
      this.appointmentData.entity_id,
      this.appointmentData.entity_value_id]);

    // this.serviceDetailsModel = this.modalService.open(serviceDetailsTemplate,
    //   {
    //     ariaLabelledBy: 'modal-basic-title',
    //     backdrop: 'static',
    //     size: 'xl',
    //     keyboard: false,
    //     windowClass: 'custom-modal',
    //     container: '#homeComponent'
    //   });
  }

  onManage(row, walkInTemplateRef): void {
    const tempObj = {
      entity_id: row.entityId,
      entity_value_id: row.entityValueId,
      entity_value_name: row.entityValueName,
      entity_name: row.entityName,
    };
    const providerData = new Provider(tempObj);
    this.providerDetails = providerData;
    this.qmsQlistLibService.setCurrentSelectedProvider(this.providerDetails);
    this.queueService.getEntityAppointmentBookingBySequence(row.entityValueId, providerData.providerId,
      providerData.providerValueId, new Date(), null, false).subscribe((res: Array<QAppointmentDetails>) => {
        this.qSlotList = [];
        if (res.length) {
          const indx = res.findIndex((p) => p.entityId === row.entityId && p.entityValueId === row.entityValueId);
          if (indx !== -1) {
            // const details = res[indx].slotsDetails;
            // details.forEach(r => {
            //   let t = r as QSlotInfoDummy;
            //   if (r.appointments.length) {
            //     r.appointments.forEach(v => {
            //       t = Object.assign(t, v);
            //       t.slotTime = _.clone(this.convertTime(t.slotTime));
            //       this.qSlotList.push(t);
            //     });
            //   } else {
            //     t.slotTime = _.clone(this.convertTime(t.slotTime));
            //     this.qSlotList.push(t);
            //   }
            // });
            this.qSlotList = this.commonService.convertAppointmentDataToFlatList(res[indx].slotsDetails, this.timeFormateKey);
          }
        }
        this.openManageContent(walkInTemplateRef);
      });
  }

  openManageContent(walkInTemplateRef) {
    this.subscription.unsubscribe();
    const modalInstance = this.modalService.open(walkInTemplateRef,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        windowClass: 'custom-modal modal-xxl',
        container: '#modelOpenContent'
      });
    modalInstance.result.then(() => { }, (reason) => {
      this.frontDeskProviderList = [];
      this.timerSubscribeEvents();
      this.clearSearchFilter();
    });
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

  ManageAppointmentModal(row): void {
    const tempObj = {
      entity_id: row.entityId,
      entity_name: row.entityName,
      entity_value_id: row.entityValueId,
      entity_value_name: row.entityValueName,
    };
    const providerData = new Provider(tempObj);
    this.providerDetails = providerData;
    this.commonService.setCurrentSelectedProvider(this.providerDetails);
    this.router.navigate(['appointmentApp/appointments/listfd/fduserappointmentsList']);
    // const ManageAppointmentModalInstance = this.modalService.open(ManageAppointmentTemplateRef,
    //   {
    //     ariaLabelledBy: 'modal-basic-title',
    //     backdrop: 'static',
    //     keyboard: false,
    //     windowClass: 'custom-modal',
    //     size: 'xl',
    //     container: '#homeComponent'
    //   });
    // ManageAppointmentModalInstance.result.then(() => { }, (reason) => {
    //   this.getDashboardData();
    // });
  }

  ManageCalendarModal(row, ManageCalendarTemplateRef): void {
    const tempObj = {
      entity_id: row.entityId,
      entity_value_id: row.entityValueId,
    };
    this.entityName = row.entityValueName;
    this.UserDetails = tempObj;
    const ManageCalendarModalInstance = this.modalService.open(ManageCalendarTemplateRef,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        windowClass: 'custom-modal',
        size: 'xl',
        container: '#homeComponent'
      });
    ManageCalendarModalInstance.result.then(() => { }, (reason) => {
      this.getDashboardData().subscribe();
      this.clearSearchFilter();
    });
  }
  slotClick(eventData: boolean) {
    this.serviceDetailsModel.close();
    console.log(eventData);
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase().trim();
    this.searchText = val;
    let temp = [];
    // filter our data
    if (val) {
      temp = _.filter(this.initialDashboardData.entityTimeData, (d) => {
        const entityValName = (d.entityValueName == null) ? '' : d.entityValueName;
        const departmentName = (d.departmentName == null) ? '' : d.departmentName;
        return entityValName.toLowerCase().trim().indexOf(val) !== -1 || departmentName.toLowerCase().trim().indexOf(val) !== -1 || !val;
      }
      );
      // update the rows
      this.dashboardData.entityTimeData = [...temp];
    } else {
      this.dashboardData.entityTimeData = _.cloneDeep(this.initialDashboardData.entityTimeData);
    }
    // Whenever the filter changes, always go back to the first page
    // this.table.offset = 0;
  }

  clearSearchFilter(): void {
    this.dashboardData.entityTimeData = _.cloneDeep(this.initialDashboardData.entityTimeData);
    this.searchText = '';
  }

  subscribeEvents(): void {
    this.appointmentService.$slotViewDetailsPopClose.pipe(takeUntil(this.$destroy)).subscribe((res) => {
      if (res) {
        this.getDashboardData().subscribe();
      }
    });
  }

  delayNotification(row): void {
    const tempObj = {
      entity_id: row.entityId,
      entity_value_id: row.entityValueId,
      entity_value_name: row.entityValueName,
    };
    const providerData = new Provider(tempObj);
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
      providerDetails: providerData
    };
    modalInstanceDelayNotification.componentInstance.environmentDetails = environment;
    modalInstanceDelayNotification.componentInstance.isFrontDesk = true;
    modalInstanceDelayNotification.componentInstance.frontDeskProviderList = this.frontDeskProviderList;
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

  ModifySchedule(row) {
    const tempObj = {
      entity_id: row.entityId,
      entity_value_id: row.entityValueId,
      entity_value_name: row.entityValueName,
    };

    const providerDetails = {
      providerId: row.entityId,
      providerValueId: row.entityValueId,
      providerName: row.entityValueName
    }
    const modalRef = this.modalService.open(ModifyScheduleComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      container: '#homeComponent',
      size: 'lg'
    });
    modalRef.componentInstance.providers = providerDetails;
    // this.modalRef.componentInstance.scheduleList = [];
    modalRef.componentInstance.environmentDetails = environment;
    modalRef.componentInstance.isFrontDesk = true;
    modalRef.componentInstance.frontDeskProviderList = this.frontDeskProviderList;
    modalRef.componentInstance.loginUserDetails = this.authService.getUserInfoFromLocalStorage();
    modalRef.result.then((res) => {
    }, (reason) => {
      modalRef.close();
    });
  }
  onPopoverClick(ele: NgbPopover): void {
    if (ele) {
      this.ngbPopover = ele;
      if (ele.isOpen()) {
        ele.close();
      } else {
        ele.open();
      }
    }
  }

  onScrollForPopOver(): void {
    if (this.ngbPopover) {
      this.ngbPopover.close();
    }
  }

  isOpenEntityInstructionBar(item) {
    const schedulingDate = moment().format('MM/DD/YYYY');
    // Open instruction slider
    this.commonService.openCloseInstruction('open');
    let serviceProviderDetailsData = null;
    let hoidayDetails = [];
    const $requestParamsSPDetails = {
      entity_id: item.entityId,
      entity_data_id: item.entityValueId,
      service_id: 0,
      scheduling_date: schedulingDate
    };

    // get service provider name

    this.appointmentService.getServiceProviderDetails($requestParamsSPDetails).subscribe(res => {
      const params = {
        entity_id: $requestParamsSPDetails.entity_id,
        entityvalue_id: $requestParamsSPDetails.entity_data_id,
        search_text: '',
        limit: 1000, // 0
        current_page: 1,
        sort_order: 'desc',
        sort_column: 'date_from',
        from_date: '', // moment().format(Constants.apiDateFormate)
        to_date: '',
        is_active: true,
        block_type: ''
      };
      this.entitySettingsService.getDoctorHolidaySettings(params).subscribe(holiday => {
        const currentDate = moment().format('YYYY-MM-DD');
        params.block_type = 'block';
        let blockDetailList = [];
        if (holiday.entityBlock_Holiday_Data && holiday.entityBlock_Holiday_Data.details.length) {
          hoidayDetails = _.filter(holiday.entityBlock_Holiday_Data.details, (o) => {
            const dateFrom = moment(o.date_from, 'DD-MM-YYYY').format('YYYY-MM-DD');
            return o.is_active === true && moment(dateFrom).isSameOrAfter(currentDate) && o.block_type === 'holiday';
          });
          const blockList = _.filter(holiday.entityBlock_Holiday_Data.details, (o) => {
            const dateFrom = moment(o.date_from, 'DD-MM-YYYY').format('YYYY-MM-DD');
            return o.is_active === true && moment(dateFrom).isSameOrAfter(currentDate) && o.block_type === 'block';
          });
          // const displayList = _.filter(this.displayList, (f) => {
          //   return f.entity_value_id === params.entityvalue_id;
          // });
          const uniqueDateWiseDisplayList = _.groupBy(blockList, (o) => o.date_from);
          blockDetailList = this.filterInfoBlockDetails(uniqueDateWiseDisplayList);
        }
        serviceProviderDetailsData = {
          serviceProviderName: item.entityValueName,
          scheduled_config_details: res.scheduled_config_details,
          holidayList: hoidayDetails,
          entityParams: params,
          blockDetailsList: blockDetailList,
          defaultTab: 'tab-instruction'
        };
        // this.providerInfo.emit({ data: serviceProviderDetailsData });
        this.setServiceProviderDetailsInfoData(serviceProviderDetailsData);
      });
    });
  }

  setServiceProviderDetailsInfoData(event) {
    this.serviceProviderDetailsData = event;
  }

  filterInfoBlockDetails(entityblockList) {
    const blockhash = [];
    _.map(entityblockList, (groupVal, date) => {
      const obj = {
        key: date,
        value: groupVal
      };
      blockhash.push(obj);
    });
    return blockhash;
  }

  closeInstruction() {
    this.commonService.openCloseInstruction('close');
  }

  redirectCalendarView(row) {
    const tempObj = {
      entity_id: row.entityId,
      entity_name: row.entityName === 'SERVICE_PROVIDER' ? 'SERVICE PROVIDER' :
      row.entityName === 'JOINT_CLINIC' ? 'JOINT CLINIC' : row.entityName,
      entity_value_id: row.entityValueId,
      entity_value_name: row.entityValueName,
      entity_alias: row.entityName
    };
    const providerData = new Provider(tempObj);
    this.providerDetails = providerData;
    this.commonService.setCurrentSelectedProvider(this.providerDetails);
    this.router.navigate(['appointmentApp/appointments/calendar']);
  }

  getOpdStatus(row) {
    if (row.isCheckIn && row.isPaused) {
      return 'Paused ' + row.pausedMin + ' mins';
    }
    return row.isCheckIn ? 'Checked In' :
      row.isCheckOut ? 'Checked Out' :
        row.isOnHoliday ? 'Doctor is on Holiday' :
          (row.startTime === null && row.endTime === null) ? 'Schedule Not Available' :
            'N/A';
  }
}





