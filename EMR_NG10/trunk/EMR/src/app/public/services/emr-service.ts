import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Role } from './../../public/models/role.modal';
import * as _ from 'lodash';
import { Designation } from './../../public/models/designation.modal';

@Injectable()
export class EMRService {
    constructor(
        private http: HttpClient
    ) { }

    getUserRoleTypeList(): Observable<any> {
        const reqUrl = `${environment.dashboardBaseURL}/emr/GetUserRoleTypeList`;
        return this.http.get(reqUrl).pipe(map((res: any) => {
            if (res.status_message === 'Success') {
                const temp = [];
                res.data.forEach(element => {
                    const role = new Role();
                    role.generateObject(element);
                    temp.push({ ...role });
                });
                return temp;
            } else {
                return [];
            }
        }));
    }
    getUserDesignationList(roleTypeId?: any): Observable<any> {
      const reqUrl = `${environment.dashboardBaseURL}/emr/GetUserDesignationList?RoleTypeId=` + roleTypeId;
      return this.http.get(reqUrl).pipe(map((res: any) => {
          if (res.status_message === 'Success') {
              const temp = [];
              res.data.forEach(element => {
                  const designation = new Designation();
                  designation.generateObject(element);
                  temp.push({ ...designation });
              });
              return temp;
          } else {
              return [];
          }
      }));
  }

    getUsersList(reqParams: { search_keyword: string, dept_id: number, speciality_id: number, role_type_id: number, limit: number }): Observable<any> {
        const reqUrl = `${environment.dashboardBaseURL}/emr/GetUsersBySearchKeyword`;
        return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
            if (res.status_message === 'Success') {
                return res.data;
            } else {
                return [];
            }
        }));
    }

    getUserDetailById(userId: number): Observable<any> {
      const reqUrl = `${environment.dashboardBaseURL}/emr/getUserDetailById?UserId=` + userId;
      return this.http.get(reqUrl).pipe(map((res: any) => {
          if (res.status_message === 'Success') {
              return res.data;
          } else {
              return null;
          }
      }));
  }


}
