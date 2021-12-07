import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';

@Injectable()
export class SaleReturnService {

  constructor(private http: HttpClient) { }

  getSaleBillsForReturn(param): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/SalesReturn/GetSaleBillsForReturn`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return res.data;
      } else {
        return null;
      }
    }));
  }

  saveSalesReturn(param): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/SalesReturn/SaveSalesReturn`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return res;
      } else {
        return null;
      }
    }));
  }



}
