import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IAlert } from 'src/app/models/AlertMessage';
import { CommonService } from 'src/app/services/common.service';
import { ActivatedRoute } from '@angular/router';
import { Constants } from 'src/app/config/constants';
import { NgxPermissionsService } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import * as _ from 'lodash';


@Component({
  selector: 'app-feedback-send-setting',
  templateUrl: './feedback-send-setting.component.html',
  styleUrls: ['./feedback-send-setting.component.scss']
})
export class FeedbackSendSettingComponent implements OnInit {
  feedbackSettingForm: FormGroup;
  alertMsg: IAlert;
  feedbackSetting = {
    send_feedback: 'off'
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
    this.formLoad = false;
    this.editPermission = _.isUndefined(this.ngxPermissionsService.getPermission(PermissionsConstants.update_Patient_Feedback_Settings)) ? true : false;

    this.getFeedbackSettings();
    // this.commonService.routeChanged(this.route);
  }

  getFeedbackSettings() {
    this.commonService.getQueueSettings(Constants.feedbackSendKey).subscribe(res => {
      this.feedbackSetting.send_feedback = res;
      this.createForm();
    });
  }

  createForm(): void {
    this.feedbackSettingForm = this.fb.group({
      send_feedback: [this.feedbackSetting.send_feedback, Validators.required],
    });
    this.formLoad = true;
  }

  get feedbackSettingFormControls() {
    return this.feedbackSettingForm.controls;
  }

  updateFeedbackSetting() {
    const formValues = this.feedbackSettingForm.value;
    this.commonService.SaveQueueSettings(Constants.feedbackSendKey, formValues.send_feedback).subscribe((res) => {
      if (res != null && res === 'Success') {
        this.alertMsg = {
          message: 'Setting Save successfully.',
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
