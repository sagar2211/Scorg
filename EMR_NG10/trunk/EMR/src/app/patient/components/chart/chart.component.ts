import { Component, OnInit, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit, OnChanges {
  @Input() painChartData;
  @Input() painAssociatedData;
  @Input() chartRightCount;
  @Input() lightTouchRightCount;
  @Input() pinprickRightCount;
  @Input() setClass;
  @Input() dummyData;
  @Input() lightTouchLeftCount;
  @Input() pinprickLeftCount;
  @Input() chartLeftCount;
  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    this.painChartData = this.painChartData;
    this.painAssociatedData = this.painAssociatedData;
    this.chartRightCount = this.chartRightCount;
    this.lightTouchRightCount = this.lightTouchRightCount;
    this.pinprickRightCount = this.pinprickRightCount;
    this.setClass = this.setClass;
    this.dummyData = this.dummyData;
    this.lightTouchLeftCount = this.lightTouchLeftCount;
    this.pinprickLeftCount = this.pinprickLeftCount;
    this.chartLeftCount = this.chartLeftCount;
  }

}
