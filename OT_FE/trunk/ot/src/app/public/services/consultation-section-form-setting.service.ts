
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import * as _ from 'lodash';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConsultationSectionFormSettingService {
  componentData: any;
  consultationComponentForms: any[] = [];  // -- store all forms list by hispital Id
  allExamHeadListFormData = [];
  allTagModules = [];
  examinationHeadList = [];
  allFaqSectionFormData = [];
  allForms = [];
  hospitalDetails: any;
  masterCopyOfAllForms: any[] = [];
  localFormData = [];
  callToApi = true;
  faqSectionList = [];
  formAddUpdateData = {
    action: 'create',
    formObj: null
  };
  constructor(
    private http: HttpClient
  ) { }

  setComponentData(component) {
    this.componentData = component;
  }

  getComponentData() {
    return this.componentData;
  }

  setFormsData(formData, action?, form?): Observable<any> {
    if (!_.isArray(this.masterCopyOfAllForms)) {
      this.masterCopyOfAllForms = [];
    }
    if ((action && action === 'update') && _.isObject(form)) {
      _.map(this.masterCopyOfAllForms, (data, i) => {
        if (data.formId === form.formId) {
          this.masterCopyOfAllForms[i] = formData;
        }
      });
    } else {
      this.masterCopyOfAllForms.push(formData);
    }
    console.log('forms array: ');
    console.log(this.masterCopyOfAllForms);

    return of(this.masterCopyOfAllForms);
  }

  getFormsData(): Observable<any> {
    return of(this.consultationComponentForms);
  }

  // returns sub sections (for faq sections, exam label). If not form id, return all master llst. else return filtered result.
  // After API call, data stored in local variables.
  getSubSectionsList(paramsObj): Observable<any> {
    let localArray = this[paramsObj.variableKey];
    const requestURL = paramsObj.requestURL;
    const resultKey = paramsObj.resultKey;
    const formKey = paramsObj.formKey;
    const formId = paramsObj.formId;
    const filterFlag = paramsObj.filterFlag;
    const requestParams = paramsObj.params;
    let apiResult;

    if (formId === '') {
      if (localArray.length) {
        return of(_.cloneDeep(localArray));
      }

      if (formKey === 'examination_heads') {
        return this.http.get(requestURL).pipe(
          map((result: any) => {
            apiResult = result.data;
            localArray = apiResult;
            this[paramsObj.variableKey] = localArray;
            return _.cloneDeep(localArray);
          }));
      } else if (formKey === 'faq_section') {
        return this.http.post(requestURL, requestParams).pipe(
          map((result: any) => {
            apiResult = result.data;
            localArray = apiResult;
            this[paramsObj.variableKey] = localArray;
            return _.cloneDeep(localArray);
          }));
      }
    } else {
      const formsData = _.find(this.localFormData, function (o) {
        return o.formId === formId && !_.isUndefined(o[formKey]);
      });
      if (!_.isUndefined(formsData)) {
        if (filterFlag) {
          return of(_.cloneDeep(this.filterLocalFormsByKey(formsData[formKey], 'form_status', true)));
        }
        return of(_.cloneDeep(formsData[formKey]));
      }

      if (formKey === 'examination_heads') {
        return this.http.get(requestURL).pipe(
          map((result: any) => {
            apiResult = result.data;
            localArray = apiResult;

            this.storeLocalFormDataByFormId(formId, formKey, apiResult);
            if (filterFlag) {
              return _.cloneDeep(this.filterLocalFormsByKey(result.data, 'form_status', true));
            }
            return _.cloneDeep(result.data);
          }));
      }

      if (formKey === 'faq_section') {
        return this.http.post(requestURL, requestParams).pipe(
          map((result: any) => {
            // apiResult = result.data;
            let res = [];
            // _.forEach(result.data, (o) => {
            //   if (o.template_id == paramsObj.tempSectionId) {
            //     res.push(o);
            //   }
            // });
            res = result.data;
            apiResult = res;
            if (formId > 0) {
              this.storeLocalFormDataByFormId(formId, formKey, apiResult);
            }
            if (filterFlag) {
              return _.cloneDeep(this.filterLocalFormsByKey(result.data, 'form_status', true));
            }
            return _.cloneDeep(res);
          }));
      }
    }
  }

  getExaminationHeadsList(formId, filter?): Observable<any> {
    const params = {
      variableKey: 'examinationHeadList',
      requestURL: environment.EMR_BaseURL + '/PageSetting/getExaminationHeads',
      resultKey: 'examinationHeadsListByFormId',
      formKey: 'examination_heads',
      formId: formId,
      filterFlag: filter
    };
    return this.getSubSectionsList(params);
  }

  setTagModule(data) {
    this.allTagModules = data;
  }

  getActiveFormSettingByKey(key, formId): any {
    let inputData = [];
    let inputKey;
    if (key === 'faq_section') {
      inputData = this.allFaqSectionFormData;
      inputKey = 'faqSectionList';
    }
    if (key === 'examination_heads') {
      inputData = this.allExamHeadListFormData;
      inputKey = 'examinationHeadsList';
    }

    const filteredResult = _.find(inputData, function (o) {
      return o.formId === formId;
    });
    return (!_.isEmpty(filteredResult)) ? filteredResult[inputKey] : [];
  }

  getAllFormsList(reqParams): Observable<any> {
    // if (!this.callToApi) { // call when data is <=200
    //   const filterVal = this.filteredOnMasterFrms(reqParams);
    //   return of(filterVal);
    // } else {
    return this.http.get(environment.STATIC_JSON_URL + 'forms_list.json', reqParams).pipe(
      map((result: any) => {
        // this.callToApi = this.masterCopyOfAllForms.length <= 200 ? false : true;
        return this.masterCopyOfAllForms = result;
      })
    );
    // }
  }

  // -- check if the search parameters matches the conditions and return data against it
  // filteredOnMasterFrms(reqParams): any[] {
  //   return this.masterCopyOfAllForms.filter(x => {
  //     const dep = reqParams.department.length <= 0 ? true : reqParams.department.some(d => x.department === d.departmentId);
  //     const speciality = reqParams.speciality.length <= 0 ? true : reqParams.speciality.some(sp => x.speciality === sp.specialityId);
  //     const doc = reqParams.doctor.length <= 0 ? true : reqParams.doctor.some(dc => x.user === dc.doctorId);
  //     const role = x.role === reqParams.role;
  //     const formType = x.formType === reqParams.formType;
  //     const searcTxt = !reqParams.searchText ? true : (x.formName.toLowerCase().indexOf(reqParams.searchText.toLowerCase())) > -1;
  //     return (((reqParams.hospital === x.hospital) && (dep) && (speciality) && (role) && (doc)) && (searcTxt) && (formType));
  //   });
  // }

  getAllDoctorForms(filterFlag, docId?, speciality?, department?, role?, episodeType?): Observable<any> {
    if (_.isArray(this.consultationComponentForms) && this.consultationComponentForms.length) {
      if (!filterFlag) {
        return of(this.consultationComponentForms);
      }
      return of(this.filterFormsList(this.consultationComponentForms, docId, speciality, department, role, episodeType));
    }
    return this.http.get(environment.STATIC_JSON_URL + 'forms_list.json').pipe(
      map((result: any) => {
        this.consultationComponentForms = result;
        if (!filterFlag) {
          return this.consultationComponentForms;
        }
        return this.filterFormsList(this.consultationComponentForms, docId, speciality, department, role, episodeType);
      }));
  }

  getHospitalDetails(hospitalId): Observable<any> {
    if (!_.isEmpty(this.hospitalDetails)) {
      return of(this.hospitalDetails);
    }
    return this.http.get(environment.STATIC_JSON_URL + 'hospital_details.json').pipe(
      map((result: any) => {
        this.hospitalDetails = result;
        return this.hospitalDetails;
      }));
  }

  filterFormsList(formsList, docId, speciality, department, role, episodeType) {
    let data;
    data = _.filter(formsList, (o) => {
      return ((o.user === docId && o.speciality === speciality && o.department === department && o.role === role && o.formType === episodeType) ||
        (o.user === '' && o.speciality === speciality && o.department === department && o.role === role && o.formType === episodeType) ||
        (o.user === '' && o.speciality === '' && o.department === department && o.role === role && o.formType === episodeType) ||
        (o.user === '' && o.speciality === '' && o.department === '' && o.role === role && o.formType === episodeType)
      );
    });
    return data;
  }

  storeLocalFormDataByFormId(formId, key, data) {
    const formsDataObj = _.find(this.localFormData, function (o) {
      return o.formId === formId;
    });

    if (_.isUndefined(formsDataObj)) {
      const localFormObj = {
        formId: formId
      };
      localFormObj[key] = data;
      this.localFormData.push(localFormObj);
    } else {
      formsDataObj[key] = data;
    }
  }

  filterLocalFormsByKey(data, filterKey, value) {
    return _.filter(data, function (o) {
      return o[filterKey] === value;
    });
  }

  // -- delete masterForms by formId
  deleteFormByFormId(formId): Observable<any> {
    // -- call to API
    return of();
  }

  getFaqSectionList(formId, userId, filter?, templateIds?) {
    // const reqUrl = (tempSectionId) ? environment.STATIC_JSON_URL + 'all_faq_sections.json' : environment.EMR_BaseURL + '/PageSetting/getAllSectionList';
    // const reqUrl = environment.STATIC_JSON_URL + 'all_faq_sections.json';
    const reqUrl = environment.dashboardBaseURL + '/Template/GetTemplateList';
    const params = {
      variableKey: 'faqSectionList',
      // requestURL: environment.EMR_BaseURL + '/PageSetting/getAllSectionList',
      requestURL: reqUrl,
      formKey: 'faq_section',
      formId: formId,
      filterFlag: filter,
      params: {
        "speciality_id": 1,
        "service_type_id": 2,
        "search_keyword": "",
        "is_generic": null,
        "is_active": true,
        "sort_order": "string",
        "sort_column": "string",
        "current_page": 1,
        "limit": 10
      }
    };
    // if (tempSectionId) {
    //   params['tempSectionId'] = tempSectionId;
    // }
    return this.getSubSectionsList(params);
  }

  getSetFormData(method, action?, formobj?) {
    if (method === 'set') {
      this.formAddUpdateData.action = action;
      this.formAddUpdateData.formObj = formobj;
    } else if (method === 'get') {
      return this.formAddUpdateData;
    }
  }

}

