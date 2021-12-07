import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import { IndentType } from '../modals/indentType.model';

@Injectable()
export class IndentService {
  indentTypeArray = [];
  constructor(private http: HttpClient) { }

  getIndentTypes(): Observable<any> {
    if (this.indentTypeArray.length) {
      return of(this.indentTypeArray);
    } else {
      const reqUrl = `${environment.INVENTORY_BaseURL}/Indent/GetIndentTypes`;
      return this.http.get(reqUrl).pipe(
        map((res: any) => {
          if (res.status_code === 200 && res.data.length > 0) {
            const data = [];
            _.map(res.data, val => {
              const mg = new IndentType();
              if (mg.isObjectValid(val)) {
                mg.generateObject(val);
                data.push(mg);
              }
            });
            return data;
          } else {
            return [];
          }
        })
      );
    }
  }

  saveIndent(param): Observable<any> {
    const reqUrl = environment.INVENTORY_BaseURL + '/Indent/SaveIndent';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  getIndentList(params): Observable<any> {
    const reqUrl = environment.INVENTORY_BaseURL + '/Indent/GetIndentList';
    return this.http.post(reqUrl, params).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data.length > 0) {
          return { data: res.data, totalCount: res.total_records };
        } else {
          return { data: [], totalCount: 0 };
        }
      })
    );
  }

  getIndentById(id) {
    const reqUrl = environment.INVENTORY_BaseURL + `/Indent/GetIndentById?indentId=${id}`;
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data) {
          return res.data;
        } else {
          return {};
        }
      })
    );
  }

  approveIndent(id): Observable<any> {
    const reqUrl = environment.INVENTORY_BaseURL + `/Indent/ApproveIndent?indentId=${id}`;
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  cancelIndent(param): Observable<any> {
    const reqUrl = environment.INVENTORY_BaseURL + '/Indent/CancelIndent';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  rejectIndent(param): Observable<any> {
    const reqUrl = environment.INVENTORY_BaseURL + '/Indent/RejectIndent';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  deleteIndent(id): Observable<any> {
    const reqUrl = `${environment.INVENTORY_BaseURL}/Indent/DeleteIndent?indentId=${id}`;
    return this.http.delete(reqUrl).pipe(map((res: any) => {
      return res;
    }));
  }

}
