import { environment } from './../../../environments/environment';
import { IdiagnosisMasterList } from './../../public/models/idiagnosis-master-list.model';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import * as  _ from 'lodash';
import { PublicService } from './public.service';
import { IFormData } from './prescription.service';
import { ConsultationService } from './consultation.service';

@Injectable({
  providedIn: 'root'
})
export class DiagnosisService {

  defaultDiagnosisObj = { // diagnosisInput
    name: null,
    remarks: null,
    id: null,
    isIcd: 0,
    isPrimary: 0,
    description: null,
    icdCode: null,
    nameOld: null
  };
  diagnosisPrescriptions: any[] = [];
  diagnosisMasterList: any[] = [];
  diagnosisInputs: IFormData[] = [];

  constructor(
    private http: HttpClient,
    public _publicService: PublicService,
    private _consultationService: ConsultationService
  ) { }

  getDiagnosisDefaultObj(): Observable<any> {
    const reqUrl = environment.STATIC_JSON_URL + 'diagnosis.json';
    return this.http.get(reqUrl).pipe(
      map((res: any) => res.diagnosisDefaultObject)
    );
  }

  // getAllDiagnosisMasterList(): Observable<any> {
  //   const reqUrl = environment.STATIC_JSON_URL + 'diagnosis.json';
  //   if (this.diagnosisMasterList.length > 0) {
  //     return of(this.diagnosisMasterList);
  //   } else {
  //     return this.http.get(reqUrl).pipe(
  //       map((res: any) => res.data)
  //     );
  //   }
  // }

  // API: medicine/get_prescription_by_diagnosis_id. Method: POST.
  getDiagnosisPrescription(diagnosisId, icd_code): Observable<any> {
    diagnosisId = diagnosisId ? diagnosisId : '';
    icd_code = icd_code ? icd_code : '';
    const url = environment.EMR_BaseURL + '/medicine/get_prescription_by_diagnosis_id';
    const params = {
      diagnosis_id: diagnosisId,
      icd_code: icd_code
    };

    // call method here.
    return this.http.post(url, params).pipe(
      map((res: any) => {
        return res.data;
      })
    );
  }

  // API Name: medicine/delete_prescription_for_diagnosis. Method: POST
  deletePrescriptionByDiagnosisId(diagnosisId, setId, icd_code): Observable<any> {
    diagnosisId = diagnosisId || '';
    icd_code = icd_code || '';
    const url = environment.EMR_BaseURL + '/medicine/delete_prescription_for_diagnosis';
    const params = {
      diagnosis_id: diagnosisId,
      set_id: setId,
      icd_code: icd_code
    };

    return this.http.post(url, params).pipe(
      map((res: any) => {
        return res.data;
      })
    );
  }

  addMedicineSaveOpd(medicineDetails): Observable<any> {
    const url = environment.STATIC_JSON_URL + '/medicine/addMedicineOpdSave';
    let returnObservable;
    // check medicine name already exists in server
    const data = [];
    this.checkForMedicineAlreadyExists(medicineDetails).subscribe(existingMedicine => {
      if (existingMedicine && existingMedicine !== undefined) {
        medicineDetails.medicineId = existingMedicine.id;
        returnObservable = { data: existingMedicine.id, msg: 'already exists' };
      } else if (medicineDetails.medicineId === '') {
        // HttpService.enterprisePost(url, medicineDetails).then(function (data) {
        //   def.resolve({data:data.data, msg : 'new medicine added'});
        // }, function (error) {
        //   def.reject(error);
        // });
        // --------NON API RESPONSE----------
        returnObservable = { data: new Date().getTime(), msg: 'new medicine added' };
      }
    });
    return of(returnObservable);
  }

  checkForMedicineAlreadyExists(medicineDetails): Observable<any> {
    let existingMedicine;
    this._publicService.getMedicineNamesByMedType(medicineDetails).subscribe(response => {
      existingMedicine = _.find(response, function (o) {
        return o.MedicineTypeID === medicineDetails.medicineType
          && (o.Name == null || (o.Name === undefined) ? '' : (o.Name).toLowerCase()) === medicineDetails.medicineName.toLowerCase();
      });
      // called because on load medicines were blank
    });
    return of(existingMedicine);
  }

