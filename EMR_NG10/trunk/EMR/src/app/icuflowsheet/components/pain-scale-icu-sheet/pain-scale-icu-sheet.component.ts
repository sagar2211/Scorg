import { EncounterPatient } from './../../../public/models/encounter-patient.model';
import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as _ from 'lodash';
import { AuthService } from './../../../public/services/auth.service';
import { IcuFlowSheetService } from './../../../public/services/icu-flow-sheet.service';
import { Constants } from 'src/app/config/constants';

@Component({
  selector: 'app-pain-scale-icu-sheet',
  templateUrl: './pain-scale-icu-sheet.component.html',
  styleUrls: ['./pain-scale-icu-sheet.component.scss']
})
export class PainScaleIcuSheetComponent implements OnInit, OnChanges {
  barValues: any[] = [];
  imgPath: string;
  oldscore: any = '';
  painScaleInput: any;
  painScoreInputs: any;
  @Input() patientObj: EncounterPatient;
  sheetDate: any;
  userInfo: any;

  constructor(
    private authService: AuthService,
    private icuFlowSheetService: IcuFlowSheetService,
  ) { }

  ngOnInit() {
    // this.painScaleInput = this.icutempdataService.getValueByKey('painScale');
    this.imgPath = environment.IMG_PATH;
    this.defaultImgIconForPainScale();
    // this.painscaleChangeIcon(this.painScaleInput);
  }

  ngOnChanges() {
    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    this.imgPath = environment.IMG_PATH;
    this.defaultImgIconForPainScale();
    this.getParamData();
  }

  getParamData() {
    this.sheetDate = this.icuFlowSheetService.getIcuFlowSheetSelectedDate();
    const param = {
      patient_id: this.patientObj.patientData.id,
      opd_id: this.patientObj.visitNo,
      date: this.sheetDate,
      key: Constants.icuFlowSheetPainScale,
    };
    const data = this.icuFlowSheetService.getDataByKeyParam(param);
    if (data) {
      this.painScaleInput = data;
      this.painscaleChangeIcon(this.painScaleInput);
    } else {
      this.painscaleChangeIcon(null);
    }
  }

  updateParamValue(): void {
    const param = {
      patient_id: this.patientObj.patientData.id,
      opd_id: this.patientObj.visitNo,
      date: this.sheetDate,
      key: Constants.icuFlowSheetPainScale,
      value: this.painScaleInput,
      user_id: this.userInfo.user_id,
    };
    this.icuFlowSheetService.saveKeyWiseData(param).subscribe(res => {
      // this.getParamData();
    });
  }

  // --set pain scale images
  defaultImgIconForPainScale(): void {
    for (let i = 0; i <= 10; i++) {
      const v = { val: i, img: '00' + i + '.png' };
      this.barValues.push(v);
    }
  }

  resetPainScale(): void {
    this.painscaleChangeIcon(null);
  }

  painscaleChangeIcon(score): void {
    if (score === '' || score === null) {
      this.painscaleChange(null, score, 'painScale');
    } else {
      const id = ((score === 0) ? this.painscaleChange(0, score, 'painScale') :
        (score >= 1 && score <= 3) ? this.painscaleChange(2, score, 'painScale') :
          (score >= 4 && score <= 6) ? this.painscaleChange(5, score, 'painScale') :
            (score >= 7 && score <= 9) ? this.painscaleChange(8, score, 'painScale') :
              (score === 10) ? this.painscaleChange(10, score, 'painScale') :
                this.painscaleChange(null, score, 'painScale'));
    }
  }

  painscaleChange(score, barScore, where): void {
    barScore = barScore || score;
    if (where === 'painScale' && barScore != null) {
      this.painScaleInput = barScore;
      this.oldscore = this.oldscore.toString();
      if (this.oldscore !== '') {
        // const indx = _.findIndex(this.barValues, (o) => {
        //   return o.val === +this.oldscore;
        // });
        // if (indx != -1) { }
        this.barValues[this.oldscore]['img'] = '00' + this.oldscore + '.png';
      }
      const indxs = _.findIndex(this.barValues, (o) => {
        return o.val === +score;
      });
      if (indxs !== -1) {
        this.barValues[score]['img'] = score + '.png';
        this.oldscore = score;
      }
    } else if (barScore === '' || barScore === null) {
      if (where === 'painScale') {
        this.barValues = [];
        this.painScaleInput = barScore;
        this.defaultImgIconForPainScale();
      }
    }
    this.updateParamValue();
  }


}
