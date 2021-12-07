import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import { AdvancePaymentModel } from '../modals/advance-payment-model';

@Injectable()
export class IssueService {
  constructor(private http: HttpClient) { }

  getIndetnListForIssue(param): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/Issue/GetIndetnListForIssue`;
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
    const reqUrl = `${environment.baseUrlPharma}/Consumption/GetStoreConsumptionList`;
    return this.http.post(reqUrl, reqParams);
  }

  getPatientIssueList(reqParams): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/Consumption/GetPatientConsumptionList`;
    return this.http.post(reqUrl, reqParams);
  }

  getStoreConsumptionById(consumptionId): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/Consumption/GetStoreConsumptionById?consumptionId=${consumptionId}`;
    return this.http.get(reqUrl);
  }

  getIndentById(id): Observable<any> {
    const reqUrl = environment.baseUrlPharma + `/Indent/GetIndentById?indentId=${id}`;
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
    const reqUrl = environment.baseUrlPharma + `/Issue/GetIssueById`;
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
    const reqUrl = environment.baseUrlPharma + `/Stock/GetItemStockById`;
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data) {
          return res.data;
        } else {
          return [];
        }
      })
    );
  }

  getIssueList(param): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/Issue/GetIssueList`;
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
    const reqUrl = `${environment.baseUrlPharma}/Issue/IssueAcceptanceList`;
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
    const reqUrl = `${environment.baseUrlPharma}/Stock/ItemStockHold`;
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
    const reqUrl = `${environment.baseUrlPharma}/Stock/ItemStockHoldList`;
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
    const reqUrl = `${environment.baseUrlPharma}/Stock/ItemStockRelease`;
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
    const reqUrl = `${environment.baseUrlPharma}/Issue/SaveIssue`;
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
    const reqUrl = `${environment.baseUrlPharma}/Consumption/GetPatientConsumptionItemList`;
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
    const reqUrl = `${environment.baseUrlPharma}/Consumption/SaveStoreConsumption`;
    return this.http.post(reqUrl, reqParams);
  }

  getIssueAcceptanceList(param): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/Issue/IssueAcceptanceList`;
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
    const reqUrl = environment.baseUrlPharma + '/Issue/IssueAcceptance';
    return this.http.post(reqUrl, params).pipe(map((res: any) => {
      return !!(res.status_code === 200 && res.status_message === 'Success' && res.data);
    }));
  }

  savePatientIssue(reqParams): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/Consumption/SavePatientConsumption`;
    return this.http.post(reqUrl, reqParams);
  }

  getPatientIssueById(consumptionId): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/Consumption/GetPatientConsumptionById?consumptionId=${consumptionId}`;
    return this.http.get(reqUrl);
  }

  getVoucherData(param): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/Consumption/GetPatientConsumptionVoucherList`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data.length > 0) {
        return res.data;
      } else {
        return [];
      }
    }));
  }

  getDeptVoucherData(param): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/Consumption/GetDepartmentConsumptionVoucherList`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data.length > 0) {
        return res.data;
      } else {
        return [];
      }
    }));
  }

  getDeptConsumptionItemList(param): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/Consumption/GetDeptConsumptionItemList`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_code === 200 && res.data.length > 0) {
        return { data: res.data, totalCount: res.total_records };
      } else {
        return { data: [], totalCount: 0 };
      }
    }));
  }

  getCounterSaleConsumptionItemList(param): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/Consumption/GetCounterSaleConsumptionItemList`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_code === 200 && res.data.length > 0) {
        return { data: res.data, totalCount: res.total_records };
      } else {
        return { data: [], totalCount: 0 };
      }
    }));
  }

  getCounterSaleConsumptionVoucherList(param): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/Consumption/GetCounterSaleConsumptionVoucherList`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data.length > 0) {
        return res.data;
      } else {
        return [];
      }
    }));
  }

  getPrescriptionList(param): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/Consumption/GetPrescriptionList`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data.length > 0) {
        const arrayData = res.data;
        return arrayData;
      } else {
        return [];
      }
    }));
  }

  getPrescriptionItemDetails(param): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/Consumption/GetPrescriptionItemDetailsByPatientID`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return res.data;
      } else {
        return null;
      }
    }));
  }

  getVoucherPrescriptionCount(): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/Consumption/GetPrescriptionCount`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data) {
        return res.data;
      } else {
        return null;
      }
    }));
  }

  getBankDepoTypeDetails(searchText, flag): Observable<any> {
    const reqUrl = `${environment.baseUrlHis}/PatientBilling/GetBankDepoTypeDetails?searchText=${searchText}&flag=${flag}`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return res.data;
      } else {
        return [];
      }
    })
    )
  };

  getIndentItemDetailsByDeptID(param): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/Indent/GetIndentItemDetailsByDeptID`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data.length > 0) {
        const arrayData = res.data;
        return arrayData;
      } else {
        return [];
      }
    }));
  }

  getAdvancePaymentDetailsList(param): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/Master/GetAdvancePaymentDetailsList`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        const result = [];
        // _.map(res.data, (d: any) => {
        //   const advanceData = new AdvancePaymentModel();
        //   advanceData.isAdvanceApply = d.PapChqCleared == "Y" ? true : false;
        //   var balanceAmount = isNaN(parseFloat(d.BalanceAmount)) ? 0.00 : parseFloat(d.BalanceAmount).toFixed(2);
        //   if (d.PapMode != 'CASH' || d.BalanceAmount == null) {
        //     balanceAmount = parseFloat(d.PapAmount).toFixed(2);
        //   }
        //   advanceData.balanceAmount = _.cloneDeep(balanceAmount);
        //   advanceData.applicableAmount = _.cloneDeep(balanceAmount);
        //   advanceData.generateObject(d);
        //   result.push(advanceData);
        // });
        return res.data;
      } else {
        return [];
      }
    })
    )
  }

  getPaymentHistory(id): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/Consumption/GetPatientPayDetails?consumptionId=${id}`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return res.data;
      } else {
        return [];
      }
    })
    )
  }

}
