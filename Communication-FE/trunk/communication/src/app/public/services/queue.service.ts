import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import * as moment from 'moment';
import { Observable, Subject } from 'rxjs';
import * as _ from 'lodash';
import { QAppointmentDetails } from '../models/q-entity-appointment-details';
import { environment } from 'src/environments/environment';
import { UpdateAppointmentQueue } from './../models/all-api-service-request.model';

@Injectable()
export class QueueService {
  masterQAppointmentsData: Array<QAppointmentDetails> = [];
  public queueStatusList = [
    { id: 1, name: 'NEXT' },
    { id: 2, name: 'CALLING' },
    { id: 3, name: 'ABSENT' },
    { id: 4, name: 'INCONSULTATION' },
    { id: 5, name: 'COMPLETE' },
    { id: 7, name: 'SKIP' }
  ];

  closengbPopover: Subject<object> = new Subject();
  public $closeNgbPopoverObs = this.closengbPopover.asObservable();

  // public bookAppEvent: Subject<any> = new Subject<any>();
  // public $receiveBookAppEvent = this.bookAppEvent.asObservable();

  public printAnddelayNotificationEvent: Subject<any> = new Subject<any>();
  public $receiveprintAnddelayNotificationEvent = this.printAnddelayNotificationEvent.asObservable();

  public scheduleTimeDetailId = 0;
  private scheduleArray = null;

  constructor(
    private http: HttpClient
  ) { }

  // -- not used
  // getQueuePatientListByLoginUser(loginId: number, date: Date): Observable<Array<QEntityAppointmentDetails>> {
  //   const reqParams = {
  //     loggedin_userid: loginId,
  //     date: moment(date).format('MM/DD/YYYY')
  //   };
  //   const reqUrl = `${environment.baseUrlAppointment}/QueueMaster/getEntityQueueSlot`;
  //   return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
  //     const temp = [];
  //     res.data.forEach(element => {
  //       const qEntity = new QEntityAppointmentDetails();
  //       qEntity.generateObject({ ...element });
  //       temp.push(qEntity);
  //     });
  //     return temp;
  //   }));
  // }

  updateAppointmentQueue(reqParams: UpdateAppointmentQueue): Observable<any> {
    const reqUrl = `${environment.baseUrlAppointment}/QueueTransaction/updateAppointmentQueue`;
    return this.http.put(reqUrl, reqParams);
  }

