import { Pipe, PipeTransform } from '@angular/core';
import * as _ from "lodash";

@Pipe({
    name: 'filterBy',
    pure: true
})
export class FilterByPipe implements PipeTransform {

    transform(array: any[], propertyName: string, filterBy: boolean): any[] {
        return _.filter(array, { [propertyName]: filterBy })
    }

}
