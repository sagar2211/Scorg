import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ConsultationService } from './../../../public/services/consultation.service';
import * as _ from 'lodash';
import { IcutempdataService } from './../../../public/services/icutempdata.service';

@Component({
  selector: 'app-diabetic-chart',
  templateUrl: './diabetic-chart.component.html',
  styleUrls: ['./diabetic-chart.component.scss']
})
export class DiabeticChartComponent implements OnInit {
  insValAll: any;
  patientId: any;
  prevPath = '';
  // diabeticForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private icutempdataService: IcutempdataService,
    private router: Router,
    private consultationService: ConsultationService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.patientId = this.consultationService.getPatientObj('patientId');
    this.insValAll = this.icutempdataService.getInsulinReportData();
    // this.createForm(val);
    this.route.queryParams.subscribe(result => {
      this.prevPath = (_.isEmpty(result) || (!_.isEmpty(result) && _.isUndefined(result['from']))) ? '' : result['from'];
    });
  }

  // showDiabeticForm() {
  //   this.router.navigate(['dashboard/patientDashboard/diabeticChart/', 'ipd', this.patientId]);
  // }

  navigate() {
    const navigateURL = '/emr/patient/icu_flow_sheet/icu_diabetic_chart/';
    this.router.navigate([navigateURL, this.patientId], { skipLocationChange: true, queryParams: { from: 'icu_flow_sheet' } });
  }
  // createForm(val) {
  //   this.patchDefaultValue(val);
  // }

  // patchDefaultValue(val?) {
  //   const form = {
  //     totalInsulin: [val ? val.totalInsulin : null],
  //     rapidActing: [val ? val.rapidActing : null],
  //     longActing: [val ? val.longActing : null],
  //     maxBSL: [val ? val.maxBSL : null],
  //     minBSL: [val ? val.minBSL : null],
  //   };
  //   this.diabeticForm = this.fb.group(form);
  // }

  // updateValues() {
  //   const values = this.diabeticForm.value;
  //   this.icutempdataService.setValueByKey('diabeticChart', values);
  // }
}
