import { Injectable } from '@angular/core';
import { Subject, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import * as _ from 'lodash';


@Injectable({
  providedIn: 'root'
})
export class FrontDeskEntityMappingService {
  // public sendMappingData = new Subject<any>();
  // public $receiveMappingEvent = this.sendMappingData.asObservable();
  newmappingObject: any;
  editMappingData: any;
  userMappingMasterList = [];

  constructor(
    private http: HttpClient,
  ) { }

  // updateFormObject(data) {
  //   this.sendMappingData.next(data);
  // }
  saveUserMapping(param: any): Observable<any> {
    const reqUrl = environment.baseUrl + '/DashboardMapping/saveDashBoardUserMapping';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  getfrontDeskMappingList(param: any): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/UserDashboardMapping/GetUserDashboardMappingList';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  getMappingDetailsById(param: any): Observable<any> {
    const reqUrl = `${environment.baseUrlAppointment}/UserDashboardMapping/GetUserDashboardMappingDetailsById/${param}`;
    const isExistObject = _.find(this.userMappingMasterList , (o) => o.userId === param );
    if (isExistObject) {
      return of(isExistObject.mappingObject);
    } else {
      return this.http.get(reqUrl).pipe(
        map((res: any) => {
          const usermappingObject = {
            userId : param,
            mappingObject : res
          };
          this.userMappingMasterList.push(usermappingObject);
          return res;
        })
      );
    }
  }
}
