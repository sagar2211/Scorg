import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MasterMappingService {

  constructor(
    private http: HttpClient
  ) { }

  mappingRmoDept(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Mapping/SaveUserDeptMapping`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      return res;
    }));
  }

  getRmoDeptMappingList(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Mapping/GetUserDeptMappingList`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.data.length) {
        return res;
      } else {
        return [];
      }
    }));
  }

  getRmoDeptMappingById(id): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Mapping/GetUserDeptMappingById?id=${id}`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      return res;
    }));
  }

  deleteRmoDeptMappingById(id): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Mapping/DeleteUserDeptMappingById?id=${id}`;
    return this.http.delete(reqUrl).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
        return res.data;
      } else {
        return false;
      }
    }));
  }

  getRmoDoctorMappingList(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Mapping/GetUserDoctorMappingList`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.data.length) {
        return res;
      } else {
        return [];
      }
    }));
  }

  saveUserDoctorMapping(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Mapping/SaveUserDoctorMapping`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      return res;
    }));
  }
  deleteRmoDoctorMappingById(DoctorId): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Mapping/DeleteUserDoctorMappingById?DoctorId=${DoctorId}`;
    return this.http.delete(reqUrl).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
        return res.data;
      } else {
        return false;
      }
    }));
  }

  mappingNursingWord(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Mapping/SaveUserWardMapping`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      return res;
    }));
  }

  saveNurseToNursingStationMapping(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Mapping/SaveUserNursingStationMapping`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      return res;
    }));
  }

  getNursingWordMappingList(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Mapping/GetUserWardMappingList`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.data.length) {
        return res;
      } else {
        return [];
      }
    }));
  }

  getNursingWordMappingById(id): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Mapping/GetUserWardMappingByWardId?id=${id}`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      return res;
    }));
  }

  deleteNursingWordMappingById(id): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Mapping/DeleteUserWardMappingById?id=${id}`;
    return this.http.delete(reqUrl).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
        return res.data;
      } else {
        return false;
      }
    }));
  }

  mappingWardDept(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Mapping/SaveWardDeptMapping`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      return res;
    }));
  }

  getwardDeptMappingList(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Mapping/GetWardDeptMappingList`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.data.length) {
        return res;
      } else {
        return [];
      }
    }));
  }

  getWardDeptMappingById(id): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Mapping/GetUserDeptMappingById?id=${id}`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      return res;
    }));
  }

  deleteWardDeptMappingById(id): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Mapping/DeleteWardDeptMappingById?id=${id}`;
    return this.http.delete(reqUrl).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
        return res.data;
      } else {
        return false;
      }
    }));
  }

  getUserNursingStationMappingList(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Mapping/GetUserNursingStationMappingList`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.data.length) {
        return res;
      } else {
        return [];
      }
    }));
  }

  deleteNursingNursingStationMappingById(id): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Mapping/DeleteUserNursingStationMappingById?id=${id}`;
    return this.http.delete(reqUrl).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
        return res.data;
      } else {
        return false;
      }
    }));
  }

}
