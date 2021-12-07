import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'footScoreFilter',
  pure:false
})
export class FootScoreFilterPipe implements PipeTransform {

  transform(footExaminationData: any, painScore:any): any {
   let filteredData=[];
        footExaminationData.forEach(element => {
         if(element.pain_score==painScore){
           filteredData.push(element)
         }
       });
       return filteredData;
  }

}
