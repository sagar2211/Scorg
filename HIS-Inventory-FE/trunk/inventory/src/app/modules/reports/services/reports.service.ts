import { Injectable } from '@angular/core';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import * as _ from 'lodash';
import {ReportMenus} from '../models/report-menus-model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  reportMenus: any[] = [{
    menuId: 1,
    menuName: 'GRN Date Wise Report',
    menuURL: 'Report/GrnDateWise?auth_token=#token#&storeId=#storeId#',
    menuKey: 'grnDateWise'
  },
  {
    menuId: 2,
    menuName: 'GRN Item Wise Report',
    menuURL: 'Report/grnItemWise?auth_token=#token#&storeId=#storeId#',
    menuKey: 'grnItemWise'
  },
  {
    menuId: 3,
    menuName: 'GDN Date Wise Report',
    menuURL: 'Report/gdnDateWise?auth_token=#token#&storeId=#storeId#',
    menuKey: 'gdnDateWise'
  },
  {
    menuId: 4,
    menuName: 'GDN Item Wise Report',
    menuURL: 'Report/gdnItemWise?auth_token=#token#&storeId=#storeId#',
    menuKey: 'gdnItemWise'
  },
  {
    menuId: 5,
    menuName: 'Issue Report',
    menuURL: 'Report/IssueDateWise?auth_token=#token#&storeId=#storeId#',
    menuKey: 'issue'
  },
  {
    menuId: 6,
    menuName: 'Issue Item wise Report',
    menuURL: 'Report/issueItemWIse?auth_token=#token#&storeId=#storeId#',
    menuKey: 'issueItemWIse'
  },
  {
    menuId: 7,
    menuName: 'Issue Return Report',
    menuURL: 'Report/issueReturn?auth_token=#token#&storeId=#storeId#',
    menuKey: 'issueReturn'
  },
  {
    menuId: 8,
    menuName: 'Stock Reorder Report',
    menuURL: 'Report/StockReorderReport?auth_token=#token#&storeId=#storeId#',
    menuKey: 'stockReorder'
  },
  {
    menuId: 9,
    menuName: 'Stock Expiry Date Report',
    menuURL: 'Report/StockExpiryReport?auth_token=#token#&storeId=#storeId#',
    menuKey: 'stockExpDate'
  },
  {
    menuId: 10,
    menuName: 'Stock Report',
    menuURL: 'Report/StockReport?auth_token=#token#&storeId=#storeId#',
    menuKey: 'stock'
  },
  {
    menuId: 11,
    menuName: 'Opening Stock Report',
    menuURL: 'Report/OpeningStockReport?auth_token=#token#&storeId=#storeId#',
    menuKey: 'openingStock'
  },
  {
    menuId: 12,
    menuName: 'Item ledger Report',
    menuURL: 'Report/ItemLedgerReport?auth_token=#token#&storeId=#storeId#',
    menuKey: 'itemLedger'
  }];
  constructor(private http: HttpClient) { }

  getReportsMenu(): Observable<any> {
    if (this.reportMenus.length) {
      return of(this.reportMenus);
    }
    const reqUrl = `${environment.baseUrlAppointment}/DashBoard/getQMSReportMenus`;
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success' && res.reportMenus.length > 0) {
          _.map(res.reportMenus, (menu) => {
            const reportMenu = new ReportMenus();
            reportMenu.generateObj(menu);
            reportMenu.menuName =  _.replace(reportMenu.menuName, 'Entity', 'Provider');
            this.reportMenus.push(reportMenu);
          });
          return this.reportMenus;
        } else {
          return [];
        }
      })
    );
  }

}
