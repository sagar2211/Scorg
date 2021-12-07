import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'splitValue'
})
export class SplitValuePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    let splitValue = '';
    if (value.indexOf('Upper') !== -1) {
      splitValue = value.replace(/_/g, '').replace(/Upper/gi, ' ');
    } else if (value.indexOf('Lower') !== -1) {
      splitValue = value.replace(/_/g, '').replace(/Lower/gi, ' ');
    } else if (value.indexOf('Pinprick') !== -1) {
      splitValue = value.replace(/_/g, '').replace(/Pinprick/gi, ' ');
    } else if (value.indexOf('Right_') !== -1) {
      splitValue = value.replace('Right_', '');
    } else if (value.indexOf('Left_') !== -1) {
      splitValue = value.replace('Left_', '');
    } else {
      splitValue = value.replace(/_/g, ' ').replace(/_/gi, ' ');
    }
    return splitValue;
  }

}
