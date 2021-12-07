import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';

@Pipe({
  name: 'orderBy',
  pure: true
})
export class OrderByPipe implements PipeTransform {

  // transform(value: any[], propertyName: string, orderType: boolean): any[] {
  //   if (propertyName) {
  //     return value.sort((a: any, b: any) => b[propertyName].localeCompare(a[propertyName]));
  //   } else {
  //     return value;
  //   }
  // }

  transform( array: any[], propertyName: string, orderType: boolean, subPropertyName?: string): any[] {
    array.sort( ( a: any, b: any ) => {
        const ae = subPropertyName && _.isObject(a[ propertyName ]) ? a[ propertyName ][subPropertyName] : a[ propertyName ];
        const be = subPropertyName && _.isObject(b[ propertyName ]) ? b[ propertyName ][subPropertyName] : b[ propertyName ];
        if ( !ae && !be) { return 0; }
        if ( !ae && be ) { return orderType ? 1 : -1; }
        if ( ae && !be ) { return orderType ? -1 : 1; }
        if ( ae === be ) { return 0; }
        return orderType ? (ae.toString().toLowerCase() > be.toString().toLowerCase() ? -1 : 1) : (be.toString().toLowerCase() > ae.toString().toLowerCase() ? -1 : 1);
    } );
    return array;
  }

}
