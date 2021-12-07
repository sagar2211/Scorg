import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Stock } from '../modals/stock.model';
import * as _ from 'lodash';
@Injectable({
  providedIn: 'root'
})
export class StockService {

  constructor(
    private http: HttpClient
  ) { }

  getStockList(param): Observable<any> {
    const reqUrl = environment.baseUrlPharma + '/Item/GetItemReorderList';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data.length > 0) {
          const data = [];
          _.map(res.data, (val, key) => {
            const stock = new Stock();
            if (stock.isObjectValid(val)) {
              stock.generateObject(val);
              data.push(stock);
            }
          });
          return { data: data, totalCount: res.total_records };
        } else {
          return { data: [], totalCount: 0 };
        }
      })
    );
  }

  saveItemReorderLevel(param): Observable<any> {
    const reqUrl = environment.baseUrlPharma + '/Item/SaveItemReOrderQty';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data) {
          return res.data;
        } else {
          return res.data;
        }
      })
    );
  }
}
