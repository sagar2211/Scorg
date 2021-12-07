import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';

@Pipe({
    name: 'modifyCustomTemplateData'
})
export class ModifyCustomTemplateData implements PipeTransform {

    transform(customTemplateList: Array<any>, patientName?: string): Array<any> {
        if (customTemplateList.length) {
            const uniqList = _.uniqBy(customTemplateList, 'template_id');
            const tempList = [];
            uniqList.forEach(e => {
                tempList.push({
                    templateName: e.template_name,
                    templateData: customTemplateList.filter(c => c.template_id === e.template_id)
                });
            });
            return tempList;
        }
        return customTemplateList;
    }

}
