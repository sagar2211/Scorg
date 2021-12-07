import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import { PublicService } from './public.service';
import { ConsultationService } from './consultation.service';
import { environment } from 'src/environments/environment';
import { IAllergyTypes } from './../models/iallergy';
import { IFormData } from './../models/iFormData';

@Injectable({
  providedIn: 'root'
})
export class AllergiesService {
  // allergiesData: any = {};
  allergiesFormData: IFormData[] = [];
  allergyTypes = [];
  allergyDefaultObj = {
    isAllergySelected: 'YES',
    allergiesListFrm: [{
      type: null,
      medicineObject: {},
      remark: null,
      name: null,
      medicine: null,
    }]
  };

  constructor(
    private http: HttpClient,
    private publicService: PublicService,
    private consultationService: ConsultationService
  ) { }

  getDefaultObj(): Observable<any> {
    const reqUrl = environment.STATIC_JSON_URL + 'allergies.json';
    return this.http.get(reqUrl).pipe(
      map((res: any) => res.defaultObj)
    );
  }

  // getMedicinesList(): Observable<IMedicineList[]> {
  //   const reqUrl = environment.STATIC_JSON_URL + 'allergies.json';
  //   return this.http.get(reqUrl).pipe(
  //     map((res: any) => res.medicineList)
  //   );
  // }

  // getMedicinesByType(reqParams): Observable<IMedicineList[]> {
  //   const reqUrl = environment.STATIC_JSON_URL + 'allergies.json';
  //   return this.http.get(reqUrl).pipe(
  //     map((res: any) => {
  //       const data = !reqParams.medicine_type ? res.medicineList : _.filter(res.medicineList, (ml) => reqParams.medicine_type === +ml.MedicineTypeID);
  //       return data;
  //     })
  //   );
  // }

  getAllergyTypes(searchText?): Observable<IAllergyTypes[]> {
    if (this.allergyTypes.length) {
      if (searchText && searchText.length > 2) {
        const filteredData =  _.filter(this.allergyTypes, (v) => {
          return _.includes((v.name.toLowerCase()), searchText.toLowerCase());
        });
        return of(filteredData);
      } else {
        return of(this.allergyTypes);
      }
    }
    const reqUrl = environment.dashboardBaseURL + '/AllergyType/GetAllergyTypeList?NoOfRecords=10';
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        if (res.Allergy_Type_List.length) {
          _.map(res.Allergy_Type_List, (val, key) => {
            const _IAllergyTypes = new IAllergyTypes();
            if (_IAllergyTypes.isObjectValid(val)) {
              // val.AllergyTypeId = val.AllergyTypeId.toString();
              _IAllergyTypes.generateObject(val);
              this.allergyTypes.push(_.cloneDeep(_IAllergyTypes));
            }
          });
        } else {
          this.allergyTypes = [];
        }
        return this.allergyTypes;
      })
    );
  }

  // setAllergies(data) {
  //   this.allergiesData = data;
  // }

  // getAllergiesData(): Observable<any> {
  //   const self = this;
  //   const reqUrl = environment.STATIC_JSON_URL + 'allergies.json';
  //   if (this.allergiesFormData.length > 0 ) {
  //     return of(this.filterData(this.allergiesFormData));
  //   } else {
  //     return this.http.get(reqUrl).pipe(
  //       map((res: any) => {
  //         return this.filterData(res.allergiesData);
  //       })
  //     );
  //   }
  // }

  getAllergiesData(patientId): Observable<any> {
    const self = this;
    const reqUrl = environment.STATIC_JSON_URL + 'allergies.json';
    // get allergies data
    const allergiesData = this.consultationService.getConsultationFormDataByKey(patientId, 'allergies');
    if (_.isEmpty(allergiesData)) {
      const data = Object.assign(this.allergyDefaultObj);
      return of(this.consultationService.setConsultationFormData(patientId, 'allergies', data));
    } else {
      return of(allergiesData);
    }
  }

  // check if records is exist in formData
  checkIfDataExist(): boolean {
    const indx = _.findIndex(this.allergiesFormData, x => x.formId == this.publicService.activeFormId);
    return indx != -1 ? true : false;
  }

  mergeData(data) {
    if (data.length <= 0) {
      data = Object.assign(this.allergyDefaultObj);
    }
    const formIndx = _.findIndex(this.allergiesFormData, x => x.formId == this.publicService.activeFormId);
    if (formIndx != -1) {
      this.allergiesFormData[formIndx].data = data;
    } else {
      this.allergiesFormData.push({
        formId: this.publicService.activeFormId,
        data: data
      });
    }
  }

  setAllergiesInputs(formData) {
    const self = this;
    const index = _.findIndex(self.allergiesFormData, (o) => o.formId == this.publicService.activeFormId);
    if (index == -1) {
      this.pushAllergiesData(formData);
    } else {
      this.allergiesFormData[index].data = formData;
    }
  }

  filterData(filterData): any {
    const data = _.find(filterData, (o) => o.formId == this.publicService.activeFormId);
    if (_.isUndefined(data)) {
      this.pushAllergiesData(this.allergyDefaultObj);
      return this.allergyDefaultObj;
    } else {
      return data.data;
    }
  }

  pushAllergiesData(data) {
    const obj: IFormData = {
      formId: this.publicService.activeFormId,
      data: data
    };
    this.allergiesFormData.push(obj);
  }

}
