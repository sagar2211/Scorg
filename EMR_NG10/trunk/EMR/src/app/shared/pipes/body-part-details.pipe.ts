import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';
@Pipe({
  name: 'bodyPartDetails'
})
export class BodyPartDetailsPipe implements PipeTransform {

  transform(list: any, args?: any): any {
    const filterArray = [];
    if (list.length > 0) {
      _.map(list, (value, key) => {
        const tempObj = Object.assign({}, value);
        tempObj.body_part = tempObj.body_part.replace(/[0-9]/g, '').trim();
        const isExist = _.find(filterArray, (o) => {
          return o.body_part === tempObj.body_part && o.pain_score === tempObj.pain_score && o.svg_name === tempObj.svg_name;
        });
        if (_.isUndefined(isExist)) {
          filterArray.push(tempObj);
        }
      });
      return filterArray;
    }
  }

}
