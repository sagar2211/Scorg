import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonService } from 'src/app/public/services/common.service';

@Component({
  selector: 'app-op-patient',
  templateUrl: './op-patient.component.html',
  styleUrls: ['./op-patient.component.scss']
})
export class OpPatientComponent implements OnInit, OnDestroy {
  @Output() isOPPatientVisibleSection = new EventEmitter<any>();
  @Input() dashboardData;
  isOPPatientVisible: boolean;
  donutChartData = [];
  loadChart = false;

  totalOpPatient = 155;
  opPatient = 120;
  followUpPatient = 35;
  otherPatient = 15;
  destroy$ = new Subject();
  constructor(
    private commonService: CommonService,
  ) {
  }

  ngOnInit(): void {
    this.isOPPatientVisible = false;
    const data = this.dashboardData && this.dashboardData.opPatient ? this.dashboardData.opPatient : null;
    this.totalOpPatient = data ? data.total : 0.00;
    this.opPatient = data ? data.op : 0.00;
    this.followUpPatient = data ? data.followUp : 0.00;
    this.otherPatient = data ? data.other : 0.00;
    this.getOpPatientData();
    this.commonService.$subRevnewDashboardDetailShow.pipe(takeUntil(this.destroy$)).subscribe((val: any) => {
      if (val !== 'isOPPatientVisible') {
        this.isOPPatientVisible = false;
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  getOpPatientData() {
    if (this.opPatient || this.followUpPatient || this.otherPatient) {
      this.loadChart = true;
    }
    this.donutChartData = [{
      type: "OP",
      val: this.opPatient
    }, {
      type: "Follow-Up",
      val: this.followUpPatient
    }, {
      type: "Other",
      val: this.otherPatient
    }];
  }

  showOPPatientDetail() {
    this.isOPPatientVisible = !this.isOPPatientVisible;
    this.isOPPatientVisibleSection.emit(this.isOPPatientVisible);
  }

  customizeLabel(arg) {
    return arg.valueText + " (" + arg.percentText + ")";
  }

}
