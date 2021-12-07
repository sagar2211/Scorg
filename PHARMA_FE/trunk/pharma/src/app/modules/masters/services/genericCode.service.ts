import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GenericCodeService {
  constructor(
    private http: HttpClient,
  ) { }

  getGenericItemList(param): Observable<any> {
    const reqUrl = environment.baseUrlPharma + '/Item/GetGenericItemList';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data.length > 0) {
          return { data: res.data, totalCount: res.total_records };
        } else {
          return { data: [], totalCount: 0 };
        }
      })
    );
  }

  getGenericItemDataById(id): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/Item/GetGenericItemDataById?genericId=${id}`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      return res;
    }));
  }

  deleteGenericItemById(id): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/Item/DeleteGenericItemById?genericId=${id}`;
    return this.http.delete(reqUrl).pipe(map((res: any) => {
      return res;
    }));
  }


  saveGenericComponent(param): Observable<any> {
    const reqUrl = environment.baseUrlPharma + '/Item/SaveGenericComponent';
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

  getItemList(param, isString?): Observable<any> {
    let paramObj = null;
    if (isString) {
      paramObj = {
        searchKeyword: param,
        sortOrder: 'asc',
        sortColumn: 'categoryName',
        pageNumber: 1,
        limit: 10,
        isActive: true
      };
    } else {
      paramObj = param;
    }
    const reqUrl = environment.baseUrlPharma + '/Item/GetItemList';
    return this.http.post(reqUrl, paramObj).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data.length > 0) {
          return res.data;
        } else {
          return [];
        }
      })
    );
  }

}
