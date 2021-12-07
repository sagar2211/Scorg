import { CommonService } from 'src/app/services/common.service';
import { Constants } from '../../../../config/constants';
import { IAlert } from '../../../../models/AlertMessage';
import { FormGroup } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'app-doctor-field-settings',
  templateUrl: './doctor-field-settings.component.html',
  styleUrls: ['./doctor-field-settings.component.scss']
})
export class DoctorFieldSettingsComponent implements OnInit {
  @Input() permissionDetails: any = [];
  doctorFieldSettingForm: FormGroup;
  submitted = false;
  fields = [];
  alertMsg: IAlert;
  constructor(
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.getDoctorFieldSettings();
    // this.commonService.routeChanged(this.route);
  }

  getDoctorFieldSettings() {
    this.commonService.getQueueSettings(Constants.doctorFieldSettingKey).subscribe(res => {
      if (res.length < this.commonService.doctorFieldSettingDefaultObj.length) {
        const diffData = _.differenceBy(this.commonService.doctorFieldSettingDefaultObj, res, 'key');
        if (diffData.length > 0) {
          this.fields = _.concat(res, diffData);
        }
      } else {
        this.fields = res;
      }
    });
  }

  get doctorFieldSettingFormControls() {
    return this.doctorFieldSettingForm.controls;
  }

  UpdateDcotorFieldSettings() {
    this.submitted = true;
    if (this.submitted) {
      const feildSettingObj = JSON.stringify(this.fields);
      this.commonService.SaveQueueSettings(Constants.doctorFieldSettingKey, feildSettingObj).subscribe((res) => {
        if (res != null && res === 'Success') {
          this.alertMsg = {
            message: 'Doctor Field Setting Save successfully.',
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

  // selectDisplay(field, i) {
  //   if (field) {
  //     this.fields[i].isDisplay = !this.fields[i].isDisplay;
  //     this.fields[i].isChanged = true;
  //   }
  // }

  // selectMask(field, i) {
  //   if (field) {
  //     this.fields[i].isMask = !this.fields[i].isMask;
  //     this.fields[i].isChanged = true;
  //   }
  // }

  selectNumberOfCharacter(field, i) {
    if (field && field.numberOfCharacter <= 10 && field.numberOfCharacter > -1) {
      this.fields[i].isChanged = true;
    } else {
      field.numberOfCharacter = 0;
      this.alertMsg = {
        message: 'Number of character should be less than 10 and greater than -1',
        messageType: 'danger',
        duration: 3000
      };
    }
  }
}
