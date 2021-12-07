import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';

@Injectable()
export class MtpMlcService {

  constructor(private http: HttpClient) {

  }

  getMLCList(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/MLC/GetMLCList`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data.length > 0) {
        return { data: res.data, totalCount: res.total_records };
      } else {
        return { data: [], totalCount: 0 };
      }
    }));
  };

  saveMLC(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/MLC/SaveMLC `;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data) {
        return res;
      } else {
        return null;
      }
    }));
  };

  deleteDeathRegisterById(id: number): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/MLC/DeleteMLCById?mlcId=` + id;
    return this.http.delete(reqUrl).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success') {
        return res;
      } else {
        return null;
      }
    }));
  }

  getMLCByID(id: number): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/MLC/GetMLCByID?encounterId=` + id;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success') {
        return res;
      } else {
        return null;
      }
    }));
  }

  getMLCTypeList(): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/MLC/GetMLCTypeList`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success') {
        return res.data;
      } else {
        return [];
      }
    }));
  }

  getIdentificationTypeList(): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/MLC/GetIdentificationTypeList`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success') {
        return res.data;
      } else {
        return [];
      }
    }));
  }

}
