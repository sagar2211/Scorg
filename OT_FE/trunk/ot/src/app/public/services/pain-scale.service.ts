import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { IFormData } from '../models/iFormData';
import { ConsultationService } from './consultation.service';
import { PainScoreModel } from '../models/pain-score-model';

@Injectable({
  providedIn: 'root'
})
export class PainScaleService {
  formData: IFormData[] = [];
  // painScoreInputs = {
  //   pain_body_part: [],
  //   pain_associated_data: {
  //     comment: '',
  //     vacResult: false,
  //     dapResult: false,
  //     aisValue: '',
  //     completeModel: '',
  //     partialSensoryRight: '',
  //     partialSensoryLeft: '',
  //     partialMototRight: '',
  //     partialMototLeft: '',
  //     neurlogicalInjury: '',
  //     motorLeft: '',
  //     motorRight: '',
  //     sensoryRight: '',
  //     sensoryLeft: ''
  //   }
  // };
  painScaleObj = {
    'painReliefInput': null,
    'painScaleInput': null,
    'painScoreInputs': null
  };

  constructor(
    private consultationService: ConsultationService
  ) { }

  // getPainDetails(): Observable<any> {
  //   const self = this;
  //   const reqUrl = environment.STATIC_JSON_URL + 'prescription.json';
  //   if (this.checkIfDataExist()) {
  //     return of('form exist');
  //   } else {
  //     return this.http.get(reqUrl).pipe(map(res => {
  //       if (false) {
  //         this.setPainData(res);
  //       } else {
  //         self.painScaleObj.painScoreInputs = Object.assign({
  //           pain_body_part: [],
  //           pain_associated_data: {
  //             comment: '',
  //             vacResult: false,
  //             dapResult: false,
  //             aisValue: '',
  //             completeModel: '',
  //             partialSensoryRight: '',
  //             partialSensoryLeft: '',
  //             partialMototRight: '',
  //             partialMototLeft: '',
  //             neurlogicalInjury: '',
  //             motorLeft: '',
  //             motorRight: '',
  //             sensoryRight: '',
  //             sensoryLeft: ''
  //           }
  //         });
  //         this.setPainData(this.ngCopy(self.painScaleObj));
  //       }
  //       return 'loaded';
  //       })
  //     );
  //   }
  // }

  // setPainData(res): void {
  //   const index = _.findIndex(this.formData, (o)  => o.formId == this._publicService.activeFormId);
  //   const copyOfPainScaleObj = this.ngCopy(this.painScaleObj);
  //   if (index != -1) {
  //     this.formData[index].data = this.ngCopy(res);
  //   } else {
  //     copyOfPainScaleObj['painReliefInput'] = res.painReliefInput;
  //     copyOfPainScaleObj['painScaleInput'] = res.painScaleInput;
  //     copyOfPainScaleObj['painScoreInputs'] = res.painScoreInputs;
  //     const obj: IFormData = {
  //       formId: this._publicService.activeFormId,
  //       data: copyOfPainScaleObj
  //     };
  //     this.formData.push(obj);
  //   }
  // }

  // -- Get body part details by key
  getPainScaleObject(key): any {
    const patientId = this.consultationService.getPatientObj('patientId');
    const painRel = this.consultationService.getConsultationFormDataByKey(patientId, 'pain_relief');
    const painScal = this.consultationService.getConsultationFormDataByKey(patientId, 'pain_scale');
    const painScore = this.consultationService.getConsultationFormDataByKey(patientId, 'pain_score');
    this.painScaleObj['painReliefInput'] = painRel === false ? null : painRel;
    this.painScaleObj['painScaleInput'] = painScal === false ? null : painScal;
    // this.painScaleObj['painScoreInputs'] = painScore == false ? _.cloneDeep(this.painScoreInputs) : painScore;

    // get pain score object
    const painScoreModel = new PainScoreModel();
    if (painScore) {
      if (painScoreModel.isObjectValid(painScore)) {
        painScoreModel.generateObject(painScore);
        this.painScaleObj['painScoreInputs'] = painScoreModel;
      } else {
        this.painScaleObj['painScoreInputs'] = null;
      }
    } else {
      // generate empty object
      painScoreModel.generateObject(painScore, true);
      this.painScaleObj['painScoreInputs'] = painScoreModel;
    }
    return this.painScaleObj[key];
  }

  // -- set body part details by key
  setPainScaleObj(key, value) {
    const patientId = this.consultationService.getPatientObj('patientId');
    this.painScaleObj[key] = value;
    if ((key === 'painScaleInput') || (key === 'painReliefInput')) {
      this.consultationService.setConsultationFormData(patientId, key === 'painScaleInput' ? 'pain_scale' : 'pain_relief', value);
    }
  }

  // getPainScaleObject(key): any {
  //   const self = this;
  //   const reqUrl = environment.STATIC_JSON_URL + '';
  //   if (this.formData.length > 0) {
  //     const data = this.filterData(this.formData);
  //     return data[key];
  //   } else {
  //     // return this.http.get(reqUrl).pipe(
  //     //   map((res: any) => {
  //     //     return this.filterData(res.compTypeData);
  //     //   })
  //     // );

  //     // CALL TO API TO GET DATA.
  //     const apiResponse = [];
  //     const data = this.filterData(apiResponse);
  //     return data[key];
  //   }
  // }

}
