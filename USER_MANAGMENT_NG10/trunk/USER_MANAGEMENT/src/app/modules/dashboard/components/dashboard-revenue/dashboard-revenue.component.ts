import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard-revenue',
  templateUrl: './dashboard-revenue.component.html',
  styleUrls: ['./dashboard-revenue.component.scss']
})
export class DashboardRevenueComponent implements OnInit {
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
  constructor() { }

  ngOnInit(): void {
    this.isTotalRevenueVisible = false;
    this.isOPPatientVisible = false;
    this.isIPPatientVisible = false;

    this.isRevenueSummarySwitch = false;
    this.isRevenueSummary1 = false;
    this.isRevenueSummary2 = false;
    this.isRevenueSummary3 = false;

    this.isBedOccupancySwitch = false;
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
