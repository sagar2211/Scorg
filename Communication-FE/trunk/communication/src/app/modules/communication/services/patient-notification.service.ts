import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PatientNotificationService {

  constructor(
    private http: HttpClient
  ) { }

  getFilterPatientCount(param: any): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/Patient/getPatientListCountForBulkSMS';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        return res;
      })
    );
  }
  getFilterPatientList(param: any): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/Patient/getPatientListForBulkSMS';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  sendNotificationOnFilterPatients(param: any): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/Patient/sendBulkSMSToPatient';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        return res;
      })
    );
  }
}
