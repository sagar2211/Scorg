import { Component, OnInit, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-total-revenue-details',
  templateUrl: './total-revenue-details.component.html',
  styleUrls: ['./total-revenue-details.component.scss']
})
export class TotalRevenueDetailsComponent implements OnInit, OnChanges {
  @Input() isTotalRevenueVisible: boolean;
  @Input() dashboardData;
  constructor() { }

  ngOnInit(): void {
  }
  ngOnChanges(): void {
  }

}
