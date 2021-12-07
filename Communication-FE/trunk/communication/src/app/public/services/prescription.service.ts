import { environment } from './../../../environments/environment';
import { MedicineSig } from './../models/medicine-sig';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import { MedicineMasterData } from '../models/medicine-master-data';
import { Constants } from './../../config/constants';

export class IFormData {
  formId: number;
  data: any;
}

@Injectable({
  providedIn: 'root'
})
export class PrescriptionService {
  genericeMasterData: { data: MedicineMasterData, docId: number }[] = [];
  instructionsMaster: any[] = [];
  selectedLanguage: any = {};
  sigList: any[] = [];
  routeList: any[] = [];
  doseList: any[] = [];
  doseUnitList: any[] = [];
  routes = [];
  doseUnit = [];
  constructor(
    private http: HttpClient,
  ) { }

  getAllMedicineRelatedMastersData(docId): Observable<MedicineMasterData[]> {
    const reqUrl = environment.EMR_BaseURL + '/medicine/getAllMedicineRelatedMastersData';
    if (!_.isEmpty(this.getMasterData(this.genericeMasterData, docId))) {
      return of(this.getMasterData(this.genericeMasterData, docId)[0]);
    }
    return this.http.post(reqUrl, docId).pipe(
      map((res: any) => {
        res.data['dose'].shift();
        res.data['route'] = this.routes;
        res.data['doseUnit'] = this.doseUnit;
        res.data.sig = this.generateSigObject(res.data.sig);
        this.setMasterData(this.genericeMasterData, res.data, docId);
        return res.data;
      })
    );
  }

  // -- set master data
  setMasterData(masterVar, data, doc_Id?) {
    const docId = doc_Id ? doc_Id : JSON.parse(localStorage.getItem('globals')).userParentId;
    let indx = _.findIndex(masterVar, mv => mv.docId == docId);
    if (indx == -1) {
      masterVar.push({
        data: [],
        docId: docId,
      });
      indx = masterVar.length - 1;
    }
    if (_.isArray(data)) {
      masterVar[indx].data = data;
    } else {
      masterVar[indx].data.push(data);
    }
  }

  // -- get master data
  getMasterData(masterVar, doc_id?): any {
    const docId = doc_id ? doc_id : JSON.parse(localStorage.getItem('globals')).userParentId;
    let indx = _.findIndex(masterVar, mv => mv.docId == docId);
    if (indx == -1) {
      masterVar.push({
        data: [],
        docId: docId,
      });
      indx = masterVar.length - 1;
    }
    return masterVar[indx].data;
  }

  deletePrescriptionByDiagnosisId(diagnosisId, setId, icd_code): Observable<any> {
    diagnosisId = diagnosisId || '';
    icd_code = icd_code || '';
    const url = environment.STATIC_JSON_URL + '/medicine/delete_prescription_for_diagnosis';
    const params = {
      diagnosis_id: diagnosisId,
      set_id: setId,
      icd_code: icd_code
    };
    return of('Deleted');
  }

  getMedicineInstructions(): Observable<any> {
    const reqUrl = environment.EMR_BaseURL + '/patient/get_suggestions_select_box';
    if (!_.isEmpty(this.getMasterData(this.instructionsMaster))) {
      return of(this.getMasterData(this.instructionsMaster));
    }
    const params = {
      keyInput: '',
      medicineID: '',
      fontID: ''
    };
    return this.http.post(reqUrl, params).pipe(
      map((res: any) => {
        this.setMasterData(this.instructionsMaster, res.data.medicine_instruction_suggestions);
        return this.getMasterData(this.instructionsMaster);
      })
    );
  }

  // --get all language list
  getLanguageList(): Observable<any> {
    return of(Constants.LANGUAGE_LIST);
  }
  // --get selected language
  getSelectedLanguage(): Observable<{ name: string, id: number }> {
    return of(this.selectedLanguage);
  }
  // --set language details
  setLanguageDetails(language: { name: string, id: number }): void {
    this.selectedLanguage = language;
  }

  getMedicineDetailsById(id): Observable<any> {
    const reqUrl = environment.EMR_BaseURL + '/medicine/get_medicine_detials_by_id/' + id;
    return this.http.get(reqUrl).pipe(
      map((r: any) => r.data)
    );
  }

  overwriteMedicineInstructions(reqParams): Observable<any> {
    const reqUrl = environment.EMR_BaseURL + '/patient/overwrite_medicine_instruction';
    return this.http.post(reqUrl, reqParams);
  }

  generateSigObject(array): Array<MedicineSig> {
    const temp = [];
    array.forEach(element => {
      const sig = new MedicineSig();
      sig.generateObject({ ...element });
      temp.push(sig);
    });
    return temp;
  }


  GetMedicineSigList(): Observable<any> {
    if (this.sigList.length) {
      return of(this.sigList);
    }
    const reqUrl = `${environment.dashboardBaseURL}/MedicineSigMaster/GetMedicineSigList`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.sig.length > 0) {
        this.sigList = res.sig;
        return res.sig;
      } else {
        return [];
      }
    }));
  }

  GetMedicineRouteList(): Observable<any> {
    if (this.routeList.length) {
      return of(this.routeList);
    }
    const reqUrl = `${environment.dashboardBaseURL}/MedicineRouteMaster/GetMedicineRouteList`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.route.length > 0) {
        this.routeList = res.route;
        return res.route;
      } else {
        return [];
      }
    }));
  }

  GetMedicineDoseList(medicineTypeId): Observable<any> {
    if (this.doseList.length) {
      return of(this.doseList);
    }
    const reqUrl = `${environment.dashboardBaseURL}/MedicineDose/GetMedicineDoseList?MedicineTypeID=${medicineTypeId}`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.dose.length > 0) {
        this.doseList = res.dose;
        return res.dose;
      } else {
        return [];
      }
    }));
  }

  GetMedicineDoseUnitList(medicineTypeId): Observable<any> {
    if (this.doseUnitList.length) {
      return of(this.doseUnitList);
    }
    const reqUrl = `${environment.dashboardBaseURL}/MedicineDoseUnit/GetMedicineDoseUnitList?MedicineTypeID=${medicineTypeId}`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.doseUnit.length > 0) {
        const doseUnits = [];
        _.forEach(res.doseUnit, (o) => {
          const term = o.dose_unit;
          const re = new RegExp('^[a-zA-Z ]*$');
          // dont allow alphanumeric string, only alphabet string
          if (re.test(term)) {
            doseUnits.push(o);
          }
        });
        this.doseUnitList = doseUnits;
        return doseUnits;
      } else {
        return [];
      }
    }));
  }

  GetInstructionsByLanguage(reqParams): Observable<any> {
    return of(['instruction 1', 'instruction 2', 'instruction 3', 'कार्रवाई']);
  }

  getAdviceTemplateSuggestionList(reqParams): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Advice/GetAdviceSuggestionList`;
    return this.http.post(reqUrl, reqParams).pipe(
      map((r: any) => {
        if (r.status_code === 200 && r.status_message === 'Success') {
          return r.data;
        }
        return [];
      })
    );
  }

  saveAdviceTemplate(reqParams): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Advice/SaveAdviceTemplate`;
    return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success') {
        return res.data;
      }
      return 0;
    }));
  }

}
