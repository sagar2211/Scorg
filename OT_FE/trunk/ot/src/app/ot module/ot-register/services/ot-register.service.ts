import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { Constants } from 'src/app/config/constants';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class OtRegisterService {
  selectedRegisterDate: any = null;
  doseUnitList = [];
  constructor(
    private http: HttpClient
  ) { }

  getOTRegisterList(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/OTRegister/GetOTRegisterList`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.data.length) {
        return res;
      } else {
        return [];
      }
    }));
  }

  getOTPatientSchedule(searchText): Observable<any> {
    if (this.selectedRegisterDate) {
      const param = {
        searchKeyword: searchText,
        appointmentDate: this.selectedRegisterDate,
        limit: 50
      };
      const reqUrl = `${environment.dashboardBaseURL}/OTRegister/GetOTPatientSchedule`;
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

  saveOTRegister(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/OTRegister/SaveOTRegister`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.data) {
        return res;
      } else {
        return null;
      }
    }));
  }

  getAnaesthesiaTypeList(): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/OTRegister/GetAnaesthesiaTypeList`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      return res;
    }));
  }

  getSurgeryLevelList(): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/OTRegister/GetSurgeryLevelList`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      return res;
    }));
  }

  getOTRegisterByAppointmentId(id): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/OTRegister/GetOTRegisterByAppointmentId?appointmentId=${id}`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      return res;
    }));
  }

  getAnaesthetistList(searchText): Observable<any> {
    const param = {
      searchKeyword: searchText,
      userRoleTypeId: Constants.userRoleType.doctor.id,
      designationKeys: ['anaesthetist'],
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

  getOTCheckListByAppointmentId(id): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/OTRegister/GetOTCheckListByAppointmentId?appointmentId=${id}`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      return res;
    }));
  }

  getOTCheckListByPriority(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/OTCheckList/GetOTCheckListByPriority`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.data) {
        return res.data;
      } else {
        return null;
      }
    }));
  }

  getetPreOTCheckListById(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/OTCheckList/GetPreOTCheckListById`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.data) {
        return res.data;
      } else {
        return null;
      }
    }));
  }

  savePreOTCheckList(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/OTCheckList/SavePreOTCheckList`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.data) {
        return res;
      } else {
        return null;
      }
    }));
  }

  saveOTCheckListMaster(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/OTCheckList/SaveOTCheckListMaster`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.data) {
        return res;
      } else {
        return null;
      }
    }));
  }

  getOTCheckListMasterById(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/OTCheckList/GetOTCheckListMasterById`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.data) {
        return res;
      } else {
        return null;
      }
    }));
  }

  getMedicineDoseUnitList(medicineTypeId): Observable<any> {
    if (this.doseUnitList.length) {
      return of(this.doseUnitList);
    }
    const reqUrl = `${environment.dashboardBaseURL}/MedicineDoseUnit/GetMedicineDoseUnitList?MedicineTypeID=${medicineTypeId}`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.doseUnit.length > 0) {
        const doseUnits = [];
        _.forEach(res.doseUnit, (o) => {
          const term = o.dose_unit;
          const re = new RegExp('^[a-zA-Z ]*$');
          // dont allow alphanumeric string, only alphabet string
          if (re.test(term)) {
            doseUnits.push(o);
          }
        });
        this.doseUnitList = doseUnits;
        return doseUnits;
      } else {
        return [];
      }
    }));
  }


}
