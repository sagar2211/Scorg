import { Constants } from '../../../../config/constants';
import { IAlert } from 'src/app/models/AlertMessage';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { CommonService } from '../../../../services/common.service';
import { ActivatedRoute } from '@angular/router';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { NgxPermissionsService } from 'ngx-permissions';

@Component({
  selector: 'app-qms-queue-settings',
  templateUrl: './qms-queue-settings.component.html',
  styleUrls: ['./qms-queue-settings.component.scss']
})
export class QmsQueueSettingsComponent implements OnInit {
  queueSettingForm: FormGroup;
  submitted = false;
  alertMsg: IAlert;
  queueSetting = {
    available_slot: 'first',
    skip_setting_minute: '',
    no_of_repeat_calling: '',
    is_booking_confirmed: false,
    no_of_pending_action: ''
  };
  formLoad: boolean;
  editPermission: boolean;

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private ngxPermissionsService: NgxPermissionsService

  ) { }

  ngOnInit() {
    // this.commonService.routeChanged(this.route);
    this.editPermission = _.isUndefined(this.ngxPermissionsService.getPermission(PermissionsConstants.Update_Queue_Settings)) ? true : false;

    this.formLoad = false;
    this.getQueueSettings();
  }

  getQueueSettings() {
    this.commonService.getQueueSettings(Constants.queueSkipSettingKey).subscribe(res => {
        this.queueSetting.available_slot = res.available_slot;
        this.queueSetting.skip_setting_minute = res.skip_setting_minute;
        this.queueSetting.no_of_repeat_calling = res.no_of_repeat_calling;
        this.queueSetting.is_booking_confirmed = res.is_booking_confirmed;
        this.queueSetting.no_of_pending_action = res.no_of_pending_action;
        this.defaultFormObjects();
    });
  }

  defaultFormObjects(): void {
    this.queueSettingForm = this.fb.group({
      available_slot: [this.queueSetting.available_slot, Validators.required],
      skip_setting_minute: [this.queueSetting.skip_setting_minute, Validators.required],
      no_of_repeat_calling: [this.queueSetting.no_of_repeat_calling, Validators.required],
      is_booking_confirmed: [this.queueSetting.is_booking_confirmed],
      no_of_pending_action: [this.queueSetting.no_of_pending_action, Validators.required]
    });
    this.formLoad = true;
  }

  get queueSettingFormControls() {
    return this.queueSettingForm.controls;
  }

  UpdateQueueSettings() {
    this.submitted = true;
    if (this.queueSettingForm.valid && this.submitted) {
      const formValues = this.queueSettingForm.value;
      let queueSkipSettingObj;
      queueSkipSettingObj = {
        available_slot: formValues.available_slot,
        skip_setting_minute: formValues.skip_setting_minute,
        no_of_repeat_calling: formValues.no_of_repeat_calling,
        is_booking_confirmed: formValues.is_booking_confirmed,
        no_of_pending_action: formValues.no_of_pending_action
      };
      const queSettingObj = JSON.stringify(queueSkipSettingObj);
      this.commonService.SaveQueueSettings(Constants.queueSkipSettingKey, queSettingObj).subscribe((res) => {
        if (res != null && res === 'Success') {
          this.alertMsg = {
            message: 'Queue Setting Save successfully.',
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
}
