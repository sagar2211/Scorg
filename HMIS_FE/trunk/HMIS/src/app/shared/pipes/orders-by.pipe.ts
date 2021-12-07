import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';

@Pipe({
  name: 'ordersBy',
  pure: false
})
export class OrdersByPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if ( value ) {
      if (args === 'desc') {
        return _.orderBy(value, ['year'], [args]);
      }
      if (args === 'datetime') {
        return _.orderBy(value, ['opd_date'], ['asc']);
      }
    }
    return value;
  }

}
