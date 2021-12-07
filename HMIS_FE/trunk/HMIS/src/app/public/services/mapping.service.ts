import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { Department } from './../models/department';
import { Ward } from './../models/ward';
import * as _ from 'lodash';
import { Speciality } from './../models/speciality.model';
import { ServiceType } from '../models/service-type.model';
import { DocumentType } from '../models/document-type.model';
import { Constants } from 'src/app/config/constants';
import { Nursingstation } from '../models/nursingstation.model';

@Injectable({
  providedIn: 'root'
})
export class MappingService {

  serviceTypeArray = [];
  documentTypeArray = [];
  constructor(
    private http: HttpClient
  ) { }

  getNursingStationList(param): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/Mapping/GetNursingStationListBySearchKeyword';
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data.length) {
        const list = [];
        _.map(res.data, d => {
          const station = new Nursingstation();
          if (station.isObjectValid(d)) {
            station.generateObject(d);
            list.push(station);
          }
        });
        return list;
      } else {
        return [];
      }
    }));
  }

  getDepartmentList(param): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/HISView/getDepartmentList';
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data.length) {
        const deptList = [];
        _.map(res.data, d => {
          const dept = new Department();
          if (dept.isObjectValid(d)) {
            dept.generateObject(d);
            deptList.push(dept);
          }
        });
        return deptList;
      } else {
        return [];
      }
    }));
  }

  getWardList(param): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/HISView/getWardList';
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data.length) {
        const wardList = [];
        _.map(res.data, d => {
          const wrd = new Ward();
          if (wrd.isObjectValid(d)) {
            wrd.generateObject(d);
            wardList.push(wrd);
          }
        });
        return wardList;
      } else {
        return [];
      }
    }));
  }

  getSpecialityList(param): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/HISView/getSpecialtiesList';
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data.length) {
        const specilityList = [];
        _.map(res.data, d => {
          const specility = new Speciality();
          if (specility.isObjectValid(d)) {
            specility.generateObject(d);
            specilityList.push(specility);
          }
        });
        return specilityList;
      } else {
        return [];
      }
    }));
  }

  getSpecialityById(id): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/HISView/GetSpecialityById?id=${id}`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
        const specility = new Speciality();
        if (specility.isObjectValid(res.data)) {
          specility.generateObject(res.data);
        }
        return specility;
      } else {
        return null;
      }
    }));
  }

  getServiceTypeList(): Observable<any> {
    if (this.serviceTypeArray.length > 0) {
      return of(this.serviceTypeArray);
    }
    const reqUrl = environment.dashboardBaseURL + '/emr/GetServiceTypeList';
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data.length) {
        const dataList = [];
        _.map(res.data, d => {
          const type = new ServiceType();
          if (type.isObjectValid(d)) {
            type.generateObject(d);
            dataList.push(type);
          }
        });
        this.serviceTypeArray = dataList;
        return dataList;
      } else {
        return [];
      }
    }));
  }

  getPatientDocumentTypeList(patientId): Observable<any> {
    if (this.getDocumentTypeArray(patientId).length > 0) {
      return of(this.getDocumentTypeArray(patientId));
    }
    const reqUrl = environment.dashboardBaseURL + '/Patient/GetPatientDocumentList?patientId=' + patientId;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data.length) {
        const dataList = [];
        _.map(res.data, d => {
          const type = new DocumentType();
          if (type.isObjectValid(d)) {
            type.generateObject(d);
            dataList.push(type);
          }
        });
        this.updateDocumentTypeArray(dataList, patientId);
        return dataList;
      } else {
        return [];
      }
    }));
  }

  updateDocumentTypeArray(dataList, patientId) {
    const indx = _.findIndex(this.documentTypeArray, dt => {
      return dt.patientId === patientId;
    });
    if (indx === -1) {
      const obj = {
        patientId: patientId,
        data: dataList
      };
      this.documentTypeArray.push(obj);
    }
  }

  getDocumentTypeArray(patientId) {
    const indx = _.findIndex(this.documentTypeArray, dt => {
      return dt.patientId === patientId;
    });
    if (indx !== -1) {
      return this.documentTypeArray[indx].data;
    } else {
      return [];
    }
  }

  getWardListData(string): Observable<any> {
    const param = {
      search_string: string,
      page_number: 1,
      limit: 50
    }
    const reqUrl = environment.dashboardBaseURL + '/HISView/getWardList';
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data.length) {
        const wardList = [];
        _.map(res.data, d => {
          const wrd = new Ward();
          if (wrd.isObjectValid(d)) {
            wrd.generateObject(d);
            wardList.push(wrd);
          }
        });
        return wardList;
      } else {
        return [];
      }
    }));
  }

}
