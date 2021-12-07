import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { IcutempdataService } from './../../../public/services/icutempdata.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ConsultationService } from './../../../public/services/consultation.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-diabetic-chart-form',
  templateUrl: './diabetic-chart-form.component.html',
  styleUrls: ['./diabetic-chart-form.component.scss']
})
export class DiabeticChartFormComponent implements OnInit {
  hrsList = [];
  insulinTypeList = [];
  insulinData = [];
  diabeticForm: FormGroup;
  patientId: any;
  prevPath = '';
  constructor(
    private fb: FormBuilder,
    private icutempdataService: IcutempdataService,
    private router: Router,
    private consultationService: ConsultationService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.patientId = this.consultationService.getPatientObj('patientId');
    this.insulinData = this.icutempdataService.getValueByKey('diabeticFormData');
    this.hrsList = this.icutempdataService.createHoursList12HourFormat();
    this.insulinTypeList = this.icutempdataService.insulinTypeList;
    this.createForm();
    this.route.queryParams.subscribe(result => {
      this.prevPath = (_.isEmpty(result) || (!_.isEmpty(result) && _.isUndefined(result['from']))) ? '' : result['from'];
    });
    if (this.insulinData && this.insulinData['diabeticData']) {
      _.map(this.insulinData['diabeticData'], (d) => {
        this.patchDefaultValue(d);
      });
    } else {
      this.patchDefaultValue();
    }
  }

  createForm() {
    this.diabeticForm = this.fb.group({
      diabeticData: this.fb.array([])
    });
  }

  patchDefaultValue(val?) {
    const form = {
      time: [val ? val.time : null],
      bsl: [val ? val.bsl : null],
      insLvl: [val ? val.insLvl : null],
      insGvn: [val ? val.insGvn : null],
      insTyp: [val ? val.insTyp : null],
    };
    this.diabeticData.push(this.fb.group(form));
  }

  get diabeticData() {
    return this.diabeticForm.get('diabeticData') as FormArray;
  }

  addInsulin(val) {
    this.patchDefaultValue();
  }

  updateValueInService() {
    const formdata = this.diabeticForm.value;
    this.icutempdataService.setValueByKey('diabeticFormData', formdata);
  }

  deleteInsulin(indx) {
    this.diabeticData.removeAt(indx);
    if (this.diabeticData.controls.length <= 0) {
      this.patchDefaultValue();
    }
  }

  goToIcuFlowSheet() {
    this.router.navigate(['/emr/patient/icu_flow_sheet/sheet/', this.patientId]);
  }

  navigate(navigateURL) {
    if (navigateURL === 'icu_flow_sheet') {
      this.router.navigate(['/emr/patient/icu_flow_sheet/sheet/', this.patientId]);
    } else {
      navigateURL = '/emr/patient/' + navigateURL + '/';
      this.router.navigate([navigateURL, this.patientId]);
    }

  }
}
