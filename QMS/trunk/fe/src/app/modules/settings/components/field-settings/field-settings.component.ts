import { Constants } from '../../../../config/constants';
import { IAlert } from '../../../../models/AlertMessage';
import { FormGroup } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import * as _ from 'lodash';
import { CommonService } from '../../../../services/common.service';

@Component({
  selector: 'app-field-settings',
  templateUrl: './field-settings.component.html',
  styleUrls: ['./field-settings.component.scss']
})
export class FieldSettingsComponent implements OnInit {
  fieldSettingForm: FormGroup;
  submitted = false;
  fields = [];
  alertMsg: IAlert;
  maskTypeSetAs: string;
  maskTypeSetAsPre: string;
  maskTypeSetAsMid: string;
  maskTypeSetAsPost: string;
  @Input() permissionDetails: any = [];
  constructor(
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.getFieldSettings();
    // this.commonService.routeChanged(this.route);
  }
  // defaultFieldObj() {
  //   this.fields = patientFieldSettingDefaultObj;
  // }
  getFieldSettings() {
    this.commonService.getQueueSettings(Constants.patientFieldSettingKey).subscribe(res => {
      if (res.length < this.commonService.patientFieldSettingDefaultObj.length) {
        const diffData = _.differenceBy(this.commonService.patientFieldSettingDefaultObj, res, 'key');
        if (diffData.length > 0) {
          this.fields = _.concat(res, diffData);
        }
      } else {
        this.fields = res;
      }
    });
  }
  get fieldSettingFormControls() {
    return this.fieldSettingForm.controls;
  }

  UpdateFieldSettings() {
    this.submitted = true;
    if (this.submitted) {
      const feildSettingObj = JSON.stringify(this.fields);
      this.commonService.SaveQueueSettings(Constants.patientFieldSettingKey, feildSettingObj).subscribe((res) => {
        if (res != null && res === 'Success') {
          this.alertMsg = {
            message: 'Field Setting Save successfully.',
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

  selectMask(field, i, selectedMask) {
    if (field) {
      this.fields[i].maskType = selectedMask;
      this.fields[i].isChanged = true;
    }
  }

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
