import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Country } from '../models/country';
// import { State } from '../models/state';
// import { City } from '../models/city';
import * as _ from 'lodash';
import { EncounterPatient } from 'src/app/public/models/encounter-patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  constructor(private http: HttpClient) { }

  getQuickPatientList(searchPatKey): Observable<any> {
    const param = {
      searchKeyword: searchPatKey,
      visitType: [],
      pageNumber: 1,
      limit: 100
    };
    const reqUrl = `${environment.dashboardBaseURL}/HISView/GetPatientEncounterList`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data.length > 0) {
        return res.data;
      } else {
        return [];
      }
    }));
  }

  getLanguageList(): Observable<any> {
    const reqUrl = `${environment.API_FOR_PDF}/ConsentForm/GetLanguageList`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data.length > 0) {
        return res.data;
      } else {
        return [];
      }
    }));
  }

  getConsentFormList(param): Observable<any> {
    const reqUrl = `${environment.API_FOR_PDF}/ConsentForm/GetPrintFormList `;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data.length > 0) {
        return res.data;
      } else {
        return [];
      }
    }));
  }

  printConsentForm(param): Observable<any> {
    const reqUrl = `${environment.API_FOR_PDF}/ConsentForm/PrintConsentForm `;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data) {
        return res.data;
      } else {
        return null;
      }
    }));
  }

  GetPrintFormFavorites(param): Observable<any> {
    const reqUrl = `${environment.API_FOR_PDF}/ConsentForm/GetPrintFormFavorites`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data) {
        return res.data;
      } else {
        return null;
      }
    }));
  }

  // printConsentForm(param): Observable<any> {
  //   // return of(null);
  //   const reqUrl = `${environment.API_FOR_PDF}/ConsentForm/PrintConsentForm`;
  //   return this.http.post(reqUrl, param, {
  //     responseType: "arraybuffer",
  //     headers: new HttpHeaders().append("Content-Type", "application/json")
  //   }).pipe(map((res: any) => {
  //     if (res) {
  //       return res;
  //     } else {
  //       return null;
  //     }
  //   }));
  // }

  getPrintContent(param): Observable<any> {
    const reqUrl = `http://172.16.100.203:191/ShowReport/GetOpdPrint`;
    return this.http.post(reqUrl, param, {
      responseType: "arraybuffer",
      headers: new HttpHeaders().append("Content-Type", "application/json")
    }).pipe(map((res: any) => {
      if (res) {
        return res;
      } else {
        return null;
      }
    }));
  }


  getTypeList(): Observable<any> {
    const reqUrl = `${environment.API_FOR_PDF}/ConsentForm/ConsentFormCategoryList`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data.length > 0) {
        const dataArray = [];
        _.map(res.data, d => {
          dataArray.push({
            id: d.categoryId,
            name: d.categoryName
          })
        })
        return dataArray;
      } else {
        return [];
      }
    }));
  }

  getPatientActiveVisitDetail(searchKey?): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/HISView/GetPatientActiveVisitDetail?PatientId=` + searchKey;
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success') {
          if (res.data !== null) {
            const patAry = [];
            const ipdPatData = new EncounterPatient();
            ipdPatData.generateObject(res.data);
            patAry.push(ipdPatData);
            return patAry;
          }
        } else {
          return null;
        }
      })
    );
  }


}
