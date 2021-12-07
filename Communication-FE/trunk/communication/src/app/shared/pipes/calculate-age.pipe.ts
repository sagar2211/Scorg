import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';

@Pipe({
  name: 'calucalteAge',
  pure: false
})
export class CalculateAge implements PipeTransform {

  transform(value: any): any {
    if (value) {
      value = moment(value, 'DD/MM/YYYY').isValid() ? moment(value, 'DD/MM/YYYY') : value ;
      const years = moment().diff(value, 'years');
      const month = moment().diff(value, 'month');
      const day = moment().diff(value, 'day');
      return years ? `${years} Year(s)` : month ? `${month} Month(s)` : `${day} Day(s)`;
    } else {
      return null;
    }
  }
}
