import { Component, OnInit } from '@angular/core';
import { IcutempdataService } from './../../../public/services/icutempdata.service';
import { Router, ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { Constants } from 'src/app/config/constants';
import { AuthService } from './../../../public/services/auth.service';
import { IcuFlowSheetService } from './../../../public/services/icu-flow-sheet.service';
import { CommonService } from './../../../public/services/common.service';
import { EncounterPatient } from 'src/app/public/models/encounter-patient.model';

@Component({
  selector: 'app-assessment-chart',
  templateUrl: './assessment-chart.component.html',
  styleUrls: ['./assessment-chart.component.scss']
})
export class AssessmentChartComponent implements OnInit {
  assessmentArray = [];
  patientId: any;
  prevPath = '';
  patientObj: EncounterPatient;
  sheetDate: any;
  userInfo: any;

  constructor(
    private icutempdataService: IcutempdataService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private icuFlowSheetService: IcuFlowSheetService,
    private commonService: CommonService,
  ) { }

  ngOnInit() {
    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    this.getParamData();
    this.route.queryParams.subscribe(result => {
      this.prevPath = (_.isEmpty(result) || (!_.isEmpty(result) && _.isUndefined(result['from']))) ? '' : result['from'];
    });
  }

  getParamData() {
    this.patientObj = this.commonService.getLastActivePatient();
    this.patientId = this.patientObj.patientData.id;
    this.sheetDate = this.icuFlowSheetService.getIcuFlowSheetSelectedDate();
    const param = {
      patient_id: this.patientObj.patientData.id,
      opd_id: this.patientObj.visitNo,
      date: this.sheetDate,
      key: Constants.icuFlowSheetAssessmentChart,
    };
    const data = this.icuFlowSheetService.getDataByKeyParam(param);
    if (data) {
      this.assessmentArray = data;
    } else {
      this.assessmentArray = _.map(_.clone(this.icutempdataService.assessmentTypeList), (v) => {
        if (v.type === 'bool') {
          v.mVal = false;
          v.eVal = false;
          v.nVal = false;
        } else {
          v.mVal = null;
          v.eVal = null;
          v.nVal = null;
        }
        return v;
      });
    }
  }

  updateParamValue(): void {
    const param = {
      patient_id: this.patientObj.patientData.id,
      opd_id: this.patientObj.visitNo,
      date: this.sheetDate,
      key: Constants.icuFlowSheetAssessmentChart,
      value: this.assessmentArray,
      user_id: this.userInfo.user_id,
    };
    this.icuFlowSheetService.saveKeyWiseData(param).subscribe(res => {
      // this.getParamData();
    });
  }

  updateRowVal(index, key) {
    this.assessmentArray[index][key] = !this.assessmentArray[index][key];
    this.updateParamValue();
  }

  goToIcuFlowSheet() {
    this.router.navigate(['/emr/patient/icu_flow_sheet/sheet/', this.patientId]);
  }

  navigate() {
    this.router.navigate(['/emr/patient/icu_flow_sheet/sheet/', this.patientId]);
  }
}
