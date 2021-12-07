import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import { PurchaseOrder } from '../modals/purchase-order.modal';

@Injectable()
export class TransactionsService {

  constructor(private http: HttpClient) { }

  getPurchaseOrderList(params): Observable<any> {
    const reqUrl = environment.baseUrlPharma + '/PurchaseOrder/GetPurchaseOrderList';
    return this.http.post(reqUrl, params).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data.length > 0) {
          const data = [];
          _.map(res.data, (val, key) => {
            const po = new PurchaseOrder();
            if (po.isObjectValid(val)) {
              po.generateObject(val);
              data.push(po);
            }
          });
          return { data, totalCount: res.total_records };
        } else {
          return { data: [], totalCount: 0 };
        }
      })
    );
  }

  getGRNList(reqParams): Observable<any> {
    const reqUrl = environment.baseUrlPharma + '/GRN/GetGRNList';
    return this.http.post(reqUrl, reqParams);
  }

  getSupplierBySearchKeyword(searchValue: string): Observable<any> {
    const reqParams = {
      searchKeyword: searchValue
    };
    const reqUrl = environment.baseUrlPharma + '/Supplier/GetSupplierBySearchKeyword';
    return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return res.data;
      } else {
        return [];
      }
    }));
  }

  getPoListBySupplierId(supplierId: number, storeId: number): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/PurchaseOrder/GetPoListBySupplierId?supplierId=${supplierId}&storeId=${storeId}`;
    return this.http.get(reqUrl);
  }

  getPurchaseOrderById(id): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/PurchaseOrder/GetPurchaseOrderById?poId=${id}`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      return res;
    }));
  }

  savePurchaseOrderData(param): Observable<any> {
    const reqUrl = environment.baseUrlPharma + '/PurchaseOrder/SavePurchaseOrder';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  getSupplierItemsList(reqParams): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/PurchaseOrder/GetSupplierItemsList`;
    return this.http.post(reqUrl, reqParams);
  }

  getSupplierItemsListNgSelect(keyword, supp): Observable<any> {
    const paramObj = {
      searchKeyword: keyword,
      supplierId: supp,
      limit: 50
    };
    const reqUrl = environment.baseUrlPharma + '/PurchaseOrder/GetSupplierItemsList';
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

  saveGRN(reqParams): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/GRN/SaveGRN`;
    return this.http.post(reqUrl, reqParams);
  }

  getGRNListBySearchKeyword(reqParams): Observable<any> {
    const reqUrl = environment.baseUrlPharma + '/GRN/GetGRNListBySearchKeyword';
    return this.http.post(reqUrl, reqParams);
  }

  getGRNById(grnId: number): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/GRN/GetGRNById/?grnId=${grnId}`;
    return this.http.get(reqUrl);
  }
  approvePurchaseOrder(param): Observable<any> {
    const reqUrl = environment.baseUrlPharma + '/PurchaseOrder/ApprovePurchaseOrder';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  cancelPurchaseOrder(param): Observable<any> {
    const reqUrl = environment.baseUrlPharma + '/PurchaseOrder/CancelPurchaseOrder';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  rejectPurchaseOrder(param): Observable<any> {
    const reqUrl = environment.baseUrlPharma + '/PurchaseOrder/RejectPurchaseOrder';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  deletePurchaseOrder(id): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/PurchaseOrder/DeletePurchaseOrder?poId=${id}`;
    return this.http.delete(reqUrl).pipe(map((res: any) => {
      return res;
    }));
  }

  deleteGRN(id): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/GRN/DeleteGRN?grnId=${id}`;
    return this.http.delete(reqUrl).pipe(map((res: any) => {
      return res;
    }));
  }

  cancelGRN(reqParams): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/GRN/CancelGRN`;
    return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
      return res;
    }));
  }

  rejectGRN(reqParams: { Id: number, remark: string }): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/GRN/RejectGRN`;
    return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
      return res;
    }));
  }

  getPurchaseReturnList(params): Observable<any> {
    const reqUrl = environment.baseUrlPharma + '/GDN/GetGDNList';
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

  // getGRNListBySearchKeyword(reqParams): Observable<any> {
  //   const reqUrl = `${environment.baseUrlPharma}/GRN/GetGRNListBySearchKeyword`;
  //   return this.http.post(reqUrl, reqParams);
  // }

  getItemDetailForGDN(reqParams): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/GDN/GetItemDetailForGDN`;
    return this.http.post(reqUrl, reqParams);
  }

  saveGDN(params, isAll?): Observable<any> {
    const reqUrl = environment.baseUrlPharma + '/GDN/SaveGDN';
    return this.http.post(reqUrl, params).pipe(map((res: any) => {
      if (isAll) {
        return res;
      }
      return !!(res.status_code === 200 && res.status_message === 'Success' && res.data);
    }));
  }

  getGDNDetailsById(reqParams): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/GDN/GetGDNById`;
    return this.http.post(reqUrl, reqParams);
  }

  rejectGDN(params): Observable<any> {
    const reqUrl = environment.baseUrlPharma + '/GDN/RejectGDN';
    return this.http.post(reqUrl, params).pipe(map((res: any) => {
      return !!(res.status_code === 200 && res.status_message === 'Success' && res.data);
    }));
  }

  cancelGDN(params): Observable<any> {
    const reqUrl = environment.baseUrlPharma + '/GDN/CancelGDN';
    return this.http.post(reqUrl, params).pipe(map((res: any) => {
      return !!(res.status_code === 200 && res.status_message === 'Success' && res.data);
    }));
  }

  getInvoiceList(params): Observable<any> {
    const reqUrl = environment.baseUrlPharma + '/Invoice/GetInvoiceList';
    return this.http.post(reqUrl, params);
  }

  saveInvoiceList(params): Observable<any> {
    const reqUrl = environment.baseUrlPharma + '/Invoice/SaveInvoice';
    return this.http.post(reqUrl, params);
  }

  getGRNForInvoice(params): Observable<any> {
    const reqUrl = environment.baseUrlPharma + '/Invoice/GetGRNForInvoice';
    return this.http.post(reqUrl, params);
  }

  deleteInvoice(invoiceId): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/Invoice/DeleteInvoice?invoiceId=${invoiceId}`;
    return this.http.delete(reqUrl);
  }

  cancelInvoice(reqParams: { Id: 0, remark: string }): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/Invoice/CancelInvoice`;
    return this.http.post(reqUrl, reqParams);
  }

  rejectInvoice(reqParams: { Id: 0, remark: string }): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/Invoice/RejectInvoice`;
    return this.http.post(reqUrl, reqParams);
  }

  getInvoiceById(invoiceId: number): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/Invoice/GetInvoiceById?invoiceId=${invoiceId}`;
    return this.http.get(reqUrl);
  }

  approveGRN(reqParams): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/GRN/ApproveGRN`;
    return this.http.post(reqUrl, reqParams);
  }

  approveInvoice(invoiceId): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/Invoice/ApproveInvoice?invoiceId=${invoiceId}`;
    return this.http.get(reqUrl);
  }

  approveGDN(gdnId): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/GDN/ApproveGDN?gdnId=${gdnId}`;
    return this.http.get(reqUrl);
  }

  GetAuditLog(params): Observable<any> {
    const reqUrl = environment.baseUrlPharma + '/UserActivity/GetAuditLog';
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

}
