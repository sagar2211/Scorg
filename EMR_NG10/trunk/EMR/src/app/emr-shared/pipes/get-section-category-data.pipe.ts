import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';

@Pipe({
    name: 'getSectionGroupData'
})
export class GetSectionCategoryDataPipe implements PipeTransform {

    transform(allFaqSectionList: Array<any>, args?: any): Array<any> {
        // const investigationType = args;
        if (allFaqSectionList.length) {
            const categoryWiseData =  allFaqSectionList.filter(i => i.categoryId === args);
            const sectionGroupData = _.uniqBy(categoryWiseData, 'sectionGroupId');
            return sectionGroupData;
        }
        return allFaqSectionList;
    }

}





