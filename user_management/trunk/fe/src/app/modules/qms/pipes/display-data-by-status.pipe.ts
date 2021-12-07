import { QSlotInfoDummy } from './../models/q-entity-appointment-details';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'displayDataByStatus',
  pure: false
})
export class DisplayDataByStatusPipe implements PipeTransform {

  transform(value: Array<QSlotInfoDummy>, ...args: any[]): any {
    const isReturnEmptySlots = args[0] as boolean;
    const queueStatusList = args[1] ? (args[1] as Array<string>) : [];
    const returnAllAppointents = args[2] ? args[2] : false;
    const isReturnBookedApp = args[3] ? args[3] : false;
    const source = args[4] ? args[4] : '';
    const repeatCallingCount = args[5] ? args[5] : 0;
    if (value.length) {
      if (isReturnEmptySlots) { // -- only return booked appointments for the slots
        value = value.filter((v: QSlotInfoDummy) => {
          let isTrue = true;
          if (returnAllAppointents) { // -- return booked appointments with all q status
            const findInx = queueStatusList.findIndex(q => q === v.queueStatus);
            if (findInx !== -1) {
              isTrue = true;
            } else {
              isTrue = false;
            }
            isTrue = isReturnBookedApp ? isTrue ? true : v.isBooked && v.queueStatusId === 0 && v.appointmentId !== 0 : isTrue;
            return (v.isBooked) && isTrue;
          } else { // -- return booked appointments with provided status
            const findInx = queueStatusList.findIndex(q => q === v.queueStatus);
            if (findInx !== -1) {
              isTrue = true;
            } else {
              isTrue = false;
            }
            return (v.isBooked) && isTrue;
          }
        });
        return value;
      } else { // -- returned all empty slots with queue_status
        value = value.filter(a => {
          let isTrue = true;
          if (source !== 'all') {
            const findInx = queueStatusList.findIndex(q => q === a.queueStatus);
            if (findInx !== -1) {
              isTrue = true;
            } else {
              isTrue = false;
            }
          }
          return (a.isBooked) ? isTrue : true;
        });
        return value;
      }
    }
    return value;
  }

  // if (source === 'queue' && v.queueStatus === 'SKIP') {
  //   if (v.skippedCount <= repeatCallingCount) {
  //     isTrue = true;
  //   } else {
  //     isTrue = false;
  //   }
  // } else if (source === 'skipped' && v.queueStatus === 'SKIP') {
  //   if (v.skippedCount > repeatCallingCount) {
  //     isTrue = true;
  //   } else {
  //     isTrue = false;
  //   }
  // } else {
  //   isTrue = true;
  // }

}