  getSingleAppointmentSlotByEntity(...orgs): Observable<any> {
    const reqParams = {
      entity_id: orgs[0].entityId,
      entity_value_id: orgs[0].entityValueId,
      service_id: orgs[0].serviceId,
      appointment_type_id: orgs[0].appTypeId,
      sorting_type: orgs[0].sortingType,
      is_include_elapsed_slot: orgs[0].lapsedTimeSlot,
      time_detail_id: orgs[0].timeDetailId
    };
    const reqUrl = `${environment.baseUrlAppointment}/appointment/getSingleAppointmentSlotByEntity`;
    return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return res.appointment_data;
      } else {
        return null;
      }
    }));
  }

  updateTimeFormatInLocalStorage(keyVal) {
    const globals = JSON.parse(localStorage.getItem('globals'));
    globals.timeFormat = keyVal;
    localStorage.setItem('globals', JSON.stringify(globals));
  }

  cancelBookedAppointment(reqParams): Observable<any> {
    const reqUrl = `${environment.baseUrlAppointment}/AppointmentBooking/cancelBookedAppointment`;
    return this.http.post(reqUrl, reqParams);
  }

  cancelBulkAppointments(reqParams): Observable<any> {
    const reqUrl = `${environment.baseUrlAppointment}/AppointmentBooking/cancelBulkAppointments`;
    return this.http.post(reqUrl, reqParams);
  }

  deleteBulkAppointments(reqParam): Observable<any> {
    const reqUrl = `${environment.baseUrlAppointment}/AppointmentBooking/deleteBulkAppointments`;
    return this.http.post(reqUrl, reqParam);
  }

  // -- Not used
  // getEntityAppointmentBooking(loginId: number, date: Date, prType?: string): Observable<Array<QAppointmentDetails>> {
  //   const reqParams = {
  //     loggedin_userid: loginId,
  //     date: moment(date).format('MM/DD/YYYY'),
  //     providerType: prType
  //   };
  //   const reqUrl = `${environment.baseUrlAppointment}/AppointmentBooking/getEntityAppointmentBooking`;
  //   return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
  //     const temp = [];

  //     if (res.status_message === 'Success') {
  //       res.data[0].entity_details = this.filterSlotDataForRepeatedPatient(res.data[0].entity_details);
  //       res.data.forEach(element => {
  //         const qEntity = new QAppointmentDetails();
  //         qEntity.generateObject({ ...element });
  //         temp.push(qEntity);
  //       });
  //       return temp;
  //     }
  //     return temp;
  //   }));
  // }

  getEntityAppointmentBookingBySequence(loginId: number, entityId: number, entityValueId: number, date: Date, prType?: string, includeEmptySlots?): Observable<Array<QAppointmentDetails>> {
    const reqParams = {
      loggedin_userid: 0, // loginId,
      date: moment(date).format('MM/DD/YYYY'),
      providerType: prType,
      is_include_empty_slots: true,
      Entity_id: entityId,
      Entity_value_id: entityValueId
    };
    if (includeEmptySlots !== null) {
      reqParams.is_include_empty_slots = includeEmptySlots;
    }
    const reqUrl = `${environment.baseUrlAppointment}/AppointmentBooking/getEntityAppointmentBookingBySequence`;
    return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
      const temp = [];
      if (res.status_message === 'Success' && res.data) {
        res.data.forEach(element => {
          const qEntity = new QAppointmentDetails();
          qEntity.generateObject({ ...element });
          temp.push(qEntity);
        });
        return temp;
      }
      return temp;
    }));
  }

  // setQAppointmentData(configId: number, entityId: number, entityValueId: number, list: Array<QAppointmentDetails>, slotId?: number, appointmentData?: QAppointments) {
  //   const indx = this.masterQAppointmentsData.findIndex(m => m.configId === configId && m.entityId === entityId && m.entityValueId === entityValueId);
  //   if (indx === -1) {
  //     this.masterQAppointmentsData = list;
  //   } else {
  //     const slotIndx = this.masterQAppointmentsData[indx].slotsDetails.findIndex(s => s.slotId === slotId);
  //     if (slotIndx !== -1) {
  //       this.masterQAppointmentsData[indx].slotsDetails[slotIndx].appointments.push(appointmentData);
  //     }
  //   }
  // }

  // getQAppointmentData(entityId: number, entityValueId: number, configId: number, date, slotId?) {
  //   const indx = this.masterQAppointmentsData.findIndex(m => {
  //     return m.configId === configId && m.entityId === entityId && m.entityValueId === entityValueId && moment(m.queueDate, 'DD/MM/YYYY').isSame(moment(date, 'DD/MM/YYYY'));
  //   });
  //   if (indx === -1) {
  //     return [];
  //   } else {
  //     if (slotId) { // -- if slot id then return slot details only
  //       const slotIndx = this.masterQAppointmentsData[indx].slotsDetails.findIndex(s => s.slotId === slotId);
  //       if (slotIndx !== -1) {
  //         return this.masterQAppointmentsData[indx].slotsDetails[slotIndx];
  //       } else {
  //         return [];
  //       }
  //     } else {  // -- if not return all slots related
  //       return this.masterQAppointmentsData[indx];
  //     }
  //   }
  // }

  sendEventOfNgbPopover(componentInst) {
    this.closengbPopover.next({ ...componentInst });
  }

  // -- check in doctor
  checknInDoctor(entityMappingId): Observable<any> {
    const reqParams = {
      room_mapping_id: entityMappingId
    };
    const reqUrl = `${environment.baseUrlAppointment}/QueueTransaction/entityCheckIn`;
    return this.http.post(reqUrl, reqParams);
  }

  checkOutDoctor(entityMappingId): Observable<any> {
    const reqParams = {
      room_mapping_id: entityMappingId
    };
    const reqUrl = `${environment.baseUrlAppointment}/QueueTransaction/entityCheckOut`;
    return this.http.post(reqUrl, reqParams);
  }

  saveCheckInCheckOutStatus(reqParams): Observable<any> {
    const reqUrl = `${environment.baseUrlAppointment}/QueueTransaction/saveCheckInCheckOutStatus`;
    return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
      res.checkInStatus = reqParams.staus;
      return res;
    }));
  }

  getCheckInCheckOutStatus(roomMappingId, checkinDate): Observable<any> {
    const reqParams = {
      room_mapping_id: roomMappingId,
      checkin_date: checkinDate // --MM/DD/YYYY
    };
    const reqUrl = `${environment.baseUrlAppointment}/QueueTransaction/getCheckInCheckOutStatus`;
    return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.CheckinStatus) {
        // res.CheckinStatus[0].checkin_status = res.CheckinStatus[0].checkin_status;
        // res.CheckinStatus.checkin_status = res.CheckinStatus.checkout_status ? false : res.CheckinStatus.checkin_status;
        return res;
      } else {
        return res;
      }
    }));
  }

  setScheduleTimeDetailId(timeDetailId) {
    this.scheduleTimeDetailId = timeDetailId;
  }

  getScheduleTimeDetailId() {
    return this.scheduleTimeDetailId;
  }

  saveZeroSlots(requestParams) {
    const reqURL = `${environment.baseUrlAppointment}/ScheduleConfig/extendScheduleTime`;
    return this.http.post(reqURL, requestParams).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success') {
          return { timeId: res.time_id, message: '' };
        } else {
          return { timeId: 0, message: res.message };
        }
      })
    );
  }

  // sendEventToGetQueueAppSlots(data) {
  //   this.bookAppEvent.next(data);
  // }

  sendPrintOrDelayNotificationEvent(flag) {
    this.printAnddelayNotificationEvent.next(flag);
  }

  saveDelayNotification(requestParams) {
    const reqURL = `${environment.baseUrlAppointment}/QueueTransaction/saveLateComingEntity`;
    return this.http.post(reqURL, requestParams).pipe(
      map((res: any) => {
        /*  if (res.status_code === 200 && res.status_message === 'Success') {
           return res;
         } else {
           return null;
         } */
        return res
      })
    );
  }

  getDelayedHistoryForToday(requestParams): Observable<any> {
    const reqURL = `${environment.baseUrlAppointment}/QueueTransaction/getEntityDelayTime`;
    return this.http.post(reqURL, requestParams).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success') {
          return res;
        } else {
          return null;
        }
      })
    );
  }

  // filterSlotDataForRepeatedPatient(slotData) {
  //   const bookedSlots = _.filter(slotData, { is_booked: true });
  //   const bookedFalseSlots = _.filter(slotData, { is_booked: false });
  //   const slotTomerge = [];
  //   const sameAppointments = [];
  //   bookedSlots.forEach(slot => {
  //     slot.patientAppointmentSlotDetails.forEach(appointment => {
  //       const repeateAppointemnt = _.find(slotTomerge, { appointment_id: appointment.appointment_id });
  //       if (repeateAppointemnt) {
  //         const existingAptTime = moment(moment().format('YYYY-MM-DD') + ' ' + repeateAppointemnt.apt_time);
  //         const newTime = moment(moment().format('YYYY-MM-DD') + ' ' + slot.slot_time);
  //         if (existingAptTime.isAfter(newTime)) {
  //           slotTomerge.splice(_.findIndex(slotTomerge, { appointment_id: appointment.appointment_id }, 1,
  //             { slot_id: slot.slot_id, appointment_id: appointment.appointment_id, apt_time: slot.slot_time }));
  //         }
  //       }
  //       if (!repeateAppointemnt) {
  //         const slotAlreadyAdded = _.find(slotTomerge, { slot_id: slot.slot_id });
  //         if (!slotAlreadyAdded) {
  //           slot.proceedToQueue = true;
  //           slotTomerge.push({ slot_id: slot.slot_id, appointment_id: appointment.appointment_id, apt_time: slot.slot_time });
  //         }
  //       }
  //     });
  //   });
  //   slotTomerge.forEach(slot => {
  //     const slotToPush = _.find(bookedSlots, { slot_id: slot.slot_id });
  //     bookedFalseSlots.push(slotToPush);
  //   });
  //   this.sortByTime(bookedFalseSlots);
  //   return bookedFalseSlots;
  // }

  sortByTime(allSlots, sortBy) {
    allSlots.sort((a, b) => {
      const first: any = new Date('1970/01/01 ' + a[sortBy]);
      const second: any = new Date('1970/01/01 ' + b[sortBy]);
      const diff: any = first - second;
      return diff;
    });
  }

  updateQueueSequence(requestParams: { from_slot: number, to_slot: number }): Observable<any> {
    const reqURL = `${environment.baseUrlAppointment}/QueueTransaction/UpdateQueueSequence`;
    return this.http.post(reqURL, requestParams);
  }
  setCurrentSchedules(scheduleArray) {
    this.scheduleArray = scheduleArray;
  }
  getCurrentSchedules() {
    return this.scheduleArray;
  }

  getAllEntityAppointment(loginId: number): Observable<Array<QAppointmentDetails>> {
    const reqParams = {
      loggedin_userid: loginId,
      appointment_type_id: 0,
      date: moment().format('MM/DD/YYYY')
    };
    const reqUrl = `${environment.baseUrlAppointment}/AppointmentBooking/getAllEntityAppointmentBookingBySequence`;
    return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
      const temp = [];
      if (res.status_message === 'Success') {
        res.data.forEach(element => {
          const qEntity = new QAppointmentDetails();
          qEntity.generateObject({ ...element });
          temp.push(qEntity);
        });
        return temp;
      }
      return temp;
    }));
  }

  updateSelectedSchedule(requestParams) {
    const reqURL = `${environment.baseUrlAppointment}/ScheduleConfig/addReplacedSchedule`;
    return this.http.post(reqURL, requestParams).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success') {
          return { timeId: res.time_id, message: '' };
        } else {
          return { timeId: 0, message: res.message };
        }
      })
    );
  }

  AddSelectedSchedule(requestParams) {
    const reqURL = `${environment.baseUrlAppointment}/ScheduleConfig/addExtendedSchedule`;
    return this.http.post(reqURL, requestParams).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success') {
          return { timeId: res.time_id, message: '' };
        } else {
          return { timeId: 0, message: res.message };
        }
      })
    );
  }

  getCheckInCheckOutStatusByUserId(reqParams): Observable<any> {
    const reqURL = `${environment.baseUrlAppointment}/QueueTransaction/getCheckInCheckOutStatusByUserId`;
    return this.http.post(reqURL, reqParams);
  }

}
