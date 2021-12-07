import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import * as moment from 'moment';
import * as _ from 'lodash';
import { Appointment, CalendarData, CalendarDayData, AppointmentTypeIntervalDetails } from '../models/Appointment';
import { CalendarEvent } from 'angular-calendar';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { SlotInfo } from '../modules/appointment/models/slot-info.model';
import { Constants } from '../config/constants';
import { ScheduleTypes } from '../shared/constants/ApplicationEntityConstants';
import { AppointmentType } from '../modules/schedule/models/appointment-type.model';
import { NgxPermissionsService } from 'ngx-permissions';
import { PermissionsConstants } from '../shared/constants/PermissionsConstants';
import { CommonService } from './common.service';
import { AuthService } from './auth.service';


@Injectable({
  providedIn: 'root',
})
export class CalendarService {

  constructor(
    private http: HttpClient,
    private ngxPermissionsService: NgxPermissionsService,
    private commonService: CommonService,
    private authService: AuthService
  ) { }
  timeFormatKey: string = '24_hour';
  getMasterScheduleData(entityType: string, fromDate: string, toDate: string, userId: number, appointmentTypes: Array<number>): Observable<any> {
    const start = moment(fromDate);
    const end = moment(toDate);
    let duration = moment.duration(end.diff(start)).days();
    if (duration === 0) {
      duration = 1;
    }
    return this.getCalendarDataForEntity(entityType, fromDate, toDate, userId, appointmentTypes);
  }

