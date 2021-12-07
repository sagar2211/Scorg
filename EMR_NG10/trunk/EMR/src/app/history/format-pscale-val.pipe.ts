import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatPScaleVal'
})
export class FormatPScaleValPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    let returnVal;
    if (value === 0.00) {
      returnVal = 'No Pain (' + (value) + '/10)';
    } else if (value >= 1.00 && value <= 3.00) {
      returnVal = 'Mild (' + (value) + '/10)';
    } else if (value >= 4.00 && value <= 6.00) {
      returnVal = 'Moderate (' + (value) + '/10)';
    } else if (value >= 7.00 && value <= 9.00) {
      returnVal = 'Severe (' + (value) + '/10)';
    } else if (value === 10.00) {
      returnVal = 'Worst pain possible (' + (value) + '/10)';
    } else {
      returnVal = 'Not found!';
    }
    return returnVal;
  }

}
