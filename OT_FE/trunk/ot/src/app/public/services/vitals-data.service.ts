import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import { Vitals, VitalCategory, VitalMapped } from './../models/vitals';

@Injectable({
  providedIn: 'root'
})
export class VitalsDataService {

  vitalDataArray = [];
  // vitalObj = {
  //   service_type_id: null,
  //   speciality_id: null,
  //   vital: []
  // };
  constructor(
    private http: HttpClient,
  ) { }

  generateVitalData(val, vtlArray?) {
    const obj = {
      vital: {
        id: val.vital_id,
        name: val.vital_name,
        key: val.vital_key,
        vitalType: val.vital_type ? val.vital_type : null,
      },
      clubbedVital: {
        id: val.clubbed_vital_id ? val.clubbed_vital_id : null,
        name: val.clubbed_vital_name ? val.clubbed_vital_name : null,
        key: val.clubbed_vital_key ? val.clubbed_vital_key : null,
        vitalType: null,
      },
      vitalFormula: {
        detail: val.formula_detail ? val.formula_detail : null,
        display: val.formula_display ? val.formula_display : null,
        idArray: val.formula_vitals_id ? val.formula_vitals_id : null,
      },
      suffix: val.suffix ? val.suffix : null,
      prefix: val.prefix ? val.prefix : null,
      isDecimal: val.is_decimal,
      vitalUnit: val.vital_unit ? val.vital_unit : null,
      rangeData: [],
      clubbedVitalData: null,
      sequence: val.sequence
    };
    if (val.clubbed_vital_id) {
      const vitalClb = new Vitals();
      if (vitalClb.isObjectValid(obj.clubbedVital)) {
        vitalClb.generateObject(obj.clubbedVital);
        obj.clubbedVital = vitalClb;
      }
      if (vtlArray && val.clubbed_vital_id) {
        const vtlData = this.getClubbedVital(vtlArray, val.clubbed_vital_id);
        if (vtlData) {
          obj.clubbedVital.vitalType = vtlData.vital_type;
          obj.clubbedVitalData = {
            suffix: vtlData.suffix ? vtlData.suffix : null,
            prefix: vtlData.prefix ? vtlData.prefix : null,
            isDecimal: vtlData.is_decimal,
            vitalUnit: vtlData.vital_unit ? vtlData.vital_unit : null,
            rangeData: [],
            vitalFormula: null
          };
          if (vtlData.formula_detail) {
            obj.clubbedVitalData.vitalFormula = {
              detail: vtlData.formula_detail,
              display: vtlData.formula_display,
              idArray: vtlData.formula_vitals_id,
            };
          }
          _.map(vtlData.vital_range_data, dt => {
            const rangeObj = this.generateVitalRangeData(dt);
            obj.clubbedVitalData.rangeData.push(rangeObj);
          });
        }
      }
    } else {
      obj.clubbedVital = null;
    }
    if (!val.formula_display) {
      obj.vitalFormula = null;
    }
    _.map(val.vital_range_data, dt => {
      const rangeObj = this.generateVitalRangeData(dt);
      obj.rangeData.push(rangeObj);
    });
    const vital = new Vitals();
    if (vital.isObjectValid(obj.vital)) {
      vital.generateObject(obj.vital);
      obj.vital = vital;
    }
    return obj;
  }

  generateVitalRangeData(val) {
    const obj = {
      id: val.id,
      category: {
        id: val.category_id,
        category: val.category
      },
      color: val.color,
      firstRange: {
        operator: val.firstRange.rangeoperator,
        value: val.firstRange.value,
      },
      secondRange: {
        operator: val.secondRange.rangeoperator,
        value: val.secondRange.value,
      }
    };
    const cat = new VitalCategory();
    if (cat.isObjectValid(obj.category)) {
      cat.generateObject(obj.category);
      obj.category = cat;
    }
    return obj;
  }

  getClubbedVital(vitalArray, vitalId) {
    const vital = _.find(vitalArray, dt => {
      return dt.vital_id === vitalId;
    });
    return vital ? vital : null;
  }

  removeClubbedVitalFromMailList(arrayList) {
    const vitalClubbedFilter = _.filter(arrayList, vtl => {
      return !_.isEmpty(vtl.clubbedVital);
    });
    if (vitalClubbedFilter.length > 0) {
      _.map(vitalClubbedFilter, vtl => {
        const findVtl = _.findIndex(arrayList, lst => {
          return lst.vital.id === vtl.clubbedVital.id;
        });
        if (findVtl !== -1) {
          arrayList.splice(findVtl, 1);
        }
      });
    }
    return arrayList;
  }

