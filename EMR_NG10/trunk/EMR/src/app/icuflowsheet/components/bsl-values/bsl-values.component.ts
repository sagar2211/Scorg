import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from './../../../public/services/auth.service';
import { IcuFlowSheetService } from './../../../public/services/icu-flow-sheet.service';
import { Constants } from 'src/app/config/constants';
import { EncounterPatient } from 'src/app/public/models/encounter-patient.model';

@Component({
  selector: 'app-bsl-values',
  templateUrl: './bsl-values.component.html',
  styleUrls: ['./bsl-values.component.scss']
})
export class BslValuesComponent implements OnInit, OnChanges {
  bslForm: FormGroup;
  @Input() patientObj: EncounterPatient;
  sheetDate: any;
  userInfo: any;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private icuFlowSheetService: IcuFlowSheetService,
  ) { }

  ngOnInit() {

  }

  ngOnChanges() {
    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    this.createForm(null);
    this.getParamData();
  }

  getParamData() {
    this.sheetDate = this.icuFlowSheetService.getIcuFlowSheetSelectedDate();
    const param = {
      patient_id: this.patientObj.patientData.id,
      opd_id: this.patientObj.visitNo,
      date: this.sheetDate,
      key: Constants.icuFlowSheetBslValue,
    };
    const data = this.icuFlowSheetService.getDataByKeyParam(param);
    if (data) {
      this.bslForm.patchValue({
        bslValue: data.bslValue,
        freqVal: data.freqVal,
      });
    }
  }

  updateParamValue(): void {
    const param = {
      patient_id: this.patientObj.patientData.id,
      opd_id: this.patientObj.visitNo,
      date: this.sheetDate,
      key: Constants.icuFlowSheetBslValue,
      value: this.bslForm.value,
      user_id: this.userInfo.user_id,
    };
    this.icuFlowSheetService.saveKeyWiseData(param).subscribe(res => {
      // this.getParamData();
    });
  }

  createForm(val) {
    this.patchDefaultValue(val);
  }

  patchDefaultValue(val?) {
    if (this.bslForm) {
      return;
    }
    const form = {
      bslValue: [val ? val.bslValue : null],
      freqVal: [val ? val.freqVal : null]
    };
    this.bslForm = this.fb.group(form);
  }

  updateValues() {
    const values = this.bslForm.value;
    this.updateParamValue();
  }
}
