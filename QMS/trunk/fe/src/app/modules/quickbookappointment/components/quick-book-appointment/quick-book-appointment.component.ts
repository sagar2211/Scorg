import { map, takeUntil } from 'rxjs/operators';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { FrontDeskEntityMappingService } from 'src/app/modules/qms/services/front-desk-entity-mapping.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GetAppointmentListByEntity } from 'src/app/models/all-api-service-request.model';
import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { CommonService } from 'src/app/services/common.service';
import { AuthService } from 'src/app/services/auth.service';
import { SlideInOutAnimation } from 'src/app/config/animations';
import { IAlert } from 'src/app/models/AlertMessage';
import { AppointmentListModel } from 'src/app/modules/appointment/models/appointment.model';
import { AppointmentService } from 'src/app/modules/appointment/services/appointment.service';
import { EntitySettingsService } from 'src/app/modules/appointment/services/entity-settings.service';

@Component({
  selector: 'app-quick-book-appointment',
  templateUrl: './quick-book-appointment.component.html',
  styleUrls: ['./quick-book-appointment.component.scss'],
  animations: [SlideInOutAnimation]
})
export class QuickBookAppointmentComponent implements OnInit {
  patientInfo: any;
  followUpDetails: any = null;
  searchDataByPatientHistory: any;
  isShowAvailableComp = false;
  isShowAppointmentViewComp = false;
  searchRequestParams = null;
  providerInforequestParams: {};
  timeFormateKey = '';
  appointmentData = null;
  public appontmentSlotDate: Date = new Date();
  selectedEntity: any;
  availableAppointmentSlotsList: Array<AppointmentListModel> = [];
  userId: number;
  mappedUserList = [];
  isSlotViewFormLoad = false;
  isShowInstruction: boolean;
  animationState = 'out';
  loganimationState = 'out';
  selectedAppointmentDetailsId: any = null;
  isShowLog = false;
  $destroy = new Subject<boolean>();
  alertMsg: IAlert;
  serviceProviderDetailsData: any;

  constructor(
    private appointmentService: AppointmentService,
    private commonService: CommonService,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private frontdeskentityMappingService: FrontDeskEntityMappingService,
    private entitySettingsService: EntitySettingsService,
  ) { }

  ngOnInit() {
    this.isSlotViewFormLoad = false;
    this.commonService.routeChanged(this.activatedRoute);
    this.userId = +this.authService.getLoggedInUserId();
    const selectedProvider = this.commonService.getCurrentSelectedProvider();
    this.timeFormateKey = this.authService.getUserInfoFromLocalStorage().timeFormat;
    const paramsForSelectedId = {
      eid: 0,
      evalueid: 0
    };
    this.getAllMappingUserList().subscribe(res => {
      if (this.activatedRoute.snapshot.params.eid) {
        const entityData = this.activatedRoute.snapshot.params;
        const objFind = _.find(this.mappedUserList, (o) => o.entityTypeValueId === +entityData.evalueid);
        if (objFind) {
          this.selectedEntity = objFind;
        }
        paramsForSelectedId.eid = +entityData.eid;
        paramsForSelectedId.evalueid = +entityData.evalueid;
        this.getAppointmentData(paramsForSelectedId);
      } else if (selectedProvider) {
        const filterData = this.commonService.manageAppointmentFilterData;
        if (filterData) {
          // this.appontmentSlotDate = filterData.startDate;
          this.getAppointmentList(filterData);
        }
        const objFind = _.find(this.mappedUserList, (o) => o.entityTypeValueId === selectedProvider.providerValueId);
        if (objFind) {
          this.selectedEntity = objFind;
        }
        paramsForSelectedId.eid = selectedProvider.providerId;
        paramsForSelectedId.evalueid = selectedProvider.providerValueId;
        this.getAppointmentData(paramsForSelectedId);
      }
    });
    this.commonService.$logSliderOpenClose.pipe(takeUntil(this.$destroy)).subscribe((obj: any) => {
      if (obj === 'open') {
        this.isShowLog = true;
        this.loganimationState = this.isShowLog ? 'in' : 'out';
      } else {
        this.selectedAppointmentDetailsId = null;
        this.isShowLog = false;
        this.loganimationState = 'out';
      }
    });

    this.commonService.$subInstructionSliderOpenClose.pipe(takeUntil(this.$destroy)).subscribe((obj: any) => {
      if (obj === 'open') {
        this.isShowInstruction = true;
        this.animationState = this.isShowInstruction ? 'in' : 'out';
      } else {
        this.isShowInstruction = false;
        this.animationState = 'out';
      }
    });
    this.commonService.$receiveBookAppEvent.subscribe(res => {
      if (res.source === 'rescheduleFromQuickBook' && this.selectedEntity) {
        this.getAppointmentDataForSelectedEntity();
      }
    });
  }
  setTempObj() {
    const tempObj = {
      config_id: 0,
      entity_id: 0,
      entity_value_id: 0,
      entity_value_name: '',
      token_type: '',
      entity_data: {
        appointment_type: '',
        appointment_type_id: 0,
        start_time: null,
      },
    };
    this.appointmentData = tempObj as AppointmentListModel;
  }
  getAppointmentData(entityData) {
    const reqParams = {
      entity_id: entityData.eid,
      entity_value_id: entityData.evalueid,
      speciality_id: 0, // Optional
      service_id: 0, // optional
      appointment_type_id: 0,
      date: moment(this.appontmentSlotDate).format('MM/DD/YYYY'), // MM/dd/yyyy format required
      start_time: null
    };
    this.getAppointmentListAPI(reqParams);
  }
  getPatientInfo($event) {
    this.patientInfo = $event;
  }
  recieveFollowUpDetails(event): void {
    this.followUpDetails = event;
  }
  receiveAppointmentSearchEntity(event): void {
    this.searchDataByPatientHistory = event;
    const objFind = _.find(this.mappedUserList, (o) => o.entityTypeValueId === event.entityValue[0].entityValueId);
    if (objFind) {
      this.selectedEntity = objFind;
      this.getAppointmentDataForSelectedEntity();
    } else {
      this.alertMsg = {
        message: 'Doctor is Not mapped with this user',
        messageType: 'warning',
        duration: 3000
      };
    }
  }
  getAppointmentList($event): void {
    this.appontmentSlotDate = $event.startDate;
  }

