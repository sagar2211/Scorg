import { Component, OnInit, ViewChild, TemplateRef, Input, OnDestroy } from '@angular/core';
import { startOfDay, endOfDay, isSameDay, isSameMonth, addHours, endOfWeek } from 'date-fns';
import { Subject, Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  CalendarEvent,
  CalendarEventTimesChangedEvent,
  CalendarView,
  CalendarWeekViewBeforeRenderEvent,
  CalendarDayViewBeforeRenderEvent,
  CalendarMonthViewBeforeRenderEvent,
  CalendarDateFormatter,
  CalendarUtils
} from 'angular-calendar';
import * as moment from 'moment';
import * as _ from 'lodash';
import { AuthService } from 'src/app/services/auth.service';
import { CalendarService } from 'src/app/services/calendar.service';
import { CalendarData, CalendarDayData } from 'src/app/models/Appointment';
import { takeUntil, map } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../../../services/common.service';
import { Provider } from 'src/app/shared/models/provider';
import { Constants } from 'src/app/config/constants';
import { CustomDateFormatter } from './custom-date-formatter.provider';
import { CustomCalendarUtils } from './custom-calendar-utils';
import { Entity } from 'src/app/modules/schedule/models/entity.model';
import { ScheduleTypes, ApplicationEntityConstants } from 'src/app/shared/constants/ApplicationEntityConstants';
import { IAlert } from 'src/app/models/AlertMessage';
import { NgxPermissionsService } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { AppointmentPrint } from 'src/app/modules/qms/models/appointment-print.mode';
import { AppointmentBookLibComponent, QmsQlistLibService } from '@qms/qlist-lib';
import { environment } from 'src/environments/environment';
import { AppointmentListModel } from 'src/app/modules/appointment/models/appointment.model';
import { AppointmentService } from 'src/app/modules/appointment/services/appointment.service';
import { AppointmentEntityInfoModel } from 'src/app/modules/appointment/models/appointment-entity-info.model';
import { AddPatientComponent } from 'src/app/modules/patient-shared/component/add-patient/add-patient.component';

const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3'
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF'
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA'
  }
};


@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  providers: [
    {
      provide: CalendarDateFormatter,
      useClass: CustomDateFormatter
    },
    {
      provide: CalendarUtils,
      useClass: CustomCalendarUtils
    }

  ],
  styleUrls: ['./calendar.component.scss'],
  styles: [
    `
      .cal-week-view .cal-time-events .cal-day-column {
        margin-right: 10px;
      }

      .cal-week-view .cal-hour {
        width: calc(100% + 10px);
      }
    `
  ]
})
export class CalendarComponent implements OnInit, OnDestroy {
  loadAsComponentVal = false;
  currentActiveEntity: Provider = null;
  @Input() componentUserId: number;
  @Input() date: string;
  @Input() calendarView: string;
  @Input() entityType: string;
  @Input() entity: Entity;
  @Input() showNavigationControls: boolean;
  @Input() loadAsComponent: boolean;
  @Input() appointmentData: AppointmentListModel;
  @Input() selectedPatient;
  @Input() isExpand = false;

  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;
  view: CalendarView = CalendarView.Week;

  CalendarView = CalendarView;
  selectedPatientForApoointment = null;
  viewDate: Date = new Date();
  calendarData: CalendarData;
  loadSource;
  calendarDaysData: Array<CalendarDayData>;
  modalData: {
    action: string;
    event: CalendarEvent;
  };

  refresh: Subject<any> = new Subject();

  events: CalendarEvent[] = [];
  $destroy = new Subject<any>();
  activeDayIsOpen = false;
  showCalendarNavigationControls = true;
  userInfo: any = null;
  appointmentTypeIdsList: Array<number> = [];
  timeFormateKey = '';

  isDayHoliday: boolean;
  isOutOfAdvanceBookingDay: boolean = false;
  scheduleDefined: boolean = false;
  advanceBookingDate = '';
  advanceBookingDays = 0;
  userId: number;
  alertMsg: IAlert;
  printData = null;
  entityData: any;
  isPartialLink: boolean;
  public allowLapsedTimeSlotBooking = false;

  slotColorSetting = {
    holiday_color: 'holiday',
    available_color: '',
    blocked_color: 'bg-blocked',
    booked_color: '',
    differentdateslot_color: '',
    out_of_hour_color: 'bg-out-of-hour',
    time_lapsed_color: 'custom-bg-light'
  };
  patientId: any;

  constructor(
    private modal: NgbModal,
    private authService: AuthService,
    private calendarService: CalendarService,
    private appointmentService: AppointmentService,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private ngxPermissionsService: NgxPermissionsService,
    private addPatientModalService: NgbModal,
    private qmsQlistLibService: QmsQlistLibService,
    private activeRoute: ActivatedRoute,
    private router : Router
  ) {
  }

