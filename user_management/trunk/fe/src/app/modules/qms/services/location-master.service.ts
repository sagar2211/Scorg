import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {map} from 'rxjs/operators';
import * as _ from 'lodash';
import {LocationModel} from '../models/location.model';
@Injectable({
  providedIn: 'root'
})
export class LocationMasterService {

  constructor(private http: HttpClient) { }

  static generateLocationModel(val) {
    const location = new LocationModel();
    location.generateObject(val);
    return location;
  }

  getAllLocationMasterList(param): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/QueueMaster/getLocationMasterList';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.locationMasterList.length > 0) {
          const data = [];
          _.map(res.locationMasterList, (val, key) => {
            data.push(LocationMasterService.generateLocationModel(val));
          });
          return { locationData: data, totalCount: res.total_records };
        } else {
          return { locationData: [], totalCount: 0 };
        }
      })
    );
  }

  saveLocationMasterData(param): Observable<any> {
    let reqUrl = environment.baseUrlAppointment + '/QueueMaster/saveLocationMaster';
    let method = 'post';
    const obj = {
      location_name: param.name,
      is_active: param.isActive
    };
    if (param.id) {
      obj['location_id'] = param.id;
      method = 'put';
      reqUrl = environment.baseUrlAppointment + '/QueueMaster/editLocationMaster';
    }
    return this.http[method](reqUrl, obj).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success') {
          return true;
        } else {
          return false;
        }
      })
    );
  }

  deleteLoactionMaster(locationId):Observable<any>{
    let url = environment.baseUrlAppointment + `/QueueMaster/deleteLocation/${locationId}`;
    return this.http.delete(url).pipe(map((response:any)=>{
     return response;
    }))
  }
}


