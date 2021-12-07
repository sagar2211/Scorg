import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import { ScoreTemplateService } from '../public/services/score-template.service';

@Injectable()
export class HistoryService {

  // sendPatHistoryFilterData$ = new Subject<any>();
  // public getPatHistoryFilterData$ = this.sendPatHistoryFilterData$.asObservable();
  patientHistoryFilter = [];
  patientInvestigationHistoryFilter = [];

  private autoScrollTree = new Subject<any>();
  public $subcautoScrollTree = this.autoScrollTree.asObservable();

  constructor(
    private http: HttpClient,
    private scoretemplateService: ScoreTemplateService
  ) { }

  getPatientVisitHistory(param): Observable<any> {
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

  getPatientVisitHistoryDetailsById(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Patient/GetPatientVisitHistoryById`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
        if (res.data.chart_data) {
          _.forEach(res.data.chart_data.score_template_detail, (element) => {
            element = this.scoretemplateService.getCalTemplateValue(element);
          });
        }
        return res.data;
      } else {
        return null;
      }
    }));
  }

  getPatientEncounterVisitList(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Patient/GetPatientEncounterVisitList `;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
        return res.data;
      } else {
        return null;
      }
    }));
  }

  setPatientHistoryFilter(patientId, filterData) {
    if (this.patientHistoryFilter.length > 0) {
      const indx = _.findIndex(this.patientHistoryFilter, d => {
        return d.patientId === patientId;
      });
      if (indx !== -1) {
        this.patientHistoryFilter[indx].data = filterData;
      } else {
        const obj = {
          patientId: patientId,
          data: filterData
        };
        this.patientHistoryFilter.push(obj);
      }
    } else {
      const obj = {
        patientId: patientId,
        data: filterData
      };
      this.patientHistoryFilter.push(obj);
    }
  }

  setPatientInvestigationHistoryFilter(patientId, filterData) {
    if (this.patientInvestigationHistoryFilter.length > 0) {
      const indx = _.findIndex(this.patientInvestigationHistoryFilter, d => {
        return d.patientId === patientId;
      });
      if (indx !== -1) {
        this.patientInvestigationHistoryFilter[indx].data = filterData;
      } else {
        const obj = {
          patientId: patientId,
          data: filterData
        };
        this.patientInvestigationHistoryFilter.push(obj);
      }
    } else {
      const obj = {
        patientId: patientId,
        data: filterData
      };
      this.patientInvestigationHistoryFilter.push(obj);
    }
  }

  getPatientHistoryFilter(patientId) {
    if (this.patientHistoryFilter.length > 0) {
      const indx = _.findIndex(this.patientHistoryFilter, d => {
        return d.patientId === patientId;
      });
      if (indx !== -1) {
        return this.patientHistoryFilter[indx].data;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  getPatientInvestigationHistoryFilter(patientId) {
    if (this.patientInvestigationHistoryFilter.length > 0) {
      const indx = _.findIndex(this.patientInvestigationHistoryFilter, d => {
        return d.patientId === patientId;
      });
      if (indx !== -1) {
        return this.patientInvestigationHistoryFilter[indx].data;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  // getPatientChartComponentsById(chartId: number): Observable<any> {
  //   const reqUrl = environment.dashboardBaseURL + '/PatientChart/GetPatientChartComponentsById?ChartId=' + chartId;
  //   return this.http.get(reqUrl);
  // }

  scrollToNodeIntree(callFrom?) {
    this.autoScrollTree.next(callFrom);
  }

  getInvestigationReportList(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Patient/GetInvestigationReportList `;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
        return res;
      } else {
        return null;
      }
    }));
  }

  getPatientInvestigationHistory(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Patient/GetPatientInvestigationHistory `;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
        return res;
      } else {
        return null;
      }
    }));
  }

}
