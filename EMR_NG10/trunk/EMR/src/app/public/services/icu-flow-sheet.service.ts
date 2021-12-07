import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Constants } from 'src/app/config/constants';

@Injectable({
  providedIn: 'root'
})
export class IcuFlowSheetService {
  private icuFlowSheetSelectedDate: any;
  private keyWiseData = [];
  // sturcture
  // obj = {
  //   patient_id: null,
  //   opd_id: null,
  //   date: null,
  //   data: []
  // };

  // dataObj = {
  //   key: null,
  //   value: null
  // }
  constructor(
    private http: HttpClient,
  ) { }

  saveKeyWiseData(param): Observable<any> {
    const reqParam = _.cloneDeep(param);
    if (reqParam.date) {
      reqParam.date = moment(param.date).format('YYYY-MM-DD');
    }
    reqParam.value = JSON.stringify(reqParam.value);
    const reqUrl = `${environment.dashboardBaseURL}/emr/SaveAppSetting `;
    return this.http.post(reqUrl, reqParam).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success') {
        this.updateDataInLocalObject(param);
        return true;
      } else {
        return false;
      }
    }));
  }

  getKeyWiseData(param, storeData?): Observable<any> {
    if (param.date) {
      param.date = moment(param.date).format('YYYY-MM-DD');
    }
    const reqUrl = `${environment.dashboardBaseURL}/emr/GetAppSetting  `;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data.length) {
        if (!storeData) {
          this.updateDataInLocalObjectForGet(param, res.data);
        }
        return res.data;
      } else {
        return [];
      }
    }));
  }

  setIcuFlowSheetSelectedDate(date) {
    this.icuFlowSheetSelectedDate = date;
  }

  getIcuFlowSheetSelectedDate() {
    return this.icuFlowSheetSelectedDate;
  }

  checkAndUpdateDataKeyWise(indx, key, value) {
    const findKeyIndx = _.findIndex(this.keyWiseData[indx].data, d => {
      return d.key === key;
    });
    if (findKeyIndx === -1) {
      this.keyWiseData[indx].data.push({
        'key': key,
        'value': value
      });
    } else {
      this.keyWiseData[indx].data[findKeyIndx] = {
        'key': key,
        'value': value
      };
    }
  }

  updateDataInLocalObjectForGet(param, resData) {
    const findIndx = _.findIndex(this.keyWiseData, dt => {
      if (param.date) {
        return dt.patient_id === param.patient_id && dt.opd_id === param.opd_id
          && moment(moment(dt.date).format(Constants.apiDateFormate))
            .isSame(moment(moment(param.date).format(Constants.apiDateFormate)));
      } else {
        return dt.patient_id === param.patient_id && dt.opd_id === param.opd_id;
      }
    });
    if (findIndx === -1) {
      const obj = {
        patient_id: param.patient_id,
        opd_id: param.opd_id,
        date: param.date,
        data: []
      };
      _.map(resData, d => {
        obj.data.push({
          key: d.key,
          value: d.value
        });
        this.keyWiseData.push(obj);
      });
    } else {
      _.map(resData, d => {
        this.checkAndUpdateDataKeyWise(findIndx, d.key, d.value);
      });
    }
  }

  updateDataInLocalObject(param) {
    const findIndx = _.findIndex(this.keyWiseData, dt => {
      if (param.date) {
        return dt.patient_id === param.patient_id && dt.opd_id === param.opd_id
          && moment(moment(dt.date).format(Constants.apiDateFormate))
            .isSame(moment(moment(param.date).format(Constants.apiDateFormate)));
      } else {
        return dt.patient_id === param.patient_id && dt.opd_id === param.opd_id;
      }
    });
    if (findIndx === -1) {
      const obj = {
        patient_id: param.patient_id,
        opd_id: param.opd_id,
        date: param.date,
        data: []
      };
      obj.data.push({
        key: param.key,
        value: param.value
      });
      this.keyWiseData.push(obj);
    } else {
      this.checkAndUpdateDataKeyWise(findIndx, param.key, param.value);
    }
  }

  getDataByKeyParam(param) {
    const findIndx = _.findIndex(this.keyWiseData, dt => {
      if (param.date) {
        return dt.patient_id === param.patient_id && dt.opd_id === param.opd_id
          && moment(moment(dt.date).format(Constants.apiDateFormate))
            .isSame(moment(moment(param.date).format(Constants.apiDateFormate)));
      } else {
        return dt.patient_id === param.patient_id && dt.opd_id === param.opd_id;
      }
    });
    if (findIndx !== -1) {
      const findKeyIndx = _.findIndex(this.keyWiseData[findIndx].data, d => {
        return d.key === param.key;
      });
      if (findKeyIndx !== -1) {
        return this.keyWiseData[findIndx].data[findKeyIndx].value;
      } else {
        return null;
      }
    } else {
      return null;
    }

  }

}
