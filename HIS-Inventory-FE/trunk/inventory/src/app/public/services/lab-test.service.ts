import {environment} from '../../../environments/environment';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {IFormData} from './prescription.service';
import {PublicService} from './public.service';
import * as _ from 'lodash';
import {ConsultationService} from './consultation.service';

export const defaultLabTestData = [{
  id: null,
  name: null,
  comment: null,
  date: null,
  headId: null
}];

@Injectable({
  providedIn: 'root'
})
export class LabTestService {
  defaultLabTestObj = {
    id: null,
    name: null,
    comment: null,
    date: null,
    headId: null
  };
  labTestInputs: IFormData[] = [];
  masterAllLabTestData: any[] = [];

  constructor(private http: HttpClient, private _publicService: PublicService, private _consultationService: ConsultationService) { }

  geLabTestDefaultObj(): Observable<any> {
    const reqUrl = environment.STATIC_JSON_URL + 'lab-test.json';
    return this.http.get(reqUrl).pipe(
      map((res: any) => res.defaultObj)
    );
  }

  // getAllLabTestDataByLimit(): Observable<any> {
  //   const reqUrl = environment.STATIC_JSON_URL + 'lab-test.json';
  //   return this.http.get(reqUrl).pipe(
  //     map((res: any) => {
  //       this.masterAllLabTestData =  _.map(res.getInvestigationDataByLimit, x => Object.assign(x)) ;
  //       return this.masterAllLabTestData;
  //     })
  //   );
  // }

  // get this data to load initial form values.
  getLabTestFormData(): Observable<any> {
    const patientId = this._consultationService.getPatientObj('patientId');
    const labTestData = this._consultationService.getConsultationFormDataByKey(patientId, 'investigation');
    if (labTestData && labTestData.length) {
      return of(labTestData);
    } else {
      // return this.http.get(reqUrl).pipe(
      //   map((res: any) => {
      //     return this.filterData(res.compTypeData);
      //   })
      // );
      // CALL TO API
      const defaultObj = _.cloneDeep(defaultLabTestData);
      return of(this._consultationService.setConsultationFormData(patientId, 'investigation', defaultObj));
    }
  }

  checkIfDataExist() {
    const indx = _.findIndex(this.labTestInputs, o => o.formId == this._publicService.activeFormId);
    return indx != -1 ? true : false;
  }

  // setLabTestData(formData) {
  //   const self = this;
  //   const index = _.findIndex(self.labTestInputs, function (o) {
  //     return o.formId == self._publicService.activeFormId;
  //   });
  //   if (index == -1) {
  //     this.pushLabTestData(formData);
  //   } else {
  //     this.labTestInputs[index].data = formData;
  //   }
  // }

  setLabTestData(formData, mode, indx?): void {
    const patientId = this._consultationService.getPatientObj('patientId');
    let labTestData;
    if (mode == 'add' || mode == 'update') {
      labTestData = this._consultationService.setConsultationFormData(patientId, 'investigation', formData, mode);
      if (labTestData.length > 1) {
        _.remove(labTestData, obj => {
          (obj.name == '' || obj.name == null);
        });
      }
    } else {
      // delete mode
      labTestData = this._consultationService.getConsultationFormDataByKey(patientId, 'investigation');
      labTestData.splice(indx, 1);
    }
  }

  // setLabTestData(formData, mode, indx?): void {
  //   const formIndx = _.findIndex(this.labTestInputs, (o) => {
  //     return o.formId == this._publicService.activeFormId;
  //   });
  //
  //   switch (mode) {
  //     case 'ADD': // if data is object
  //       if (formIndx != -1) {
  //         this.labTestInputs[formIndx].data.push(formData);
  //         if (this.labTestInputs[formIndx].data.length > 1) {
  //           _.remove(this.labTestInputs[formIndx].data, function (obj) {
  //             return obj.label == '';
  //           });
  //         }
  //       }
  //       break;
  //     case 'UPDATE': // if you have array then direct update the value of array
  //       if (formIndx == -1) {
  //         this.pushLabTestData(formData);
  //       } else {
  //         this.labTestInputs[formIndx].data = formData;
  //         if (this.labTestInputs[formIndx].data.length > 1) {
  //           _.remove(this.labTestInputs[formIndx].data, function (obj) {
  //             return obj.label == '';
  //           });
  //         }
  //       }
  //       break;
  //     case 'DELETE': // delete the purticular data
  //       if (formIndx != -1) {
  //         this.labTestInputs[formIndx].data.splice(indx, 1);
  //       }
  //       break;
  //   }
  // }

  filterData(filterData): any {
    const self = this;
    const data = _.filter(filterData, function (o) {
      return o.formId == self._publicService.activeFormId;
    });
    if (data.length == 0) {
      this.pushLabTestData(defaultLabTestData);
      return defaultLabTestData;
    } else {
      return data[0].data;
    }
  }

  pushLabTestData(data) {
    const obj: IFormData = {
      formId: this._publicService.activeFormId,
      data: data
    };
    this.labTestInputs.push(obj);
  }



}
