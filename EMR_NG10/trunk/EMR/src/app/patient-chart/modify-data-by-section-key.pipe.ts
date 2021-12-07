import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filterDataBySectionType',
    // pure: false
})
export class ModifyDataBySectionKeyPipe implements PipeTransform {
    transform(chartCompList: Array<any>, sectionType: string): Array<any> {
        if (sectionType) {
            return chartCompList.filter(res => res.section_type === sectionType);
        }
        return chartCompList;
    }
}
