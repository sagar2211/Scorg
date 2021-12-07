import { Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { IAlert } from 'src/app/models/AlertMessage';
import { CommonService } from 'src/app/services/common.service';
import { EntitityCommonDataService } from 'src/app/modules/schedule/services/entitity-common-data.service';
import { Constants } from 'src/app/config/constants';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { PermissionsConstants } from './../../../../shared/constants/PermissionsConstants';



@Component({
  selector: 'app-application-settings',
  templateUrl: './application-settings.component.html',
  styleUrls: ['./application-settings.component.scss']
})
export class ApplicationSettingsComponent implements OnInit {
  applicationSettingForm: FormGroup;
  submitted = false;
  alertMsg: IAlert;
  defaultSettingObj = { tag_name: '', tag_question: '', tag_value: '' };
  temphoursArray = [];
  applicationSettingArray = [
    { tag_name: 'QMS_BE_SETTINGS', tag_question: 'defaultUserPassword', tag_value: '' },
    { tag_name: 'QMS_BE_SETTINGS', tag_question: 'parellelBookingSufix', tag_value: '' },
    { tag_name: 'QMS_BE_SETTINGS', tag_question: 'autoappointmentConfirm', tag_value: '' },
    { tag_name: 'QMS_BE_SETTINGS', tag_question: 'opdTvDisplayBeforeMinutes', tag_value: '' },
    { tag_name: 'QMS_BE_SETTINGS', tag_question: 'opdnotstartedStatusText', tag_value: '' },
    { tag_name: 'QMS_BE_SETTINGS', tag_question: 'stopsmsOtpService', tag_value: '' },
    { tag_name: 'QMS_BE_SETTINGS', tag_question: 'entitySummarySmsMorning', tag_value: '' },
    { tag_name: 'QMS_BE_SETTINGS', tag_question: 'entitySummarySmsEvening', tag_value: '' },
    { tag_name: 'QMS_BE_SETTINGS', tag_question: 'opddisplayrefreshSecond', tag_value: '' },
    { tag_name: 'QMS_BE_SETTINGS', tag_question: 'patientAbsentmarketime', tag_value: '' },
    { tag_name: 'QMS_BE_SETTINGS', tag_question: 'defaultidletimecheckoutEntity', tag_value: '' },
    { tag_name: 'QMS_BE_SETTINGS', tag_question: 'defaultidleminutechat', tag_value: '' },
    { tag_name: 'QMS_BE_SETTINGS', tag_question: 'forgotpasswordlinkActive', tag_value: '' },
    { tag_name: 'QMS_BE_SETTINGS', tag_question: 'logerRequiredMongoDb', tag_value: '' },
    { tag_name: 'QMS_BE_SETTINGS', tag_question: 'smsOnlyConfirmAppointment', tag_value: '' },
    { tag_name: 'QMS_BE_SETTINGS', tag_question: 'smsHospitalName', tag_value: '' },
    { tag_name: 'QMS_BE_SETTINGS', tag_question: 'smsHospitalLocation', tag_value: '' },
    { tag_name: 'QMS_BE_SETTINGS', tag_question: 'opdservicestartbufferMinute', tag_value: '' },
    { tag_name: 'QMS_BE_SETTINGS', tag_question: 'appoinmentFollowUpDay', tag_value: '' },
    { tag_name: 'QMS_BE_SETTINGS', tag_question: 'autocheckinAllowed', tag_value: '' },
    { tag_name: 'QMS_BE_SETTINGS_REPORTS', tag_question: 'pageFooterShowEmailPhone', tag_value: '' },
    { tag_name: 'QMS_BE_SETTINGS_REPORTS', tag_question: 'pageFootershowAddressName', tag_value: '' },
    { tag_name: 'QMS_BE_SETTINGS_REPORTS', tag_question: 'pageFootershowBranchName', tag_value: '' },
    { tag_name: 'QMS_BE_SETTINGS_REPORTS', tag_question: 'pageFootershowName', tag_value: '' },
    { tag_name: 'QMS_BE_SETTINGS_REPORTS', tag_question: 'headershowEmailPhone', tag_value: '' },
    { tag_name: 'QMS_BE_SETTINGS_REPORTS', tag_question: 'headershowAddressName', tag_value: '' },
    { tag_name: 'QMS_BE_SETTINGS_REPORTS', tag_question: 'headerBranchName', tag_value: '' },
    { tag_name: 'QMS_BE_SETTINGS_REPORTS', tag_question: 'headerShowName', tag_value: '' },
    { tag_name: 'QMS_BE_SETTINGS_REPORTS', tag_question: 'headerShowLog', tag_value: '' }
  ];
  PermissionsConstantsList: any = [];



  constructor(
    public fb: FormBuilder,
    private commonService: CommonService,
    private entityCommonDataService: EntitityCommonDataService
  ) { }

  ngOnInit() {
    this.PermissionsConstantsList = PermissionsConstants;
    this.temphoursArray = this.entityCommonDataService.createHoursList24HourFormat(true);
    this.getAllApplicationSettingDetails().subscribe();
  }

  saveSettingChangesObject(changeModel) {
    this.applicationSettingArray.push(changeModel);
  }

  getAllApplicationSettingDetails(): Observable<any> {
    const param = [
      {
        tag_name: Constants.qmsBeSettingKey,
        tag_question: '',
      },
      {
        tag_name: Constants.qmsBeReportSettingKey,
        tag_question: '',
      }
    ];
    return this.commonService.getQueueSettingsForMultiple(param).pipe(map((res: any) => {
      _.map(res, (v) => {
        if (v.tag_question && v.tag_value) {
          // JSON.parse(v.tag_value)
          this.patchValueInValidObject(v.tag_value, v.tag_question);
        }
      });
      return res;
    })
    );
  }

  patchValueInValidObject(tagvalue, tagkey) {
    const indexIsExist = _.findIndex(this.applicationSettingArray, (rec) => rec.tag_question.toLowerCase() === tagkey.toLowerCase());
    if (indexIsExist !== -1) {
      this.applicationSettingArray[indexIsExist].tag_value = tagvalue;
    }
  }

  saveAppicationSettings() {
    const saveObjectList = []
    _.map(this.applicationSettingArray, (o) => {
      o.tag_value = o.tag_value.trim();
      if (o.tag_value) {
        saveObjectList.push(o);
      }
    });
    if (saveObjectList.length !== 0) {
      this.commonService.saveApplicationSettings(saveObjectList).subscribe(res => {
        if (res) {
          this.alertMsg = {
            message: 'Setting(s) are save Successfully',
            messageType: 'success',
            duration: 3000
          };
        }
      });
    }
  }

  radioOnclickValueChanges(object,event) {
    const indexIsExist = _.findIndex(this.applicationSettingArray, (rec) => rec.tag_question.toLowerCase() === object.tag_question.toLowerCase());
    if (indexIsExist !== -1) {
      this.applicationSettingArray[indexIsExist].tag_value = event;
    }
  }
}
