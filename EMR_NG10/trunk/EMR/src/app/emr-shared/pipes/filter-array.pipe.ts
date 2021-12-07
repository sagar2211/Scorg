import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';
@Pipe({
  name: 'filterArray',
  pure: false
})

export class FilterArrayPipe implements  PipeTransform {

  transform(arrayInput, key, value): string {
    return _.filter(arrayInput, (option) => {
      return option[key] == value;
    });
  }
}