  getVitalMasterList(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Vital/GetVitalMasterList `;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data.length) {
        return {
          totalRecord: res.total_records,
          data: res.data
        };
      } else {
        return {
          totalRecord: 0,
          data: []
        };
      }
    }));
  }

  getAllVitals(): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Vital/GetAllVitals `;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data.length) {
        const arrayList = [];
        _.map(res.data, dt => {
          const vtl = new Vitals();
          if (vtl.isObjectValid(dt)) {
            vtl.generateObject(dt);
            arrayList.push(vtl);
          }
        });
        return arrayList;
      } else {
        return [];
      }
    }));
  }

  getVitalById(id): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Vital/GetVitalById?vital_id=${id}`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
        return res.data;
      } else {
        return null;
      }
    }));
  }

  deleteVitalById(id): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Vital/DeleteVitalById?vitalid=${id}`;
    return this.http.delete(reqUrl).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
        return res.data;
      } else {
        return false;
      }
    }));
  }

  getVitalCategoryList(): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Vital/GetVitalCategoryList `;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data.length) {
        const arrayList = [];
        _.map(res.data, dt => {
          const vtl = new VitalCategory();
          if (vtl.isObjectValid(dt)) {
            vtl.generateObject(dt);
            arrayList.push(vtl);
          }
        });
        return arrayList;
      } else {
        return [];
      }
    }));
  }

  saveVitalDetails(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Vital/SaveVitalDetails`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
        return res.data;
      } else {
        return false;
      }
    }));
  }

  getVitalMappingListForManageOrder(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Vital/GetVitalMappingListForManageOrder`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
        const arrayList = [];
        _.map(res.data, dt => {
          const vtl = new VitalMapped();
          if (vtl.isObjectValid(dt)) {
            vtl.generateObject(dt);
            arrayList.push(vtl);
          }
        });
        return arrayList;
      } else {
        return [];
      }
    }));
  }

  getVitalMappingList(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Vital/GetVitalMappingList`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data.length) {
        return {
          totalRecord: res.total_records,
          data: res.data
        };
      } else {
        return {
          totalRecord: 0,
          data: []
        };
      }
    }));
  }

  saveVitalMapping(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Vital/SaveVitalMapping`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
        return res.data;
      } else {
        return false;
      }
    }));
  }

  getConsultationVitalsList(param): Observable<any> {
    const vitalData = this.getVitalData(param);
    if (vitalData.length) {
      return of(vitalData);
    } else {
      const reqUrl = `${environment.dashboardBaseURL}/Vital/GetConsultationVitals`;
      return this.http.post(reqUrl, param).pipe(map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
          let arrayList = [];
          _.map(res.data, dt => {
            const obj = this.generateVitalData(dt, res.data);
            arrayList.push(obj);
          });
          arrayList = this.removeClubbedVitalFromMailList(arrayList);
          this.setVitalData(param, arrayList);
          return arrayList;
        } else {
          return false;
        }
      }));
    }
  }

  setVitalData(param, data) {
    const checkData = _.findIndex(this.vitalDataArray, dt => {
      return param.service_type_id === dt.service_type_id && param.speciality_id === dt.speciality_id;
    });

    if (checkData === -1) {
      const vitalObj = {
        service_type_id: param.service_type_id,
        speciality_id: param.speciality_id,
        vital: data
      };
      this.vitalDataArray.push(vitalObj);
    }
  }


  getVitalData(param) {
    const checkData = _.findIndex(this.vitalDataArray, dt => {
      return param.service_type_id === dt.service_type_id && param.speciality_id === dt.speciality_id;
    });

    if (checkData !== -1) {
      return this.vitalDataArray[checkData].vital;
    } else {
      return [];
    }
  }

  getVitalsDisplay(chartVital, masterVital, isObser?) {
    _.map(chartVital, vtl => {
      vtl.clubbedVital = null;
    });
    const vitalClubbedFilter = _.filter(masterVital, vtl => {
      return !_.isEmpty(vtl.clubbedVital);
    });
    if (vitalClubbedFilter.length > 0) {
      _.map(vitalClubbedFilter, clv => {
        const vitalIndex = _.findIndex(chartVital, vtl => {
          return vtl.vital_id === clv.vital.id;
        });
        const clbVitalIndex = _.findIndex(chartVital, vtl => {
          return vtl.vital_id === clv.clubbedVital.id;
        });
        if (clbVitalIndex !== -1) {
          chartVital[vitalIndex].clubbedVital = chartVital[clbVitalIndex];
          chartVital.splice(clbVitalIndex, 1);
        }
      });
    }
    return isObser ? of(chartVital) : chartVital;
  }

}