  setPrescription(diagnosisId, fontId, prescription, icdCode): Observable<any> {
    icdCode = icdCode ? icdCode : '';
    diagnosisId = diagnosisId ? diagnosisId : '';
    const url = environment.STATIC_JSON_URL + '/medicine/set_diagnosis_prescription';
    const params = {
      diagnosis_id: diagnosisId,
      prescription: prescription,
      font_id: fontId,
      icd_code: icdCode
    };
    // return HttpService.enterprisePost(url, params);
    // Insert in Get Prescription array.
    // ---------NON API RESPONSE-----------
    this.pushInDiagnosisPrescription(diagnosisId, fontId, prescription, icdCode);
    const res = { error: '0', msg: 'Prescription Added' };
    return of(res);
  }

  addDiagnosis(diagnosisName): Observable<any> {
    const url = environment.STATIC_JSON_URL + '/masterdata/addDiagnosis';
    const params = {
      'diagnosisName': diagnosisName
    };
    // return from API.

    // ---------------Non API Response--------------
    // Insert in diagnosis Input.
    // newDiagnosisObject = Object.assign({}, defaultDiagnosisObj);
    return of(new Date().getTime());
  }

  // setMasterObjectDiagnosis(diagnosisObject): void {
  //   var diagnosisList = this.getPopulatedData(diagnosisMaster);
  //   updateRecord.name = updateRecord.Name;
  //   diagnosisList.push(updateRecord);
  //   //diagnosisMaster.diagnosisList.push(updateRecord);
  // }

  // getDiagnosisData(): Observable<any> {
  //   const self = this;
  //   const reqUrl = environment.STATIC_JSON_URL + 'diagnosis.json';
  //   return this.http.get(reqUrl).pipe(
  //     map((res: any) => {
  //       if (res.patient_diagnosis.length > 0) {
  //         self.diagnosisInputs = res.patient_diagnosis;
  //       } else if (self.diagnosisInputs.length == 0) {
  //         self.diagnosisInputs.push(defaultDiagnosisObj);
  //       }
  //       return self.diagnosisInputs;
  //     })
  //   );
  // }

  getDiagnosisData(): Observable<any> {
    const patientId = this._consultationService.getPatientObj('patientId');
    let diagnosisInputs;
    const self = this;
    const reqUrl = environment.STATIC_JSON_URL + 'diagnosis.json';
    diagnosisInputs = this._consultationService.getConsultationFormDataByKey(patientId, 'patient_diagnosis');
    if (!_.isEmpty(diagnosisInputs)) {
      return of(diagnosisInputs);
    } else {
      const defaultDiagnosisObj = _.cloneDeep([this.defaultDiagnosisObj]);
      diagnosisInputs = this._consultationService.setConsultationFormData(patientId, 'patient_diagnosis', defaultDiagnosisObj);
      return of(diagnosisInputs);
    }
  }

  pushInDiagnosisPrescription(diagnosisId, fontId, prescription, icdCode): void {
    const newDPArray = [];
    const self = this;
    let setId = (self.diagnosisPrescriptions.length > 0) ? (+self.diagnosisPrescriptions[0].set_id + 1) : 1;
    prescription.forEach(function (value) {

      const setDataArray = [];
      const setData = {
        diagnosis_id: null,
        icd_code: icdCode,
        medicine_id: value.medicineId,
        MorningA: '',
        MorningB: '',
        LunchB: '',
        LunchA: '',
        DinnerB: '',
        DinnerA: '',
        Days: '',
        Dosage: '',
        Instruction: value.Instruction,
        FontId: value.selectedLanguage.id,
        Prescription_count: '1',
        Freq: '',
        Quantity: '1',
        dose_unit: null,
        sig: '',
        route: '',
        genericFreq: null,
        genericDose: null,
        generic_duration: null,
        genericRemarks: null,
        dose_view_type: value.dose_view_type,
        FreqSchedule: '',
        genric_name: null,
        medicineName: value.medicineName,
        medicineId: new Date().getTime(),
        medicineTypeName: 'SYRUP',
        medicineTypeId: value.medicineType,
        ShortName: value.ShortName,
        Morning: null,
        Lunch: null,
        Dinner: null,
        dosageUnit: value.dosageUnit,
        genericDuration: value.genericDuration
      };
      setDataArray.push(setData);
      // set prev set_data:
      if (self.diagnosisPrescriptions.length > 0) {
        self.diagnosisPrescriptions[0].set_data.forEach(function (setDataValue) {
          setDataArray.push(setDataValue);
        });
      }
      newDPArray.unshift({ set_id: setId, set_data: setDataArray });
      setId++;
    });
    self.diagnosisPrescriptions = newDPArray;
  }