  ngOnInit() {
    this.userId = +this.authService.getLoggedInUserId();
    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    const param = [
      {
        tag_name: Constants.calendarViewSetting,
        tag_question: this.userId,
      },
      {
        tag_name: Constants.slotColorSetting,
        tag_question: ''
      },
      {
        tag_name: Constants.allowLapsedTimeBooking,
        tag_question: ''
      }
    ];
    this.commonService.getQueueSettingsForMultiple(param).subscribe(res => {
      _.map(res, (v) => {
        if (v.tag_name.toUpperCase() === Constants.calendarViewSetting.toUpperCase() && v.tag_value) {
          const calView = JSON.parse(v.tag_value).favView;
          this.calendarView = calView === 'day' ? 'Day' : calView === 'week' ? 'Week' : calView === 'month' ? 'Month' : 'Day';
        }
        if (v.tag_name.toUpperCase() === Constants.slotColorSetting.toUpperCase() && v.tag_value) {
          this.getSlotColors(JSON.parse(v.tag_value));
        }
        if (v.tag_name.toUpperCase() === Constants.allowLapsedTimeBooking.toUpperCase() && v.tag_value) {
          this.allowLapsedTimeSlotBooking = (v.tag_value) ? (v.tag_value === 'YES') : false;
        }
      });
      this.timeFormateKey = this.authService.getUserInfoFromLocalStorage().timeFormat; // data.time_format_key;
      this.calendarService.timeFormatKey = this.timeFormateKey;
      this.commonService.routeChanged(this.route);
      this.loadAsComponentVal = this.loadAsComponent;
      if (this.userInfo.provider_info.length) {
        this.currentActiveEntity = _.find(this.userInfo.provider_info, (o) => o.providerValueId === this.userInfo.user_id && o.providerType === this.userInfo.role_type);
      }
      if (this.showNavigationControls !== undefined && !this.showNavigationControls) {
        this.showCalendarNavigationControls = false;
      }
      this.setView(this.calendarView === 'Day' ? CalendarView.Day : (this.calendarView === 'Week' ? CalendarView.Week : CalendarView.Month));
      this.viewDate = this.date ? moment(this.date, 'DD/MM/YYYY').toDate() : new Date();
      if (this.userInfo.role_type === ApplicationEntityConstants.DOCTOR && !this.loadAsComponentVal) { // redirect from fd user need to check ,for not call more then once
        this.loadSchedule(this.viewDate);
      } else if (this.loadAsComponentVal) { // from call center view
        this.loadSchedule(this.viewDate);
      }
    });
    this.subscribeEvents();
    this.isDayHoliday = false;
  }

  ngOnDestroy() {
    this.$destroy.next();
    this.$destroy.unsubscribe();
  }

