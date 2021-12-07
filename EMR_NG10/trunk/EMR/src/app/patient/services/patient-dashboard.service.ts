import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import { AuthService } from './../../public/services/auth.service';
import { ConsultationService } from './../../public/services/consultation.service';
import { environment } from 'src/environments/environment';
import { AppointmentPatientDetails } from './../../public/models/appointment-patient-details';
//import { AdmitedPatientDetails } from './../../public/models/admited-patient-details';
import { Constants } from 'src/app/config/constants';

@Injectable({
  providedIn: 'root'
})
export class PatientDashboardService {
  admittedPatients: Array<any> = [];
  masterCopyofAppointmentList: Array<any> = [];
  bedList = [{ key: 'ER', value: 'ER-1' },
  { key: 'ER', value: 'ER-2' },
  { key: 'ICU', value: 'CCU/BED-01' },
  { key: 'ICU', value: 'CCU / BED - 02' },
  { key: 'ICU', value: 'CCU / BED - 03' },
  { key: 'IPD', value: 'IPD-1OBGY / FLOO2 / W1 / 12' },
  { key: 'IPD', value: 'OBGY / FLOO2 / W2 / 101' },
  { key: 'IPD', value: 'MED / FLOO5 / W3 / 118' },
  { key: 'IPD', value: 'MED / FLOO6 / W3 / 118' },
  ];

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private consultationService: ConsultationService,
  ) { }

  patientFilterApply = [];

  getAppointmentList(obj): Observable<any> {
    // const reqUrl = environment.STATIC_JSON_URL + 'dasboard.json';
    if (!_.isEmpty(this.masterCopyofAppointmentList)) {
      return of(this.masterCopyofAppointmentList);
    }
    const reqUrl = environment.EMR_BaseURL + '/patient/getPatientNameList';
    return this.http.post(reqUrl, obj).pipe(
      map((res: any) => {
        this.masterCopyofAppointmentList = res.data;
        return res.data;
      })
    );
  }

  getAdmittedPatientList(id): Observable<any> {
    if (!_.isEmpty(this.admittedPatients)) {
      // const admittedPatientList = _.cloneDeep(this.admittedPatients);
      return of(this.admittedPatients);
    }
    const reqUrl = environment.EMR_BaseURL + '/ipd/getAllAdmittedPatientDetail';
    const obj = { doc_id: id };
    return this.http.post(reqUrl, obj).pipe(
      map((result: any) => {
        this.admittedPatients = result.data;
        let count = 0;
        this.admittedPatients.forEach(element => {
          for (let i = count; i < this.bedList.length; i++) {
            element.bed_no = this.bedList[i].value;
            element.ward = this.bedList[i].key;
            count++;
            count = this.bedList.length === count ? 0 : count;
            return;
          }
        });
        return result.data;
      })
    );
  }

  getPatientDetailsByPatId(patId: number): Observable<any> {
    this.admittedPatients = Constants.EMR_IPD_USER_DETAILS.addmittedPatientData;
    if (_.isEmpty(this.admittedPatients)) {
      return this.getAdmittedPatientList(this.authService.getUserParentId()).pipe(map(res => {
        return _.find(res, ((pd: any) => pd.id === patId));
      }));
    } else {
      return of(_.find(this.admittedPatients, ((pd: any) => pd.id === patId)));
    }
  }

  // AddUpdateIpdPatient(param: any): Observable<any> {
  //   const reqUrl = environment.EMR_BaseURL + '/ipd/addUpdatePatientToAdmittedPatientsList';
  //   return this.http.post(reqUrl, param).pipe(
  //     map((res: any) => {
  //       if (res.data.status === 1) {
  //         this.admittedPatients.push(res.data.patient_data);
  //       } else if (res.data.status === 2) {
  //         const findIndx = _.findIndex(this.admittedPatients, r => r.ipdId === param.ipd_id);
  //         if (findIndx !== -1) {
  //           this.admittedPatients.splice(findIndx, 1);
  //           // splice patient Data from consulation Array.
  //           const findpatientIndx = _.findIndex(this.consultationService.patientConsultationFormsArray, r => r.patientId === param.patient_id);
  //           if (findpatientIndx !== -1) {
  //             this.consultationService.patientConsultationFormsArray.splice(findpatientIndx, 1);
  //           }
  //         }
  //       }
  //       return res;
  //     })
  //   );
  // }

  generateAppointmentObject(patobject: any) {
    const appoinmentList = new AppointmentPatientDetails();
    if (appoinmentList.isObjectValid(patobject)) {
      appoinmentList.generateObject(patobject);
      return appoinmentList;
    } else {
      return null;
    }
  }

  // generateAdmitedObject(patobject: any) {
  //   const admittedPatientList = new AdmitedPatientDetails();
  //   if (admittedPatientList.isObjectValid(patobject)) {
  //     admittedPatientList.generateObject(patobject);
  //     return admittedPatientList;
  //   } else {
  //     return null;
  //   }
  // }

  getMenusList(): Observable<any> {
    const reqUrl = environment.STATIC_JSON_URL + 'menus.json';
    return this.http.get(reqUrl);
  }

  dischargePatient(reqParams): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Discharge/DischargePatient`;
    return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
      // if (res.status_message === 'Success') {
      //   const findIndx = _.findIndex(this.admittedPatients, r => r.patient_id === reqParams.patient_id);
      //   if (findIndx !== -1) {
      //     this.admittedPatients.splice(findIndx, 1);
      //     // splice patient Data from consulation Array.
      //     const findpatientIndx = _.findIndex(this.consultationService.patientConsultationFormsArray, r => r.patientId === reqParams.patient_id);
      //     if (findpatientIndx !== -1) {
      //       this.consultationService.patientConsultationFormsArray.splice(findpatientIndx, 1);
      //     }
      //   }
      // }
      return res;
    }));
  }
  UpdateEncounterStatus(reqParams): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Discharge/UpdateEncounterStatus`;
    return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
      // res.data = true;
      return res;
    }));
  }

  getVitalDate(obj): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/Dashboard/GetPatientDashboardVitalData';
    return this.http.post(reqUrl, obj).pipe(
      map((res: any) => {
        return res.data;
      })
    );
  }
  checkPatientIsReferred(param) {
    const url = `${environment.dashboardBaseURL}/Refer/CheckPatientIsReferred`;
    return this.http.post(url, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success') {
          return res;
        } else {
          return null;
        }
      })
    );
  }

  getFilterData(patId) {
    const filterIndx = _.findIndex(this.patientFilterApply, dt => {
      return dt.patientId === patId;
    });
    if (filterIndx !== -1) {
      return this.patientFilterApply[filterIndx].data;
    } else {
      return [];
    }
  }

  setFilterData(patId, data) {
    const filterIndx = _.findIndex(this.patientFilterApply, dt => {
      return dt.patientId === patId;
    });
    if (filterIndx === -1) {
      this.patientFilterApply.push(_.cloneDeep({
        data: data,
        patientId: patId
      }));
    } else {
      this.patientFilterApply[filterIndx].data = _.cloneDeep(data);
    }
  }

  getUserSetting(obj): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/emr/GetUserSetting';
    return this.http.post(reqUrl, obj).pipe(
      map((res: any) => {
        return res.data;
      })
    );
  }

  saveUserSetting(obj): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/emr/SaveUserSetting';
    return this.http.post(reqUrl, obj).pipe(
      map((res: any) => {
        return res.data;
      })
    );
  }

  getReasonTypeList(): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/Discharge/GetDischargeTypeList';
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        const list = [];
        _.map(res.data, d => {
          const obj = {
            id: d.dischargeTypeId,
            name: d.dischargeType,
          }
          list.push(_.cloneDeep(obj));
        });
        return list;
      })
    );
  }

  getReasonList(id): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Discharge/GetDischargeReasonList?dischargeTypeId=` + id;
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        const list = [];
        _.map(res.data, d => {
          const obj = {
            id: d.dischargeReasonId,
            name: d.dischargeReason,
            isSelected: false
          }
          list.push(_.cloneDeep(obj));
        });
        return list;
      })
    );
  }
}
