import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OtMasterService {

  constructor(
    private http: HttpClient
  ) { }

  getOTRoomList(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/OTMaster/GetOTRoomList`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.data.length) {
        return res;
      } else {
        return [];
      }
    }));
  }

  saveOTRoomDetail(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/OTMaster/SaveOTRoomDetail`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      return res;
    }));
  }

  getOTRoomDetailById(id): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/OTMaster/GetOTRoomDetailById?roomId=${id}`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      return res;
    }));
  }

  getOTRoomBySearchKeyword(searchKeyword): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/OTMaster/GetOTRoomBySearchKeyword?searchKeyword=${searchKeyword}`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      return res.data;
    }));
  }

  deleteOTRoomById(id): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/OTMaster/DeleteOTRoomById?roomId=${id}`;
    return this.http.delete(reqUrl).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
        return res.data;
      } else {
        return false;
      }
    }));
  }

  getQuickPatientList(searchText): Observable<any> {
    const param = {
      search_string: searchText,
      page_number: 1,
      limit: 50,
    };
    const reqUrl = `${environment.dashboardBaseURL}/HISView/GetQuickPatientList`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data.length > 0) {
        return res.data;
      } else {
        return [];
      }
    }));
  }

  getOTParameterList(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/OTMaster/GetOTParameterList`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.data.length) {
        return res;
      } else {
        return [];
      }
    }));
  }

  saveOTParameterDetail(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/OTMaster/SaveOTParameterDetail`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.data) {
        return res;
      } else {
        return null;
      }
    }));
  }

  getOTParameterDetailById(id): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/OTMaster/GetOTParameterDetailById?roomId=${id}`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      return res;
    }));
  }

  getOTParameterBySearchKeyword(searchKeyword): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/OTMaster/GetOTParameterBySearchKeyword?searchKeyword=${searchKeyword}`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      return res.data;
    }));
  }

  deleteOTParameterById(id): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/OTMaster/DeleteOTParameterById?roomId=${id}`;
    return this.http.delete(reqUrl).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
        return res.data;
      } else {
        return false;
      }
    }));
  }

  getMedicineBySearchKeyword(searchKeyword): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Medicine/GetMedicineBySearchKeyword?searchKeyword=${searchKeyword}`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      return res.Medicine_Data;
    }));
  }

  getPreOtCheckListItemList(serach, type): Observable<any> {
    const param = {
      itemGroupKey: type,
      searchKeyword: serach,
      limit: 100
    }
    const reqUrl = `${environment.dashboardBaseURL}/OTCheckList/GetPreOtCheckListItemList`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.data) {
        return res.data;
      } else {
        return null;
      }
    }));
  }


}
