import { EncounterPatient } from './../../../public/models/encounter-patient.model';
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { ConsultationService } from './../../../public/services/consultation.service';
import { IcuFlowSheetService } from './../../../public/services/icu-flow-sheet.service';
import { Constants } from 'src/app/config/constants';
import { AuthService } from './../../../public/services/auth.service';

@Component({
  selector: 'app-icu-handover-log-params',
  templateUrl: './icu-handover-log-params.component.html',
  styleUrls: ['./icu-handover-log-params.component.scss']
})
export class IcuHandoverLogParamsComponent implements OnInit, OnChanges {
  @Input() patientObj: EncounterPatient;
  sheetDate: any;
  userInfo: any;
  paramDetails: any = [
    {
      name: 'HOSPITAL STAY',
      key: 'hospital_stay',
      value: ''
    },
    {
      name: 'ICU STAY',
      key: 'icu_stay',
      value: ''
    },
    {
      name: 'POST OP STAY',
      key: 'post_op_stay',
      value: ''
    }, {
      name: 'DAYS INTUBATED',
      key: 'days_intubated',
      value: ''
    }, {
      name: 'DAYS VENTILATED',
      key: 'days_ventilated',
      value: ''
    },
    {
      name: 'BIPAP DAY',
      key: 'bipap_day',
      value: ''
    }
  ];
  constructor(
    public consultationService: ConsultationService,
    public icuFlowSheetService: IcuFlowSheetService,
    public authService: AuthService,
  ) { }

  ngOnInit() {

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
      key: Constants.icuFlowSheetHandOverParamLog,
    };
    const data = this.icuFlowSheetService.getDataByKeyParam(param);
    if (data) {
      this.paramDetails = data;
    }
  }

  updateParamValue(): void {
    const param = {
      patient_id: this.patientObj.patientData.id,
      opd_id: this.patientObj.visitNo,
      date: this.sheetDate,
      key: Constants.icuFlowSheetHandOverParamLog,
      value: this.paramDetails,
      user_id: this.userInfo.user_id,
    };
    this.icuFlowSheetService.saveKeyWiseData(param).subscribe(res => {
      this.getParamData();
    });
  }

}
