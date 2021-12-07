import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import * as _ from 'lodash';
import { Service } from '../models/service.model';

@Injectable()
export class EntitityRulesService {
  serviceListData = {
    entity_id: 0,
    service_provider_id: 0,
    serviceList: [],
    isPopulated: false
  };


  constructor(
    private http: HttpClient,
  ) { }

  getServiceListArray(param): Observable<any> {
    if (param.service_provider_id !== this.serviceListData.service_provider_id &&
      param.entity_id !== this.serviceListData.entity_id
      && this.serviceListData.isPopulated === false) {
      const reqUrl = `${environment.baseUrlAppointment}/Appointment/getService?service_provider_id=${param.service_provider_id}&entity_id=${param.entity_id}`;
      return this.http.get(reqUrl).pipe(
        map((res: any) => {
          if (res.status_code === 200 && res.status_message === 'Success') {
            this.serviceListData.entity_id = param.entity_id;
            this.serviceListData.service_provider_id = param.service_provider_id;
            this.serviceListData.isPopulated = true;
            this.serviceListData.serviceList = [];
            _.map(res.service, (val, index) => {
              const service = new Service();
              if (service.isObjectValid(val)) {
                service.generateObject(val);
                this.serviceListData.serviceList.push(service);
              }
            });
          }
          return this.serviceListData.serviceList;
        })
      );
    } else {
      return of(this.serviceListData.serviceList);
    }
  }

  // getServiceListByNameArray(param): Observable<any> {
  //   const reqUrl = environment.baseUrlAppointment + '/Appointment/getServiceSearchByName';
  //   const reqParam = {
  //     entity_id: param.entity_id,
  //     service_provider_id: param.service_provider_id,
  //     search_text: param.search_text || '',
  //   };
  //   return this.http.post(reqUrl, reqParam).pipe(
  //     map((res: any) => {
  //       if (res.status_code === 200 && res.status_message === 'Success') {
  //         const serviceList = [];
  //         _.map(res.service, (val, index) => {
  //           const service = new Service();
  //           if (service.isObjectValid(val)) {
  //             service.generateObject(val);
  //             serviceList.push(service);
  //           }
  //         });
  //         return serviceList;
  //       } else {
  //         return [];
  //       }
  //     })
  //   );
  // }
}
