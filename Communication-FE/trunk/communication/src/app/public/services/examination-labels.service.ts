// import { environment } from './../../environments/environment';
import { environment } from '../../../environments/environment';
import { ConsultationSectionFormSettingService } from './consultation-section-form-setting.service';
import { Injectable } from '@angular/core';
import { of, Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import * as _ from 'lodash';
import { PublicService } from './public.service';
import { ConsultationService } from './consultation.service';
import { ExaminationTags } from '../models/examination-tags';
import { ExaminationType } from '../models/examination-type.model';
import { ServiceType } from '../models/service-type.model';
import { Speciality } from './../models/speciality.model';

@Injectable({
  providedIn: 'root'
})
export class ExaminationLabelsService {

  allTagModules: any;
  allExaminationHeadsList: any[] = [];
  allOpdTagInputs: any;
  allTagsHeadByModules: any;
  opdTagInputs: any;
  tagsHeadByModules: any;
  currentOpdTagInputs: any[] = [];
  opdDate: any = new Date();
  hospitalPatId = 2222;
  opdId = 1111;
  tagsInputs = [];
  defaultOpdTagsData = [{
    displayName: '',
    displayType: '',
    headKey: '',
    status: '',
    tagText: ''
  }];
  tagFilter: any;
  examHeadList = [];

  // for cache of Examination Label
  allExaminationLabelList = [];

  constructor(
    private http: HttpClient,
    private publicService: PublicService,
    private csTemplateSetting: ConsultationSectionFormSettingService,
    private consultationService: ConsultationService
  ) { }

  getTagsInputFormData(): Observable<any> {
    return this.csTemplateSetting.getExaminationHeadsList(this.publicService.activeFormId, false).pipe(
      map((examHeadList) => {
        this.examHeadList = examHeadList;
        const patientId = this.consultationService.getPatientObj('patientId');
        let examLabelCurrentFormData = this.consultationService.getConsultationFormDataByKey(patientId, 'examinationLabelLocalFormData');
        if (examLabelCurrentFormData) {
          return examLabelCurrentFormData;
        }
        // set current  form data format for exam label and save key.
        // get opd_tags key from exam label.
        let opdTags = this.consultationService.getConsultationFormDataByKey(patientId, 'opd_tags');
        if (_.isArray(opdTags) || !opdTags) {
          // filter data and set key.
          opdTags = this.getOpdTags(opdTags);
          this.consultationService.setConsultationFormData(patientId, 'opd_tags', opdTags);
        }

        // prepare data for exam component reactive form patch value.
        examLabelCurrentFormData = this.intTagsInputFormData(opdTags);
        this.consultationService.setConsultationFormData(patientId, 'examinationLabelLocalFormData', examLabelCurrentFormData);
        return examLabelCurrentFormData;
      })
    );
  }

  getOpdTagInputs(): Observable<any> {
    if (this.allOpdTagInputs !== undefined) {
      const filteredData = this.getFilteredDataByFormId(this.tagsInputs);
      return of(filteredData[0].opdTagInputs);
    } else {
      return this.http.get('./assets/JSON/examination-labels.json').pipe(
        map((result: any) => {
          this.allOpdTagInputs = result.opdTagInputsData;
          let filteredData = this.getFilteredDataByFormId(result.opdTagInputsData);
          filteredData = (filteredData.length) ? filteredData[0].opdTagInputs : [];
          this.allOpdTagInputs = filteredData;
          return this.allOpdTagInputs;
        })
      );
    }
  }

  // API: medsonit-be/masterdata/getTagsHeadByModule/opd
  getTagHeadsByTagModule(): Observable<any> {
    const self = this;
    // return this.getOpdTagsObject(this.csTemplateSetting.allTagModules);
    if (self.allTagModules !== undefined) {
      return of(_.cloneDeep(self.allTagModules));
      // const filteredData = this.getFilteredDataByFormId(this.tagsInputs);
      // return filteredData[0].tagsHeadByModules;
      // return this.allTagsHeadByModules;
    } else {
      return self.http.get(environment.EMR_BaseURL + '/masterdata/getTagsHeadByModule/opd').pipe(
        map((result: any) => {
          self.allTagModules = self.getOpdTagsObject(result.data);
          const allTags = Object.keys(self.allTagModules);
          _.forEach(allTags, (tagName) => {
            _.map(self.allTagModules[tagName], (o) => {
              o['name'] = o['tag_name'];
            });
          });
          return _.cloneDeep(self.allTagModules);
        })
      );
      // return this.http.get('./JSON/examination-labels.json').pipe(
      //   map((result: any) => {
      //     // return (this.tagsHeadByModules = result.tagsHeadByModules);
      //     this.allTagsHeadByModules = result.tagsHeadByModulesData;
      //     let filteredData = this.getFilteredDataByFormId(result.tagsHeadByModulesData);
      //     filteredData = (filteredData.length) ? filteredData[0].tagsHeadByModules : [];
      //     // this.pushTagsInputsData(filteredData, 'tagsHeadByModules');
      //     return this.getOpdTagsObject(filteredData);
      //     })
      // );
      this.allTagsHeadByModules = this.allTagModules;
      let filteredData = this.getFilteredDataByFormId(this.allTagsHeadByModules);
      filteredData = (filteredData.length) ? filteredData[0].tagsHeadByModules : [];
      // this.pushTagsInputsData(filteredData, 'tagsHeadByModules');
      this.allTagsHeadByModules = this.getOpdTagsObject(filteredData);
      // return this.ngCopy(this.allTagModules);
    }
  }
  saveOpdTags(): Observable<any> {
    const self = this;
    let tagtexts;
    tagtexts = this.currentOpdTagInputs;
    const tagList = [];
    let tagModule = '';
    const tagKeys = [];
    let observable: any;

    // remove blank tag from tagtexts
    _.map(Object.keys(tagtexts), (key) => {
      const filterTagtexts = [];
      _.map(tagtexts[key], (tag) => {
        if (tag.tag_name !== undefined && tag.tag_name.replace(/\s+/g, '').toLowerCase().trim() !== '') {
          filterTagtexts.push(tag);
        }
      });
      tagtexts[key] = filterTagtexts;
    });
    self.currentOpdTagInputs = tagtexts;

    const getOpdTags = this.getTagHeadsByTagModule();
    getOpdTags.subscribe(result => {
      _.map(result, (value) => {
        if (value) {
          tagModule = value.module_name;
          _.map(value.tags, (val) => {
            val.head_key = value.head_key;
            tagKeys.push(val);
          });
        }
      });
      let examinationHeadsList = this.getFilteredDataByFormId(this.tagsInputs);
      examinationHeadsList = examinationHeadsList[0].examinationHeadsList;
      _.map(examinationHeadsList, (element, index) => {
        _.map(tagtexts[element.head_key], (value, key) => {
          value.display_name = element.display_name;
          value.head_key = element.head_key;
          value.module_name = element.module_name;
          const newTagKey = value.tag_name.replace(/\s+/g, '').toLowerCase().trim();
          value.tag_priority = value.tag_priority !== undefined ? 'normal' : value.tag_priority;

          const chkTagExist = _.find(tagKeys, { head_key: element.head_key, tag_key: newTagKey.toLowerCase() });
          if (chkTagExist == undefined && value.edited !== true) {
            tagList.push({
              tag_name: value.tag_name.trim(),
              tag_key: '',
              tag_priority: value.tag_priority,
              tagSubModule: element.head_key,
              tagModule: tagModule
            });

            tagKeys.push({
              tag_name: value.tag_name.trim(),
              tag_key: newTagKey,
              head_key: element.head_key,
              display_name: element.head_key,
              id: '',
              module_name: tagModule,
              tag_priority: 'normal'
            });
          } else if (newTagKey !== '') {
            tagList.push({
              tag_name: value.tag_name.trim(),
              tag_key: newTagKey,
              tag_priority: value.tag_priority,
              tagSubModule: element.head_key,
              tagModule: tagModule
            });
          }
        });
      });

      // CALL API '/patient/saveOpdTags';
      this.callsaveOpdTags(tagList).subscribe(res => {
        // OpdService.updateOpdTagsMasterList(result.data.new_tags);
        observable = of('Save tags resolved');
      }, error => {
        observable = throwError(error);
      });
    });
    return observable;
  }

  callsaveOpdTags(tagList): Observable<any> {
    const url = environment.STATIC_JSON_URL + '/patient/saveOpdTags';
    const params = {
      tagList: tagList,
      opd_id: this.opdId,
      hospital_pat_id: this.hospitalPatId,
      opd_date: this.opdDate,
    };

    // uncomment below after actual OPD implementation
    // HttpService.enterprisePost(url, params).then(function (data) {
    //   def.resolve(data);
    // }, function (error) {
    //   def.reject(error);
    // });
    // return def.promise;
    return of('Request Sent');
  }

  // filterData (filterData): Observable<any> {
  //   const self = this;
  //   const data = _.filter(filterData, function (o) {
  //     return o.formId == self.publicService.activeFormId;
  //   });
  //   if (data.length == 0) {
  //     return this.intTagsInputFormData();
  //   } else {
  //     return of(data[0].data);
  //   }
  // }

  intTagsInputFormData(tagResult): any {
    const tagsInputArr = [];
    // examHeadList = _.filter(examHeadList, function (key) {
    //   return !!(key.form_status);
    // });
    this.examHeadList.forEach((obj, index) => {
      const headKey = (obj.head_key !== undefined) ? obj.head_key : obj.headKey;
      const tagsArr = [];
      if (!_.isUndefined(tagResult[headKey])) {
        _.forEach(tagResult[headKey], (o) => {
          const examTagModel = new ExaminationTags();
          examTagModel.generateObject(o);
          tagsArr.push(examTagModel);
        });
      }
      const tagsData = {
        displayName: obj.display_name,
        displayType: obj.display_type,
        headKey: headKey,
        status: obj.form_status,
        freeText: this.setFormControl(headKey, tagResult),
        suggestionText: this.setFormControl(headKey, tagResult),
        tagText: tagsArr
      };
      tagsInputArr.push(tagsData);
    });
    return tagsInputArr;
  }

  setFormControl(headKey, tagResult): any {
    if (headKey === 'freetext' || headKey === 'suggestionsbox') {
      if (tagResult[headKey].length > 0) {
        return tagResult[headKey][0]['tag_name'];
      }
    }
    return '';
  }

  // data param is taken only after API load.
  getOpdTagsObject(data?, tagFieldName?) {
    const self = this;
    let tagsData;
    tagFieldName = (tagFieldName) ? tagFieldName : 'tags';
    if (!data) {
      tagsData = _.filter(this.allTagModules, (o) => {
        return o.formId === self.publicService.activeFormId;
      });
      tagsData = !(tagsData.length) ? [] : tagsData[0].data;
    } else {
      tagsData = data;
    }
    const tagKeys = [];
    const tagFilter = {};
    _.forEach(tagsData, (value) => {
      if (value !== null) {
        // tagModule = value.module_name;
        const headKey = (value.headKey) ? value.headKey : value.head_key;
        tagFilter[headKey] = [];
        _.forEach(value[tagFieldName], (val) => {
          tagKeys.push(val.tag_key);
          tagFilter[headKey].push(val);
        });
      }
    });
    // set tagsHeadByModules only after API load. Used in suggestion list box to maintain data from API.
    if (data) {
    }
    return tagFilter;
  }

  // accepts data and key and returns data of given key against active form id. If data not present, inserts it against active form id.
  getFilteredDataByFormId(data, key?) {
    const self = this;
    const resultData = _.filter(data, (o) => {
      return o.formId === self.publicService.activeFormId;
    });
    return resultData;
  }

  checkTagInputExistForActiveForm() {
    const self = this;
    const index = _.findIndex(self.tagsInputs, (o) => {
      return o.formId === self.publicService.activeFormId;
    });
    return index;
  }

  ngCopy(obj): object {
    return Object.assign({}, obj);
  }

  getOpdTags(opdTagsData) {
    const opdTagInputs = {};
    _.map(this.examHeadList, (ele, index) => {
      opdTagInputs[ele.head_key] = [];
    });
    _.map(opdTagsData, (value, key) => { // response.data
      _.map(value, (val) => {
        if (_.isUndefined(opdTagInputs[val.head_key])) {
          opdTagInputs[val.head_key] = [];
        }
        val.tag_priority = val.tag_priority.toLowerCase();
        val.tag_key_prop = val.id;
        opdTagInputs[val.head_key].push(val);
      });
    });
    return opdTagInputs;
  }

  getAllTagModules() {
    const patientId = this.consultationService.getPatientObj('patientId');
    const examLabelCurrentFormData = this.consultationService.getConsultationFormDataByKey(patientId, 'examinationLabelLocalFormData');
    return this.getOpdTagsObject(examLabelCurrentFormData, 'tagText');
  }

  // New API with EMR

  getExaminationTypeList(): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/Examination/GetExaminationTypeList';
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data.length) {
        const dataList = [];
        _.map(res.data, d => {
          const type = new ExaminationType();
          if (type.isObjectValid(d)) {
            type.generateObject(d);
            dataList.push(type);
          }
        });
        return dataList;
      } else {
        return [];
      }
    }));
  }

  getExaminationLabelList(param): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/Examination/GetExaminationLabelList';
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

  saveExaminationLabel(param): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/Examination/SaveExaminationLabel';
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
        return true;
      } else {
        return false;
      }
    }));
  }

  getExaminationLabelById(param): Observable<any> {
    const exmData = this.getExaminationList(param, false);
    if (exmData) {
      return of(exmData);
    } else {
      const reqUrl = `${environment.dashboardBaseURL}/Examination/GetExaminationLabelById?id=${param}`;
      return this.http.get(reqUrl).pipe(map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
          this.addUpdateDataInList(res.data);
          return res.data;
        } else {
          return null;
        }
      }));
    }
  }

  getExaminationLabelDetailListData(ids): Observable<any> {
    const idArray = [];
    const returnDataArray = [];
    _.map(ids, id => {
      const data = this.getExaminationList(id, false);
      if (data) {
        returnDataArray.push(data);
      } else {
        idArray.push(id);
      }
    });
    if (idArray.length > 0) {
      const reqParam = {
        exam_head_ids: idArray
      };
      const reqUrl = `${environment.dashboardBaseURL}/Examination/GetExaminationLabels`;
      return this.http.post(reqUrl, reqParam).pipe(map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
          _.map(res.data, dt => {
            this.addUpdateDataInList(dt);
            returnDataArray.push(dt);
          });
        }
        return returnDataArray;
      }));
    } else {
      return of(returnDataArray);
    }
  }

  addUpdateDataInList(exmData) {
    const findIndex = _.findIndex(this.allExaminationLabelList, lst => {
      return lst.exam_head_id === exmData.exam_head_id;
    });
    if (findIndex === -1) {
      this.allExaminationLabelList.push(exmData);
    }
  }

  getExaminationList(headId, isObserb?) {
    const findIndex = _.findIndex(this.allExaminationLabelList, lst => {
      return lst.exam_head_id === headId;
    });
    if (findIndex !== -1) {
      return isObserb ? of(this.allExaminationLabelList[findIndex]) : this.allExaminationLabelList[findIndex];
    } else {
      return isObserb ? of(null) : null;
    }
  }

  deleteExaminationLabelById(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Examination/DeleteExaminationLabelById?id=${param}`;
    return this.http.delete(reqUrl).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
        return res.data;
      } else {
        return false;
      }
    }));
  }

  getExaminationBySearchKeyword(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Examination/GetExaminationBySearchKeyword`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
        return res.data;
      } else {
        return [];
      }
    }));
  }

  generateExaminationData(val) {
    const obj = {
      serviceType: null,
      speciality: null,
      labelName: val.display_name,
      key: val.head_key,
      isActive: val.is_active,
      printSetting: val.print_setting,
      examType: null,
      headId: val.exam_head_id,
      masterSaveSetting: val.save_setting ? val.save_setting : 'no_master_save'
    };
    if (val.speciality_id) {
      const spec = new Speciality();
      const deptObj = {
        id: val.speciality_id,
        name: val.speciality_name
      };
      spec.generateObject(deptObj);
      obj.speciality = spec;
    }
    const serviceType = new ServiceType();
    const sTypeObj = {
      service_type_id: val.service_type_id,
      display_name: val.service_type,
      service_type: null
    };
    serviceType.generateObject(sTypeObj);
    obj.serviceType = serviceType;
    const examType = new ExaminationType();
    const eTypeObj = {
      exam_type_id: val.exam_type_id,
      type_key: null,
      type_name: val.exam_type_name
    };
    examType.generateObject(eTypeObj);
    obj.examType = examType;
    return obj;
  }

}
