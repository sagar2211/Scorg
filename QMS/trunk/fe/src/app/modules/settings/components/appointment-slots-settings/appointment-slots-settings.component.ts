import { Component, OnInit } from '@angular/core';
import {Constants} from '../../../../config/constants';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {IAlert} from '../../../../models/AlertMessage';
import {CommonService} from '../../../../services/common.service';
import {ActivatedRoute} from '@angular/router';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';

@Component({
  selector: 'app-appointment-slots-settings',
  templateUrl: './appointment-slots-settings.component.html',
  styleUrls: ['./appointment-slots-settings.component.scss']
})
export class AppointmentSlotsSettingsComponent implements OnInit {
  appointmentSlotSettingForm: FormGroup;
  alertMsg: IAlert;
  appointmentSlotSetting = {
    allow_lapsed_time: 'off'
  };
  formLoad: boolean;
  permissionConstList: any= [];
  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.formLoad = false;
    this.permissionConstList = PermissionsConstants;
    this.getAppointmentSlotBooking();
    // this.commonService.routeChanged(this.route);
  }

  getAppointmentSlotBooking() {
    this.commonService.getQueueSettings(Constants.allowLapsedTimeBooking).subscribe(res => {
      this.appointmentSlotSetting.allow_lapsed_time = res;
      this.createForm();
    });
  }

  createForm(): void {
    this.appointmentSlotSettingForm = this.fb.group({
      allow_lapsed_time: [this.appointmentSlotSetting.allow_lapsed_time, Validators.required],
    });
    this.formLoad = true;
  }

  get appointmentSlotSettingControls() {
    return this.appointmentSlotSettingForm.controls;
  }

  updateAppointmentSlotSetting() {
    const formValues = this.appointmentSlotSettingForm.value;
    this.commonService.SaveQueueSettings(Constants.allowLapsedTimeBooking, formValues.allow_lapsed_time).subscribe((res) => {
      if (res != null && res === 'Success') {
        this.alertMsg = {
          message: 'Setting Save successfully.',
          messageType: 'success',
          duration: 3000
        };
      } else {
        this.alertMsg = {
          message: 'Something went wrong!',
          messageType: 'danger',
          duration: 3000
        };
      }
    });
  }

}
