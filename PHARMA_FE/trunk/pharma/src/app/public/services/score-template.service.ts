import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class ScoreTemplateService {
  scoreTemplateList = [];
  constructor(
    private http: HttpClient
  ) { }

  getScoreTemplateList(params) {
    const reqUrl = environment.dashboardBaseURL + '/ScoreTemplate/GetScoreTemplateList';
    // const params = {
    //   speciality_id: 0,
    //   service_type_id: 1,
    //   search_keyword: '',
    //   is_active: true,
    //   sort_order: '',
    //   sort_column: '',
    //   page_number: 1,
    //   limit: 10
    // };
    return this.http.post(reqUrl, params).pipe(
      map((result: any) => {
        this.scoreTemplateList = result.data;
        return result;
      }));
  }

  getCalTemplateValue(selectedtemplate) {
    let tempCalcValue = null;
    _.map(selectedtemplate.question_list, (val) => {
      const tempSeledValue = _.clone(val.selected_optionValue);
      tempCalcValue += parseFloat(tempSeledValue) ? parseFloat(tempSeledValue) : 0;
    });
    if (selectedtemplate.template_calc_Type === 'average') {
      selectedtemplate.templatecalcvalue = tempCalcValue / selectedtemplate.questionAnsList.length.toFixed(2);
    } else {
      selectedtemplate.templatecalcvalue = tempCalcValue;
    }
    return selectedtemplate;
  }

  getScoreTemplateListById(reqParams: { template_ids: Array<number> }): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/ScoreTemplate/GetScoreTemplateListById';
    return this.http.post(reqUrl, reqParams);
  }


  addScoreTemplate(reqParams): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/ScoreTemplate/SaveScoreTemplates`;
    return this.http.post(reqUrl, reqParams);
  }
  getScoreTemplateById(scoreTemplateId: number): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/ScoreTemplate/GetScoreTemplateById?score_template_id=${scoreTemplateId}`;
    return this.http.get(reqUrl);
  }
  deleteScoreTemplateById(scoreTemplateId: number): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/ScoreTemplate/DeleteScoreTemplateById?score_template_id=${scoreTemplateId}`;
    return this.http.get(reqUrl);
  }
}
