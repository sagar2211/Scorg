import { QSlotInfoDummy } from './../../modules/qms/models/q-entity-appointment-details';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'qStatusListByKey'
})
export class QStatusListByKeyPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    const queueStatus = args[0];
    const slot = args[1] as QSlotInfoDummy;
    if (value) {
      switch (queueStatus) {
        case 'all':
          if (slot.queueStatusId === 4) {
            return value === 5;
          } else if (slot.queueStatusId === 5) {
            return false;
          } else if (slot.queueStatusId === 1) {
            return ((value !== 5) && (value !== 1));
          } else if (slot.queueStatusId === 2) {
            return ((value !== 5) && (value !== 1) && (value !== 2));
          } else if (slot.queueStatusId === 7) {
            return (value === 4 || value === 2 || value === 1 || value === 3);
          } else {
            return true;
          }
        case 'queue':
          // value = value.filter(v => {
          //   return (v.id !== 5);
          // });
          if (slot && slot.queueStatusId === 2) {
            return ((value !== 5) && (value !== 1) && (value !== 2));
          } else {
            return ((value !== 5) && (value !== 1));
          }
        case 'inConsultation':
          // value = value.filter(v => {
          //   return (v.id === 5 || v.id === 7);
          // });
          return (value === 5);
        case 'skipped':
          // value = value.filter(v => {
          //   return (v.id !== 4 || v.id !== 5);
          // });
          return (value === 4 || value === 2 || value === 1 || value === 3);
        case 'complete':
          // value = value.filter(v => {
          //   return (v.id === 5 || v.id === 7);
          // });
          return false; // (value === 5);
      }

    }
    return value;
  }

}
