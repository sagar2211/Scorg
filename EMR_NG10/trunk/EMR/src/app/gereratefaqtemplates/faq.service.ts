import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FaqService {

  constructor(
    private http: HttpClient
  ) { }

  defaultQueGroupObj() {
    const defaultQuestionGroupPanel = {
      type: 'queGroupPanel',
      queGroupTempId: this.getRandomNumber(),
      queGroupId: 0,
      questionGroupName: 'Question Group',
      displayFormat: 'horizontal',
      questionHeading: 'Question heading',
      summaryMerge: true,
      tabularHeadingsData: [],
      questionPanel: [],
      collapse: false
    };
    return _.cloneDeep(defaultQuestionGroupPanel);
  }
  defaultQueObj() {
    const defaultQuestionPanel = {
      // label: 'Question Name',
      type: 'quePanel',
      questionTempId: this.getRandomNumber(),
      questionId: 0,
      questionText: 'Question Name',
      queStorySetting: '',
      parentQueTempId: '',
      parentAnsGroupKey: '',
      parentAnsGroupOption: '',
      colWidth: 12,
      repeatAns: false,
      orderByAnsGroupKey: '',
      orderBy: true,
      collapse: false,
      answerData: []
    };
    return _.cloneDeep(defaultQuestionPanel);
  }

  getFaqTemplateList(params) {
    const reqUrl = environment.dashboardBaseURL + '/Template/GetTemplateList';
    return this.http.post(reqUrl, params).pipe(
      map((result: any) => {
        return result;
      }));
  }
  getTemplateFormById(formId: any) {
    const reqUrl = `${environment.dashboardBaseURL}/Template/GetTemplateFormById?formId=${formId}`;
    return this.http.get(reqUrl).pipe(
      map((result: any) => {
        return result;
      }));
  }
  getFaqFormList(params) {
    const reqUrl = `${environment.dashboardBaseURL}/Template/GetTemplateFormList`;
    return this.http.post(reqUrl, params).pipe(
      map((result: any) => {
        return result;
      }));
  }
  saveTemplateForm(params: any) {
    const reqUrl = environment.dashboardBaseURL + '/Template/SaveTemplateForm';
    return this.http.post(reqUrl, params).pipe(
      map((result: any) => {
        return result;
      }));
  }
  getRandomNumber(): any {
    // tslint:disable-next-line: radix
    return parseInt((Math.random() + '').substring(2, 15));
  }

  saveTemplate(params) {
    const reqUrl = environment.dashboardBaseURL + '/Template/SaveTemplate';
    return this.http.post(reqUrl, params).pipe(map((res: any) => {
      return !!(res.status_code === 200 && res.status_message === 'Success' && res.data);
    }));
  }

  deleteFaqTemplateById(templateId): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Template/DeleteTemplateById?template_id=${templateId}`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
        return res.data;
      } else {
        return false;
      }
    }));
  }

  GetTemplateFormListByTemplateId(templateId) {
    const reqUrl = `${environment.dashboardBaseURL}/Template/GetTemplateFormListByTemplateId?templateId=${templateId}`;
    return this.http.get(reqUrl).pipe(
      map((result: any) => {
        return result;
      }));
  }

  getFaqSectionTemplateList(reqParams) {
    const reqUrl = environment.dashboardBaseURL + '/Template/GetTemplateListById';
    return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return res.data;
      }
      return [];
    }));
  }

  deleteFaqFormById(formId): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Template/DeleteTemplateFormById?formId=${formId}`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
        return res.data;
      } else {
        return false;
      }
    }));
  }

  // getAnswerOptionList(reqParams) {
  //   const reqUrl = environment.dashboardBaseURL + '/Template/GetAnswerOptionList';
  //   return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
  //     const array = [];
  //     if (res.status_message === 'Success') {
  //       _.map(res.data, dt => {
  //         array.push(_.cloneDeep({ answerText: dt.name, asnwerKey: dt.id }));
  //       });
  //       return array;
  //     }
  //     return [];
  //   }));
  // }

}
