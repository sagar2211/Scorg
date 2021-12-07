import { fadeInOut } from './../../../../config/animations';
import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Entity } from 'src/app/modules/schedule/models/entity.model';
import * as moment from 'moment';
import * as _ from 'lodash';
import { takeUntil, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { IAlert } from './../../../../models/AlertMessage';
import { Constants } from './../../../../config/constants';
import { DecimalPipe } from '@angular/common';
import { CommonService } from '../../../../services/common.service';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { AppointmentBookLibComponent, QmsQlistLibService } from '@qms/qlist-lib';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { AppointmentListModel } from 'src/app/modules/appointment/models/appointment.model';
import { AppointmentService } from 'src/app/modules/appointment/services/appointment.service';
import { EntitySettingsService } from 'src/app/modules/appointment/services/entity-settings.service';
import { AddPatientComponent } from 'src/app/modules/patient-shared/component/add-patient/add-patient.component';
import { AppointmentEntityInfoModel } from 'src/app/modules/appointment/models/appointment-entity-info.model';

@Component({
  selector: 'app-available-appointment-display',
  templateUrl: './available-appointment-display.component.html',
  styleUrls: ['./available-appointment-display.component.scss'],
  providers: [DecimalPipe],
  animations: [
    fadeInOut
  ],
})
export class AvailableAppointmentDisplayComponent implements OnInit, OnDestroy {

  @Input() displayList: Array<AppointmentListModel>;
  @Output() selectedView = new EventEmitter<any>();
  @Output() clearAllSection = new EventEmitter<any>();
  @Input() searchCriteria: any;
  @Input() selectedPatient;
  @Input() providerInfoParams: any;
  @Input() advanceBookingDays = 0;
  @Output() providerInfo = new EventEmitter<any>();

  date: string = null;
  entityDetails: Entity = null;
  userId: number;
  slotColorSettingObj = {
    holiday_color: String,
    available_color: String,
    blocked_color: String,
    booked_color: String,
    differentdateslot_color: String
  };
  // openById = {
  //   'custom-panel0': true
  // };
  // selectedPatient = null;
  $destroy: Subject<boolean> = new Subject();
  alertMsg: IAlert;
  allowLapsedTimeSlotBooking = false;
  PermissionsConstantsList: any = [];
  constructor(
    private modelService: NgbModal,
    private appointmentService: AppointmentService,
    private decimalPipe: DecimalPipe,
    private entitySettingsService: EntitySettingsService,
    private commonService: CommonService,
    private authService: AuthService,
    private addPatientModalService: NgbModal,
    private qmsQlistLibService: QmsQlistLibService,
    private ngxPermissionsService: NgxPermissionsService,

  ) {
  }

  ngOnInit() {
    // this.subscribeEvents();
    //
    this.entityDetails = this.searchCriteria ? this.searchCriteria.selectedEntityType : null;
    this.getAppointmentSlotBookingSetting();
    this.PermissionsConstantsList = PermissionsConstants;

    this.getSlotColorSetting();
    //this.color=Constants.holidayColor;
  }

  ngOnDestroy() {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
    this.modelService.dismissAll();
  }

  // onPanelClick(event) {
  //   this.openById[event.panelId] = event.nextState;
  // }



  isDateSame(date) {
    const dateFrom = moment(date, 'MM/DD/YYYY').format('YYYY-MM-DD');
    const paramDate = moment(this.providerInfoParams.date, 'MM/DD/YYYY').format('YYYY-MM-DD');
    return this.providerInfoParams && !moment(paramDate).isSame(dateFrom) ? true : false;
  }

  appointmentBookModal(view: string, { ...item }, rowData): void {
    const indx = _.findIndex(item.entity_data, (e) => e.time_detail_id === rowData.time_detail_id);
    const selectedRowData = item.entity_data[indx];
    item.entity_data = selectedRowData;
    const canBook = this.canBookAppointment(selectedRowData);
    if (this.selectedPatient && !canBook) {
      const modalInstance = this.modelService.open(AppointmentBookLibComponent,
        {
          ariaLabelledBy: 'modal-basic-title',
          backdrop: 'static',
          keyboard: false,
          size: 'xl',
          windowClass: 'custom-modal',
          container: '#homeComponent'
        });
      modalInstance.componentInstance.patientData = this.selectedPatient;
      modalInstance.componentInstance.allowLapsedTimeSlotBooking = this.allowLapsedTimeSlotBooking;
      modalInstance.componentInstance.selectedAppointementData = item as AppointmentListModel;
      modalInstance.componentInstance.source = view;
      modalInstance.componentInstance.sourcePopup = 'callcenterView';
      modalInstance.componentInstance.environmentDetails = environment;
      modalInstance.componentInstance.permissions = this.ngxPermissionsService.getPermission(PermissionsConstants.Add_PatientMaster);
      modalInstance.componentInstance.loginUserDetails = this.authService.getUserInfoFromLocalStorage();
      modalInstance.componentInstance.addNewPatient.subscribe((receivedEntry) => {
        this.addPatientModal(receivedEntry);
      });
      modalInstance.result.then(() => { }, (reason) => {
        if (_.isEmpty(reason)) {
          this.selectedView.emit({ from: view, data: null });
          this.clearAllSection.emit(false);
        } else {
          // need to clear all section of search and patient history
          this.clearAllSection.emit(true);
        }
      });
    } else {
      if (canBook) {
        this.alertMsg = {
          message: canBook.message,
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
      } else {
        this.alertMsg = {
          message: 'Please select patient',
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
      }

    }

  }
  addPatientModal(receivedEntry): void {
    const modalInstance = this.addPatientModalService.open(AddPatientComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        windowClass: 'custom-modal',
        size: 'xl',
        container: '#homeComponent'
      });
    modalInstance.componentInstance.isModal = true;
    modalInstance.componentInstance.newPatientDetails = receivedEntry ? receivedEntry.searchString : '';
    modalInstance.componentInstance.addPatModalValues.subscribe((receivedValue) => {
      if (receivedValue.checkDefualtSelect) {
        const patId = (receivedValue.pat_uhid === '' || receivedValue.pat_uhid === undefined) ? null : receivedValue.pat_uhid;
        if (receivedValue.pat_uhid) {
          receivedValue.isAddPatient = true;
          this.qmsQlistLibService.setPatientInfo(receivedValue);
        } else {
          receivedValue.isAddPatient = false;
          this.qmsQlistLibService.setPatientInfo(receivedValue);
        }
      } else {
        receivedValue.isAddPatient = false;
        this.qmsQlistLibService.setPatientInfo(null);
      }
    });
  }

  // showCalendarView(item, entity) {
  //   this.userId = item.entity_value_id;
  //   this.date = moment(entity.date, 'MM/DD/YYYY').format('DD/MM/YYYY');
  //   console.log(`Selected Entiry Data: ${JSON.stringify(entity)}`);
  // }
  //
  onAppointmentView(view: string, { ...item }, rowData: AppointmentEntityInfoModel) {
    const indx = _.findIndex(item.entity_data, (e) => e.time_detail_id === rowData.time_detail_id);
    const selectedRowData = item.entity_data[indx];
    item.entity_data = selectedRowData;
    this.userId = item.entity_value_id;
    this.date = moment(item.entity_data.date, 'DD/MM/YYYY').format('DD/MM/YYYY');
    item.entity_data['calDate'] = moment(item.entity_data.date, 'DD/MM/YYYY').format('DD/MM/YYYY');
    this.selectedView.emit({ from: view, data: item });
  }

  subscribeEvents() {
    this.appointmentService.$patientInfo.pipe(takeUntil(this.$destroy)).subscribe(res => this.selectedPatient = res);
  }

  trackByFunction = (index, item) => {
    if (!item) { return null; }
    return item.config_id;
  }

  averageCalculation(entity): any {
    const val = (entity.used_slot_count / entity.total_slot_count) * 100;
    return this.decimalPipe.transform(val, '1.0-0');
  }

  isOpenInstructionBar(item) {
    // Open instruction slider
    this.commonService.openCloseInstruction('open');
    let serviceProviderDetailsData = null;
    let hoidayDetails = [];
    const $requestParamsSPDetails = {
      entity_id: this.providerInfoParams.entity_id,
      entity_data_id: (item.entity_value_id !== 0) ? item.entity_value_id : this.providerInfoParams.service_id,
      service_id: 0,
      scheduling_date: this.providerInfoParams.date
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
          blockDetailList = this.filterBlockDetails(uniqueDateWiseDisplayList);
        }
        serviceProviderDetailsData = {
          serviceProviderName: item.entity_value_name,
          scheduled_config_details: res.scheduled_config_details,
          holidayList: hoidayDetails,
          entityParams: params,
          blockDetailsList: blockDetailList,
          defaultTab: 'tab-instruction'
        };
        this.providerInfo.emit({ data: serviceProviderDetailsData });

      });
    });
  }

  filterBlockDetails(entityblockList) {
    const blockhash = [];
    // _.map(displayList, (groupObject, date) => {
    // const entitydate = moment(date).format('YYYY-MM-DD');
    // const blockList = _.filter(entityblockList, (o) => {
    //   const dateFrom = moment(o.date_to, 'DD-MM-YYYY').format('YYYY-MM-DD');
    //   return o.is_active === true && moment(dateFrom).isSame(entitydate);
    // });
    // if (blockList.length) {
    //   const eDate = moment(entitydate, 'YYYY-MM-DD').format('DD/MM/YYYY');
    //   const index = _.findIndex(blockhash, (s) => s.key === eDate);
    //   if (index !== -1) {
    //     _.map(blockList, (k) => {
    //       blockhash[index].value.push(k);
    //     });
    //   } else {
    //     const obj = {
    //       key: eDate,
    //       value: blockList
    //     };
    //     blockhash.push(obj);
    //   }
    // }
    // });
    _.map(entityblockList, (groupVal, date) => {
      const obj = {
        key: date,
        value: groupVal
      };
      blockhash.push(obj);
    });
    return blockhash;
  }

  canBookAppointment(selectedRowData) {
    const origionalSlotData = selectedRowData.slot_data;
    if (!(origionalSlotData.length > 0)) {
      return { booked: true, message: 'Slots are not present' };
    }
    const bookedList = _.filter(origionalSlotData, { isBooked: true }).length === origionalSlotData.length;
    const holidayList = _.filter(origionalSlotData, { isOnHoliday: true }).length === origionalSlotData.length;
    const BlockedList = _.filter(origionalSlotData, { isBlocked: true }).length === origionalSlotData.length;
    if (bookedList) {
      return { booked: true, message: 'All slots are Booked' };
    } else if (holidayList) {
      return { holiday: true, message: 'Doctor is on Holiday' };
    } else if (BlockedList) {
      return { blocked: true, message: 'Slots are Blocked' };
    }
    return null;
  }

  getAdvanceBookingDate(days) {
    const date = new Date();
    if (days && days > 0) {
      const advanceBookingDate = moment(date, 'DD-MM-YYYY').add(days, 'days').format('DD/MM/YYYY');
      return advanceBookingDate;
    } else {
      const advanceBookingDate = moment(date).format('DD/MM/YYYY');
      return advanceBookingDate;
    }
  }

  getAppointmentSlotBookingSetting() {
    this.commonService.getQueueSettings(Constants.allowLapsedTimeBooking).subscribe(res => {
      this.allowLapsedTimeSlotBooking = (res) ? ((res === 'YES')) : false;
    });
  }

  getSlotColorSetting() {
    this.commonService.getQueueSettings(Constants.slotColorSetting).subscribe((res) => {
      if (res) {
        this.slotColorSettingObj = res;
      }
    });
  }
}
