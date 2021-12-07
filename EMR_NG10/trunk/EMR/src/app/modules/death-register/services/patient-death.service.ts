import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';

@Injectable()
export class PatientDeathService {

  constructor(private http: HttpClient) {

  }

  getPatientListBySearchKeywords(param): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/HISView/GetAllPatientList`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data.length > 0) {
        return res.data;
      } else {
        return [];
      }
    }));
  };

  getDeathTypeList() {
    const reqUrl = `${environment.dashboardBaseURL}/DeathRegister/GetDeathTypeList`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data.length > 0) {
        return res.data;
      } else {
        return [];
      }
    }));
  }

  getDeathRegisterList(param) {
    const reqUrl = `${environment.dashboardBaseURL}/DeathRegister/GetDeathRegisterList`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return { data: res.data, totalCount: res.total_records };
      } else {
        return { data: [], totalCount: 0 };
      }
    }));
  }

  getDeathPatientInfo(patientId: number) {
    const reqUrl = `${environment.dashboardBaseURL}/DeathRegister/GetDeathRegisterByID?encounterId=` + patientId;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
        return res.data;
      } else {
        return [];
      }
    }));
  }

  deleteDeathRegisterById(id: number) {
    const reqUrl = `${environment.dashboardBaseURL}/DeathRegister/DeleteDeathRegisterById?deathRegId=` + id;
    return this.http.delete(reqUrl).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success') {
        return res;
      } else {
        return null;
      }
    }));
  }

  SaveDeathRegister(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/DeathRegister/SaveDeathRegister`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success') {
        return res;
      } else {
        return null;
      }
    }));
  };



}
