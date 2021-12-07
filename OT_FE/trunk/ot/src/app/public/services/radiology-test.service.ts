import {environment} from '../../../environments/environment';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {PublicService} from './public.service';
import {IFormData} from './prescription.service';
import * as _ from 'lodash';
import {ConsultationService} from './consultation.service';

export const defaultRadiologyTestData = [{
  id: null,
  name: null,
  comment: null,
  date: null,
  headId: null
}];

@Injectable({
  providedIn: 'root'
})
export class RadiologyTestService {
  radiologyTestInputs: IFormData[] = [];
  defaultRadiologyTestObj = {
    id: null,
    name: null,
    comment: null,
    date: null,
    headId: null
  };
  masterAllRadiologyTest: any[] = [];


  constructor(private http: HttpClient, private _publicService: PublicService, private _consultationService: ConsultationService) { }

  getRadiologyDefaultObj(): Observable<any> {
    const reqUrl = environment.STATIC_JSON_URL + 'radiology.json';
    return this.http.get(reqUrl).pipe(
      map((res: any) => res.defaultObj)
    );
  }

  getAllRadiologyList(reqParams): Observable<any> {
    // const reqUrl = environment.STATIC_JSON_URL + 'radiology.json';
    const reqUrl = environment.EMR_BaseURL + '/Masterdata/getInvestigationDataByLimit';
    return this.http.post(reqUrl, reqParams).pipe(
      map((res: any) => res.data)
    );
  }

  getRadiologyTestData(): Observable<any> {
    const patientId = this._consultationService.getPatientObj('patientId');
    const radioTestData = this._consultationService.getConsultationFormDataByKey(patientId, 'radioInvestigationInputs');
    if (radioTestData && radioTestData.length) {
      return of(radioTestData);
    } else {
      // return this.http.get(reqUrl).pipe(
      //   map((res: any) => {
      //     return this.filterData(res.compTypeData);
      //   })
      // );
      // CALL TO API
      const defaultObj = _.cloneDeep(defaultRadiologyTestData);
      return of(this._consultationService.setConsultationFormData(patientId, 'radioInvestigationInputs', defaultObj));
    }
  }

  checkIfDataExist(): boolean {
    const indx = _.findIndex(this.radiologyTestInputs, o => o.formId == this._publicService.activeFormId);
    return indx != -1 ? true : false;
  }

  setRadiologyTestData(formData, mode, indx?): void {
    const patientId = this._consultationService.getPatientObj('patientId');
    let radiologyTestData;
    if (mode == 'add' || mode == 'update') {
      radiologyTestData = this._consultationService.setConsultationFormData(patientId, 'radioInvestigationInputs', formData, mode);
      if (radiologyTestData.length > 1) {
        _.remove(radiologyTestData, obj => obj.label == '');
      }
    } else {
      // delete mode
      radiologyTestData = this._consultationService.getConsultationFormDataByKey(patientId, 'radioInvestigationInputs');
      radiologyTestData.splice(indx, 1);
    }
  }

  // setRadiologyTestData(formData, mode, indx?): void {
  //   const patientId = this._consultationService.getPatientObj('patientId');
  //   let radiologyTestData;
  //   const formIndx = _.findIndex(this.radiologyTestInputs, (o) => o.formId == this._publicService.activeFormId);
  //   switch (mode) {
  //     case 'ADD': // if data is object
  //       if (formIndx != -1) {
  //         this.radiologyTestInputs[formIndx].data.push(formData);
  //         if (this.radiologyTestInputs[formIndx].data.length > 1) {
  //           _.remove(this.radiologyTestInputs[formIndx].data, (obj) => {
  //             return obj.label == '';
  //           });
  //         }
  //       }
  //       break;
  //     case 'UPDATE': // if you have array then direct update the value of array
  //       if (formIndx == -1) {
  //         this.pushRadiologyTestData(formData);
  //       } else {
  //         this.radiologyTestInputs[formIndx].data = formData;
  //         if (this.radiologyTestInputs[formIndx].data.length > 1) {
  //           _.remove(this.radiologyTestInputs[formIndx].data, (obj) => {
  //             return obj.label == '';
  //           });
  //         }
  //       }
  //       break;
  //     case 'DELETE': // delete the purticular data
  //       if (formIndx != -1) {
  //         this.radiologyTestInputs[formIndx].data.splice(indx, 1);
  //       }
  //       break;
  //   }
  // }

  filterData(filterData): any {
    const self = this;
    const data = _.find(filterData, function (o) {
      return o.formId == self._publicService.activeFormId;
    });
    if (_.isUndefined(data)) {
      this.pushRadiologyTestData(defaultRadiologyTestData);
      return defaultRadiologyTestData;
    } else {
      return data.data;
    }
  }

  pushRadiologyTestData(data) {
    const obj: IFormData = {
      formId: this._publicService.activeFormId,
      data: data
    };
    this.radiologyTestInputs.push(obj);
  }

}
