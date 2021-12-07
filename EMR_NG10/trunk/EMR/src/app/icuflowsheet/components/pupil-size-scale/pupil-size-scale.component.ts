import { EncounterPatient } from './../../../public/models/encounter-patient.model';
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { AuthService } from './../../../public/services/auth.service';
import { IcuFlowSheetService } from './../../../public/services/icu-flow-sheet.service';
import { Constants } from 'src/app/config/constants';

@Component({
  selector: 'app-pupil-size-scale',
  templateUrl: './pupil-size-scale.component.html',
  styleUrls: ['./pupil-size-scale.component.scss']
})
export class PupilSizeScaleComponent implements OnInit, OnChanges {
  pupilSizeValue: number;
  @Input() patientObj: EncounterPatient;
  sheetDate: any;
  userInfo: any;
  constructor(
    private authService: AuthService,
    private icuFlowSheetService: IcuFlowSheetService,
  ) { }

  ngOnInit() {
    // this.pupilSizeValue = this.icutempdataService.getValueByKey('pupilSize');
  }

  ngOnChanges() {
    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    this.getParamData();
  }

  getParamData() {
    this.sheetDate = this.icuFlowSheetService.getIcuFlowSheetSelectedDate();
    const param = {
      patient_id: this.patientObj.patientData.id,
      opd_id: this.patientObj.visitNo,
      date: this.sheetDate,
      key: Constants.icuFlowSheetPupilSize,
    };
    const data = this.icuFlowSheetService.getDataByKeyParam(param);
    if (data) {
      this.pupilSizeValue = data;
    }
  }

  updateParamValue(): void {
    const param = {
      patient_id: this.patientObj.patientData.id,
      opd_id: this.patientObj.visitNo,
      date: this.sheetDate,
      key: Constants.icuFlowSheetPupilSize,
      value: this.pupilSizeValue,
      user_id: this.userInfo.user_id,
    };
    this.icuFlowSheetService.saveKeyWiseData(param).subscribe(res => {
      // this.getParamData();
    });
  }

  updatePupilValue(item) {
    this.pupilSizeValue = item;
    this.updateParamValue();
  }

}