  getAppointmentListAPI(reqParams) {
    this.appointmentService.getAppointmentListByEntity(reqParams as GetAppointmentListByEntity).subscribe((res: any) => {
      _.map(res.appointment_List, (pv) => {
        _.map(pv.entity_data, (cv) => {
          cv.start_time = _.clone(this.convertTime(cv.start_time));
          cv.end_time = _.clone(this.convertTime(cv.end_time));
          _.map(cv.slot_data, (sv) => {
            sv.slotTime = _.clone(this.convertTime(sv.slotTime));
          });
        });
      });
      // if (res.appointment_List.length > 0) {
      //   this.availableAppointmentSlotsList = res.appointment_List;
      //   const appData: any = this.availableAppointmentSlotsList[0];
      //   appData.entity_data = {
      //     appointment_type: '',
      //     appointment_type_id: 0,
      //     start_time: null,
      //     date: this.appontmentSlotDate
      //   };
      //   this.appointmentData = appData;
      // } else {
      //   this.setTempObj();
      // }
      const appData = {
        appointment_type: '',
        appointment_type_id: 0,
        start_time: null,
        date: this.appontmentSlotDate
      };
      const tempObj = {
        config_id: 0,
        entity_id: reqParams.entity_id,
        entity_value_id: reqParams.entity_value_id,
        entity_value_name: '',
        token_type: '',
        entity_data: appData
      };
      this.appointmentData = tempObj;
      // this.loadComponent(true);
      this.isShowAvailableComp = true;
      this.isShowAppointmentViewComp = false;
      this.isSlotViewFormLoad = true;
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
  // getTimeFormatKey(): Observable<any> {
  //   const userId = this.authService.getLoggedInUserId();
  //   return this.commonService.getQueueSettings(Constants.timeFormateKey, userId).pipe(map (res => {
  //     this.timeFormateKey = res.time_format_key;
  //   }));
  // }

  slotClick(eventData: boolean) {
    console.log(eventData);
  }

  getDetails(row): void {
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
  }

  getAllMappingUserList(): Observable<any> {
    return this.frontdeskentityMappingService.getMappingDetailsById(this.userId).pipe(map (res => {
      if (res.UserDetails.length && res.UserDetails[0].userMappingResponseViewModelList.length) {
        this.mappedUserList = res.UserDetails[0].userMappingResponseViewModelList;
        _.map(this.mappedUserList, (o) => {
          o.displayMapUserName = o.entityTypeValueName + '(' + o.entityTypeName + ')';
        });
      }
    }));
  }
  getAppointmentDataForSelectedEntity() {
    if (this.selectedEntity) {
      const entityData = this.selectedEntity;
      const reqParams = {
        entity_id: entityData.entityTypeId,
        entity_value_id: entityData.entityTypeValueId,
        speciality_id: 0, // Optional
        service_id: 0, // optional
        appointment_type_id: 0,
        date: moment(this.appontmentSlotDate).format('MM/DD/YYYY'), // MM/dd/yyyy format required
        start_time: null
      };
      this.getAppointmentListAPI(reqParams);
    } else {
      this.setTempObj();
    }
  }

  clearSlotData($event) {
    if ($event) {
      this.selectedEntity = null;
      this.appontmentSlotDate = new Date();
      this.setTempObj();
    }
  }
  closeLogSlider() {
    this.commonService.openCloselogSlider('close');
  }
  getselectedAppointment(event): void {
    this.selectedAppointmentDetailsId = event;
  }

  isOpenEntityInstructionBar() {
    const schedulingDate = moment(this.appontmentSlotDate).format('MM/DD/YYYY');
    // Open instruction slider
    this.commonService.openCloseInstruction('open');
    let serviceProviderDetailsData = null;
    let hoidayDetails = [];
    const entityData = this.selectedEntity;
    const $requestParamsSPDetails = {
      entity_id: entityData.entityTypeId,
      entity_data_id: entityData.entityTypeValueId,
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
          serviceProviderName: entityData.entityTypeValueName,
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

}
