import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable()
export class DisplayListService {

  constructor(
    private http: HttpClient,
  ) { }

  getWaitingQueueDisplayList(param): Observable<any> {
    const reqParam = {
      section_name: param
    };
    const reqUrl = environment.baseUrlAppointment + '/QueueTransaction/getlivePatientQueue';
    return this.http.post(reqUrl, reqParam).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success') {
          return res;
        } else {
          return false;
        }
      })
    );
  }
  getDisplayDataByTemplate(param): Observable<any> {
    const reqParam = {
      section_name: param
    };
    const reqUrl = environment.baseUrlAppointmentForDisplayTemplate9 + '/QueueTransaction/getlivePatientQueueRowWiseData';
    return this.http.post(reqUrl, reqParam).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success') {
          return res;
        } else {
          return false;
        }
      })
    );
  }
}
