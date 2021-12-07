
import { Component, OnInit, Input, OnChanges, OnDestroy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { map, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import * as _ from 'lodash';
import * as moment from 'moment';
import { FormGroup, FormBuilder } from '@angular/forms';

import { SlotInfo } from 'src/app/modules/appointment/models/slot-info.model';
import { Constants } from './../../../config/constants';
import { IAlert } from 'src/app/models/AlertMessage';
import { AppointmentEntityInfoModel } from './../../../modules/appointment/models/appointment-entity-info.model';
import { AppointmentService } from './../../../modules/appointment/services/appointment.service';
import { AppointmentListModel } from './../../../modules/appointment/models/appointment.model';

import { QAppointments } from '../../../modules/qms/models/q-entity-appointment-details';
import { SlotByStatusPipe } from './../../../modules/qms/pipes/slot-by-status.pipe';
import { AuthService } from 'src/app/services/auth.service';
import { AppointmentTimeSlots } from './../../../modules/appointment/models/appointment-time-slot.model';
import { ApppointmentSuccessModel } from './../../../modules/appointment/models/appointment-success.model';
import { EntityBasicInfoService } from './../../../modules/schedule/services/entity-basic-info.service';
import { Service } from '../../../modules/schedule/models/service.model';
import { CommonService } from '../../../services/common.service';
import { PatientHistory } from 'src/app/modules/appointment/models/patient-history.model';
import { AppointmentHistory } from 'src/app/modules/appointment/models/appointment-history.model';
import { ApplicationEntityConstants } from '../../constants/ApplicationEntityConstants';

@Component({
  selector: 'app-appointment-book',
  templateUrl: './appointment-book.component.html',
  styleUrls: ['./appointment-book.component.scss'],
  providers: [SlotByStatusPipe]
})
export class AppointmentBookComponent implements OnInit, OnChanges, OnDestroy {
  compInstance = this;

  @Input() patientData;
  @Input() selectedAppointementData: AppointmentListModel;
  @Input() slotDetails: SlotInfo;
  @Input() source: string;
  @Input() slotList: Array<SlotInfo>;
  @Input() public bookingData: QAppointments;
  @Input() allowLapsedTimeSlotBooking = false;
  @Input() timeFormatKey = '';
  @Input() environmentDetails: any;
  @Input() loginUserDetails;
  @Input() appointmentDate: Date;

  formObj: any = {};
  serviceList: Array<any> = [];
  choosePatient = false;
  ishowPatientTypehead = false;
  alertMsg: IAlert;
  appEntityData: any;
  userId: number;
  userInfo: any = null;
  isBooked = false;
  isFormDisable: boolean; // to form disable
  // -- for reschedule
  public minDate = new Date();
  public appontmentDate: Date = new Date();
  appointmentFrm: FormGroup;
  totalServiceTime: number;
  selectedAppointmentTime: any;
  selectedAppointmentDate: any;
  isAppointmentAvailable: boolean;
  serviceStatus: boolean = false;
  patientHistory: PatientHistory;
  history: Array<AppointmentHistory>;

  oldAppointmentFormData: any = null;
  newAppointmentFormData: any = null;
  $destroy = new Subject<true>();
  isDisableSaveBtn = false;

  constructor(
    public modal: NgbActiveModal,
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private slotByStatusPipe: SlotByStatusPipe,
    private fb: FormBuilder,
    private entityBasicInfoService: EntityBasicInfoService,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.isFormDisable = false;
    this.appointmentFrm = this.fb.group({
      patientType: ['WALKIN'],
      selectedServiceArr: [[]],
      notes: [''],
      remarks: [''],
      selectedSlot: [null]
    });

    this.getAppointmentSlotBookingSetting();
    this.userId = +this.authService.getLoggedInUserId();
    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    this.entityBasicInfoService.getAllEntityList().subscribe((res) => {
      this.selectedAppointementData.entity_name = this.entityBasicInfoService.getEnityDetailsById(this.selectedAppointementData.entity_id).name;
    });
    const appointmentDt = this.selectedAppointementData ? this.selectedAppointementData.entity_data as AppointmentEntityInfoModel : null;
    this.appEntityData = appointmentDt;

    if (this.patientData) {
      this.formObj.patientInfo = this.patientData;
      this.choosePatient = false;
    } else {
      this.choosePatient = true;
    }
    if (this.source === 'book' && appointmentDt.slot_data.length) {

      appointmentDt.slot_data.forEach((slot) => {
        slot = this.concateDateWithTime(slot);
      });
      appointmentDt.slot_data.forEach((as => {
        if (this.allowLapsedTimeSlotBooking && this.selectedAppointementData.token_type !== 'SEQUENTIAL' && !(moment(appointmentDt.date).isBefore(moment()))) {
          as.timePassed = false;
          return;
        }
        const slotEndTime = moment(as.slotTime, 'hh:mm A').add(this.selectedAppointementData.default_time_per_patient, 'minutes').format('hh:mm A');
        if ((moment(moment(), 'hh:mm A').isAfter(moment(slotEndTime, 'hh:mm A'))) && moment(appointmentDt.date).isBefore(moment())) {
          as.timePassed = true;
        } else {
          as.timePassed = false;
        }
      }));
      const sortList = _.orderBy(appointmentDt.slot_data, ['slotDateTime'], ['asc']);
      if (this.selectedAppointementData.token_type === 'SEQUENTIAL') {
        // this.slotDetails = this.getImmediateSlotsForSEQUENTIAL(sortList, appointmentDt.date);
        this.slotDetails = this.updateSlotsForSEQUENTIAL(sortList, appointmentDt.date);
      } else {
        this.slotDetails = this.getImmediateSlots(sortList);
      }

      this.isBooked = this.slotDetails.isBooked;
    } else if (this.source === 'reschedule' || this.source === 'qlist' || this.source === 'edit_appointment') {
      this.slotDetails = new SlotInfo();
      this.slotDetails.tokenNo = this.bookingData.tokenNo;
      this.slotDetails.appointmentStatus = this.bookingData.bookingStatus;
      if (this.source === 'reschedule') {
        // this.bookingData['slotTime'] = (this.bookingData['slotTime']) ?
        //   this.bookingData['slotTime'] : this.bookingData['appointmentTime'];
        this.slotDetails.slotId = this.bookingData.slotId;
        this.bookingData.appointmentTime = !this.bookingData.appointmentTime ? this.bookingData.slotTime : this.bookingData.appointmentTime;
        // this.slotDetails.slotTime = this.bookingData.slotTime ? this.bookingData.slotTime : this.bookingData.appointmentTime;
        this.slotDetails.slotTime = undefined;
        this.getAvailableSlots();
      } else if (this.source === 'qlist') {
        // this.appointmentFrm.get('patientType').disable();
        this.bookingData.appointmentTime = this.slotDetails.slotTime;
        this.slotDetails.slotTime = undefined;
        this.appEntityData.start_time = this.commonService.convertTime(this.timeFormatKey, this.bookingData['startTime']);
        this.appEntityData.end_time = this.commonService.convertTime(this.timeFormatKey, this.bookingData['endTime']);
        this.appEntityData.appointment_type = this.bookingData['appointmentType'];
        // this.appointmentFrm.get('selectedServiceArr').disable();
        this.slotDetails.slotId = this.bookingData['slotId'];
      } else if (this.source === 'edit_appointment') {
        // this.bookingData['appointmentTime'];
        this.slotDetails.slotTime = this.bookingData['appointmentTime'];
        this.slotDetails.slotId = this.bookingData['slotId'];
      }

      this.appointmentFrm.patchValue({
        patientType: this.bookingData.patType
      });
      this.oldAppointmentFormData = this.appointmentFrm.value;
      this.checkFormIsUpdate(true);
    } else {
      this.isBooked = this.slotDetails.isBooked;
    }
    this.selectedAppointmentTime = this.slotDetails.slotTimeInFormat ? this.slotDetails.slotTimeInFormat : this.slotDetails.slotTime;
    // this.appEntityData.date = _.isDate(this.appEntityData.date) ? moment(this.appEntityData.date).format('DD/MM/YYYY') : moment(appointmentDt.date, 'DD-MM-YYYY').format('DD/MM/YYYY');
    this.selectedAppointmentDate = this.appEntityData.date;
    this.selectedAppointmentDate = _.isDate(this.selectedAppointmentDate) ? moment(this.selectedAppointmentDate).format('DD/MM/YYYY') : moment(appointmentDt.date, 'DD-MM-YYYY').format('DD/MM/YYYY');
    this.getServiceList();

    if (this.source === 'book' || this.source === 'calendarAsComponent' || this.source === '' || this.source === 'frontDesk') {
      if (this.patientData) {
        this.patientAppointmentHistory(this.patientData);
      } else {
        this.isAppointmentAvailable = true;
      }
    } else {
      this.isAppointmentAvailable = true;
    }

    if (_.isEmpty(this.selectedAppointementData)) {
      this.totalServiceTime = 0;
    } else {
      this.totalServiceTime = this.selectedAppointementData.default_time_per_patient ? this.selectedAppointementData.default_time_per_patient : 0;
    }
    this.getServiceByAppointmentId();

  }

  ngOnChanges() {
    this.patientData = this.patientData;
  }

  ngOnDestroy() {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  isCurrentDateIsTodaysDate(date) {
    const today = moment();
    if (date && moment(date).format('DD/MM/YYYY') === today.format('DD/MM/YYYY')) {
      return true;
    }
    return false;
  }

  isTimePassed(slotTime) {
    return moment(moment(slotTime, 'hh:mm A')).isBefore(moment(moment(), 'hh:mm A'));
    // return moment(moment(slotTime, 'hh:mm A')).add(this.appointmentData.default_time_per_patient, 'm').isBefore(moment(moment(), 'hh:mm A'));
  }

  updateSlotsForSEQUENTIAL(slotData, date?) {
    const firstAvailablslots = [];
    // if (this.allowLapsedTimeSlotBooking) {
    slotData.forEach(slot => {
      slot.timePassed = true;
    });
    const isToday = this.isCurrentDateIsTodaysDate(moment(date));
    // }

    let slotAvl = true;
    slotData.forEach((sl, indx) => {
      if (this.allowLapsedTimeSlotBooking && (this.userInfo.role_type === ApplicationEntityConstants.FRONTDESK)) {
        // const isAlreadySlotAvailable = _.find(firstAvailablslots, { timeDetailId: sl.timeDetailId });
        if (!sl.isBooked && !sl.isBlocked && !sl.isOnHoliday && slotAvl) {
          slotAvl = false;
          firstAvailablslots.push(sl);
        }
      } else {
        if (((isToday && !this.isTimePassed(sl.slotTime)) || (!isToday)) && !sl.isBooked && !sl.isBlocked && !sl.isOnHoliday && slotAvl) {
          slotAvl = false;
          firstAvailablslots.push(sl);
        }
      }
    });
    return firstAvailablslots[0];
  }

  getImmediateSlotsForSEQUENTIAL(slotList, date) {
    let slotData = null;
    slotList.forEach((ts, cIndex) => {
      if (moment(moment().format("YYYY-MM-DD")).isSame(moment(moment(date).format('YYYY-MM-DD')))) {
        // if date is today's date then check time
        if (moment(moment().format('hh:mm A'), 'hh:mm A').isBetween(moment(ts.slotTime, 'hh:mm A'), moment(moment(ts.slotTime, 'hh:mm A').add(this.selectedAppointementData.default_time_per_patient, 'minutes'), 'hh:mm A'), null, "[)")) {
          ts.timePassed = false;
        } else {
          ts.timePassed = true;
        }
      } else if (moment(moment().format("YYYY-MM-DD")).isBefore(moment(moment(date).format('YYYY-MM-DD')))) {
        if (moment((moment(date).format('YYYY-MM-DD') + ' ' + ts.slotTime), 'YYYY-MM-DD hh:mm A').isSameOrBefore(moment(moment(date).format('YYYY-MM-DD hh:mm A'), 'YYYY-MM-DD hh:mm A'))) {
          ts.timePassed = true;
        } else {
          ts.timePassed = false;
        }
      }
    });

    if (moment(moment().format("YYYY-MM-DD")).isSame(moment(moment(date).format('YYYY-MM-DD')))) {
      slotList.forEach((ts, cIndex) => {
        if (slotData === null) {
          if (ts.isBooked) {
            if (!_.isUndefined(slotList[cIndex + 1].slotTime) && (!slotList[cIndex + 1].isBooked
              && !slotList[cIndex + 1].isBlocked
              && !slotList[cIndex + 1].isOnHoliday)
              && moment(moment().format('hh:mm A'), 'hh:mm A').isBefore(moment(slotList[cIndex + 1].slotTime, 'hh:mm A'))) {
              slotData = slotList[cIndex + 1];
            }
          } else if (!ts.isBooked && !ts.isBlocked && !ts.isOnHoliday) {
            if (moment(moment().format('hh:mm A'), 'hh:mm A')
              .isBetween(moment(ts.slotTime, 'hh:mm A'), moment(moment(ts.slotTime, 'hh:mm A').add(this.selectedAppointementData.default_time_per_patient, 'minutes'), 'hh:mm A'), null, "[)")) {
              slotData = ts;
            } else if (!_.isUndefined(slotList[cIndex + 1].slotTime) && (!slotList[cIndex + 1].isBooked
              && !slotList[cIndex + 1].isBlocked
              && !slotList[cIndex + 1].isOnHoliday)
              && moment(moment().format('hh:mm A'), 'hh:mm A').isBefore(moment(slotList[cIndex + 1].slotTime, 'hh:mm A'))) {
              slotData = slotList[cIndex + 1];
            }
          }
        }
      });
    } else if (moment(moment().format("YYYY-MM-DD")).isBefore(moment(moment(date).format('YYYY-MM-DD')))) {
      slotList.forEach((ts, cIndex) => {
        if (slotData === null) {
          if (ts.isBooked) {
            if (!_.isUndefined(slotList[cIndex + 1].slotTime) && (!slotList[cIndex + 1].isBooked
              && !slotList[cIndex + 1].isBlocked
              && !slotList[cIndex + 1].isOnHoliday)) {
              slotData = slotList[cIndex + 1];
            }
          } else if (!ts.isBooked && !ts.isBlocked && !ts.isOnHoliday) {
            slotData = ts;
          }
        }
      });
    }
    return slotData;
  }

  onAppointmentBook(): void {
    if (this.source === 'qlist') { // || this.source === 'edit_appointment'
      this.updateNotesRemarks(this.bookingData.appointmentId, true);
      return;
    }
    let duration = 0; // in mins
    if (this.patientData && this.patientData.pat_uhid) {
      const selectedServiceArr = (this.appointmentFrm.get('selectedServiceArr').disabled) ? this.appointmentFrm.getRawValue().selectedServiceArr : this.appointmentFrm.value.selectedServiceArr;
      const serviceListIds = _.map(selectedServiceArr, (p) => {
        duration = duration + p.caterTime;
        return p.id;
      });
      // duration = serviceListIds.length > 0 ? duration : this.selectedAppointementData ? this.selectedAppointementData.default_time_per_patient : 0;
      // if (this.selectedAppointementData.token_type === 'FIXED') {
      //   duration = this.selectedAppointementData.default_time_per_patient;
      // }

      if (!_.isUndefined(this.selectedAppointementData)) {
        duration = serviceListIds.length > 0 ? duration : this.selectedAppointementData.default_time_per_patient;
        if (this.selectedAppointementData.token_type === 'FIXED') {
          duration = this.selectedAppointementData.default_time_per_patient;
        }
      } else {
        duration = serviceListIds.length > 0 ? duration : 0;
      }
      const sTime = this.slotDetails.slotTime ? moment(moment().format('YYYY-MM-DD') + ' ' + this.slotDetails.slotTime).format('hh:mm A') : null;
      const endTime = this.slotDetails.slotTime ? moment(this.slotDetails.slotTime, 'hh:mm A').add(duration, 'minutes').format('hh:mm A') : null;
      const reqParams = {
        Appt_Slot_Id: this.slotDetails.slotTime ? this.slotDetails.slotId || this.slotDetails['slot_id'] : 0,
        Pat_Uhid: this.patientData.pat_uhid,
        Remarks: this.appointmentFrm.value.remarks,
        Services: serviceListIds,
        Start_Time: sTime,
        End_Time: endTime,
        Service_Duration: duration ? duration : 0,
        Notes: this.appointmentFrm.value.notes,
        Pat_Type: (this.appointmentFrm.get('patientType').disabled) ? this.appointmentFrm.getRawValue().patientType : this.appointmentFrm.value.patientType,
        // if load from caleder (call center/calendar view flag should be true)
        IsCalendarAppointment: (this.source === 'calendar' || this.source == 'calendarAsComponent') ? true : false
      };

      if (this.checkValidation() && this.slotDetails.slotTime) { // check for reshdule If timeSlot is not there this going to be Update Appointment.
        this.alertMsg = {
          message: 'Please select slot time',
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
        return;
      }

      if (this.source === 'queue') {
        reqParams['Token_Type'] = this.selectedAppointementData.token_type;
        this.queueAppointmentBook(reqParams);
      } else {
        if (this.source === 'reschedule') {
          reqParams['Pat_ExistingAppt_Id'] = this.bookingData.appointmentId;
          // this.appointmentService.setPatientInfo(null);
        }
        if (this.source === 'frontDesk') {
          reqParams['Token_Type'] = null;
          // const isFromReschedule = (this.source === 'reschedule');
          this.appointmentService.savePatientAppointmentinQueue(reqParams).subscribe((res: ApppointmentSuccessModel) => {
            if (res !== null && res.isBooked) {
              // this.updateNotesRemarks(res.id);
              this.updateSlotDetails(res, reqParams);
            } else {
              this.alertMsg = {
                message: res.message,
                messageType: 'danger',
                duration: Constants.ALERT_DURATION
              };
            }
          });
        } else {
          this.appointmentService.saveAppointmentBooking(reqParams).subscribe((res: ApppointmentSuccessModel) => {
            if (res !== null) {
              if (res.isBooked) {
                this.isFormDisable = (this.source === 'reschedule');
                this.updateSlotDetails(res, reqParams);
              } else { // Merge edit and reschedule Api if isBooked response is not there then its edit reponse
                this.alertMsg = {
                  message: res.message,
                  messageType: res.message === 'Appointment updated successfully' ? 'success' : 'danger',
                  duration: Constants.ALERT_DURATION
                };
              }
              this.isDisableSaveBtn = res.message === 'Appointment updated successfully' ? true : false;
            } else {
              this.alertMsg = {
                message: res ? res.message : 'Somtihing went Wrong',
                messageType: 'danger',
                duration: Constants.ALERT_DURATION
              };
            }
          });
        }
      }
    } else {
      this.alertMsg = {
        message: 'Please select patient',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
    }
  }

  getServiceList(): void {
    if (this.selectedAppointementData) {
      const slotID = this.slotDetails.slotId || this.slotDetails['slot_id']
      const entityId = this.selectedAppointementData.entity_id;
      const entityValueId = this.selectedAppointementData.entity_value_id;
      this.appointmentService.getEntityServices(entityId, entityValueId, '', slotID).subscribe(res => {
        this.serviceList = res.serviceList;
        const tempList = [];
        if (res.status_code === 200 && res.serviceList && res.serviceList.length > 0) {
          this.serviceList.forEach(el => {
            if (el.serviceMaxPatient === 0 || (el.serviceMaxPatient !== el.serviceBookedCount)) {
              tempList.push(el);
            }
          });
          this.serviceList = tempList;
        } else if (res.status_code === 400) {
          this.alertMsg = {
            message: res.message,
            messageType: 'danger',
            duration: Constants.ALERT_DURATION
          };
        }
        if (res && res.length > 0 && this.serviceList.length === 0) {
          this.serviceStatus = true;
        } else {
          this.serviceStatus = false;
        }
      });
    }
  }

  checkForServices() {
    if (this.serviceStatus) {
      this.alertMsg = {
        message: 'There are no Free Slots available for any Service',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
    }
  }

  getPatientList(searchText): Observable<any> {
    return this.compInstance.appointmentService.getPatientList(100, searchText).pipe(map(pd => {
      return pd.Patient_Data;
    }));
  }

  onSelectPat(event) {
    this.choosePatient = (typeof event === 'object') ? false : true;
    this.formObj.patientInfo = { ...event };
    this.patientData = event;
    this.appointmentService.setPatientInfo(event);
    if (this.source === 'book' || this.source === 'calendarAsComponent' || this.source === '' || this.source === 'frontDesk') {
      this.patientAppointmentHistory(this.patientData);
    }
  }

  onChooseBtn(): void {
    this.ishowPatientTypehead = !this.ishowPatientTypehead;
    this.choosePatient = false;
  }

  selectService(event): void {
    // this.formObj.selectedServiceArr = event;
    this.appointmentFrm.patchValue({
      selectedServiceArr: event
    });
  }

  updateSlots(startTime, endTime): void {
    if (this.selectedAppointementData.token_type === 'FLEXIBLE') {
      _.map(this.slotList, (sl) => {
        if (moment(sl.slotTime, 'hh:mm A').isSameOrAfter(moment(startTime, 'hh:mm A')) && moment(sl.slotTime, 'hh:mm A').isSameOrBefore(moment(endTime, 'hh:mm A'))) {
          sl.isBooked = true;
        }
      });
    } else if (this.selectedAppointementData.token_type === 'SEQUENTIAL') {
      const dt = _.find(this.slotList, (s) => s.slotTime === endTime);
      if (!_.isUndefined(dt)) {
        dt.timePassed = false;
      }
    }
  }

  // -- from queue
  queueAppointmentBook(params) {
    const sTime = moment(moment().format('YYYY-MM-DD') + ' ' + params.Start_Time).format('hh:mm A');
    const eTime = moment(moment().format('YYYY-MM-DD') + ' ' + params.End_Time).format('hh:mm A');
    const req = {
      Pat_Uhid: params.Pat_Uhid,
      Appt_Slot_Id: params.Appt_Slot_Id,
      Token_Type: params.Token_Type, //
      Start_Time: sTime,
      End_Time: eTime,
      Service_Duration: params.Service_Duration,
      Remarks: params.Remarks,
      Notes: params.Notes,
      Pat_Type: params.Pat_Type,
      Services: params.Services
    };
    // (PRIORITY / NORMAL / WALKIN)
    this.appointmentService.savePatientAppointmentinQueue(req).subscribe((res: ApppointmentSuccessModel) => {
      if (res !== null && res.isBooked) {
        if (res.id) {
          this.slotDetails = Object.assign(this.slotDetails, res);
        }
        this.appointmentService.prepaireBookingDataToAppHistory(this.patientData, this.selectedAppointementData, this.slotDetails);
        this.alertMsg = {
          message: res.message,
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        this.isBooked = res.isBooked;
        this.isFormDisable = true;
        // this.updateNotesRemarks(res.id);
        this.updateSlotDetails(res, req);

      } else {
        this.alertMsg = {
          message: res.message,
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
      }
    });
  }

  dismissModel(): void {
    if (this.source === 'queue') {
      this.modal.close({ bookingData: this.slotDetails.isBooked ? this.slotDetails : null, patientData: this.patientData });
    } else if (this.source === 'reschedule' || this.source === 'qlist') {
      if (this.source === 'qlist') {
        this.appointmentService.setPatientInfo(null);
        const selectedPatType = (this.appointmentFrm.get('patientType').disabled) ? this.appointmentFrm.getRawValue().patientType : this.appointmentFrm.value.patientType;
        this.modal.close({ isBooked: this.isBooked, patType: selectedPatType });
      } else {
        this.modal.close(this.isBooked);
      }
    } else if (this.source === 'calendar' || this.source === 'frontDesk') {
      this.appointmentService.setPatientInfo(null);
      this.modal.dismiss(this.slotDetails.isBooked ? this.slotDetails : null);
    } else {
      this.appointmentService.slotViewclosepopup(true);
      this.modal.dismiss(this.slotDetails.isBooked ? this.slotDetails : null);
    }
  }

  getAvailableSlots(): void {
    const reqParams = {
      entity_id: this.selectedAppointementData.entity_id,
      entity_value_id: this.selectedAppointementData.entity_value_id,
      appointment_type_id: null,
      service_id: 0,
      date: moment(_.clone(this.appontmentDate)).format('MM/DD/YYYY'),
      start_time: null
    };

    this.appointmentService.getAvailableAppointmentTimeSlot(reqParams).subscribe((res: AppointmentTimeSlots) => {
      const tempArr = [];
      res.subTimeSlots.forEach(r => tempArr.push(...r.slots));
      this.slotList = this.slotByStatusPipe.transform(tempArr, this.appontmentDate, res.defaultTimePerPatient, this.allowLapsedTimeSlotBooking);
      const self = this;
      const bookingSlotTime = self.commonService.convertTime(this.timeFormatKey, this.bookingData.appointmentTime);
      const IsappointmentTypeIndex = _.findIndex(res.subTimeSlots, (s) => {
        const slottime = moment(moment(this.appontmentDate).format('YYYY-MM-DD') + ' ' + self.commonService.convertTime(this.timeFormatKey, bookingSlotTime));
        const startTime = moment(moment(this.appontmentDate).format('YYYY-MM-DD') + ' ' + self.commonService.convertTime(this.timeFormatKey, s.subTimeFrom));
        const endTime = moment(moment(this.appontmentDate).format('YYYY-MM-DD') + ' ' +
          self.commonService.convertTime(this.timeFormatKey, (s.subTimeTo === '00:00' || s.subTimeTo === '12:00 AM') ? '23:59' : s.subTimeTo));
        return slottime.isSameOrAfter(startTime) && slottime.isBefore(endTime); // slottime.isBetween(startTime, endTime);
      });
      const appType = IsappointmentTypeIndex !== -1 ? res.subTimeSlots[IsappointmentTypeIndex] : null;
      if (appType) {
        this.appEntityData.start_time = self.commonService.convertTime(this.timeFormatKey, appType.subTimeFrom);
        this.appEntityData.end_time = self.commonService.convertTime(this.timeFormatKey, appType.subTimeTo);
        this.appEntityData.appointment_type = appType.appointmentTypeName;
      }
      _.map(this.slotList, (element) => {
        element.slotTime = self.commonService.convertTime(this.timeFormatKey, element.slotTime);
      });
    });
  }

  onDateChange($event): void {
    this.appontmentDate = $event;
    this.getAvailableSlots();
  }

  // -- hide book button
  // hideBookBtn(): boolean {
  //   if (this.source === 'reschedule') {
  //     return true;
  //   } else {
  //     return !this.slotDetails.tokenNo;
  //   }
  // }

  onSlotSelect($event): void {
    this.formObj.selectedSlot = $event;
    this.appointmentFrm.patchValue({
      selectedSlot: typeof $event === 'object' ? this.formObj.selectedSlot.slotTime : null
    });
    this.slotDetails.slotTime = typeof $event === 'object' ? this.formObj.selectedSlot.slotTime : null;
    this.slotDetails.slotId = typeof $event === 'object' ? this.formObj.selectedSlot.slotId : null;
  }

  checkValidation(): boolean {
    let isTrue = false;
    isTrue = !!!(this.slotDetails.slotTime);
    return (isTrue);
  }

  // -- fired after appointment booked successfully
  updateSlotDetails(res, reqParams): void {
    if (res.id) {
      this.slotDetails = Object.assign(this.slotDetails, res);
    }
    this.isBooked = res.isBooked;
    this.isFormDisable = true;
    this.appointmentFrm.get('patientType').disable();
    this.appointmentFrm.get('selectedServiceArr').disable();
    const displayMsg = (this.source === 'reschedule') ? 'Appointment Updated Successfully' : 'Appointment Booked Successfully';
    this.alertMsg = {
      message: displayMsg,
      messageType: 'success',
      duration: Constants.ALERT_DURATION
    };
    if (this.source === 'calendar') {
      return;
    }
    this.updateSlots(reqParams.Start_Time, reqParams.End_Time);
    this.appointmentService.prepaireBookingDataToAppHistory(this.patientData, this.selectedAppointementData, this.slotDetails);
  }

  getImmediateSlots(slotList) {
    let returnObj = null;
    for (let i = 0; i < slotList.length; i++) {
      if (!slotList[i].isBooked
        && !slotList[i].isBlocked
        && !slotList[i].isOnHoliday
        && !this.isTimePassed(slotList[i].slotTime)) {
        return returnObj = slotList[i];
      }
    }
    return returnObj;
  }

  getTotalServiceTime(valArray, valKey) {
    const sumval = _.sumBy(valArray, valKey);
    if (sumval) {
      this.totalServiceTime = sumval;
    } else {
      this.totalServiceTime = this.selectedAppointementData.default_time_per_patient ? this.selectedAppointementData.default_time_per_patient : 0;
    }
  }

  concateDateWithTime(slot: any) {
    const timeFormat = slot.slotTime.split(' ');
    if (timeFormat.length > 1) {
      const hr12 = timeFormat[0];
      let min = 0;
      if (timeFormat[1] === 'AM' || timeFormat[1] === 'am') {
        min = (hr12.split(':')[0] * 60) + (hr12.split(':')[1] * 1);
      } else {
        min = ((12 + hr12.split(':')[0] * 1) * 60) + (hr12.split(':')[1] * 1);
      }
      slot.slotDateTime = moment().startOf('day').add(min, 'm');
    } else {
      const min = slot.slotTime.split(':')[0] * 60 + slot.slotTime.split(':')[1];
      slot.slotDateTime = moment().startOf('day').add(min, 'm');
    }
    return slot;
  }

  updateNotesRemarks(appointmentId, showAlertMsg = false) {
    if (!appointmentId) {
      return;
    }

    let duration = 0;
    const selectedServiceArr = (this.appointmentFrm.get('selectedServiceArr').disabled) ? this.appointmentFrm.getRawValue().selectedServiceArr : this.appointmentFrm.value.selectedServiceArr;
    const serviceListIds = _.map(selectedServiceArr, (p) => {
      duration = duration + p.caterTime;
      return p.id;
    });
    const selectedPatType = (this.appointmentFrm.get('patientType').disabled) ? this.appointmentFrm.getRawValue().patientType : this.appointmentFrm.value.patientType;

    const reqParams = {
      appt_id: appointmentId,
      notes: this.appointmentFrm.value.notes,
      remarks: this.appointmentFrm.value.remarks,
      service_ids: serviceListIds,
      pat_type: selectedPatType,
      service_duration: duration,
    };
    this.appointmentService.updateAppointmentNotes(reqParams).subscribe((res) => {
      if (res.status_message === 'Success') {
        if (showAlertMsg) {
          this.alertMsg = {
            message: 'Appointment Updated Successfully',
            messageType: 'success',
            duration: Constants.ALERT_DURATION
          };
        }
      } else {
        this.alertMsg = {
          message: res.message,
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
      }
    });
    // setTimeout(() => {
    // this.modal.dismiss();
    // }, 1000);
  }

  getServiceByAppointmentId() {
    if (!this.bookingData) {
      this.otherObservableEvents();
      return;
    }
    this.appointmentService.getServiceByAppointmentId(this.bookingData.appointmentId).subscribe((res) => {
      if (res) {
        // bind notes remarks and service.
        const temp = [];
        this.appointmentFrm.patchValue({
          notes: res.notes,
          remarks: res.remarks,
          selectedServiceArr: res.Services,
          patientType: res.patient_type_name
        });
        if (res.Services && res.Services.length) {
          this.totalServiceTime = 0;
          res.Services.forEach(element => {
            const service = new Service();
            service.generateObject(element);
            this.totalServiceTime = this.totalServiceTime + service.caterTime;
            temp.push({ ...service });
          });
          this.appointmentFrm.patchValue({ selectedServiceArr: temp });
        }
        this.oldAppointmentFormData = this.appointmentFrm.value;
        this.otherObservableEvents();
      }
    });
  }

  getAppointmentSlotBookingSetting() {
    this.commonService.getQueueSettings(Constants.allowLapsedTimeBooking).subscribe(res => {
      this.allowLapsedTimeSlotBooking = (res) ? ((res === 'YES')) : false;
    });
  }

  onAvailablityCheck(flag: boolean) {
    this.isAppointmentAvailable = flag;
  }

  patientAppointmentHistory(patientData) {
    this.patientData = patientData;
    this.appointmentService.getAppointmentHistoryByUhID(this.patientData.pat_uhid).subscribe((res: PatientHistory) => {
      this.patientHistory = res;
      this.history = _.filter(this.patientHistory.history, (e) =>
        moment(e.appointmentTime, 'hh:mm A').format('hh:mm A') === moment(this.selectedAppointmentTime, 'hh:mm A').format('hh:mm A')
        && e.appt_status !== 'CANCELLED' && moment(e.appointmentDate, 'YYYY-MM-DD').format('YYYY-MM-DD') === moment(this.selectedAppointmentDate, 'YYYY-MM-DD').format('YYYY-MM-DD'));

      if (this.history.length !== 0) {
        this.isAppointmentAvailable = false;
      } else {
        this.isAppointmentAvailable = true;
      }
    });
  }

  otherObservableEvents(): void {
    const sub = this.appointmentFrm.valueChanges.pipe(takeUntil(this.$destroy), distinctUntilChanged()).subscribe(res => {
      if (this.source === 'reschedule' || this.source === 'qlist' || this.source === 'edit_appointment') {
        this.newAppointmentFormData = this.appointmentFrm.value;
        this.checkFormIsUpdate();
      } else {
        sub.unsubscribe();
      }
    });
  }

  checkFormIsUpdate(onLoad?): void {
    if (this.oldAppointmentFormData && _.isEqual(this.oldAppointmentFormData, this.newAppointmentFormData)) {
      this.isDisableSaveBtn = true;
    } else {
      this.isDisableSaveBtn = onLoad ? true : false;
    }
  }
}
