import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import { Template } from '../models/template.model';
import { TemplateCategory } from '../models/template-category.model';
import { TemplateMapping } from '../models/template-mapping';

@Injectable()
export class TemplatesService {
  categoryMasterList = [];
  taghash = new Map();
  eventshash = new Map();
  templateListhash = new Map();
  templateMappingList: any[] = [];

  constructor(
    private http: HttpClient
  ) { }

  getAllTemplateList(categoryId: number, clearedExistingData?: boolean, isShowActiveInactive?: boolean): Observable<any> {
    const reqUrl = `${environment.baseUrlAppointment}/Email/getEmailTemplateList`;
    let flag = true;
    if (isShowActiveInactive) {
      flag = false;
    }
    const param = {
      category_id: categoryId,
      template_isactive: flag
    };
    if (clearedExistingData) { this.templateListhash = new Map(); }

    const hashKey = categoryId + '_' + flag;
    const isDataExist = this.templateListhash.get(hashKey);
    if (!_.isUndefined(isDataExist)) {
      return of(this.templateListhash.get(hashKey));
    } else {
      return this.http.post(reqUrl, param).pipe(map((res: any) => {
        if (res.status_message === 'Success' && res.status_code === 200 && res.EmailTemplateData.length > 0) {
          const templates = [];
          _.map(res.EmailTemplateData, (v) => {
            const TemplateModel = new Template();
            TemplateModel.generateObject(v);
            templates.push(Object.assign({}, TemplateModel));
          });
          if (templates.length > 0) {
            this.templateListhash.set(hashKey, templates);
          }
          return templates; // res.EmailTemplateData;
        } else {
          return [];
        }
      }));
    }
  }