  // setDiagnosisData(formData): void {
  //   this.diagnosisInputs = formData.diagnosisListArray;
  // }

  // setDiagnosisData(formData): void {
  //   const self = this;
  //   if (formData.length <= 0) {
  //     const indx = _.findIndex(this.diagnosisInputs, o => o.formId == this._publicService.activeFormId);
  //     if (indx != -1) { this.diagnosisInputs.splice(indx, 1); }
  //   } else {
  //     const index = _.findIndex(this.diagnosisInputs, (o) => {
  //       return o.formId == this._publicService.activeFormId;
  //     });
  //     if (index == -1) {
  //       this.pushDiagnosisData(formData);
  //     } else {
  //       this.diagnosisInputs[index].data = formData;
  //     }
  //   }
  // }

  setDiagnosisData(formData, mode, indx?): void {
    const patientId = this._consultationService.getPatientObj('patientId');
    let diagnosisData;
    if (mode == 'add' || mode == 'update') {
      diagnosisData = this._consultationService.setConsultationFormData(patientId, 'patient_diagnosis', formData, mode);
      if (diagnosisData.length > 1) {
        _.remove(diagnosisData, function (obj) {
          return obj.name == null;
        });
      }
    } else {
      // delete mode
      diagnosisData = this._consultationService.getConsultationFormDataByKey(patientId, 'patient_diagnosis');
      diagnosisData.splice(indx, 1);
    }

    // switch (mode) {
    //   case 'add': // if data is object
    //     diagnosisData = this._consultationService.setConsultationFormData(patientId, 'patient_diagnosis', formData, mode );
    //     if (diagnosisData.length > 1) {
    //       _.remove(this.diagnosisInputs[formIndx].data, function (obj) {
    //         return obj.diagnosisName == '';
    //       });
    //     }
    //     break;
    //   case 'update': // if you have array then direct update the value of array
    //     if (formIndx == -1) {
    //       this.pushDiagnosisData(formData);
    //     } else {
    //       this.diagnosisInputs[formIndx].data = formData;
    //       if (this.diagnosisInputs[formIndx].data.length > 1) {
    //         _.remove(this.diagnosisInputs[formIndx].data, function (obj) {
    //           return obj.diagnosisName == '';
    //         });
    //       }
    //     }
    //     break;
    //   case 'delete': // delete the purticular data
    //     if (formIndx != -1) {
    //       this.diagnosisInputs[formIndx].data.splice(indx, 1);
    //     }
    //     break;
    // }

    // const self = this;
    // if (formData.length <= 0) {
    //   const indx = _.findIndex(this.diagnosisInputs, o => o.formId == this._publicService.activeFormId);
    //   if (indx != -1) { this.diagnosisInputs.splice(indx, 1); }
    // } else {
    //   const index = _.findIndex(this.diagnosisInputs, (o) => {
    //     return o.formId == this._publicService.activeFormId;
    //   });
    //   if (index == -1) {
    //     this.pushDiagnosisData(formData);
    //   } else {
    //     this.diagnosisInputs[index].data = formData;
    //   }
    // }
  }

