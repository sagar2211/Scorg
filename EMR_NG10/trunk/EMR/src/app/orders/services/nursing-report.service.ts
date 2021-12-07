// import { environment } from './../../environments/environment';
import {environment} from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import {IfluidReportOptionNameList} from '../../emr/models/ifluid-report-option-name-list.model';

@Injectable({
  providedIn: 'root'
})
export class NursingReportService {


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
        const retChartOpn = {
          fluidReportFeedTypeList: [],
          fluidReportFluidTypeList: []
        };
        if (res.data.length > 0) {
          _.map(res.data, (val, index) => {
            const _ifluidReportOptionNameList = new IfluidReportOptionNameList();
            if (_ifluidReportOptionNameList.isObjectValid(val)) {
              _ifluidReportOptionNameList.generateObject(val, '');
              if (_ifluidReportOptionNameList.type == 'feed') {
                retChartOpn.fluidReportFeedTypeList.push(_.cloneDeep(_ifluidReportOptionNameList));
              } else if (_ifluidReportOptionNameList.type == 'fluid') {
                retChartOpn.fluidReportFluidTypeList.push(_.cloneDeep(_ifluidReportOptionNameList));
              }
            }
          });
        }
        return retChartOpn;
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

}
