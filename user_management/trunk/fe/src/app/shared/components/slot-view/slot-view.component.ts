import { CommonService } from 'src/app/services/common.service';
import { Component, OnInit, OnDestroy, Input, OnChanges, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import * as moment from 'moment';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { IAlert } from 'src/app/models/AlertMessage';
import { AuthService } from 'src/app/services/auth.service';
import { AppointmentBookLibComponent, QmsQlistLibService } from '@qms/qlist-lib';
import { environment } from 'src/environments/environment';
import { ApplicationEntityConstants } from 'src/app/shared/constants/ApplicationEntityConstants';
import { NgxPermissionsService } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { AppointmentListModel } from 'src/app/modules/appointment/models/appointment.model';
import { AppointmentTimeSlots, SubTimeSlots } from 'src/app/modules/appointment/models/appointment-time-slot.model';
import { AppointmentService } from 'src/app/modules/appointment/services/appointment.service';
import { AppointmentEntityInfoModel } from 'src/app/modules/appointment/models/appointment-entity-info.model';
import { Constants } from 'src/app/config/constants';
import { AddPatientComponent } from 'src/app/modules/patient-shared/component/add-patient/add-patient.component';

@Component({
  selector: 'app-slot-view',
  templateUrl: './slot-view.component.html',
  styleUrls: ['./slot-view.component.scss']
})
export class SlotViewComponent implements OnInit, OnDestroy, OnChanges {

  @Input() searchParams;
  @Input() public appointmentData: AppointmentListModel;
  @Input() public isFromFrontDesk = false;
  @Input() public selectedPatient;
  @Input() source: any;
  @Input() slotData: AppointmentTimeSlots;
  @Input() public isExpand = false;

  @Output() blockSlotDetails = new EventEmitter<any>();
  @Output() slotClicked = new EventEmitter<boolean>();
  @Input() public appointmentDateForSlot = new Date();
  @Output() clearQuickBook = new EventEmitter<boolean>();
  // @Input() public selectedEntityForFDesk: any;
  masterSlotData: AppointmentTimeSlots = null;
  $destroy: Subject<boolean> = new Subject();
  alertMsg: IAlert;
  entityData: any;
  timeFormateKey = '';
  fullDayHoliday = false;
  advancebookingValidateMsg = '';
  public minDate = new Date();
  public appontmentSlotDate: Date = new Date();
  public tempSlotData: any;
  public allowLapsedTimeSlotBooking = false;
  slotColorSettingObj = {
    holiday_color: 'holiday',
    available_color: '',
    blocked_color: 'bg-danger',
    booked_color: 'btn-warning',
    differentdateslot_color: '',
    out_of_hour_color: ''
  };
  isNotDataFound = false;
  userInfo: any = null;
  constructor(
    private appointmentService: AppointmentService,
    public modelService: NgbModal,
    private commonService: CommonService,
    private authService: AuthService,
    private addPatientModalService: NgbModal,
    private qmsQlistLibService: QmsQlistLibService,
    private ngxPermissionsService: NgxPermissionsService
  ) { }

  ngOnInit() {
    const userId = +this.authService.getLoggedInUserId();
    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    this.getAppointmentSlotBookingSetting();
    this.timeFormateKey = this.authService.getUserInfoFromLocalStorage().timeFormat;
    if (!this.isFromFrontDesk && this.appointmentData && this.appointmentData.entity_id !== 0) { // default call from slot view
      this.getSlots();
    }
    this.subscribeEvents();
  }

  ngOnChanges(changes: SimpleChanges): void {

    // this.appointmentData = this.appointmentData;
    if (!_.isUndefined(this.appointmentData) && this.appointmentData) {
      this.entityData = this.appointmentData.entity_data as AppointmentEntityInfoModel;
    }
    if (this.isFromFrontDesk && this.appointmentData.entity_id !== 0 && (changes.appointmentData || changes.appointmentDateForSlot)) {
      if (changes.appointmentDateForSlot && changes.appointmentDateForSlot.currentValue) {
        this.appontmentSlotDate = changes.appointmentDateForSlot.currentValue;
        this.entityData.date = this.appontmentSlotDate;
      }
      this.getSlots();
    }
  }

  ngOnDestroy() {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  getSlots(): void {
    if (_.isUndefined(this.source)) {
      this.entityData = this.appointmentData.entity_data as AppointmentEntityInfoModel;
      const reqParams = {
        entity_id: this.appointmentData.entity_id,
        entity_value_id: this.appointmentData.entity_value_id,
        appointment_type_id: this.entityData.appointment_type_id === 0 || this.isFromFrontDesk ? null : this.entityData.appointment_type_id,
        service_id: this.appointmentData.entity_id === 1 ? this.appointmentData.entity_value_id : 0,
        date: moment(_.clone(this.entityData.date), ['DD/MM/YYYY', 'MM/DD/YYYY']).format(Constants.apiDateFormate),
        start_time: this.entityData.start_time ? this.entityData.start_time : null
      };
      if (this.allowLapsedTimeSlotBooking && this.userInfo.role_type === ApplicationEntityConstants.FRONTDESK) {
        reqParams.start_time = null;
      }
      this.appointmentService.getAvailableAppointmentTimeSlot(reqParams).subscribe((res: AppointmentTimeSlots) => {
        const lastAppDate = moment().add(res.arpDays, 'day').format('YYYY-MM-DD');
        const reqParamsDate = moment(reqParams.date, 'MM/DD/YYYY').format('YYYY-MM-DD');
        this.advancebookingValidateMsg = '';
        if (moment(reqParamsDate).isSameOrBefore(lastAppDate)) { // Advance booking Validataion on arpDays
          _.map(res.subTimeSlots, (pv) => {
            pv.subTimeFrom = _.clone(this.commonService.convertTime(this.timeFormateKey, pv.subTimeFrom));
            pv.subTimeTo = _.clone(this.commonService.convertTime(this.timeFormateKey, pv.subTimeTo));
            _.map(pv.slots, (sv) => {
              sv.slotTime = _.clone(this.commonService.convertTime(this.timeFormateKey, sv.slotTime));
            });
            const allSlotHoliday = _.filter(pv.slots, (d) =>
              d.isOnHoliday
            );
            pv.holidaytimeSlot = allSlotHoliday.length === pv.slots.length ? true : false;
          });

          const holidayTimeSlot = _.filter(res.subTimeSlots, (d) =>
            d.holidaytimeSlot
          );
          this.fullDayHoliday = holidayTimeSlot.length === res.subTimeSlots.length ? true : false;
        } else {
          if (res.arpDays > 0) {
            res.subTimeSlots = []; // beyond advance book data should not be Display.
            this.advancebookingValidateMsg = 'Advance booking is allowed till' + ' ' + moment(lastAppDate, 'YYYY-MM-DD').format('DD/MM/YYYY');
          } else {
            res.subTimeSlots = [];
          }
        }
        this.masterSlotData = this.slotData = res;
        this.updateSlots(this.slotData.subTimeSlots, reqParams.date);
      });
    }
    if (this.source === 'blockAppointmentSetting') {
      this.masterSlotData = this.slotData;
      // this.modifySlotData(this.slotData);
      this.updateSlots(this.slotData.subTimeSlots);
    }
    this.getSlotColorSetting();
  }

  updateSlots(slotData: Array<SubTimeSlots>, paramDate?): void {
    slotData.forEach(item => {
      item.slots.forEach(as => {
        as.timePassed = false;
        let slotEndTime = moment(as.slotTime, 'hh:mm A').add(this.appointmentData.default_time_per_patient, 'minutes').format('hh:mm A');
        const checkSlotTime = moment(as.slotTime, 'hh:mm A').add(this.appointmentData.default_time_per_patient, 'minutes').format('YYYY-MM-DD');
        if (moment(moment().format('YYYY-MM-DD')).isBefore(checkSlotTime)) {
          slotEndTime = as.slotTime;
        }
        if (this.allowLapsedTimeSlotBooking && this.appointmentData.token_type !== 'SEQUENTIAL'
          && (this.isFromFrontDesk || this.userInfo.role_type === ApplicationEntityConstants.FRONTDESK)) {
          as.timePassed = false;
          return;
        }
        if (!_.isUndefined(this.appointmentData) && this.appointmentData.token_type === 'SEQUENTIAL') {
          // const currentSlotTime = moment(moment(moment().format('hh:mm A'), 'hh:mm A').add(this.appointmentData.default_time_per_patient, 'minutes')).format('hh:mm A');
          if (moment(moment().format('YYYY-MM-DD')).isSame(moment(moment(this.entityData.date).format('YYYY-MM-DD')))) {
            if (moment(moment().format('hh:mm A'), 'hh:mm A')
              .isBetween(moment(as.slotTime, 'hh:mm A'), moment(moment(as.slotTime, 'hh:mm A')
                .add(this.appointmentData.default_time_per_patient, 'minutes'), 'hh:mm A'), null, '[)')) {
              as.timePassed = false;
            } else {
              as.timePassed = true;
            }
          } else if (moment(moment().format('YYYY-MM-DD'))
            .isBefore(moment(moment(this.entityData.date).format('YYYY-MM-DD')))) {
            if (moment((moment(this.entityData.date).format('YYYY-MM-DD') + ' ' + as.slotTime), 'YYYY-MM-DD hh:mm A')
              .isSameOrBefore(moment(moment(this.entityData.date).format('YYYY-MM-DD hh:mm A'), 'YYYY-MM-DD hh:mm A'))) {
              as.timePassed = true;
            } else {
              as.timePassed = false;
            }
          } else {
            as.timePassed = false;
          }
        } else {
          if ((moment(moment(), 'hh:mm A').isAfter(moment(as.slotTime, 'hh:mm A'))) && (moment(this.entityData.date).isBefore(moment()))) {
            as.timePassed = true;
          } else {
            as.timePassed = false;
          }
        }
      });
    });
    if (!_.isUndefined(this.appointmentData) && this.appointmentData.token_type === 'SEQUENTIAL' &&
      moment(moment().format('YYYY-MM-DD')).isBefore(moment(moment(this.entityData.date).format('YYYY-MM-DD')))) {
      // first check in first array user do not have any appointment, holiday or blocked slot then enable first one and disable all
      slotData = this.updateSlotsForSEQUENTIAL(slotData, paramDate);
      // console.log(slotData);
    }
    if (!_.isUndefined(this.appointmentData) && this.appointmentData.token_type === 'SEQUENTIAL' &&
      moment(moment().format('YYYY-MM-DD')).isSame(moment(moment(this.entityData.date).format('YYYY-MM-DD')))) {
      // first check in first array user do not have any appointment, holiday or blocked slot then enable first one and disable all
      slotData = this.updateSlotsForSEQUENTIAL(slotData, paramDate);
      // console.log(slotData);
    }
  }

  updateSlotsForSEQUENTIAL(slotData, date?) {
    const firstAvailablslots = [];
    // if (this.allowLapsedTimeSlotBooking) {
    slotData.forEach((sl, indx) => {
      sl.slots.forEach(slot => {
        slot.timePassed = true;
      });
    });
    const isToday = this.isCurrentDateIsTodaysDate(moment(date));
    // }
    slotData.forEach((sl, indx) => {
      if (this.allowLapsedTimeSlotBooking && (this.isFromFrontDesk || this.userInfo.role_type === ApplicationEntityConstants.FRONTDESK)) {
        const isAlreadySlotAvailable = _.find(firstAvailablslots, { timeDetailId: sl.timeDetailId });
        const slot = _.find(sl.slots, { isBooked: false, isBlocked: false, isOnHoliday: false });
        if (slot && !isAlreadySlotAvailable) {
          firstAvailablslots.push({ timeDetailId: sl.timeDetailId, slot });
        }
      } else {
        const possibleAvailableSlots = _.filter(sl.slots, { isBooked: false, isBlocked: false, isOnHoliday: false });
        _.forEach(possibleAvailableSlots, slot => {
          const isAlreadySlotAvailable = _.find(firstAvailablslots, { timeDetailId: sl.timeDetailId });
          if ((isToday && !this.isTimePassed(slot.slotTime) && !isAlreadySlotAvailable) || (!isToday && !isAlreadySlotAvailable)) {
            firstAvailablslots.push({ timeDetailId: sl.timeDetailId, slot });
          }
        });
      }
    });
    const allSlots = _.map(slotData, 'slots');
    const slotTobeOpen = _.map(firstAvailablslots, 'slot');
    allSlots.forEach(slots => {
      slots.forEach(slot => {
        const slotPresent = _.find(slotTobeOpen, { slotId: slot.slotId });
        if (firstAvailablslots && slotPresent) {
          slot.timePassed = false;
        }
      });
    });
    return slotData;
  }

  bookAppointment(selectedData, list) {
    // if (!_.isUndefined(this.selectedPatient)) {
    const modalInstance = this.modelService.open(AppointmentBookLibComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        size: 'xl',
        container: '#homeComponent'
      });
    modalInstance.componentInstance.patientData = this.selectedPatient;
    modalInstance.componentInstance.selectedAppointementData = this.appointmentData;
    modalInstance.componentInstance.slotDetails = selectedData;
    modalInstance.componentInstance.slotList = list;
    modalInstance.componentInstance.source = this.isFromFrontDesk ? 'frontDesk' : '';
    modalInstance.componentInstance.sourcePopup = !this.isFromFrontDesk ? 'callcenterView' : '';
    modalInstance.componentInstance.environmentDetails = environment;
    modalInstance.componentInstance.loginUserDetails = this.authService.getUserInfoFromLocalStorage();
    modalInstance.componentInstance.permissions = this.ngxPermissionsService.getPermission(PermissionsConstants.Add_PatientMaster);
    modalInstance.componentInstance.addNewPatient.subscribe((receivedEntry) => {
      this.addPatientModal(receivedEntry);
    });
    modalInstance.result.then(() => { }, (reason) => {
      if (_.isEmpty(reason)) {
        this.entityData.start_time = this.isFromFrontDesk ? null : moment().format('HH:00');
        this.appointmentService.clearAllFormsValue(false);
      } else {
        // need to clear all section of search and patient history
        // this.appointmentService.clearAllFormsValue(true);
        this.entityData.start_time = moment().format('HH:00');
        if (this.isFromFrontDesk) {
          // this.clearQuickBook.emit(true);
          this.entityData.start_time = null;
          this.entityData.date = this.entityData.date;
          this.getSlots();
          this.appointmentService.clearAllFormsValue(false);
        } else {
          this.appointmentService.clearAllFormsValue(true);
        }
      }
    });
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
    modalInstance.componentInstance.newPatientDetails = receivedEntry ? receivedEntry : '';
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
  subscribeEvents() {
    this.appointmentService.$patientInfo.pipe(takeUntil(this.$destroy)).subscribe(res => this.selectedPatient = res);
  }

  disabledTimeSlots(): void {

  }

  action(selectedData, list, subSlotInfo?) {
    if (_.isUndefined(this.source)) {
      this.appointmentData.entity_data['appointment_type'] = subSlotInfo ? subSlotInfo.appointmentTypeName : '';
      const entity_data: any = this.appointmentData.entity_data;
      entity_data.start_time = this.commonService.convertTime(this.timeFormateKey, subSlotInfo.subTimeFrom);
      entity_data.end_time = this.commonService.convertTime(this.timeFormateKey,
        (subSlotInfo.subTimeTo === '00:00' || subSlotInfo.subTimeTo === '12:00 AM') ? '23:59' : subSlotInfo.subTimeTo);
      this.appointmentData.entity_data = entity_data;
      this.bookAppointment(selectedData, list);
      this.slotClicked.emit(true);
    } else {
      selectedData.isBlocked = !selectedData.isBlocked;
      this.blockSelectedSlot(selectedData, list);
    }
  }

  blockSelectedSlot(selectedData, list) {
    this.blockSlotDetails.emit(selectedData);
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
        // this.differentdateslotcolor=this.slotColorSettingObj.differentdateslot_color;
      }
    });
  }
  isTimePassed(slotTime) {
    return moment(moment(slotTime, 'hh:mm A')).isBefore(moment(moment(), 'hh:mm A'));
    // return moment(moment(slotTime, 'hh:mm A')).add(this.appointmentData.default_time_per_patient, 'm').isBefore(moment(moment(), 'hh:mm A'));
  }

  getClassValue(slot) {
    let classVal = '';
    if (slot.isOnHoliday) {
      classVal = classVal + ' ' + this.slotColorSettingObj.holiday_color + '-apply';
    }
    if (!slot.isOnHoliday && !slot.isBlocked && slot.isBooked) {
      classVal = classVal + ' ' + this.slotColorSettingObj.booked_color;
    }
    if (!slot.isOnHoliday && !slot.isBooked && !slot.timePassed && !slot.isBlocked) {
      classVal = classVal + ' btn-outline-success';
    }
    if (slot.timePassed && !slot.isBooked && !slot.isOnHoliday && !slot.isBlocked) {
      classVal = classVal + ' bg-light';
    }
    if (!slot.isOnHoliday && slot.isBlocked && !slot.timePassed && !slot.isBooked) {
      classVal = classVal + ' ' + this.slotColorSettingObj.blocked_color + '-apply';
    }
    if (!slot.isOnHoliday && slot.isBlocked && slot.timePassed && !slot.isBooked) {
      classVal = classVal + ' ' + this.slotColorSettingObj.blocked_color + '-apply';
    }
    return classVal;
  }

  isCurrentDateIsTodaysDate(date) {
    const today = moment();
    if (date && moment(date).format('DD/MM/YYYY') === today.format('DD/MM/YYYY')) {
      return true;
    }
    return false;
  }

}
