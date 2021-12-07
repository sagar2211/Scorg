import { PipeTransform, Pipe } from '@angular/core';

@Pipe({
    name: 'bodyPainScorePipe'
})
export class BodyPainScorePipe implements PipeTransform {
    transform(part, key?, value?): string {
        let splitValue = '';
        if (part.indexOf('Upper') !== -1) {
            splitValue = part.replace(/_/g, '').replace(/Upper/gi, ' ');
        } else if (part.indexOf('Lower') !== -1) {
            splitValue = part.replace(/_/g, '').replace(/Lower/gi, ' ');
        } else if (part.indexOf('Pinprick') !== -1) {
            splitValue = part.replace(/_/g, '').replace(/Pinprick/gi, ' ');
        } else if (part.indexOf('Right_') !== -1) {
            splitValue = part.replace('Right_', '');
        } else if (part.indexOf('Left_') !== -1) {
            splitValue = part.replace('Left_', '');
        } else {
            splitValue = part.replace(/_/g, ' ').replace(/_/gi, ' ');
        }
        return splitValue;
    }
}