  getCalendarDataForEntity(entityType: string, fromDate: string, toDate: string, userId: number, appointmentTypes: Array<number>): Observable<any> {
    const param = {
      appointment_type_id: appointmentTypes,
      role_type_tag: entityType,
      entity_value_id: userId,
      from_date: moment(fromDate, 'DD/MM/YYYY').format(Constants.apiDateFormate),
      to_date: moment(toDate, 'DD/MM/YYYY').format(Constants.apiDateFormate)
    };
    const reqUrl = environment.baseUrlAppointment + '/Appointment/getCalendarDataForEntity';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  generateCalendarData(res) {
    let startTime = [];
    let endTime = [];
    const calendarDaysData: Array<CalendarDayData> = [];
    _.forEach(res.appointment_dates, (calDayData) => {
      const calendarDayData = new CalendarDayData();
      calendarDayData.date = moment(calDayData.appointment_date, 'DD/MM/YYYY').toDate();
      _.forEach(calDayData.appointment_types, (dateInfo) => {
        const appointmetTypeIntervals: AppointmentTypeIntervalDetails = new AppointmentTypeIntervalDetails();
        const appointmentDetails: AppointmentType = new AppointmentType();
        appointmentDetails.generateObject({ appt_id: dateInfo.appoinment_type_id, Appt_Name: dateInfo.appointment_type });
        appointmetTypeIntervals.appointmentType = appointmentDetails;
        _.forEach(dateInfo.intervals, interval => {
          const slotsInfo: Array<SlotInfo> = [];
          appointmetTypeIntervals.startTime = interval.start_time;
          appointmetTypeIntervals.endTime = interval.end_time;
          _.forEach(interval.appointent_slots, (slot) => {
            const slotInfo: SlotInfo = new SlotInfo();
            slotInfo.generateObj(slot);
            appointmetTypeIntervals.slotInfo.push(slotInfo);
            slotsInfo.push(slotInfo);
          });
          calendarDayData.appointmentSlots = [...calendarDayData.appointmentSlots, ...slotsInfo];
          calendarDayData.intervals.push(_.clone(appointmetTypeIntervals));
        });
        calendarDaysData.push(calendarDayData);
      });
    });
    const appointmentType = _.map(res.appointment_dates, 'appointment_types');
    _.forEach(appointmentType, (aptType) => {
      const timeIntervals = _.map(aptType, 'intervals');
      _.forEach(timeIntervals, (timeInterval) => {
        const stringSTime = _.map(timeInterval, 'start_time');
        startTime = [...startTime, ...stringSTime];
        const stringETime = _.map(timeInterval, 'end_time');
        endTime = [...endTime, ...stringETime];
      });
    });
    const data = {
      calendarData: null,
      calendarDaysData
    };
    if (appointmentType.length > 0) {
      let splitTime = 0;
      const splitTimeVal = _.toString(res.default_time_per_patient).length > 1 ? _.toNumber(_.toString(res.default_time_per_patient).charAt(1)) : res.default_time_per_patient;
      if (splitTimeVal === 0) {
        splitTime = 10;
      } else {
        splitTime = 5;
      }
      const calendarData: CalendarData = new CalendarData();
      calendarData.dayStartTime = moment('1970/01/01 ' + this.getMinOrMaxtTime(startTime, true), 'YYYY/MM/DD HH:mm A').format('HH');
      calendarData.dayStartMinute = moment('1970/01/01 ' + this.getMinOrMaxtTime(startTime, true), 'YYYY/MM/DD HH:mm A').format('mm');
      calendarData.dayEndTime = moment('1970/01/01 ' + this.getMinOrMaxtTime(endTime, false), 'YYYY/MM/DD HH:mm A').format('HH');
      calendarData.dayEndMinute = moment('1970/01/01 ' + this.getMinOrMaxtTime(endTime, false), 'YYYY/MM/DD HH:mm A').format('mm');
      calendarData.hourSplitTime = res.default_time_per_patient ? Math.floor(60 / splitTime) : 2;
      calendarData.advanceBookingDays = res.arp_days ? res.arp_days : null;
      calendarData.calendarType = res.token_type ? res.token_type : ScheduleTypes.FLEXIBLE;
      data.calendarData = calendarData;
    }
    return data;
  }

  getAppointmentsBetweenDates(entityTypeId: string, fromDate: string, toDate: string, userId: number, appointmentTypes: Array<number>, hourSplitTime: number): Observable<any> {
    const param = {
      appointment_type_id: appointmentTypes,
      entity_id: entityTypeId,
      entity_value_id: userId,
      from_date: moment(fromDate, 'DD/MM/YYYY').format('MM/DD/YYYY'),
      to_date: moment(toDate, 'DD/MM/YYYY').format('MM/DD/YYYY'),
      start_time: null,
      end_time: null,
    };
    const reqUrl = environment.baseUrlAppointment + '/AppointmentBooking/getBookedAppointmentsData';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.entity_data.appointment_data.length > 0) {
          _.map(res.entity_data.appointment_data, d => {
            d.isParallelEvent = false;
          });
          const parallelApp = _.filter(_.groupBy(res.entity_data.appointment_data, 'time_slot_id'), dt => {
            return dt.length > 1;
          });
          if (parallelApp.length > 0) {
            _.map(parallelApp, v => {
              const findIndx = _.findIndex(res.entity_data.appointment_data, d => {
                return v[1].appointment_id === d.appointment_id;
              });
              res.entity_data.appointment_data[findIndx].isParallelEvent = true;
            });
          }
        }
        res.events = this.generateAppointments1(res.entity_data.appointment_data, hourSplitTime);
        return res;
      }));
  }

  generateAppointments1(appointmentData: Array<any>, hourSplitTime: number) {
    this.timeFormatKey = this.authService.getUserInfoFromLocalStorage().timeFormat;
    const appointments: Array<CalendarEvent> = [];
    _.forEach(appointmentData, (apt) => {
      if (apt.appointment_status !== 'CANCELLED') {
        const appointment = {
          start: null,
          end: null,
          title: '',
          type: 0,
          slotId: -1,
          eventMeta: {},
          cssClass: ''
        };
        const Aptduration = apt.duration.split(' ')[0] === 0 ? hourSplitTime : (apt.duration.split(' ')[0] % hourSplitTime) > 0 ?
          (hourSplitTime - (apt.duration.split(' ')[0] % hourSplitTime) + apt.duration.split(' ')[0] * 1) : apt.duration.split(' ')[0];
        const date = moment(apt.date, 'YYYY-MM-DD').format('DD/MM/YYYY');
        const AptStartTime = moment(date + ' ' + apt.time, 'DD/MM/YYYY HH:mm A');
        const AptEndTime = AptStartTime.clone().add(Aptduration, 'm');
        appointment.title = apt.patient_details.title + '. ' + apt.patient_details.name;
        appointment.start = AptStartTime;
        appointment.end = AptEndTime;
        appointment.type = apt.appointment_type_id;
        appointment.slotId = apt.time_slot_id;
        appointment.cssClass = apt.isParallelEvent ? '' : '';
        appointment.eventMeta = {
          slotId: apt.time_slot_id,
          appointmentId: apt.appointment_id,
          appointmentDuration: apt.duration ? apt.duration.split(' ')[0] : 0,
          appointmentTypeId: apt.appointment_type_id,
          appointmentStatusId: apt.appointment_status_id,
          appointmentStatus: apt.appointment_status,
          appointmentStatusDisplayName: apt.appointment_status_display_name,
          patient_details: apt.patient_details,
          remarks: apt.remarks,
          notes: apt.notes,
          services: apt.services ? apt.services : [],
          patientType: apt.pat_type_Name,
          addedByUser: apt.add_user_name,
          bookTime: this.commonService.convertTime(this.timeFormatKey, apt.time),
          appointmentType: apt.appointment_type,
          visitType: apt.visit_type,
          visitTypeId: apt.visit_type_id,
          tokenNo: apt.token_no,
          communicationStartTime: this.commonService.convertTime(this.timeFormatKey, apt.slot_time_from),
          communicationEndTime: this.commonService.convertTime(this.timeFormatKey, (apt.slot_time_to === '00:00' || apt.slot_time_to === '12:00 AM')
            ? '23:59' : apt.slot_time_to)
        };

        const aptDetails = new Appointment();
        aptDetails.generateObject(appointment);
        const calendarEvent = aptDetails.getCalendarEvent();
        calendarEvent.draggable = _.isUndefined(this.ngxPermissionsService.getPermission(PermissionsConstants.Calendar_View_Drag_Drop))
        || apt.appointment_status === 'COMPLETE' ? false : calendarEvent.draggable;
        appointments.push(calendarEvent);
      }
    });
    return appointments;
  }

  generateAppointments(duration: number, date: moment.Moment) {
    const appointment = {
      start: null,
      end: null,
      title: ''
    };
    let hours = 9;
    const appointments: Array<CalendarEvent> = [];

    for (let i = 0; i < duration; i++) {
      const clonedStartDate = date.clone();
      const clonedEndDate = date.clone();
      for (let j = 1; j < 4; j++) {
        appointment.start = clonedStartDate.startOf('day').add(hours, 'h');
        const endHour = hours + 1;
        appointment.end = clonedEndDate.startOf('day').add(endHour, 'h');

        appointment.title = `Appointment ${j} `;
        const aptDetails = new Appointment();
        aptDetails.generateObject(appointment);
        hours = hours + 1;
        appointments.push(aptDetails.getCalendarEvent());
      }
      if (duration !== 1) {
        date = date.add(1, 'days');
        hours = 9;
      }
    }
    return appointments;
  }

  getMinOrMaxtTime(times: Array<string>, isMin) {
    times.sort((a, b) => {
      const first: any = new Date('1970/01/01 ' + a);
      const second: any = new Date('1970/01/01 ' + b);
      const diff: any = first - second;
      return diff;
    });
    if (isMin) {
      return times[0];
    } else {
      return times[times.length - 1];
    }
  }

  sortByTime(allSlots, field) {
    allSlots.sort((a, b) => {
      const first: any = new Date('1970/01/01 ' + a[field]);
      const second: any = new Date('1970/01/01 ' + b[field]);
      const diff: any = first - second;
      return diff;
    });
  }

}


