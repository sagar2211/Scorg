import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, of } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import * as moment from 'moment';
import { environment } from './../../../../environments/environment';
import { VisitType } from 'src/app/public/models/visit-type.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  viitTypeMaster = [];
  constructor(
    private http: HttpClient,
  ) { }

  getVisitType(): Observable<any> {
    const reqUrl = `${environment.baseUrlAppointment}/Appointment/getVisitType`;
    if (this.viitTypeMaster.length) {
      return of(this.viitTypeMaster);
    } else {
      return this.http.get(reqUrl).pipe(map((r: any) => {
        if (r.status_message === 'Success') {
          const temp = [];
          r.visit_type_details.forEach(element => {
            const arr = new VisitType();
            arr.generateObject({ ...element });
            if (element.is_active) {
              temp.push(arr);
            }
          });
          this.viitTypeMaster = temp;
          return temp;
        } else {
          return null;
        }
      }));
    }
  }
}
