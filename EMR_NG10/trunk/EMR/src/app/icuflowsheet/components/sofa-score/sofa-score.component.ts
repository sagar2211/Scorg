import { EncounterPatient } from './../../../public/models/encounter-patient.model';
import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AuthService } from './../../../public/services/auth.service';
import { IcuFlowSheetService } from './../../../public/services/icu-flow-sheet.service';
import { Constants } from 'src/app/config/constants';

@Component({
  selector: 'app-sofa-score',
  templateUrl: './sofa-score.component.html',
  styleUrls: ['./sofa-score.component.scss']
})
export class SofaScoreComponent implements OnInit, OnChanges {
  sofaScore: FormGroup;
  @Input() patientObj: EncounterPatient;
  sheetDate: any;
  userInfo: any;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private icuFlowSheetService: IcuFlowSheetService,
  ) { }

  ngOnInit() {
    // const val = this._icutempdataService.getValueByKey('sofaScore');
    // this.createForm(val);
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
      key: Constants.icuFlowSheetSofaScore,
    };
    const data = this.icuFlowSheetService.getDataByKeyParam(param);
    if (data) {
      this.sofaScore.patchValue({
        sofaScoreVal: data.sofaScoreVal,
        addScoreVal: data.addScoreVal,
      });
    }
  }

  updateParamValue(): void {
    const param = {
      patient_id: this.patientObj.patientData.id,
      opd_id: this.patientObj.visitNo,
      date: this.sheetDate,
      key: Constants.icuFlowSheetSofaScore,
      value: this.sofaScore.value,
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
    if (this.sofaScore) {
      return;
    }
    const form = {
      sofaScoreVal: [val ? val.sofaScoreVal : null],
      addScoreVal: [val ? val.addScoreVal : null]
    };
    this.sofaScore = this.fb.group(form);
  }

  updateValues() {
    const values = this.sofaScore.value;
    this.updateParamValue();
  }

}
