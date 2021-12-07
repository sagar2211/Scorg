import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';

@Injectable()
export class IssueService {
  constructor(private http: HttpClient) { }

  getIndetnListForIssue(param): Observable<any> {
    const reqUrl = `${environment.INVENTORY_BaseURL}/Issue/GetIndetnListForIssue`;
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

  getStoreConsumptionList(reqParams): Observable<any> {
    const reqUrl = `${environment.INVENTORY_BaseURL}/Consumption/GetStoreConsumptionList`;
    return this.http.post(reqUrl, reqParams);
  }

  getPatientIssueList(reqParams): Observable<any> {
    const reqUrl = `${environment.INVENTORY_BaseURL}/Consumption/GetPatientConsumptionList`;
    return this.http.post(reqUrl, reqParams);
  }

  getStoreConsumptionById(consumptionId): Observable<any> {
    const reqUrl = `${environment.INVENTORY_BaseURL}/Consumption/GetStoreConsumptionById?consumptionId=${consumptionId}`;
    return this.http.get(reqUrl);
  }

  getIndentById(id): Observable<any> {
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

  getIssueById(id, isEditIssue): Observable<any> {
    const param = { issueId: id, isEditIssue };
    const reqUrl = environment.INVENTORY_BaseURL + `/Issue/GetIssueById`;
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data) {
          return res.data;
        } else {
          return {};
        }
      })
    );
  }

  getItemStockById(param): Observable<any> {
    const reqUrl = environment.INVENTORY_BaseURL + `/Stock/GetItemStockById`;
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data) {
          return res.data;
        } else {
          return {};
        }
      })
    );
  }

  getIssueList(param): Observable<any> {
    const reqUrl = `${environment.INVENTORY_BaseURL}/Issue/GetIssueList`;
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

  issueAcceptanceList(param): Observable<any> {
    const reqUrl = `${environment.INVENTORY_BaseURL}/Issue/IssueAcceptanceList`;
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

  itemStockHold(param): Observable<any> {
    const reqUrl = `${environment.INVENTORY_BaseURL}/Stock/ItemStockHold`;
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data.length > 0) {
          return res.data;
        } else {
          return false;
        }
      })
    );
  }

  itemStockHoldList(param): Observable<any> {
    const reqUrl = `${environment.INVENTORY_BaseURL}/Stock/ItemStockHoldList`;
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data.length > 0) {
          return res.data;
        } else {
          return false;
        }
      })
    );
  }

  itemStockRelease(param): Observable<any> {
    const reqUrl = `${environment.INVENTORY_BaseURL}/Stock/ItemStockRelease`;
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data.length > 0) {
          return res.data;
        } else {
          return false;
        }
      })
    );
  }

  saveIssueData(param): Observable<any> {
    const reqUrl = `${environment.INVENTORY_BaseURL}/Issue/SaveIssue`;
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data.length > 0) {
          return res.data;
        } else {
          return false;
        }
      })
    );
  }

  getPatientConsumptionItemList(param): Observable<any> {
    const reqUrl = `${environment.INVENTORY_BaseURL}/Consumption/GetPatientConsumptionItemList`;
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

  saveStoreConsumption(reqParams): Observable<any> {
    const reqUrl = `${environment.INVENTORY_BaseURL}/Consumption/SaveStoreConsumption`;
    return this.http.post(reqUrl, reqParams);
  }

  getIssueAcceptanceList(param): Observable<any> {
    const reqUrl = `${environment.INVENTORY_BaseURL}/Issue/IssueAcceptanceList`;
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

  IssueAcceptance(params): Observable<any> {
    const reqUrl = environment.INVENTORY_BaseURL + '/Issue/IssueAcceptance';
    return this.http.post(reqUrl, params).pipe(map((res: any) => {
      return !!(res.status_code === 200 && res.status_message === 'Success' && res.data);
    }));
  }

  savePatientIssue(reqParams): Observable<any> {
    const reqUrl = `${environment.INVENTORY_BaseURL}/Consumption/SavePatientConsumption`;
    return this.http.post(reqUrl, reqParams);
  }

  getPatientIssueById(consumptionId): Observable<any> {
    const reqUrl = `${environment.INVENTORY_BaseURL}/Consumption/GetPatientConsumptionById?consumptionId=${consumptionId}`;
    return this.http.get(reqUrl);
  }

  getVoucherData(param): Observable<any> {
    const reqUrl = `${environment.INVENTORY_BaseURL}/Consumption/GetPatientConsumptionVoucherList`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data.length > 0) {
        return res.data;
      } else {
        return [];
      }
    }));
  }

}