  getTemplateTagsByCategory(): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/Email/getEmailCategoryTags';
    const isDataExist = this.taghash.get(1);
    if (!_.isUndefined(isDataExist)) {
      return of(this.taghash.get(1));
    } else {
      return this.http.get(reqUrl).pipe(map((res: any) => {
        if (res.status_code === 200) {
          if (res.tags_Data.length > 0) {
            this.taghash.set(1, res.tags_Data);
          }
          return res.tags_Data;
        } else {
          return [];
        }
      }));
    }
  }

  getTemplateCategoryList(): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/Email/getEmailCategoryList';
    if (this.categoryMasterList.length) {
      return of(this.categoryMasterList);
    } else {
      return this.http.get(reqUrl).pipe(map((res: any) => {
        if (res.status_message === 'Success' && res.status_code === 200 && res.EmailCategoryData.length > 0) {
          _.map(res.EmailCategoryData, (v) => {
            const category = new TemplateCategory();
            if (category.isObjectValid(v)) {
              category.generateObject(v);
              this.categoryMasterList.push(Object.assign({}, category));
            }
          });
          return this.categoryMasterList;
        } else {
          return this.categoryMasterList;
        }
      }));
    }
  }

  getTemplateById(param): Observable<any> {
    const reqUrl = `${environment.baseUrlAppointment}/Email/getEmailTemplateById/?template_Id=${param}`;
    const TemplateModel = new Template();
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        if (res.status_message === 'Success' && res.status_code === 200 && res.EmailTemplateData) {
          TemplateModel.generateObject(res.EmailTemplateData);
          return TemplateModel;
        } else {
          return TemplateModel;
        }
      })
    );
  }

  updateTemplate(params): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/Email/editEmailTemplate';
    return this.http.put(reqUrl, params).pipe(map((res) => {
      return res;
    }));
  }

  saveTemplate(params): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/Email/SaveEmailTemplate';
    return this.http.post(reqUrl, params).pipe(map((res) => {
      return res;
    }));
  }


  getEmailTemplateMappingList(templateCategoryId: number[]): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/Email/getEmailTemplateMappingList';
    const templateMappingModel = new TemplateMapping();
    const templatesMappingList: Array<TemplateMapping> = [];
    const params = { template_category_id: templateCategoryId };
    return this.http.post(reqUrl, params).pipe(map((res: any) => {
      res.EmailTemplateData.forEach((obj, index) => {
        if (templateMappingModel.isObjectValid(obj)) {
          templateMappingModel.generateObject(obj);
          templatesMappingList.push(Object.assign({}, templateMappingModel));
        }
      });
      this.templateMappingList = templatesMappingList;
      return this.templateMappingList;
    }));
  }

  getTemplateEventsByCategory(params): Observable<any> {
    const paramobj = {
      category_id: params
    };
    const reqUrl = environment.baseUrlAppointment + '/Email/getEmailCategoryEvents';
    const isDataExist = this.eventshash.get(paramobj.category_id);
    /* if (!_.isUndefined(isDataExist)) {
      return of(this.eventshash.get(paramobj.category_id));
    } else */ {
      return this.http.post(reqUrl, paramobj).pipe(map((res: any) => {
        if (res.status_code === 200) {
          if (res.events_Data.length > 0) {
            this.eventshash.set(paramobj.category_id, res.events_Data);
          }
          return res.events_Data;
        } else {
          return [];
        }
      }));
    }
  }

  editEmailTemplateMapping(newobject: any): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/Email/editEmailTemplateMapping';
    const templateMappingModel = new TemplateMapping();
    const param = {
      id: newobject.id,
      entity_id: newobject.entity_id,
      template_category_id: newobject.template_category_id,
      event_name: newobject.event_name,
      template_id: newobject.template_id,
      template_isactive: newobject.template_isactive
    };
    return this.http.put(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_message == 'Success' && res.status_code == 200) {
          const index = _.findIndex(this.templateMappingList, (rec) => rec.id === param.id);
          if (templateMappingModel.isObjectValid(newobject)) {
            if (index !== -1) {
              templateMappingModel.generateObject(newobject);
              this.templateMappingList[index] = Object.assign({}, templateMappingModel);
            } else {
              templateMappingModel.generateObject(newobject);
              templateMappingModel.id = res.id;
              this.templateMappingList.push(Object.assign({}, templateMappingModel));
            }
          }
        }
        res.templateMappingList = this.templateMappingList;
        return res;
      })
    );
  }

  SaveEmailTemplateMapping(newobject: any): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/Email/SaveEmailTemplateMapping';
    const templateMappingModel = new TemplateMapping();
    const param = {
      id: newobject.id,
      entity_id: newobject.entity_id,
      template_category_id: newobject.template_category_id,
      event_name: newobject.event_name,
      template_id: newobject.template_id,
      template_isactive: newobject.template_isactive
    };
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_message == 'Success' && res.status_code == 200) {
          const index = _.findIndex(this.templateMappingList, (rec) => rec.id === param.id);
          if (templateMappingModel.isObjectValid(newobject)) {
            if (index !== -1) {
              templateMappingModel.generateObject(newobject);
              this.templateMappingList[index] = Object.assign({}, templateMappingModel);
            } else {
              templateMappingModel.generateObject(newobject);
              templateMappingModel.id = res.id;
              this.templateMappingList.push(Object.assign({}, templateMappingModel));
            }
          }
        }
        res.templateMappingList = this.templateMappingList;
        return res;
      })
    );
  }


  getReminderSettingList(param): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/ReminderSetting/getReminderSettingList';
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Details fetched successfully' && res.status_code === 200) {
        return res.reminder_settings;
      } else {
        return [];
      }
    }));
  }

  reminderSettingDelete(objId): Observable<any> {
    const param = { id: objId };
    const reqUrl = environment.baseUrlAppointment + '/ReminderSetting/deleteReminderSetting';
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.status_code === 200) {
        return res.status_message;
      } else {
        return res;
      }
    }));
  }

  addeditReminderSetting(param): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/ReminderSetting/addeditReminderSetting';
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return true;
      } else {
        return false;
      }
    }));
  }

  feedbackTemplateLinkDelete(id): Observable<any> {
    const reqUrl = `${environment.baseUrlAppointment}/Email/deleteFeedbackSetting?feedback_id=${id}`;
    return this.http.delete(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.status_code === 200) {
        return true;
      } else {
        return false;
      }
    }));
  }

  getFeedbackTemplate(): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/Email/getFeedbackSettingList';
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.status_code === 200) {
        return res.FeedbackSettingData;
      } else {
        return [];
      }
    }));
  }

  addEditFeedbackTemplate(param): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/Email/addeditFeedbackSetting';
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return true;
      } else {
        return false;
      }
    }));
  }


  updateEventCommunicationFlag(newobject: any): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/Email/EditEventSendEmailSMSFlag';
    return this.http.post(reqUrl, newobject).pipe(
      map((res: any) => {
        return res
      })
    )
  }


}
