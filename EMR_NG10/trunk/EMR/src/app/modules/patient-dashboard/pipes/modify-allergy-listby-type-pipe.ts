import { PipeTransform, Pipe } from '@angular/core';

@Pipe({
    name: 'modifyAllergyListByTypePipe'
})

export class ModifyAllergyListByTypePipe implements PipeTransform {
    transform(value: Array<any>, type: string): Array<any> {
        if (value) {
            return value.filter(v => v.allergy_type === type);
        }
        return value;
    }
}
