import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import { environment } from 'src/environments/environment';
import { IfluidReportOptionNameList } from './../../public/models/ifluid-report-option-name-list.model';

@Injectable({
  providedIn: 'root'
})
export class NursingReportService {

  fluidReportFeedTypeList = [];
  fluidReportFluidTypeList = [];

  insulinTypeList = [
    {
      'id': '1',
      'name': 'Rapid Acting',
      'key': 'rapid_acting'
    },
    {
      'id': '2',
      'name': 'Long Acting',
      'key': 'long_acting'
    },
    {
      'id': '3',
      'name': 'Regular (short-acting)',
      'key': 'short_acting'
    },
    {
      'id': '4',
      'name': 'Intermediate Acting',
      'key': 'intermediate_acting'
    },
    {
      'id': '5',
      'name': 'Combinations/pre-mixed',
      'key': 'combinations'
    },
    {
      'id': '6',
      'name': 'Inhaled insulin',
      'key': 'inhaled_insulin'
    }
  ];

  constructor(
    private http: HttpClient
  ) { }

  getNursingReportDates(param: any): Observable<any> {
    const reqUrl = environment.EMR_BaseURL + '/ipd/getFluidBalanceReport';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        return res.data;
      })
    );
  }

  addUpdateNursingReportDates(param: any): Observable<any> {
    const reqUrl = environment.EMR_BaseURL + '/ipd/addUpdateFluidBalanceReport';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        return res.data;
      })
    );
  }

  getNursingReportDataByDate(param: any): Observable<any> {
    const reqUrl = environment.EMR_BaseURL + '/ipd/getFluidBalanceReportData';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        return res.data;
      })
    );
  }

  addUpdateNursingReportDataDateWise(param: any): Observable<any> {
    const reqUrl = environment.EMR_BaseURL + '/ipd/addUpdateFluidBalanceReportData';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        return res.data;
      })
    );
  }

  getAllFluidChartOptionName(): Observable<any> {
    const reqUrl = environment.EMR_BaseURL + '/ipd/getAllFluidNameCategoryList';
    return this.http.post(reqUrl, {}).pipe(
      map((res: any) => {
        return res.data;
      })
    );
  }

  addFluidChartOptionName(param: any): Observable<any> {
    const reqUrl = environment.EMR_BaseURL + '/ipd/addUpdateFluidNameCategoryList';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        this.getAllFluidChartOptionName();
        return res.data;
      })
    );
  }

  getIntakeOutputSummeryData(param: any): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/IntakeOutput/GetPatientIntakeOutputSummary';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success' && res.data.length) {
          return res.data;
        } else {
          return [];
        }
      })
    );
  }

  getIntakeOutputDateWiseData(param: any): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/IntakeOutput/GetPatientIntakeOutputData';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success' && res.data.length) {
          return res.data;
        } else {
          return [];
        }
      })
    );
  }

  getAllFluidChartOptionData(type): Observable<any> {
    let reqUrl = '';
    if (type === 'fluid') {
      if (this.fluidReportFluidTypeList.length > 0) {
        return of(this.fluidReportFluidTypeList);
      }
      // GetIntakelvFluidsData
      reqUrl = environment.dashboardBaseURL + '/IntakeOutput/GetIntakeIvFluidsData';
    } else if (type === 'feed') {
      if (this.fluidReportFeedTypeList.length > 0) {
        return of(this.fluidReportFeedTypeList);
      }
      reqUrl = environment.dashboardBaseURL + '/IntakeOutput/GetIntakeRtFeedsList';
    }
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
          _.map(res.data, (val, index) => {
            const ifluidReportOptionNameList = new IfluidReportOptionNameList();
            if (ifluidReportOptionNameList.isObjectValid(val)) {
              ifluidReportOptionNameList.generateObject(val, type);
              if (type === 'fluid') {
                this.fluidReportFluidTypeList.push(ifluidReportOptionNameList);
              } else if (type === 'feed') {
                this.fluidReportFeedTypeList.push(ifluidReportOptionNameList);
              }
            }
          });
          if (type === 'fluid') {
            return this.fluidReportFluidTypeList;
          } else if (type === 'feed') {
            return this.fluidReportFeedTypeList;
          }
        } else {
          return [];
        }
      })
    );
  }

  saveIntakeOutputDateWiseData(param: any): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/IntakeOutput/SavePatientIntakeOutputData';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
          return res.data;
        } else {
          return false;
        }
      })
    );
  }

  getDiabeticChartData(param: any): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/DiabeticChart/GetDiabeticChartData';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
          return res.data;
        } else {
          return [];
        }
      })
    );
  }

  saveDiabeticChartData(param: any): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/DiabeticChart/SaveDiabeticChartData';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
          return res.data;
        } else {
          return false;
        }
      })
    );
  }

  getDiabeticChartSummary(param: any): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/DiabeticChart/GetDiabeticChartSummary';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
          return res.data;
        } else {
          return [];
        }
      })
    );
  }

}
