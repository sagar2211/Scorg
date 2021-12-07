import { Constants } from '../../config/constants';
import * as moment from 'moment';

export class CalendarData {
  dayStartTime: string;
  dayStartMinute = '0';
  dayEndTime: string;
  dayEndMinute = '0';
  hourSplitTime: number;
  date: Date;
  defaultPatientTime: number;
  advanceBookingDays: number;
  calendarType: string;

}

export class CalendarDayData {
  intervals: Array<AppointmentTypeIntervalDetails> = [];
  date: Date;
}

export class AppointmentTypeIntervalDetails {
  startTime: string;
  endTime: string;
}

export class Appointment {
  start: Date;
  end: Date;
  title: string;
  type: string;
  status: string;
  slotId: number;
  eventMeta: any;
  cssClass?: string;

  generateObject(obj: any) {
    this.start = obj.start.toDate();
    this.end = obj.end.toDate();
    this.title = obj.title;
    this.type = obj.type;
    this.slotId = obj.slotId;
    this.eventMeta = obj.eventMeta || {};
    this.cssClass = obj.cssClass || '';
  }

  getAppointmentTypeColor(typeId): string {
    const color = Constants.APP_TYPES_COLOR_CODES.get(typeId);
    if (color) {
      return color;
    } else {
      return '';
    }
  }

  checkDragableEvent(obj) {
    if (moment().isSameOrAfter(moment(obj))) {
      return false;
    } else {
      return true;
    }
  }
}

