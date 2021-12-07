import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-bed-occupancy',
  templateUrl: './bed-occupancy.component.html',
  styleUrls: ['./bed-occupancy.component.scss']
})
export class BedOccupancyComponent implements OnInit {
  @Input() dashboardData;
  isBedOccupancySwitch = true;
  bedData = [];
  loadChart = false;
  constructor() { }

  ngOnInit(): void {
    this.generateBedData();
  }

  showBedOccupancySwitch() {
    this.isBedOccupancySwitch = !this.isBedOccupancySwitch;
  }

  generateBedData() {
    const data = this.dashboardData && this.dashboardData.bedOccupancy ? this.dashboardData.bedOccupancy : [];
    this.bedData = [];
    // const obj = {
    //   bedType: 'sadad',
    //   // total: 13,
    //   occupied: 12,
    //   vacant: 9,
    //   other: 3,
    // }
    // this.bedData.push(obj);
    data.map(d => {
      const obj = {
        bedType: d.bedType,
        total: d.total,
        occupied: d.occupied,
        vacant: d.vacant,
        other: d.otherBed,
      }
      this.bedData.push(obj);
    });
    if (this.bedData.length) {
      this.loadChart = true;
    }
  }

}
