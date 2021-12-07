import { Pipe, PipeTransform } from '@angular/core';
import { SlotInfo } from 'src/app/modules/appointment/models/slot-info.model';
import * as moment from 'moment';

@Pipe({
  name: 'slotByStatus'
})
export class SlotByStatusPipe implements PipeTransform {

  transform(value: Array<SlotInfo>, ...args: any[]): any {
    if (value.length) {
      const date = args[0];
      const defaultTimePerPatient = args[1];
      const allowLapsedTimeSlotBooking = args[2];
      value = value.filter(v => {
        const isTime = true;
        let isTimePassed = false;
        if (allowLapsedTimeSlotBooking && !(moment(moment(date).format('YYYY/MM/DD')).isBefore(moment().format('YYYY/MM/DD')))) {
          isTimePassed = false;
        } else {
          if ((moment(moment(date).format('YYYY/MM/DD')).isAfter(moment()))) {
            isTimePassed = false;
          } else {
            const slotEndTime = moment(v.slotTime, 'hh:mm A').add(defaultTimePerPatient, 'minutes').format('hh:mm A');
            if ((moment(moment(), 'hh:mm A').isAfter(moment(slotEndTime, 'hh:mm A')))) {
              isTimePassed = true;
            } else {
              isTimePassed = false;
            }
          }
        }
        return (v.isBooked === false && v.isBlocked === false && v.isOnHoliday === false && !isTimePassed);
      });
      return value;
    }
    return [];
  }

}
