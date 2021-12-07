import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { Constants } from 'src/app/config/constants';

@Injectable({
  providedIn: 'root'
})
export class OtScheduleService {

  selectedSpecialityId;
  constructor(
    private http: HttpClient
  ) { }

  getOTSpecialityList(searchText): Observable<any> {
    const param = {
      search_string: searchText,
      page_number: 1,
      limit: 50
    };
    const reqUrl = `${environment.dashboardBaseURL}/HISView/GetOTSpecialityList`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data.length > 0) {
        return res.data;
      } else {
        return [];
      }
    }));
  }


  getOTProcedureList(searchText): Observable<any> {
    if (this.selectedSpecialityId) {
      const param = {
        search_string: searchText,
        otSpecialityId: this.selectedSpecialityId,
        page_number: 1,
        limit: 50
      };
      const reqUrl = `${environment.dashboardBaseURL}/HISView/GetOTProcedureList`;
      return this.http.post(reqUrl, param).pipe(map((res: any) => {
        if (res.status_message === 'Success' && res.data.length > 0) {
          return res.data;
        } else {
          return [];
        }
      }));
    } else {
      return of([]);
    }
  }

  getUsersList(searchText, type): Observable<any> {
    const param = {
      searchKeyword: searchText,
      userRoleTypeId: 0,
      designationKeys: type ? [type] : [],
      applicationKey: '',
      page_number: 1,
      limit: 50
    };
    const reqUrl = `${environment.baseUrl}/UserRegistration/GetUserByRoleDesignation`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data.length > 0) {
        return res.data;
      } else {
        return [];
      }
    }));
  }

  saveAppointment(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/OTSchedule/BookOTAppointment`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res) {
        return res;
      } else {
        return null;
      }
    }));
  }

  getOTAppointmentListByDate(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/OTSchedule/GetOTAppointmentBookedSlots`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data) {
        return res.data;
      } else {
        return [];
      }
    }));
  }

  getOTAppointmentData(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/OTSchedule/GetOTAppointmentData`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data) {
        return res.data;
      } else {
        return [];
      }
    }));
  }

  deleteOTAppointmentById(id): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/OTSchedule/DeleteOTAppointmentById?appointmentId=${id}`;
    return this.http.delete(reqUrl).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
        return res.data;
      } else {
        return false;
      }
    }));
  }

  getOTRoomBySearchKeyword(search): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/OTMaster/GetOTRoomBySearchKeyword?search=${search}`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
        return res.data;
      } else {
        return false;
      }
    }));
  }

  getOTAppointmentStatus(): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/OTMaster/GetOTAppointmentStatus`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
        return res.data;
      } else {
        return false;
      }
    }));
  }


}
