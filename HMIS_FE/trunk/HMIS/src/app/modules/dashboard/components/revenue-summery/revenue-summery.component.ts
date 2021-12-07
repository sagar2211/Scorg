import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-revenue-summery',
  templateUrl: './revenue-summery.component.html',
  styleUrls: ['./revenue-summery.component.scss']
})
export class RevenueSummeryComponent implements OnInit {
  @Input() dashboardData;
  selectedSummary = 'division_wise';
  isRevenueSummarySwitch = true;
  revSummery = [];
  graphData = [];
  revDataArray = {
    data: [],
    total: 0.00
  };
  loadChart = false;
  constructor() { }

  ngOnInit(): void {
    this.revSummery = this.dashboardData && this.dashboardData.revenueSummary ? this.dashboardData.revenueSummary : [];
    this.getDataByType();
  }

  randomIntFromInterval(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  getDataByType() {
    this.revDataArray = {
      data: [],
      total: 0.00
    };
    this.revSummery.map(d => {
      const obj = {
        itemName: d.departmentName,
        totalVal: d.total,
        opVal: d.op,
        ipVal: d.ip,
        otherVal: d.other,
        isExpanded: false
      }
      this.revDataArray.data.push(obj);
      this.revDataArray.total = this.revDataArray.total + d.total;
    });
    this.loadChart = true;
    if (!this.isRevenueSummarySwitch) {
      this.generateGraphData();
    }
  }

  generateGraphData() {
    this.graphData = [];
    this.revDataArray.data.map(d => {
      const obj = {
        name: d.itemName,
        opVal: d.opVal,
        ipVal: d.ipVal,
        otherVal: d.otherVal,
      };
      this.graphData.push(obj);
    });
  }

  updateRevenueSummary(val) {
    this.selectedSummary = val;
    this.getDataByType();
  }

  showRevenueSummarySwitch() {
    this.isRevenueSummarySwitch = !this.isRevenueSummarySwitch;
    this.generateGraphData();
  }

  customizeTooltip(arg: any) {
    return {
      text: arg.seriesName + ' years: ' + arg.valueText
    };
  }

  getWidth() {
    if (this.graphData.length < 8) {
      return 'auto';
    } else {
      return this.graphData.length * 50 + 'px';
    }
  }

}
