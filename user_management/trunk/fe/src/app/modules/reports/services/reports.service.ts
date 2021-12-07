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
  reportMenus: any[] = [];
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
