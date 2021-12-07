import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-other-patient',
  templateUrl: './other-patient.component.html',
  styleUrls: ['./other-patient.component.scss']
})
export class OtherPatientComponent implements OnInit {
  @Input() dashboardData;

  donutChartData = [];
  totalOtherPatient = 175;
  dayCarePatient = 20;
  erPatient = 5;
  directInvestigation = 150;
  loadChart = false;
  constructor() {
  }

  ngOnInit(): void {
    this.loadChart = false;
    const data = this.dashboardData && this.dashboardData.otherPatient ? this.dashboardData.otherPatient : null;
    this.totalOtherPatient = data ? data.total : 0.00;
    this.dayCarePatient = data ? data.dayCare : 0.00;
    this.erPatient = data ? data.er : 0.00;
    this.directInvestigation = data ? data.directInvestigation : 0.00;
    this.getOtherPatientData();
  }

  getOtherPatientData() {
    if (this.dayCarePatient || this.erPatient || this.directInvestigation) {
      this.loadChart = true;
    }
    this.donutChartData = [{
      type: "Daycare",
      val: this.dayCarePatient
    }, {
      type: "ER",
      val: this.erPatient
    }, {
      type: "Direct Investigation",
      val: this.directInvestigation
    }];
  }

  customizeLabel(arg) {
    return arg.valueText + " (" + arg.percentText + ")";
  }


}
