import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from "src/environments/environment";
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  defaultLocationData = null;
  constructor(private http: HttpClient) { }

  getTitleMaster() {
    return this.http.get(environment.baseUrlHis + '/Patient/getTitleMaster').pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return res.data;
      } else {
        return null;
      }
    }));
  }

  getCountryData(param) {
    if (!param.hasOwnProperty('search_text')) {
      param = { search_text: param, limit: 100 }
    }
    return this.http.post(environment.baseUrl + '/HISView/GetCountryData', param).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return res.data;
      } else {
        return null;
      }
    }));
  }

  getStateData(param, countryId) {
    if (!param.hasOwnProperty('searchText')) {
      param = {
        searchText: param,
        limit: 100,
        countryId: countryId
      }
    }
    return this.http.post(environment.baseUrl + '/HISView/GetStateData', param).pipe(map((res: any) => {

      if (res.status_message === 'Success') {
        return res.data;
      } else {
        return null;
      }
    }));
  }

  getCityData(param, stateId) {
    if (!param.hasOwnProperty('searchText')) {
      param = {
        searchText: param,
        limit: 100,
        stateId: stateId
      }
    }
    return this.http.post(environment.baseUrl + '/HISView/GetCityData', param).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return res.data;
      } else {
        return null;
      }
    }));
  }

  getNationality() {
    return this.http.get(environment.baseUrlHis + '/Patient/getNationality').pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return res.data;
      } else {
        return null;
      }
    }));
  }

  getAgeunit() {
    return this.http.get(environment.baseUrlHis + '/Patient/getAgeunit').pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return res.data;
      } else {
        return null;
      }
    }));
  }

  getBloodGroup() {
    return this.http.get(environment.baseUrlHis + '/Patient/getBloodGroup').pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return res.data;
      } else {
        return null;
      }
    }));
  }

  getRelation() {
    return this.http.get(environment.baseUrlHis + '/Patient/getRelation').pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return res.data;
      } else {
        return null;
      }
    }));
  }

  getOccupation() {
    return this.http.get(environment.baseUrlHis + '/Patient/getOccupation').pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return res.data;
      } else {
        return null;
      }
    }));
  }

  getLanguage() {
    return this.http.get(environment.baseUrlHis + '/Patient/getLanguage').pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return res.data;
      } else {
        return null;
      }
    }));
  }

  getReligion() {
    return this.http.get(environment.baseUrlHis + '/Patient/getReligion').pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return res.data;
      } else {
        return null;
      }
    }));
  }

  getSettingDetails() {
    return this.http.get(environment.baseUrlHis + '/Patient/GetSettingDetails').pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return res.data;
      } else {
        return null;
      }
    }));
  }

  uploadProfilePic(file) {
    const formData = new FormData();
    console.log(file[0])
    formData.append("image", file[0], file[0].name);

    return this.http.post(environment.baseUrlHis + "/Patient/UploadImageApi", formData).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return res.data;
      } else {
        return null;
      }
    }))
  }

  uploadTakeImage(image) {
    return this.http.post(environment.baseUrlHis + "/Patient/UploadCaptureImageApi", image).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return res.data;
      } else {
        return null;
      }
    }))
  }

  savePatient(obj): Observable<any> {
    return this.http.post(environment.baseUrlHis + "/Patient/savePatient", obj).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return res;
      } else {
        return null;
      }
    }));
  }

  getAllPatientList(param): Observable<any> {
    const reqUrl = environment.baseUrlHis + '/Patient/SearchPatientList';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.message === 'success' && res.data.length > 0) {
          return res;
        } else {
          return null;
        }
      })
    );
  }

  getPatientList(param) {
    console.log(param.searchString)
    const reqUrl = environment.baseUrlHis + '/Patient/GetPatientsDetails?searchText=' + param.searchString + '&page=' + param.pageNumber + '&pageSize=' + param.pageSize;
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success' && res.data.length > 0) {
          return { patientData: res.data, totalCount: res.data.length };
        } else {
          return { listData: [], totalCount: 0 };
        }
      })
    );
  }

  getPatientDetail(param) {
    const reqUrl = environment.baseUrlHis + '/Patient/GetPatientsDetailById?uhId=' + param.uhId;
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success' && res.data?.patInfo?.length > 0) {
          return res.data;
        } else {
          return null;
        }
      })
    );
  }


  getQuickPatientList(searchString): Observable<any> {
    const reqUrl = environment.baseUrlHis + '/Patient/GetPatientsDetails?searchText=' + searchString + '&page=1 &pageSize=20';
    // change by Himanshu If no search the no data to display (16/11/2021)
    if (!searchString) {
      return of([]);
    }
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data.length > 0) {
        _.map(res.data, itr => {
          itr.image = itr.image.split("../..")[1];
        })
        return res.data;
      } else {
        return [];
      }
    }));
  }

  getStaffList(searchString): Observable<any> {
    searchString = searchString ? searchString : 'a'
    const reqUrl = environment.baseUrlHis + '/Patient/GetEmployeeDetails?searchText=' + searchString;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.length > 0) {
        _.map(res, itr => {
          itr.image = itr.image.split("../../..")[1];
        })
        return res;
      } else {
        return [];
      }
    }));
  }

  public getPatientActiveVisitDetail(searchKey?) {
    const reqUrl = `${environment.dashboardBaseURL}/HISView/GetPatientActiveVisitDetail?PatientId=` + searchKey;
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success') {
          return res.data;
        } else {
          return null;
        }
      })
    );
  }

  getDefaultLocationDataToSet(): Observable<any> {
    if(this.defaultLocationData){
      return of(this.defaultLocationData);
    }else{
    const reqUrl = environment.baseUrlHis + '/patient/getDefaultCityState';
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        if (res.status_code === 200) {
          if(res.data){
            this.defaultLocationData = res;
          }          
          return res;
        } else {
          return null;
        }
      })
    );
      }
    
  }
}
