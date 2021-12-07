export class CalendarData {
  dayStartTime: string;
  dayStartMinute = '0';
  dayEndTime: string;
  dayEndMinute = '0';
  hourSplitTime: number = 2;
  date: Date;
}

// export class CalendarDayData {
//   intervals: Array<AppointmentTypeIntervalDetails> = [];
//   appointmentSlots: Array<SlotInfo> = [];
//   date: Date;
// }

// export class AppointmentTypeIntervalDetails {
//   appointmentType: AppointmentType;
//   startTime: string;
//   endTime: string;
//   slotInfo: Array<SlotInfo> = [];
// }

// export class Appointment {
//   start: Date;
//   end: Date;
//   title: string;
//   type: string;
//   status: string;
//   slotId: number;
//   eventMeta: any;
//   cssClass?: string;

//   generateObject(obj: any) {
//     this.start = obj.start.toDate();
//     this.end = obj.end.toDate();
//     this.title = obj.title;
//     this.type = obj.type;
//     this.slotId = obj.slotId;
//     this.eventMeta = obj.eventMeta || {};
//     this.cssClass = obj.cssClass || '';
//   }

//   getCalendarEvent(): CalendarEvent {
//     return {
//       start: this.start,
//       end: this.end,
//       title: this.title,
//       draggable: this.checkDragableEvent(this.start),
//       id: this.slotId,
//       color: {
//         primary: 'black',
//         secondary: this.getAppointmentTypeColor(this.type)
//       },
//       cssClass: this.cssClass,
//       resizable: {
//         beforeStart: false,
//         afterEnd: false
//       },
//       meta: this.eventMeta
//     };
//   }

//   getAppointmentTypeColor(typeId): string {
//     const color = Constants.APP_TYPES_COLOR_CODES.get(typeId);
//     if (color) {
//       return color;
//     } else {
//       return '';
//     }
//   }

//   checkDragableEvent(obj) {
//     if (moment().isSameOrAfter(moment(obj))) {
//       return false;
//     } else {
//       return true;
//     }
//   }
// }

