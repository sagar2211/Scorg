import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';

@Pipe({
  name: 'globalSearchDat'
})
export class GlobalSearchDatPipe implements PipeTransform {

  transform(items: any[], searchText?: any, searchKeys?: any[], strictMode?: boolean): any {
    searchText = searchText === 'all' ? '' : searchText;
    if (searchText) {
      return items.filter(v => {
        const filterKeys = ((searchKeys !== undefined) && (searchKeys.length > 0)) ? searchKeys : Object.keys(v);
        return filterKeys.some(key => {
          if ((_.isObject(v[key])) || (_.isArray(v[key])) && (_.isBoolean(v[key]))) {
            return false;
          } else if (strictMode ) {
            return v[key] ? (v[key].toString().toLowerCase() ===  searchText.toLowerCase()) : false;
          } else {
            return v[key] ? v[key].toString().toLowerCase().indexOf(searchText.toLowerCase()) !== -1 : false;
          }
        });
      });
    }
    return items;
  }

}
