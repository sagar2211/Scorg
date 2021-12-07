import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/public/services/common.service';

@Component({
  selector: 'app-dashboards-home',
  templateUrl: './dashboards-home.component.html',
  styleUrls: ['./dashboards-home.component.scss']
})
export class DashboardsHomeComponent implements OnInit {
  isTotalRevenueVisible: boolean;
  isOPPatientVisible: boolean;
  isIPPatientVisible: boolean;

  isRevenueSummarySwitch: boolean;
  isRevenueSummary1: boolean;
  isRevenueSummary2: boolean;
  isRevenueSummary3: boolean;

  isBedOccupancySwitch: boolean;

  selectedSummary = "division_wise";
  isMobile = window.innerWidth <= 768 ? true : false;
  constructor(
    private router: Router,
    private commonService: CommonService,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.isTotalRevenueVisible = false;
    this.isOPPatientVisible = false;
    this.isIPPatientVisible = false;

    this.isRevenueSummarySwitch = false;
    this.isRevenueSummary1 = false;
    this.isRevenueSummary2 = false;
    this.isRevenueSummary3 = false;

    this.isBedOccupancySwitch = false;
    this.commonService.routeChanged(this.activatedRoute);
  }

  showTotalRevenueDetail() {
    this.isTotalRevenueVisible = !this.isTotalRevenueVisible;
  }

  showOPPatientDetail() {
    this.isOPPatientVisible = !this.isOPPatientVisible;
  }

  showIPPatientDetail() {
    this.isIPPatientVisible = !this.isIPPatientVisible;
  }

  showBedOccupancySwitch() {
    this.isBedOccupancySwitch = !this.isBedOccupancySwitch;
  }

  showRevenueSummary1() {
    this.isRevenueSummary1 = !this.isRevenueSummary1;
  }
  showRevenueSummary2() {
    this.isRevenueSummary2 = !this.isRevenueSummary2;
  }
  showRevenueSummary3() {
    this.isRevenueSummary3 = !this.isRevenueSummary3;
  }

  showRevenueSummarySwitch() {
    this.isRevenueSummarySwitch = !this.isRevenueSummarySwitch;
  }

  updateRevenueSummary(val) {
    this.selectedSummary = val;
  }

}
