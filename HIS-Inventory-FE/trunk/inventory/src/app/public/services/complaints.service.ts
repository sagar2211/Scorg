import { environment } from './../../../environments/environment';
import { PublicService } from './public.service';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, filter, catchError } from 'rxjs/operators';
import * as _ from 'lodash';
import { IFormData } from './prescription.service';
import { ConsultationService } from './consultation.service';

@Injectable({
  providedIn: 'root'
})
export class ComplaintsService {
  complaintsInputs: IFormData[] = [];
  complaintsList = [];
  complaintsDefaultObject = [{ // complaintInputs
    name: null,
    days: null,
    month: null,
    year: null,
    id: null
  }];

  complaintsDefaultObj = { name: null, days: null, month: null, year: null };

  constructor(
    private http: HttpClient,
    private _publicService: PublicService,
    private _consultationService: ConsultationService) {
  }

  // not in use
  getComplaintsDefaultObj(): Observable<any> {
    const reqUrl = environment.STATIC_JSON_URL + 'complaints.json';
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        this.complaintsDefaultObj = Object.assign(res.getDefaultObj);
        return Object.assign(res.getDefaultObj);
      })
    );
  }

  getAllComplaintLists(): Observable<any> {
    if (this.complaintsList.length) {
      return of(this.complaintsList);
    }
    const reqUrl = environment.EMR_BaseURL + '/patient/getPatientAllComplaint';
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        this.complaintsList = res.data;
        return res.data;
      })
    );
  }

  getAllComplaintListsBySearchKey(searchKey): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/Complaint/GetComplaintsBySearchKeyword?search_keyword=' + searchKey;
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        this.complaintsList = res.data;
        return res.data;
      })
    );
  }


  getComplaintTypeData(patientId): Observable<any> {
    const complaintsData = this._consultationService.getConsultationFormDataByKey(patientId, 'complaints');
    if (!_.isEmpty(complaintsData)) {
      return of(complaintsData);
    } else {
      const dt = _.cloneDeep(this.complaintsDefaultObject);
      return of(this._consultationService.setConsultationFormData(patientId, 'complaints', dt));
    }
  }

  getComplaintsSuggestionList(params): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/Complaint/GetComplaintsSuggestionList';
    return this.http.post(reqUrl, params).pipe(map((res: any) => {
      const result = res.data;
      _.map(result, (val, key) => {
        val.name = val.complaintName;
      });
      return { complaint_data: result, total_count: result.length + result.length, search_text: params.search_keyword };
    }), catchError(
      (error) => {
        return throwError('error');
      }
    ));
  }

  addComplaintData(complaint): Observable<any> {
    const params = {
      id: 0,
      complaintName: complaint
    };
    const reqUrl = environment.dashboardBaseURL + '/Complaint/SaveComplaintMasterData';
    return this.http.post(reqUrl, params).pipe(map((res: any) => {
      return res;
    }), catchError(
      (error) => {
        return throwError('error');
      }
    ));
  }

}
