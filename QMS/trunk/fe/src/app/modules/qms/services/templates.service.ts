import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import { TemplateCategory } from '../models/template-category.model';
import { Template } from '../models/template.model';

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

}