  getDiagnosisSuggestionListOnLoad(pageNo, limit): Observable<any> {
    const reqUrl = environment.EMR_BaseURL + '/patient/getDiagnosisSuggestionListOnLoad';
    const params = {
      'page_no': +pageNo || 1,
      'limit': limit
    };
    return this.http.post(reqUrl, params).pipe(
      map((res: any) => {
        const result = res.data;
        // name key for suggestion list
        _.map(result.favourites, function (diag) { diag.name = diag.Name; });
        _.map(result.others, function (diag) { diag.name = diag.Name; });
        _.map(result.frequently_used, function (diag) { diag.name = diag.Name; });
        return { data: result, search_text: '', page_no: params.page_no };
      })
    );
  }

  getAllDiagnosisTypesWithPagination(page_no, limit, search_text, strict_match, is_favourite, max_use_count?): Observable<any> {
    const reqUrl = environment.EMR_BaseURL + '/patient/getAllDiagnosisTypesWithPagination';
    const params = {
      page_no: +page_no || 1,
      limit: limit,
      search_text: search_text || '',
      strict_match: !_.isUndefined(strict_match) ? strict_match : 0,
      is_favourite: !_.isUndefined(is_favourite) ? is_favourite : -1,
      max_use_count: !_.isUndefined(max_use_count) ? max_use_count : 0
    };
    return this.http.post(reqUrl, params).pipe(
      map((res: any) => {
        // const result = res.data;
        const diagMasterList: Array<IdiagnosisMasterList> = [];
        res.data.forEach(element => {
          const _IdiagnosisMasterList = new IdiagnosisMasterList();
          if (_IdiagnosisMasterList.isObjectValid(element)) {
            _IdiagnosisMasterList.generateObject(element);
            diagMasterList.push(_.cloneDeep(_IdiagnosisMasterList));
          }
        });
        return { data: diagMasterList, search_text: params.search_text, page_no: params.page_no };
      })
    );
  }

  getAllDiagnosisList(param): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '​/DiagnosisMaster​/GetDiagnosisMaster';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        // const result = res.data;
        const diagMasterList: Array<IdiagnosisMasterList> = [];
        res.data.forEach(element => {
          const diagnosisMasterList = new IdiagnosisMasterList();
          if (diagnosisMasterList.isObjectValid(element)) {
            diagnosisMasterList.generateObject(element);
            diagMasterList.push(_.cloneDeep(diagnosisMasterList));
          }
        });
        return { data: diagMasterList, search_text: param.search_keyword, page_no: param.page_number };
      })
    );
  }

  getDiagnosisListBySearchKeyword(param): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/DiagnosisMaster/GetDiagnosisBySearchKeyword?search_keyword=' + param.search_keyword;
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        // const result = res.data;
        const diagMasterList: Array<IdiagnosisMasterList> = [];
        res.data.forEach(element => {
          const diagnosisMasterList = new IdiagnosisMasterList();
          if (diagnosisMasterList.isObjectValid(element)) {
            diagnosisMasterList.generateObject(element);
            diagMasterList.push(_.cloneDeep(diagnosisMasterList));
          }
        });
        return { data: diagMasterList, search_text: param.search_keyword };
      })
    );
  }

  getDiagnosisSuggestionList(params): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/DiagnosisMaster/GetDiagnosisSuggestionList';
    return this.http.post(reqUrl, params).pipe(map((res: any) => {
      const result = res.data;
      const diagMasterList: Array<IdiagnosisMasterList> = [];
      _.map(result, (val, key) => {
        const diagnosisMasterList = new IdiagnosisMasterList();
        if (diagnosisMasterList.isObjectValid(val)) {
          diagnosisMasterList.generateObject(val);
          diagMasterList.push(_.cloneDeep(diagnosisMasterList));
        }
      });
      return { diagnosis_data: diagMasterList, total_count: result.length + result.length, search_text: params.search_keyword };
    }), catchError(
      (error) => {
        return throwError('error');
      }
    ));
  }

  addDiagnosisData(diagnosis): Observable<any> {
    const params = {
      id: 0,
      diagnosis_name: diagnosis,
      description: '',
      is_icd_code: true,
      is_active: true
    };
    const reqUrl = environment.dashboardBaseURL + '/DiagnosisMaster/SaveDiagnosisData';
    return this.http.post(reqUrl, params).pipe(map((res: any) => {
      return res;
    }), catchError(
      (error) => {
        return throwError('error');
      }
    ));
  }
}
