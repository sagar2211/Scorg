import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import * as  _ from 'lodash';
import { environment } from 'src/environments/environment';
import { InvestigationMaster } from '../models/investigation-master.model';
@Injectable({
  providedIn: 'root'
})
export class InvestigationService {

  constructor(
    private http: HttpClient,
  ) { }

  getInvestigationData(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/InvetigationMaster/GetInvestigationBySearchKeyword?investigation_type=${param.investigation_type}&search_keyword=${param.search_keyword}`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data.length) {
        const resAry = [];
        _.map(res.data, dt => {
          const invMaster = new InvestigationMaster();
          invMaster.generateObject(dt);
          resAry.push(invMaster);
        });
        return resAry;
      } else {
        return [];
      }
    }));
  }

  getInvestigationSuggestionList(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/InvetigationMaster/GetInvestigationSuggestionList`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data.length) {
        const resAry = [];
        _.map(res.data, dt => {
          const invMaster = new InvestigationMaster();
          invMaster.generateObject(dt);
          resAry.push(invMaster);
        });
        return resAry;
      } else {
        return [];
      }
    }));
  }

}
