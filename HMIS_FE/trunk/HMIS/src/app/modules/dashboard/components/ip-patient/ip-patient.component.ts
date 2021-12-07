import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonService } from 'src/app/public/services/common.service';

@Component({
  selector: 'app-ip-patient',
  templateUrl: './ip-patient.component.html',
  styleUrls: ['./ip-patient.component.scss']
})
export class IpPatientComponent implements OnInit, OnDestroy {
  @Output() isIPPatientVisibleSection = new EventEmitter<any>();
  @Input() dashboardData;
  isIPPatientVisible: boolean;
  donutChartData = [];

  totalIpPatient = 200;
  canceledPatient = 5;
  newPatient = 65;
  existingPatient = 80;
  dischargePatient = 50;
  destroy$ = new Subject();
  loadChart = false;
  constructor(
    private commonService: CommonService,
  ) {
  }

  ngOnInit(): void {
    this.isIPPatientVisible = false;
    const data = this.dashboardData && this.dashboardData.ipPatient ? this.dashboardData.ipPatient : null;
    this.totalIpPatient = data ? data.total : 0.00;
    this.canceledPatient = data ? data.cancelled : 0.00;
    this.newPatient = data ? data.newPatient : 0.00;
    this.existingPatient = data ? data.existing : 0.00;
    this.dischargePatient = data ? data.discharge : 0.00;
    this.getIpPatientData();
    this.commonService.$subRevnewDashboardDetailShow.pipe(takeUntil(this.destroy$)).subscribe((val: any) => {
      if (val !== 'isIPPatientVisible') {
        this.isIPPatientVisible = false;
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  getIpPatientData() {
    if (this.newPatient || this.existingPatient || this.dischargePatient) {
      this.loadChart = true;
    }
    this.donutChartData = [{
      type: "New",
      val: this.newPatient
    }, {
      type: "Existing",
      val: this.existingPatient
    }, {
      type: "Discharged",
      val: this.dischargePatient
    }];
  }

  showIPPatientDetail() {
    this.isIPPatientVisible = !this.isIPPatientVisible;
    this.isIPPatientVisibleSection.emit(this.isIPPatientVisible);
  }

  customizeLabel(arg) {
    return arg.valueText + " (" + arg.percentText + ")";
  }

}
