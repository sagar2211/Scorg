import { Component, OnInit } from '@angular/core';
import { Constants } from '../../../../config/constants';
import { IAlert } from '../../../../models/AlertMessage';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import * as _ from 'lodash';
import { CommonService } from '../../../../services/common.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';

@Component({
  selector: 'app-time-format-setting',
  templateUrl: './time-format-setting.component.html',
  styleUrls: ['./time-format-setting.component.scss']
})
export class TimeFormatSettingComponent implements OnInit {
  timeFormatSettingForm: FormGroup;
  disbaleSaveOnPermission: boolean;
  alertMsg: IAlert;
  timeFormatSetting = {
    time_format_key: '12_hour'
  };
  formLoad: boolean;

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private ngxPermissionsService: NgxPermissionsService

  ) { }

  ngOnInit() {
    this.formLoad = false;
    this.getTimeFormatSettings();
    // this.commonService.routeChanged(this.route);
  }

  getTimeFormatSettings() {
    const userId = this.authService.getLoggedInUserId();
    this.commonService.getQueueSettings(Constants.timeFormateKey, userId).subscribe(res => {
      this.timeFormatSetting.time_format_key = res.time_format_key;
      this.createForm();
      this.disbaleSaveOnPermission = _.isUndefined(this.ngxPermissionsService.getPermission(PermissionsConstants.Update_Time_Format_Settings)) ? true : false;
    });
  }

  createForm(): void {
    this.timeFormatSettingForm = this.fb.group({
      time_format_key: [this.timeFormatSetting.time_format_key, Validators.required],
    });
    this.formLoad = true;
  }

  get timeSettingFormControls() {
    return this.timeFormatSettingForm.controls;
  }

  UpdateTimeFormatSetting() {
    const formValues = this.timeFormatSettingForm.value;
    const timeDisplaySettingObj = {
      time_format_key: formValues.time_format_key,
    };
    const JsonTimeDisplaySettingObj = JSON.stringify(timeDisplaySettingObj);
    const userId = this.authService.getLoggedInUserId();
    this.commonService.SaveQueueSettings(Constants.timeFormateKey, JsonTimeDisplaySettingObj, userId).subscribe((res) => {
      if (res != null && res === 'Success') {
        this.alertMsg = {
          message: 'Time Display Setting Save successfully.',
          messageType: 'success',
          duration: 3000
        };
      } else {
        this.alertMsg = {
          message: 'Somthing went wrong!',
          messageType: 'danger',
          duration: 3000
        };
      }
    });
  }

}
