import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'displaySavedUnsaved',
  pure: false
})
export class DisplaySavedUnsavedPipe implements PipeTransform {

  transform(items: any, args?: any): any {
    if (items) {
      if (args === 'all') {
        return items;
      }

      return items.filter(res => {
        return args === 'saved' ? res.isDirty === false : res.isDirty === true;
      });
    }
    return items;
  }

}
