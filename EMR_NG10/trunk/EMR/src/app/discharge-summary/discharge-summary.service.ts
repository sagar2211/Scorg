import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from './../../environments/environment';
import { of, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { ScoreTemplateService } from './../public/services/score-template.service';

@Injectable({providedIn: 'root'})
export class DischargeSummaryService {

  dischargeSummaryData: any[] = [];
  patientActiveFilterSet = [];
  dischargeSummaryFilterValue = [];

  dcTemplates = [{
    templateId: "1",
    templateName: "Template 1",
    specialityId: 1,
    chartIds: [67,66],
    components: [
      {
        "chartDetailIds": [
          338,
          429,
          469,
          618,
          733,
          743,
          813,
          825,
          927,
          10976,
          11000
        ],
        "sectionName": "Advice",
        "sectionRefId": 6,
        "sectionKey": "advice",
        "sectionType": "CONSULTATION_SECTION",
        "displaySetting": "bullet"
      }]
  },
    {
      templateId: "2",
      templateName: "Template 2",
      specialityId: 1,
      chartIds: [64,67,66],
      components: [
        {
          "chartDetailIds": [
            338,
            429,
            469,
            618,
            733,
            743,
            813,
            825,
            927,
            10976,
            11000
          ],
          "sectionName": "Advice",
          "sectionRefId": 6,
          "sectionKey": "advice",
          "sectionType": "CONSULTATION_SECTION",
          "displaySetting": "bullet"
        },
        {
          "chartDetailIds": [
            836,
            928,
            10977,
            11001
          ],
          "sectionName": "Advice_1",
          "sectionRefId": 6,
          "sectionKey": "advice",
          "sectionType": "CONSULTATION_SECTION"
        }
        ]
    }
  ];
  constructor(
    private http: HttpClient,
    private scoretemplateService: ScoreTemplateService
  ) { }

  getActiveFilterDataById(patientId, type, isObser?: boolean) {
    const findDataIndx = _.findIndex(this.patientActiveFilterSet, data => {
      return (data.patientId) === (patientId) && data.type === type;
    });
    if (findDataIndx !== -1) {
      return isObser ? of(this.patientActiveFilterSet[findDataIndx]) : this.patientActiveFilterSet[findDataIndx];
    } else {
      return isObser ? of(null) : null;
    }
  }
  setActiveFilterDataById(data) {
    const findDataIndx = _.findIndex(this.patientActiveFilterSet, dt => {
      return(dt.patientId) === (data.patientId);
    });
    if (findDataIndx !== -1) {
      this.patientActiveFilterSet[findDataIndx] = data;
    } else {
      this.patientActiveFilterSet.push(data);
    }
  }

  setHistoryPatientData(patientId, key, data) {
    const findDataIndx = _.findIndex(this.dischargeSummaryFilterValue, dt => {
      return dt.patientId === patientId;
    });
    if (findDataIndx !== -1) {
      this.dischargeSummaryFilterValue[findDataIndx][key] = data;
    } else {
      const historyObj = {
        patientId: null,
        chartDateArray: [],
        careTeamList: []
      };
      historyObj.patientId = patientId;
      historyObj[key] = data;
      this.dischargeSummaryFilterValue.push(historyObj);
    }
  }

  getVisitDates(param): Observable<any> {
    const data = this.getDischargeSummaryFilterList(param.patient_id, 'chartDateArray', false);
    if (data && data.length > 0) {
      return of(data);
    } else {
      const reqUrl = `${environment.dashboardBaseURL}/Patient/GetPatientVisitDates`;
      return this.http.post(reqUrl, param).pipe(map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
          this.setHistoryPatientData(param.patient_id, 'chartDateArray', res.data);
          return res.data;
        } else {
          return [];
        }
      }));
    }
  }

  getAllPatientCareTeam(param): Observable<any> {
    const data = this.getDischargeSummaryFilterList(param.patient_id, 'careTeamList', false);
    if (data && data.length > 0) {
      return of(data);
    } else {
      const reqUrl = `${environment.dashboardBaseURL}/Patient/GetPatientVisitDoctors`;
      return this.http.post(reqUrl, param).pipe(map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
          this.setHistoryPatientData(param.patient_id, 'careTeamList', res.data);
          return res.data;
        } else {
          return [];
        }
      }));
    }
  }

  getPatientChartList(param): Observable<any> {
    const data = this.getDischargeSummaryFilterList(param.patient_id, 'chartList', false);
    if (data && data.length > 0) {
      return of(data);
    } else {
      const reqUrl = `${environment.dashboardBaseURL}/Patient/GetPatientVisitCharts`;
      return this.http.post(reqUrl, param).pipe(map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
          this.setHistoryPatientData(param.patient_id, 'chartList', res.data);
          return res.data;
        } else {
          return [];
        }
      }));
    }
  }

  getDischargeSummaryFilterList(patientId, key?: string, isObser?: boolean) {
    const findDataIndx = _.findIndex(this.dischargeSummaryFilterValue, data => {
      return (data.patientId) === (patientId);
    });
    if (findDataIndx !== -1) {
      if (key) {
        return isObser ? of(this.dischargeSummaryFilterValue[findDataIndx][key]) : this.dischargeSummaryFilterValue[findDataIndx][key];
      } else {
        return isObser ? of(this.dischargeSummaryFilterValue[findDataIndx]) : this.dischargeSummaryFilterValue[findDataIndx];
      }
    } else {
      return isObser ? of(null) : null;
    }
  }

  getPatientDischargeSummary(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Patient/GetPatientVisitHistory`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
        _.forEach(res.data, (h) => {
          if (h.chart_data && h.chart_data.score_template_detail) {
            _.forEach(h.chart_data.score_template_detail, (element) => {
              element = this.scoretemplateService.getCalTemplateValue(element);
            });
          }
        });
        return res.data;
      } else {
        return [];
      }
    }));
  }

  getPatientChartComponentList(patientId: any, serviceTypeId: number, visitNo: string, specialityId: number): Observable<any> {
    const reqParams = {
      patient_id: patientId,
      service_type_id: serviceTypeId,
      visit_no: visitNo,
      speciality_id: specialityId
    };
    const reqUrl = `${environment.dashboardBaseURL}/Patient/GetPatientVisitSections`;
    return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
        return res.data;
      } else {
        return [];
      }
    }));
  }

  saveDischargeSummery(reqParams): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Discharge/SaveDischargeSummary`;
    return this.http.post(reqUrl, reqParams);
  }

  getPatientVisitAllHistory(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Patient/GetPatientVisitAllHistory`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
        _.forEach(res.data, (h) => {
          if (h.chart_data && h.chart_data.score_template_detail) {
            _.forEach(h.chart_data.score_template_detail, (element) => {
              element = this.scoretemplateService.getCalTemplateValue(element);
            });
          }
        });
        return res.data;
      } else {
        return [];
      }
    }));
  }

  getDischargeSummary(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Discharge/GetDischargeSummary`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
        return res.data;
      } else {
        return [];
      }
    }));
  }

  getDischargeSummaryTemplates(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Discharge/getDischargeSummaryTemplate`;
    return this.http.post(reqUrl, param);
  }

  saveDischargeSummeryTemplate(reqParams): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Discharge/SaveDischargeSummaryTemplate`;
    return this.http.post(reqUrl, reqParams);
  }

}
