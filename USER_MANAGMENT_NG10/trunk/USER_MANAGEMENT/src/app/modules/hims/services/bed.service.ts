import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Country } from '../models/country';
// import { State } from '../models/state';
// import { City } from '../models/city';
import * as _ from 'lodash';
import { Nursingstation } from 'src/app/public/models/nursingstation.model';

@Injectable({
  providedIn: 'root'
})
export class BedService {

  levelParentId: number = 0;
  constructor(private http: HttpClient) { }

  getLevelData(searchPatKey): Observable<any> {
    const param = {
      searchKeyword: searchPatKey,
      parentId: this.levelParentId
    };
    const reqUrl = `${environment.HIMS_API}/VisualBedBrowser/GetLevelList`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data.length > 0) {
        return res.data;
      } else {
        return [];
      }
    }));
  }

  getLevelCofiguration(): Observable<any> {
    const reqUrl = `${environment.HIMS_API}/VisualBedBrowser/getLevelConfigList`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data.length > 0) {
        return res.data;
      } else {
        return [];
      }
    }));
  }

  getBedChargesList(): Observable<any> {
    const reqUrl = `${environment.HIMS_API}/VisualBedBrowser/GetBedChargeList`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data.length > 0) {
        return res.data;
      } else {
        return [];
      }
    }));
  }

  getBedCategoryList(): Observable<any> {
    const reqUrl = `${environment.HIMS_API}/VisualBedBrowser/GetBedCategoryList`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data.length > 0) {
        return res.data;
      } else {
        return [];
      }
    }));
  }

  getBedTypeList(): Observable<any> {
    const reqUrl = `${environment.HIMS_API}/VisualBedBrowser/GetBedTypeList`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data.length > 0) {
        return res.data;
      } else {
        return [];
      }
    }));
  }

  getBedClassList(): Observable<any> {
    const reqUrl = `${environment.HIMS_API}/VisualBedBrowser/GetBedClassList`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data.length > 0) {
        return res.data;
      } else {
        return [];
      }
    }));
  }

  getBedOccupiedList(param): Observable<any> {
    // return of([
    //   {
    //     "nursingStationId": 1,
    //     "nursingStation": "1ST FLOOR GENERAL WARD",
    //     "occupiedBed": 2,
    //     "availableBed": 0,
    //     "otherBed": 0,
    //     "totalBed": 2,
    //     "bedData": [
    //       {
    //         "bedAttributeInfo": "Bed Charge: DAILY, Bed Category: CRITICAL, Bed Type: CCU GENERAL, Bed Class: ICU GENERAL, Nursing Station: 1ST FLOOR GENERAL WARD, Admittable Gender: All Gender",
    //         "bedId": 1076,
    //         "bedInfo": "TWR1/FLR1/WARD1",
    //         "bedName": "BED NO2_A",
    //         "bedSubId": 168,
    //         "isSplitOrMerge": true,
    //         "pbaId": 30421,
    //         "splitMergeType": "S",
    //         "status": "O"
    //       },
    //       {
    //         "bedAttributeInfo": "Bed Charge: DAILY, Bed Category: CRITICAL, Bed Type: CCU GENERAL, Bed Class: ICU GENERAL, Nursing Station: 1ST FLOOR GENERAL WARD, Admittable Gender: All Gender",
    //         "bedId": 1076,
    //         "bedInfo": "TWR1/FLR1/WARD1",
    //         "bedName": "BED NO2_B",
    //         "bedSubId": 169,
    //         "isSplitOrMerge": true,
    //         "pbaId": 30421,
    //         "splitMergeType": "S",
    //         "status": "O"
    //       }
    //     ]
    //   }
    // ]
    // );
    const reqUrl = `${environment.HIMS_API}/VisualBedBrowser/GetOccupiedBedDetail`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data.length > 0) {
        return res.data;
      } else {
        return [];
      }
    }));
  }

  getPatientBedData(id): Observable<any> {
    const reqUrl = `${environment.HIMS_API}/VisualBedBrowser/GetPatientBedData?patientBedAssignId=${id}`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data.length > 0) {
        return res.data;
      } else {
        return [];
      }
    }));
  }

  getNursingStationList(searchKey?): Observable<any> {
    const param = {
      search_string: searchKey ? searchKey : '',
      page_number: 1,
      limit: 20
    };
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

}
