import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'customDateFormat'
})
export class CustomDateFormatPipe implements PipeTransform {

  days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  transform(value: any, prefixText?: string, format?: string, inputFormat?: string): any {
    if (value) {
      if (format === 'day') {
        const day = this.days[new Date(value).getDay()];
        return day;
      } else {
        const date = inputFormat ? moment(value, inputFormat).format(format) : moment(value).format(format);
        return prefixText + date;
      }
    } else {
      return null;
    }
  }

}

