import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'getInvestigationDataByHead'
})
export class GetInvestigationDataByHead implements PipeTransform {

    transform(investigationList: Array<any>, args?: any): Array<any> {
        const investigationType = args;
        if (investigationList.length) {
            const data =  investigationList.filter(i => i.investigation_type === investigationType);
            return data;
        }
        return investigationList;
    }

}





