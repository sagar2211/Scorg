import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
// import { Country } from '../models/country';
// import { State } from '../models/state';
// import { City } from '../models/city';
import * as _ from 'lodash';
import { typeofExpr } from '@angular/compiler/src/output/output_ast';
import { EncounterPatient } from '../models/encounter-patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  // titleMaster = [];
  bloodMaster = [];
  nationalityMaster = [];
  countryhash = new Map();
  cityhash = new Map();
  statehash = new Map();
  setInputToSideBar: Subject<any> = new Subject();
  public $listenInputs = this.setInputToSideBar.asObservable();

  constructor(private http: HttpClient) { }

  // getCountryList(limitTo: number, searchText: string): Observable<any> {
  //   const reqParams = {
  //     limit: limitTo,
  //     search_text: searchText
  //   };
  //   const countryModel = new Country();
  //   const countryModelList: Array<Country> = [];

  //   const isDataExist = this.countryhash.get(searchText);
  //   if (!_.isUndefined(isDataExist)) {
  //     return of(this.countryhash.get(searchText));
  //   } else {
  //     const reqUrl = environment.baseUrlAppointment + '/QMSHMISView/getCountryData';
  //     return this.http.post(reqUrl, reqParams).pipe(
  //       map((res: any) => {
  //         res.Country_Data.forEach(element => {
  //           countryModel.generateObject(element);
  //           countryModelList.push(Object.assign({}, countryModel));
  //         });
  //         res.countryList = countryModelList;
  //         if (searchText) {
  //           this.countryhash.set(searchText, res);
  //         }
  //         return res;
  //       })
  //     );
  //   }
  // }

  // getStateList(countryId: number, limitTo: number, searchText: string): Observable<any> {
  //   const reqParams = {
  //     country_id: countryId,
  //     limit: limitTo,
  //     search_text: searchText
  //   };
  //   const stateModel = new State();
  //   const stateModelList: Array<State> = [];
  //   const searchString = searchText ? searchText : countryId;
  //   const isDataExist = this.statehash.get(searchString);
  //   if (!_.isUndefined(isDataExist)) {
  //     return of(this.statehash.get(searchString));
  //   } else {
  //     const reqUrl = environment.baseUrlAppointment + '/QMSHMISView/getStateData';
  //     return this.http.post(reqUrl, reqParams).pipe(
  //       map((res: any) => {
  //         res.State_Data.forEach(element => {
  //           stateModel.generateObject(element);
  //           stateModelList.push(Object.assign({}, stateModel));
  //         });
  //         res.stateList = stateModelList;
  //         if (searchText) {
  //           this.statehash.set(searchText, res);
  //         } else {
  //           this.statehash.set(countryId, res);
  //         }
  //         return res;
  //       })
  //     );
  //   }
  // }

  // getCityList(stateId: number, limitTo: number, searchText: string): Observable<any> {
  //   const reqParams = {
  //     State_Id: stateId,
  //     limit: limitTo,
  //     search_text: searchText
  //   };
  //   const cityModel = new City();
  //   const cityModelList: Array<City> = [];
  //   const searchString = searchText ? searchText : stateId;
  //   const isDataExist = this.cityhash.get(searchString);
  //   if (!_.isUndefined(isDataExist)) {
  //     return of(this.cityhash.get(searchString));
  //   } else {
  //     const reqUrl = environment.baseUrlAppointment + '/QMSHMISView/getCityData';
  //     return this.http.post(reqUrl, reqParams).pipe(
  //       map((res: any) => {
  //         res.City_Data.forEach(element => {
  //           cityModel.generateObject(element);
  //           cityModelList.push(Object.assign({}, cityModel));
  //         });
  //         res.cityList = cityModelList;
  //         if (searchText) {
  //           this.cityhash.set(searchText, res);
  //         } else {
  //           this.cityhash.set(stateId, res);
  //         }
  //         return res;
  //       })
  //     );
  //   }
  // }

  // getTitle(): Observable<any> {
  //   const reqUrl = environment.baseUrlAppointment + '/QMSHMISView/getTitleData';
  //   if (this.titleMaster.length) {
  //     return of(this.titleMaster);
  //   } else {
  //     return this.http.get(reqUrl).pipe(
  //       map((res: any) => {
  //         this.titleMaster = res;
  //         return res;
  //       })
  //     );
  //   }
  // }

  getBloodList(): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/QMSHMISView/getBloodGroupName';
    if (this.bloodMaster.length) {
      return of(this.bloodMaster);
    } else {
      return this.http.get(reqUrl).pipe(
        map((res: any) => {
          this.bloodMaster = res;
          return res;
        })
      );
    }
  }

  getNationality(): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/QMSHMISView/getNationalityName';
    if (this.nationalityMaster.length) {
      return of(this.nationalityMaster);
    } else {
      return this.http.get(reqUrl).pipe(
        map((res: any) => {
          this.nationalityMaster = res;
          return res;
        })
      );
    }
  }

  savePatient(param: any): Observable<any> {
    const url = param.pat_uhid ? '/Patient/editPatient' : '/Patient/savePatient' ;
    const reqUrl = environment.baseUrlAppointment + url;
    if (param.pat_uhid) { // update
      return this.http.put(reqUrl, param).pipe(
        map((res: any) => {
          return res;
        })
      );
    } else { // add
      return this.http.post(reqUrl, param).pipe(
        map((res: any) => {
          return res;
        })
      );
    }
  }

  getPatientDetailsById(patId): Observable<any> {
    const reqUrl = `${environment.baseUrlAppointment}/Patient/getPatientById?Pat_Id=` + patId;
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  getAdmittedPatients(param: any): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/HISView/GetAdmittedPatients`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.admittedPatientList.length > 0) {
        return this.generateEncounterPatientData(res.admittedPatientList);
      } else {
        return [];
      }
    }));
  }

  getPatientOTScheduleList(param: any): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/OTSchedule/GetPatientOTScheduleList`;
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        _.map(res.data, function(o) {
          const surgeon = _.find(o.userData, function(x) { return x.userGroup == 'SURGEON' && x.type == 'PRIMARY' });
          o.surgeonName = surgeon ? ('Dr. ' + surgeon.userName) : '';
        });
        return res.data;
      })
    );
  }

  // generateIpdPatientData(patData): Array<any> {
  //   const patAry = [];
  //   _.map(patData, dt => {
  //     const ipdPatData = new IpdPatient();
  //     ipdPatData.generateObject(dt);
  //     patAry.push(ipdPatData);
  //   });
  //   return patAry;
  // }
  generateEncounterPatientData(patData): Array<any> {
    const patAry = [];
    _.map(patData, dt => {
      const ipdPatData = new EncounterPatient();
      ipdPatData.generateObject(dt);
      patAry.push(ipdPatData);
    });
    return patAry;
  }

  getCurrentAdmittedPatientInfo(): any {
    return {
      Id: 2,
      Srno: 2,
      AdmissionRefid: '2',
      PatientId: '772336',
      PatientName: 'POOL PLACE',
      Age: '30',
      Gender: 'Male',
      Bed: 'CCU/BED-01',
      AdmissionDate: '2020-03-24T00:00:00',
      Consultant: 'Anand Gurjar',
      DoctorName: 'Anand Gurjar',
      ContactNo: '7575736363',
      Status: '1',
      DoctorId: 1,
      DoctorCode: '1',
      HospitalId: 1,
      Floor: 'FLR-001',
      Ward: 'WD-001'
    };
  }

  getOrdersMenuList(patientId) {
    return [
      {
        linkKey: 'patient/orders/ordersList/' + patientId,
        name: 'Order List',
        isActive: false,
        cssClass: 'icon-emr-intake-output',
        permission: [],
        children: [],
        sectionKey: 'orders_list'
      },
      {
        linkKey: 'patient/orders/medicine/' + patientId,
        name: 'Medicine',
        isActive: false,
        cssClass: 'icon-emr-intake-output',
        permission: [],
        children: [],
        sectionKey: 'order_medicine'
      },
      {
        linkKey: 'patient/orders/lab/' + patientId,
        name: 'Lab',
        isActive: false,
        cssClass: 'icon-emr-intake-output',
        permission: [],
        children: [],
        sectionKey: 'order_lab'
      },
      {
        linkKey: 'patient/orders/radiology/' + patientId,
        name: 'Radiology',
        isActive: false,
        cssClass: 'icon-emr-intake-output',
        permission: [],
        children: [],
        sectionKey: 'order_radiology'
      },
      {
        linkKey: 'patient/orders/diet/' + patientId,
        name: 'Diet',
        isActive: false,
        cssClass: 'icon-emr-intake-output',
        permission: [],
        children: [],
        sectionKey: 'order_diet'
      },
      {
        linkKey: 'patient/orders/nursing/' + patientId,
        name: 'Nursing',
        isActive: false,
        cssClass: 'icon-emr-intake-output',
        permission: [],
        children: [],
        sectionKey: 'order_nursing'
      },
      {
        linkKey: 'patient/orders/other/' + patientId,
        name: 'Other',
        isActive: false,
        cssClass: 'icon-emr-intake-output',
        permission: [],
        children: [],
        sectionKey: 'order_other'
      },
      {
        linkKey: 'patient/orders/orderSets/' + patientId,
        name: 'Order Set',
        isActive: false,
        cssClass: 'icon-emr-intake-output',
        permission: [],
        children: [],
        sectionKey: 'order_order_set'
      },
      {
        linkKey: 'patient/orders/add_order/' + patientId,
        name: 'Add Order',
        isActive: false,
        cssClass: 'icon-emr-intake-output',
        permission: [],
        children: [],
        sectionKey: 'add_order'
      },
      {
        linkKey: 'patient/orders/add_order/' + patientId,
        name: 'Quick Order',
        isActive: false,
        cssClass: 'icon-emr-intake-output',
        permission: [],
        children: [],
        sectionKey: 'quick_order'
      },
    ];
  }

  getFilterPatientCount(param: any): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/Patient/getPatientListCountForBulkSMS';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  getFilterPatientList(param: any): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/Patient/getPatientListForBulkSMS';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  sendNotificationOnFilterPatients(param: any): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/Patient/sendBulkSMSToPatient';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  getAllPatientNotificationStatus(param: any): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/Patient/getAllPatientNotificationStatus';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  getPatientDataViaVisitType(param: any): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/HISView/GetPatientVisitInfo';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        return res.data;
      })
    );
  }
  getQuickPatientList(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/HISView/GetQuickPatientList`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data.length > 0) {
        return res.data;
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
          if (res.data !== null) {
            const patAry = [];
            const ipdPatData = new EncounterPatient();
            ipdPatData.generateObject(res.data);
            patAry.push(ipdPatData);
            return patAry;
          }
          // else if (res.data.opd_data !== null) {
          //   const patAry = [];
          //   const opdPatData = new OpdPatient();
          //   opdPatData.generateObject(res.data.opd_data);
          //   patAry.push(opdPatData);
          //   return patAry;
          // }
        } else {
          return null;
        }
      })
    );
  }

  getPatientDashboardData(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Dashboard/GetPatientDashboardData`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data) {
        return res.data;
      } else {
        return [];
      }
    }));
  }

  getPatientDashboardTimelineData(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Dashboard/GetPatientDashboardTimelineData`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data) {
        return res.data;
      } else {
        return null;
      }
    }));
  }

  getVisitTimeLine(reqParams): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Dashboard/GetPatientDashboardData`;
    return this.http.post(reqUrl, reqParams);
  }

  getCustomPatientDashboardData(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Dashboard/GetCustomPatientDashboardData`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data) {
        return res.data;
      } else {
        return [];
      }
    }));
  }

}