  subscribeEvents() {
    this.appointmentService.$patientInfo.pipe(takeUntil(this.$destroy)).subscribe(res => {
      if (res) {
        this.selectedPatientForApoointment = res;
      } else {
        this.selectedPatientForApoointment = null;
      }
    });

    const sub = this.commonService.$recieveFilterEvent.pipe(takeUntil(this.$destroy)).subscribe(res => {
      if (res.isFrom === 'calendar') {
        if ((!_.isEqual(this.currentActiveEntity, res.data.providerDetails)) ||
          (!_.isEqual(this.appointmentTypeIdsList, res.data.appTypelist))) {
          this.appointmentTypeIdsList = res.data.appTypelist;
          this.currentSelectedEntity(res.data.providerDetails);
        }
      } else {
        sub.unsubscribe();
      }
    });
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  updateAppointmentOnDrag(event) {
    const params = {
      Appt_Slot_Id: event.id,
      Pat_Uhid: event.meta.patient_details.uhid,
      Remarks: event.meta.remarks,
      Services: _.map(event.meta.services, dt => dt.service_id),
      Start_Time: moment(event.start).format('hh:mm A'),
      End_Time: moment(event.end).format('hh:mm A'),
      Notes: event.meta.notes,
      Pat_Type: event.meta.patientType,
      IsCalendarAppointment: true,
      Pat_ExistingAppt_Id: event.meta.appointmentId,
      Service_Duration: event.meta.appointmentDuration,
      Visit_Typeid: event.meta.visitTypeId
    }
    this.appointmentService.saveAppointmentBooking(params).subscribe(res => {
      this.loadSchedule(this.viewDate);
      this.alertMsg = {
        message: 'Appointment Updated',
        messageType: 'success',
        duration: Constants.ALERT_DURATION
      };
      this.getPrintData(res);
      // update notes and remarks
      // const reqParams = {
      //   appt_id: res.id,
      //   notes: event.meta.notes,
      //   remarks: event.meta.remarks
      // };
      // this.updateNotesRemarks(reqParams);
    });
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd
  }: CalendarEventTimesChangedEvent): void {
    this.events = this.events.map(iEvent => {
      // check for starttime should greated then/equal current time
      const curTime = moment();
      const findData = _.find(this.events, (ev) => {
        return moment(ev.start).isSame(moment(newStart));
      });
      if (curTime.isSameOrBefore(newStart) && _.isUndefined(findData)) {
        if (iEvent === event) {
          // find new slotid
          const slotDateData = _.findIndex(this.calendarDaysData, dt => {
            return moment(moment(dt.date).format('YYYY-MM-DD')).isSame(moment(moment(newStart).format('YYYY-MM-DD')));
          });
          if (slotDateData !== -1) {
            const slotData = _.findIndex(this.calendarDaysData[slotDateData].appointmentSlots, slot => {
              return moment(moment(newStart).format('YYYY-MM-DD') + ' ' + slot.slotTime).isSame(moment(newStart));
            });
            if (slotData !== -1) {
              const ev = {
                ...event,
                start: newStart,
                end: newEnd,
                id: this.calendarDaysData[slotDateData].appointmentSlots[slotData].slotId,
              };
              if (this.calendarDaysData[slotDateData].appointmentSlots[slotData].isBlocked) {
                this.displayErrorMsg('Blocked! Can not Book Appointment for the selected hours', 'warning');
                return iEvent;
              } if (this.calendarDaysData[slotDateData].appointmentSlots[slotData].isOnHoliday) {
                this.displayErrorMsg('Holiday! Can not Book Appointment for the selected hours', 'warning');
                return iEvent;
              } else {
                // update appointment
                this.updateAppointmentOnDrag(ev);
                return ev;
              }
            } else {
              return iEvent;
            }
          } else {
            return iEvent;
          }
        }
        return iEvent;
      } else if (curTime.isSameOrAfter(newStart)) {
        this.alertMsg = {
          message: "Can't Update Appointment For Past Time Slot",
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
        return iEvent;
      } else if (!_.isUndefined(findData)) {
        this.alertMsg = {
          message: "Appointment Exist In This Time slot",
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
        return iEvent;
      } else {
        return iEvent;
      }
    });
    this.handleEvent('Dropped or resized', event);
  }

  handleEvent(action: string, event: CalendarEvent): void {
    // this.modalData = { event, action };
    // this.modal.open(this.modalContent, { size: 'lg' });
  }

  addEvent(): void {
    this.events = [
      ...this.events,
      {
        title: 'New event',
        start: startOfDay(new Date()),
        end: endOfDay(new Date()),
        color: colors.red,
        draggable: true,
        resizable: {
          beforeStart: true,
          afterEnd: true
        }
      }
    ];
  }

  intializeEvents(appointments: CalendarEvent[]): void {
    this.events = [...appointments];
  }

  deleteEvent(eventToDelete: CalendarEvent) {
    this.events = this.events.filter(event => event !== eventToDelete);
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }


  beforeMonthViewRender(renderEvent: CalendarMonthViewBeforeRenderEvent): void {
    renderEvent.body.forEach(body => {
      const dateIndex = _.findIndex(this.calendarDaysData, dt => {
        return moment(moment(dt.date).format('YYYY-MM-DD')).isSame(moment(moment(body.date).format('YYYY-MM-DD')));
      });
      if (dateIndex !== -1) {
        const currentData = this.calendarDaysData[dateIndex];
        currentData.appointmentSlots.forEach(val => {
          if (val.isOnHoliday) {
            body.cssClass = this.slotColorSetting.holiday_color;
          }
        });
      }
    });
  }

  beforeDayViewRender(renderEvent: CalendarDayViewBeforeRenderEvent) {
    const today = moment();
    const isDateExists = _.find(this.calendarDaysData, (calData) => {
      return moment(renderEvent.period.start).format('DD/MM/YYYY') === moment(calData.date).format('DD/MM/YYYY');
    });
    const isToday = this.isCurrentDateIsTodaysDate(isDateExists ? isDateExists.date : null);
    if (isDateExists && this.calendarData.calendarType === ScheduleTypes.SEQUENTIAL) {
      this.ifScheduleTypeisSequential(isDateExists, isToday, today);
    }

    renderEvent.hourColumns.forEach(hourColumn => {
      hourColumn.hours.forEach(hour => {
        hour.segments.forEach(segment => {
          if (segment.date.getHours() >= 2 && segment.date.getHours() <= 5) {
            segment.cssClass = 'bg-pink';
          }
        });
      });
    });

    renderEvent.hourColumns.forEach(hourColumn => {
      hourColumn.hours.forEach(hour => {
        hour.segments.forEach((segment, index) => {
          segment.cssClass = this.getCssClass(segment, isDateExists, isToday);
        });
      });
    });
  }

  beforeWeekViewRender(renderEvent: CalendarWeekViewBeforeRenderEvent) {
    const today = moment();
    renderEvent.hourColumns.forEach(hourColumn => {
      const isDateExists = _.find(this.calendarDaysData, (calData) => {
        return moment(hourColumn.date).format('DD/MM/YYYY') === moment(calData.date).format('DD/MM/YYYY');
      });
      const firstSequentialSlotsByInterval = [];
      const isToday = this.isCurrentDateIsTodaysDate(isDateExists ? isDateExists.date : null);
      if (isDateExists && this.calendarData.calendarType === ScheduleTypes.SEQUENTIAL) {
        this.ifScheduleTypeisSequential(isDateExists, isToday, today);
      }
      hourColumn.hours.forEach(hour => {
        hour.segments.forEach(segment => {
          {
            segment.cssClass = this.getCssClass(segment, isDateExists, isToday);
          }
        });
      });
    });
  }

  getCssClass(segment, dateData, isToday) {
    if (dateData) {

      const slot = this.isSlotBlocked(segment.date, dateData);
      if (!slot) {
        return this.slotColorSetting.time_lapsed_color;
      }
      if (this.calendarData.calendarType === ScheduleTypes.SEQUENTIAL) {
        if (!slot.isOnHoliday && !slot.isBlocked && slot.isBooked && !this.isSlotPassed(segment.date, moment())) {
          return '';
        } else if (!slot.isOnHoliday && !slot.isBlocked && slot.isBooked && this.isSlotPassed(segment.date, moment())) {
          return this.slotColorSetting.time_lapsed_color;
        } else if (this.isSlotPassed(segment.date, moment()) && !slot.isBooked && !slot.isOnHoliday && !slot.isBlocked) {
          return this.slotColorSetting.time_lapsed_color;
        } else if (slot.isBlocked ||
          (isToday && !this.allowLapsedTimeSlotBooking && this.isSlotPassed(segment.date, moment())) ||
          this.isAheadOfAdvanceDayBooking(segment.date) ||
          this.isDayPassed(segment.date)) {
          return this.slotColorSetting.time_lapsed_color;
        } else if (slot.isOnHoliday) {
          return this.slotColorSetting.time_lapsed_color;
        }
      }
      if (!slot.isOnHoliday && !slot.isBlocked && slot.isBooked && !this.isSlotPassed(segment.date, moment())) {
        return '';
      } else if (!slot.isOnHoliday && !slot.isBlocked && slot.isBooked && this.isSlotPassed(segment.date, moment())) {
        return this.slotColorSetting.time_lapsed_color;
      } else if (this.isSlotPassed(segment.date, moment()) && !slot.isBooked && !slot.isOnHoliday && !slot.isBlocked) {
        return this.slotColorSetting.time_lapsed_color;
      } else if (slot.isBlocked ||
        (isToday && !this.allowLapsedTimeSlotBooking && this.isSlotPassed(segment.date, moment())) ||
        this.isAheadOfAdvanceDayBooking(segment.date) ||
        this.isDayPassed(segment.date)) {
        return this.slotColorSetting.holiday_color;
      } else if (slot.isOnHoliday) {
        return this.slotColorSetting.holiday_color;
      }
    } else {
      return this.slotColorSetting.time_lapsed_color;
    }
  }
  ifScheduleTypeisSequential(isDateExists, isToday, today) {
    const firstSequentialSlotsByInterval = [];
    if (isDateExists && this.calendarData.calendarType === ScheduleTypes.SEQUENTIAL) {
      _.forEach(isDateExists.intervals, interval => {
        this.calendarService.sortByTime(interval.slotInfo, 'slotTime');
        if ((this.allowLapsedTimeSlotBooking || !isToday) && this.loadAsComponentVal === undefined) {
          const slot = _.find(interval.slotInfo, { isBooked: false, isBlocked: false, isOnHoliday: false });
          firstSequentialSlotsByInterval.push(slot.slotId);
        } else {
          _.forEach(interval.slotInfo, slot => {
            const currentSlot = moment(moment(isDateExists.date).format('YYYY/MM/DD ') + slot.slotTime);
            if (this.isSlotPassed(currentSlot, today)) {
              slot.isBlocked = true;
            }
          });
          const slot = _.find(interval.slotInfo, { isBooked: false, isBlocked: false, isOnHoliday: false });
          if (slot) {
            firstSequentialSlotsByInterval.push(slot.slotId);
          }
        }
      });

      isDateExists.appointmentSlots.forEach(slot => {
        if (firstSequentialSlotsByInterval.length > 0 && !firstSequentialSlotsByInterval.includes(slot.slotId)) {
          slot.isBlocked = true;
        }
      });
    }
  }

  getAppointmentListByEntity(selectedentity) {
    if (selectedentity) {
      this.currentActiveEntity = selectedentity;
    }
    this.loadSchedule(this.viewDate);
  }

  dateChangeEvent(event) {
    if (!event) {
      return null;
    }
    this.loadSchedule(event);
  }

  loadSchedule(date: Date) {
    const momentDate = moment(date);
    const currentDate = momentDate.format('DD/MM/YYYY');
    // momentDate.add(daysAdd, 'd');
    if (this.view === 'day') {
      // currentDate = '19/08/2019';
      this.getAppointmentsBetweenDates(currentDate, currentDate);

    } else if (this.view === 'week') {
      const startOfWeek = momentDate.startOf('week');
      const endDateOfWeek = startOfWeek.clone().add(6, 'days');
      this.getAppointmentsBetweenDates(startOfWeek.format('DD/MM/YYYY'), endDateOfWeek.format('DD/MM/YYYY'));
    } else if (this.view === 'month') {
      const startOfMonth = moment().startOf('month');
      const endOfMonth = moment().endOf('month');
      this.getAppointmentsBetweenDates(startOfMonth.format('DD/MM/YYYY'), endOfMonth.format('DD/MM/YYYY'));
    }
  }

  viewChangedEvent(event) {
    this.loadSchedule(this.viewDate);
  }

  getAppointmentsBetweenDates(fromDate: string, toDate: string) {
    // 34,132,61, 197
    let entityType = 'DOCTOR';
    let userId;
    let entityTypeId;
    const appointmentTypes: Array<number> = this.appointmentTypeIdsList.length ? this.appointmentTypeIdsList : [];
    if (this.currentActiveEntity) {
      entityType = this.currentActiveEntity.providerType ? this.currentActiveEntity.providerType : 'DOCTOR';
      userId = this.currentActiveEntity.providerValueId;
    } else if (this.commonService.getCurrentSelectedProvider() && !this.currentActiveEntity) {
      this.currentActiveEntity = this.commonService.getCurrentSelectedProvider();
    } else if (!this.currentActiveEntity) {
      this.currentActiveEntity = new Provider({
        entity_id: this.currentActiveEntity ? this.currentActiveEntity.providerId : null,
        entity_alias: this.userInfo.role_type,
        entity_value_id: this.userInfo.user_id,
        entity_value_name: this.userInfo.user_name
      });
      // this.currentActiveEntity.providerType = this.userInfo.role_type;
      // this.currentActiveEntity.providerValueId = this.userInfo.user_id;
      // this.currentActiveEntity.providerName = this.userInfo.user_name;

    }
    if (this.loadAsComponentVal) {
      entityType = this.entity.key;
      this.currentActiveEntity.providerId = this.entity.id;
      this.currentActiveEntity.providerType = this.entity.key;
      this.currentActiveEntity.providerName = this.appointmentData.entity_value_name;
      this.currentActiveEntity.providerValueId = this.componentUserId;
      userId = this.componentUserId;
      fromDate = this.date;
      toDate = this.date;
      const appointmentEnityInfo: AppointmentEntityInfoModel = this.appointmentData.entity_data as AppointmentEntityInfoModel;
      appointmentTypes.push(appointmentEnityInfo.appointment_type_id);
      this.selectedPatientForApoointment = this.selectedPatient;
    }
    entityTypeId = this.currentActiveEntity.providerId;

    this.calendarService.getMasterScheduleData(entityType, fromDate, toDate, userId, appointmentTypes).subscribe((res) => {
      const calendarData = this.calendarService.generateCalendarData(res);
      if (!this.loadAsComponentVal) {
        const obj = new AppointmentListModel();
        const appModelTempObj = {
          config_id: 0,
          entity_id: entityTypeId,
          entity_name: this.userInfo.role_type,
          entity_value_id: this.userInfo.user_id,
          entity_value_name: this.userInfo.user_name,
          entity_data: [],
          time_subdetail_id: 0,
          token_type: res.token_type,
          default_time_per_patient: res.default_time_per_patient,
          // added for Parallel Booking
          is_allow_booking: res.is_parallel_booking_allowed,
          max_allow_booking: res.no_of_parallel_bookings
        };
        obj.generateObj(appModelTempObj);
        this.appointmentData = obj;
      }
      this.advanceBookingDays = res.arp_days !== undefined ? res.arp_days : 0;
      // (calendarData.calendarData && calendarData.calendarData.advanceBookingDays) ? calendarData.calendarData.advanceBookingDays : 0; // advancebooking days
      // check if view is day, then then date have holiday Or not - himanshu
      this.isDayHoliday = false;
      this.isOutOfAdvanceBookingDay = false;
      if (this.isScheduleDefined(calendarData) &&
        this.view === 'day' &&
        calendarData.calendarDaysData.length > 0) {
        const stotTotalLength = calendarData.calendarDaysData[0].appointmentSlots.length;
        const holidaySlotLength = _.filter(calendarData.calendarDaysData[0].appointmentSlots, (h) => {
          return h.isOnHoliday === true;
        });
        this.isDayHoliday = stotTotalLength === holidaySlotLength.length ? true : false;
        if (calendarData.calendarDaysData.length && moment(calendarData.calendarDaysData[0].date).isAfter(moment().add(this.advanceBookingDays, 'd'))) {
          this.isOutOfAdvanceBookingDay = true;
          this.advanceBookingDate = moment(moment().add(this.advanceBookingDays, 'd').toDate()).format('DD/MM/YYYY');
        }
      } else if (res.arp_days !== undefined && this.advanceBookingDays !== 0) {
        this.isOutOfAdvanceBookingDay = true;
        this.advanceBookingDate = moment(moment().add(this.advanceBookingDays, 'd').toDate()).format('DD/MM/YYYY');
      }
      // check if view is day, then then date have holiday Or not - himanshu
      this.calendarData = calendarData.calendarData;
      this.calendarDaysData = calendarData.calendarDaysData;
      const calendarSlotTime = this.getCalendarTimeSlot();
      this.calendarService.getAppointmentsBetweenDates(entityTypeId, fromDate, toDate, userId, appointmentTypes, calendarSlotTime).subscribe((appointmentResp: any) => {
        this.events = appointmentResp.events;
        this.refresh.next();
      }, (err) => {
      });
      this.refresh.next();
    }, (error) => {
    });
  }

  getAppointmentsCountBetweenDates(fromDate: string, toDate: string): Observable<any> {
    let entityType = 'DOCTOR';
    let userId;
    let entityTypeId;
    const appointmentTypes: Array<number> = [];
    if (this.currentActiveEntity) {
      entityType = this.currentActiveEntity.providerType ? this.currentActiveEntity.providerType : 'DOCTOR';
      userId = this.currentActiveEntity.providerValueId;
    } else if (this.commonService.getCurrentSelectedProvider() && !this.currentActiveEntity) {
      this.currentActiveEntity = this.commonService.getCurrentSelectedProvider();
    } else if (!this.currentActiveEntity) {
      this.currentActiveEntity = new Provider({
        entity_id: this.currentActiveEntity.providerId,
        entity_alias: this.userInfo.role_type,
        entity_value_id: this.userInfo.user_id,
        entity_value_name: this.userInfo.user_name
      });
    }
    if (this.loadAsComponentVal) {
      entityType = this.entity.key;
      this.currentActiveEntity.providerId = this.entity.id;
      this.currentActiveEntity.providerType = this.entity.key;
      this.currentActiveEntity.providerName = this.appointmentData.entity_value_name;
      this.currentActiveEntity.providerValueId = this.componentUserId;
      userId = this.componentUserId;
      fromDate = this.date;
      toDate = this.date;
      this.selectedPatientForApoointment = this.selectedPatient;
    }
    entityTypeId = this.currentActiveEntity.providerId;
    const calendarSlotTime = this.getCalendarTimeSlot();
    return this.calendarService.getAppointmentsBetweenDates(entityTypeId, fromDate, toDate, userId, [], calendarSlotTime).pipe(map(res => {
      return res.events;
    }));
  }

  calendaerTimeClicked(event) {
    if (!_.isUndefined(this.ngxPermissionsService.getPermission(PermissionsConstants.Calendar_View_Book_Appointment))) {
      const dayData: CalendarDayData = _.find(this.calendarDaysData, (day: CalendarDayData) => {
        const dayDataDate = moment(day.date).format('DD/MM/YYYY');
        const eventDate = moment(event.date).format('DD/MM/YYYY');
        return dayDataDate === eventDate;
      });
      if (dayData) {
        const slot = this.isSlotBlocked(event.date, dayData);
        if (slot && slot.isBlocked) {
          this.displayErrorMsg('Can not Book Appointment for the selected hours', 'danger');
          return;
        }
        // ----------- Code Start For parallel booking -----------------------
        // if user allow parallel booking
        if (slot) {
          if (this.appointmentData && this.appointmentData.parallel_booking_allow && this.appointmentData.parallel_max_patients > 0) {
            this.getAppointmentsCountBetweenDates(moment(dayData.date).format('DD/MM/YYYY'), moment(dayData.date).format('DD/MM/YYYY')).subscribe(evData => {
              const groupBySlotData = _.groupBy(evData, 'id');
              const get2AppSlotData = _.filter(groupBySlotData, v => {
                return v.length === Constants.maxParallelPatientBook;
              });
              // check for single slot max patient
              const sameSlotAppointment = _.filter(this.events, (v) => {
                return v.id === slot.slotId;
              });
              if (sameSlotAppointment.length === Constants.maxParallelPatientBook) {
                this.alertMsg = {
                  message: 'Can only book ' + Constants.maxParallelPatientBook + ' Appointment in single slot',
                  messageType: 'warning',
                  duration: Constants.ALERT_DURATION
                };
                return;
              } else {
                slot.isBooked = false;
              }
              // // check for total max patient in Parallel Booking

              if (sameSlotAppointment.length === 1 &&
                get2AppSlotData.length >= this.appointmentData.parallel_max_patients) {
                this.alertMsg = {
                  message: 'Parallel appointments max limit (' + this.appointmentData.parallel_max_patients + ') exceed for ' + moment(dayData.date).format('DD/MM/YYYY'),
                  messageType: 'warning',
                  duration: Constants.ALERT_DURATION
                };
                return;
              }
              this.bookApointmentAfterCheckingSlot(slot, event, dayData);
            });
          } else {
            this.bookApointmentAfterCheckingSlot(slot, event, dayData);
          }
        }
        // ----------- Code End For parallel booking -----------------------
      }
    } else {
      this.displayErrorMsg('Do not have Book Appointment Permission', 'danger');
      return;
    }
  }

  bookApointmentAfterCheckingSlot(slot, event, dayData) {
    if (
      slot && !slot.isBlocked && !slot.isOnHoliday && !slot.isBooked &&
      !this.isSlotPassed(event.date, moment()) &&
      !this.isDayPassed(event.date)) {
      if (this.currentActiveEntity) {
        this.appointmentData.entity_id = this.currentActiveEntity.providerId;
        this.appointmentData.entity_value_id = this.currentActiveEntity.providerValueId;
        this.appointmentData.entity_value_name = this.currentActiveEntity.providerName;
        this.appointmentData.entity_name = this.currentActiveEntity.providerTypeName;
      }
      const tempObj = {
        entity_id: this.currentActiveEntity.providerId,
        entity_value_id: this.currentActiveEntity.providerValueId,
        entity_value_name: this.currentActiveEntity.providerName,
      };
      // validate date is out of advanceBooking
      if (moment(dayData.date).isAfter(moment().add(this.advanceBookingDays, 'd'))) {
        this.isOutOfAdvanceBookingDay = true;
        this.advanceBookingDate = moment(moment().add(this.advanceBookingDays, 'd').toDate()).format('DD/MM/YYYY');
      } else {
        this.isOutOfAdvanceBookingDay = false;
      }
      // const app = new AppointmentListModel();
      const entityData = new AppointmentEntityInfoModel();
      // app.generateObj(tempObj);
      if (!this.loadAsComponentVal) {
        const IsappointmentTypeIndex = _.findIndex(dayData.intervals, (s) => {
          const slottime = moment(moment().format('YYYY-MM-DD') + ' ' + this.commonService.convertTime(this.timeFormateKey, slot.slotTime));
          const startTime = moment(moment().format('YYYY-MM-DD') + ' ' + this.commonService.convertTime(this.timeFormateKey, s.startTime));
          const endTime = moment(moment().format('YYYY-MM-DD') + ' ' + this.commonService.convertTime(this.timeFormateKey, (s.endTime === '00:00' || s.endTime === '12:00 AM') ? '23:59' : s.endTime));
          return slottime.isSameOrAfter(startTime) && slottime.isBefore(endTime); // slottime.isBetween(startTime, endTime);
        });
        const appType = IsappointmentTypeIndex !== -1 ? dayData.intervals[IsappointmentTypeIndex].appointmentType : null;
        entityData.generateObj({ appt_date: event.date });
        entityData.appointment_type = appType ? appType.name : null;
        // entityData.start_time = IsappointmentTypeIndex !== -1 ? this.commonService.convertTime(this.timeFormateKey, dayData.intervals[IsappointmentTypeIndex].startTime) : null;
        // entityData.end_time = IsappointmentTypeIndex !== -1 ? this.commonService.convertTime(this.timeFormateKey, dayData.intervals[IsappointmentTypeIndex].endTime) : null;
        entityData.start_time = this.commonService.convertTime(this.timeFormateKey, slot.slotFromTime);
        entityData.end_time = this.commonService.convertTime(this.timeFormateKey, (slot.slotToTime === '00:00:00' || slot.slotToTime === '12:00 AM') ? '23:59' : slot.slotToTime);
        this.appointmentData.entity_data = entityData;
      } else {
        this.appointmentData.entity_data['start_time'] = this.commonService.convertTime(this.timeFormateKey, slot.slotFromTime);
        this.appointmentData.entity_data['end_time'] = this.commonService.convertTime(this.timeFormateKey,
          (slot.slotToTime === '00:00:00' || slot.slotToTime === '12:00 AM') ? '23:59' : slot.slotToTime);
      }
      // this.appointmentData = app;
      if (this.timeFormateKey === '12_hour') {
        slot.slotTimeInFormat = moment(moment().format('YYYY-MM-DD') + ' ' + slot.slotTime).format('h:mm A');
      } else {
        slot.slotTimeInFormat = moment(moment().format('YYYY-MM-DD') + ' ' + slot.slotTime).format('H:mm');
      }
      if (!this.isOutOfAdvanceBookingDay) {
        this.bookAppointment(slot);
      } else {
        this.alertMsg = {
          message: 'Advance booking allowed upto ' + this.advanceBookingDate,
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
      }
    } else {
      this.alertMsg = {
        message: 'Can not Book Appointment for the selected hours ',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
      // console.log(`Can not Book Appointment for the selected hours`);
    }
  }

  // -- book appointment for particular slots
  bookAppointment(selectedData): void {
    // if (!_.isUndefined(this.selectedPatientForApoointment)) {
    const modalInstance = this.modal.open(AppointmentBookLibComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        windowClass: 'custom-modal',
        size: 'xl',
        container: '#homeComponent'
      });
    (modalInstance.componentInstance as AppointmentBookLibComponent).patientData = this.selectedPatientForApoointment;
    (modalInstance.componentInstance as AppointmentBookLibComponent).selectedAppointementData = this.appointmentData;
    (modalInstance.componentInstance as AppointmentBookLibComponent).slotDetails = selectedData;
    // (modalInstance.componentInstance as AppointmentBookComponent).providerDetails = this.currentActiveEntity;
    (modalInstance.componentInstance as AppointmentBookLibComponent).source = this.loadAsComponentVal ? 'calendarAsComponent' : 'calendar';
    (modalInstance.componentInstance as AppointmentBookLibComponent).sourcePopup = this.loadAsComponentVal ? 'callcenterView' : '';
    (modalInstance.componentInstance as AppointmentBookLibComponent).environmentDetails = environment;
    (modalInstance.componentInstance as AppointmentBookLibComponent).permissions = this.ngxPermissionsService.getPermission(PermissionsConstants.Add_PatientMaster);
    (modalInstance.componentInstance as AppointmentBookLibComponent).loginUserDetails = this.authService.getUserInfoFromLocalStorage();
    (modalInstance.componentInstance as AppointmentBookLibComponent).addNewPatient.subscribe((receivedEntry) => {
      this.addPatientModal(receivedEntry);
    });
    modalInstance.result.then((result) => {
      // this.loadSchedule(this.viewDate);
    }, (reason) => {
      const data = {
        id : 10059
      }
      this.getPrintData(data);  
      setTimeout(() => {
        if (this.loadAsComponentVal) {
          if (_.isEmpty(reason)) {
            this.appointmentService.clearAllFormsValue(false);
          } else {
            // need to clear all section of search and patient history
            this.appointmentService.clearAllFormsValue(true);
          }
        } else {
          this.loadSchedule(this.viewDate);
        }
      },);
      
      
      
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

  // this is ouput from provider-detail component
  currentSelectedEntity(provider) {
    this.currentActiveEntity = provider;
    this.loadSchedule(this.viewDate);
  }

  getCalendarTimeSlot() {
    const splitTime = this.calendarData ? this.calendarData.hourSplitTime : 0;
    return (60 / splitTime * 1);
  }
  isSlotPassed(segmentDate, today) {
    this.entityData = this.appointmentData.entity_data as AppointmentEntityInfoModel;
    const startTime = moment(this.entityData.start_time, ['h:mm A']).format('MM/DD/YYYY HH:mm');
    const startDate = new Date(startTime);
    if (this.allowLapsedTimeSlotBooking && this.userInfo.role_type === ApplicationEntityConstants.FRONTDESK) {
      return false;
    }
    if (this.appointmentData && this.allowLapsedTimeSlotBooking && this.loadAsComponentVal === undefined) {
      return false;
      // const activeSlotStartTime = moment(moment().format('YYYY-MM-DD') + ' ' + this.appointmentData.entity_data['start_time']);
      // return moment(segmentDate).isBefore(activeSlotStartTime);
    }
    let CalendarTimeSlot = this.getCalendarTimeSlot();
    if (this.loadAsComponentVal !== undefined) {
      CalendarTimeSlot = 0;
    } else if (!this.allowLapsedTimeSlotBooking) {
      CalendarTimeSlot = 0;
    }
    return moment(segmentDate).add(CalendarTimeSlot, 'm').isBefore(today);
  }
  isSlotBlocked(segmentDate, dayData: any) {
    const currentSegTime = moment(segmentDate).format('hh:mm A');
    const isTimeExists = _.find(dayData.appointmentSlots, { slotTime: currentSegTime });
    return isTimeExists;
  }
  isCurrentDateIsTodaysDate(date) {
    const today = moment();
    if (date && moment(date).format('DD/MM/YYYY') === today.format('DD/MM/YYYY')) {
      return true;
    }
    return false;
  }
  isDayPassed(date) {
    const today = moment();
    if (date && moment(date).isBefore(today, 'day')) {
      return true;
    }
    return false;
  }
  isScheduleDefined(data) {
    if (!data.calendarData && data.calendarDaysData.length === 0) {
      this.scheduleDefined = false;
      return false;
    } else {
      this.scheduleDefined = true;
      return true;
    }
  }
  canBookAppointment() {

  }

  updateNotesRemarks(reqParams) {
    if (!reqParams.appt_id) {
      return;
    }
    this.appointmentService.updateAppointmentNotes(reqParams).subscribe();
  }

  getPrintAppointment() {
    this.printData = null;
    if (this.events.length > 0) {
      const printData = {
        printFor: 'calendar_view',
        headerColumn: Constants.APPOINTMENT_PRINT_HEAD_LIST,
        bodyData: [],
        printHeading: {
          heading: 'Appointment List',
          userData: this.userInfo.user_name
        },
        date: this.events[0].start,
      };
      this.events = _.sortBy(this.events, (o) => o.start);
      _.map(this.events, (v) => {
        const appointmentPrint = new AppointmentPrint();
        const bData = {
          slotTime: moment(v.start).format('hh:mm A'),
          patName: v.title,
          patType: v.meta.patientType,
          remark: v.meta.remarks,
          patUhid: v.meta.patient_details.uhid,
          patGender: v.meta.patient_details.patgender,
          patAge: v.meta.patient_details.patage + ' ' + v.meta.patient_details.patageunit,
          patDob: v.meta.patient_details.dob,
          patContact: v.meta.patient_details.mobile_no,
          appTakenBy: v.meta.addedByUser,
          visitType: v.meta.visitType
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
      this.printData = [];
    }
  }

  displayErrorMsg(message: string, messageType: string): void {
    this.alertMsg = { message, messageType, duration: Constants.ALERT_DURATION };
  }

  getSlotColors(res) {
    // return this.commonService.getQueueSettings(Constants.slotColorSetting).pipe(map(res => {
    if (res) {
      if (res.holiday_color) {
        this.slotColorSetting.holiday_color = res.holiday_color;
      }
      if (res.blocked_color) {
        this.slotColorSetting.blocked_color = res.blocked_color;
      }
      if (res.booked_color) {
        this.slotColorSetting.booked_color = res.booked_color;
      }
      if (res.available_color) {
        this.slotColorSetting.available_color = res.available_color;
      }
      if (res.differentdateslot_color) {
        this.slotColorSetting.differentdateslot_color = res.differentdateslot_color;
      }
      if (res.out_of_hour_color) {
        this.slotColorSetting.out_of_hour_color = res.out_of_hour_color;
      }
    }
    //   return res;
    // }));
  }

  isAheadOfAdvanceDayBooking(date) {
    return moment(date).startOf('day').isAfter(moment().startOf('day').add(this.calendarData.advanceBookingDays, 'day'));
  }
  setColor(appointmentTypeId): string {
    return Constants.APP_TYPES_COLOR_CODES.get(appointmentTypeId);
  }

  getPrintData(data) {
    const url = environment.HIS_Add_PatientCommon_API + '/ShowReport/PatientAppoinmentSlip/?APPOINTMENTID=' + data.id;
    this.printData = { url: url, returnType: false };
  }
}
