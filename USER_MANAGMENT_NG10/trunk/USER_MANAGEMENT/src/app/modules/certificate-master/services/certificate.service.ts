import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CertificateService {

  selectedCertificateId: null;
  constructor(
    private http: HttpClient
  ) { }

  getTemplateListBYid(id): Observable<any> {
    const reqUrl = `${environment.API_FOR_PDF}/ConsentForm/GetConsentTemplateList?categoryId=${id}`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data.length > 0) {
        return res.data;
      } else {
        return [];
      }
    }));
  }

  getCertificateTagsNameList(): Observable<any> {
    const reqUrl = `${environment.API_FOR_PDF}/ConsentForm/GetConsentTagsList`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data.length > 0) {
        const dataArray = [];
        _.map(res.data, d => {
          dataArray.push({
            id: d.tagId,
            name: d.tagName
          })
        })
        return dataArray;
      } else {
        return [];
      }
    }));
  }

  getCertificateDataById(): Observable<any> {
    return of(null);
    // const reqUrl = `${environment.API_FOR_PDF}/ConsentForm/GetLanguageList`;
    // return this.http.get(reqUrl).pipe(map((res: any) => {
    //   if (res.status_message === 'Success' && res.data.length > 0) {
    //     return res.data;
    //   } else {
    //     return [];
    //   }
    // }));
  }

  updateTemplateData(param): Observable<any> {
    const reqUrl = `${environment.API_FOR_PDF}/ConsentForm/SaveConsentTemplate`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data) {
        return res.data;
      } else {
        return null;
      }
    }));
  }
}
