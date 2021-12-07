import { Component, OnInit } from '@angular/core';
import { IAlert } from 'src/app/models/AlertMessage';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CommonService } from 'src/app/services/common.service';
import { Constants } from 'src/app/config/constants';
import { ActivatedRoute } from '@angular/router';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';

@Component({
  selector: 'app-display-status-msg-setting',
  templateUrl: './display-status-msg-setting.component.html',
  styleUrls: ['./display-status-msg-setting.component.scss']
})
export class DisplayStatusMsgSettingComponent implements OnInit {
  statusSettingForm: FormGroup;
  submitted = false;
  statusList = [];
  alertMsg: IAlert;
  PermissionsConstantsList: any = [];
  constructor(
    public fb: FormBuilder,
    private commonService: CommonService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    // this.commonService.routeChanged(this.route);
    this.PermissionsConstantsList = PermissionsConstants;
    this.defaultForm();
    this.getDoctorFieldSettings();
  }

  defaultForm() {
    this.statusSettingForm = this.fb.group({
      checkinStatusText: [''],
      pauseStatusText: [''],
      stopStatusText:[''],
      checkoutStatusText: [''],
      opdnotstartedStatusText: [''],
      opdnotcheckedinStatusText: [''],
      opdisdelayStatusText: ['']
    });
  }

  UpdateStatusMsgSettings() {
      const statusSettingObj = JSON.stringify(this.statusSettingForm.value);
      this.commonService.SaveQueueSettings(Constants.displayStatusSetting, statusSettingObj).subscribe((res) => {
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
  getDoctorFieldSettings() {
    this.commonService.getQueueSettings(Constants.displayStatusSetting).subscribe(res => {
      if (res) {
        this.statusSettingForm.patchValue({
          checkinStatusText: res.checkinStatusText ? res.checkinStatusText : '',
          pauseStatusText: res.pauseStatusText ? res.pauseStatusText : '',
          stopStatusText: res.stopStatusText ? res.stopStatusText : '',
          checkoutStatusText: res.checkoutStatusText ? res.checkoutStatusText : '',
          opdnotstartedStatusText: res.opdnotstartedStatusText ? res.opdnotstartedStatusText : '',
          opdnotcheckedinStatusText: res.opdnotcheckedinStatusText ? res.opdnotcheckedinStatusText : '',
          opdisdelayStatusText: res.opdisdelayStatusText ? res.opdisdelayStatusText : ''
        });
      }
    });
  }
  clearForm() {
    this.statusSettingForm.reset({});
    this.defaultForm();
  }

}
