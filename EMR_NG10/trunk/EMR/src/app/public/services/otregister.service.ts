import { environment } from '../../../environments/environment';
import { PublicService } from './public.service';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, filter, catchError } from 'rxjs/operators';
import * as _ from 'lodash';
import { IFormData } from './prescription.service';
import { ConsultationService } from './consultation.service';

@Injectable({
  providedIn: 'root'
})
export class OtregisterService {

  constructor(
    private http: HttpClient,
    ) {
  }

  getPatientOTRegisterByDate(params): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/OTRegister/GetPatientOTRegisterByDate';
    return this.http.post(reqUrl, params).pipe(map((res: any) => {
      return res;
    }));
  }

  getOTRegisterByAppointmentId(id): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/OTRegister/GetOTRegisterByAppointmentId?appointmentId=${id}`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      return res;
    }));
  }

}
