import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'customDate'
})
export class CustomDatePipe implements PipeTransform {

  transform(value: any, prefixText?: any, format?: any): any {
    if (value) {
      const date = moment(value).format(format);
      return prefixText + date;
    } else {
      return null;
    }
  }

}
