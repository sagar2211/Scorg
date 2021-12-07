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
        // this.scoreTemplateList = result.data;
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
  selectOption(selectedTemplate) {
    const summaryFilter = selectedTemplate.question_list.filter(sf => sf.option_type === 'paragraph');
    const questionFilter = selectedTemplate.question_list.filter(qf => qf.option_type === 'radio');

    _.map(summaryFilter, (sf) => {
      sf.formulaKeyValue = _.clone(sf.formula_key);
      _.map(questionFilter, (qf) => {
        if (qf.selected_optionValue) {
          sf.formulaKeyValue = sf.formulaKeyValue.split(qf.formula_key).join(qf.selected_optionValue);
        }
      });
      try {
        sf.selected_optionValue = eval(sf.formulaKeyValue);
      } catch (e) {

      }
    });
    return selectedTemplate;
  }

  getScoreTemplateListById(reqParams: { template_ids: Array<number> }): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/ScoreTemplate/GetScoreTemplateListById';
    return this.http.post(reqUrl, reqParams).pipe(
      map((result: any) => {
        if (this.scoreTemplateList.length) {
          const isExistObj = _.find(_.clone(this.scoreTemplateList), (o) => o.score_template_id === result.data[0].score_template_id);
          if (_.isUndefined(isExistObj)) {
            this.scoreTemplateList.push(result.data[0]);
          }
        } else {
          this.scoreTemplateList.push(result.data[0]);
        }
        return result;
      }));
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
