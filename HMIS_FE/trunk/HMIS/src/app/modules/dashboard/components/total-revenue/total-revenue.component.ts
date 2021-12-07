import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonService } from 'src/app/public/services/common.service';

@Component({
  selector: 'app-total-revenue',
  templateUrl: './total-revenue.component.html',
  styleUrls: ['./total-revenue.component.scss']
})
export class TotalRevenueComponent implements OnInit, OnDestroy {

  @Output() isTotalRevenueVisibleSection = new EventEmitter<any>();
  @Input() dashboardData;
  donutChartData = [];
  isTotalRevenueVisible: boolean;
  totalRev = 1127476.2;
  opRev = 624285;
  ipRev = 303141;
  otherRev = 200050.2;
  destroy$ = new Subject();
  loadChart = false;

  constructor(
    private commonService: CommonService,
  ) {
  }

  ngOnInit(): void {
    this.isTotalRevenueVisible = false;
    this.totalRev = this.dashboardData && this.dashboardData.totalRevenue ? this.dashboardData.totalRevenue.totalAmount : 0.00;
    this.opRev = this.dashboardData && this.dashboardData.totalRevenue ? this.dashboardData.totalRevenue.opAmount : 0.00;
    this.ipRev = this.dashboardData && this.dashboardData.totalRevenue ? this.dashboardData.totalRevenue.ipAmount : 0.00;
    this.otherRev = this.dashboardData && this.dashboardData.totalRevenue ? this.dashboardData.totalRevenue.otherAmount : 0.00;
    this.commonService.$subRevnewDashboardDetailShow.pipe(takeUntil(this.destroy$)).subscribe((val: any) => {
      if (val !== 'isTotalRevenueVisible') {
        this.isTotalRevenueVisible = false;
      }
    });
    this.getRevnueData();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }


  getRevnueData() {
    if(this.opRev || this.ipRev || this.otherRev){
      this.loadChart = true;
    }
    this.donutChartData = [{
      type: "OP",
      val: this.opRev
    }, {
      type: "IP",
      val: this.ipRev
    }, {
      type: "Other",
      val: this.otherRev
    }];
  }

  showTotalRevenueDetail() {
    this.isTotalRevenueVisible = !this.isTotalRevenueVisible;
    this.isTotalRevenueVisibleSection.emit(this.isTotalRevenueVisible);
  }

  customizeLabel(arg) {
    return arg.valueText + " (" + arg.percentText + ")";
  }

}
