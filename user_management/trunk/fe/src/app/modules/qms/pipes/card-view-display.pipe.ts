import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'displayCardList',
  pure: false
})
export class CardViewDisplayPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    if (value.length) {
      if (args[1] === true) { // -- hide empty slots
        value = value.filter((v) => {
          if (v.appointments.length) {
            return v.appointments.some(a => {
              return (a.bookingStatus === 'CONFIRMED' && a.queueStatus === args[0]);
            });
          } else {
            return false;
          }
        });
        return value;
      } else {
        return value;
      }


      // if (args[0] === 'CONFIRMED') {
      //   if (args[1] === true) { // -- if true then hide empty slots with status
      //     value = value.filter((v) => {
      //       if (v.appointments.length) {
      //         return v.appointments.some(a => {
      //           return (a.queueId !== 0 && a.bookingStatus === 'CONFIRMED');
      //         });
      //       } else {
      //         return false;
      //       }
      //     });
      //     return value;
      //   } else {
      //     value = value.filter(v => {
      //       return  (v.queueId !== 0 && v.bookingStatus === 'CONFIRMED');
      //     });
      //   }
      //   return value;
      // } else if (args[0] === 'INCONSULTATION') {
      //   if (args[1] === true) { // -- if true then hide empty slots with status
      //     value = value.filter((v) => {
      //       if (v.appointments.length) {
      //         return v.appointments.some(a => {
      //           return (a.bookingStatus === 'CONFIRMED' && a.queueStatus === 'INCONSULTATION');
      //         });
      //       } else {
      //         return false;
      //       }
      //     });
      //     return value;
      //   } else {
      //     value = value.filter(v => {
      //       return v.bookingStatus === 'CONFIRMED' && v.queueStatus === 'INCONSULTATION';
      //     });
      //   }
      //   return value;
      // }
    }
    return value;
  }

}
