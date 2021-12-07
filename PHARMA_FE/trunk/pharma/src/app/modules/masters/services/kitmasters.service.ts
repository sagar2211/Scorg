import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as _ from 'lodash';
import { AuthService } from 'src/app/public/services/auth.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class KitMastersService {

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getItemKitMasterList(param): Observable<any> {
    const reqUrl = environment.baseUrlPharma + '/Item/GetKitList';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data.length > 0) {
          // const data = [];
          // _.map(res.data, (val, key) => {
          //   const mg = new ItemMaster();
          //   if (mg.isObjectValid(val)) {
          //     mg.generateObject(val);
          //     data.push(mg);
          //   }
          // });
          return { data: res.data, totalCount: res.total_records };
        } else {
          return { data: [], totalCount: 0 };
        }
      })
    );
  }

  getKitDataByID(id): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/Item/GetKitById?kitId=${id}`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      return res;
    }));
  }

  deleteKitDataById(id): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/Item/DeleteKitById?kitId=${id}`;
    return this.http.delete(reqUrl).pipe(map((res: any) => {
      return res;
    }));
  }

  saveKitData(param): Observable<any> {
    const reqUrl = environment.baseUrlPharma + '/Item/SaveKitMaster';
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
          // const data = [];
          // _.map(res.data, (val, key) => {
          //   const mg = new ItemMaster();
          //   if (mg.isObjectValid(val)) {
          //     mg.generateObject(val);
          //     data.push(mg);
          //   }
          // });
          return res.data;
        } else {
          return [];
        }
      })
    );
  }

}
