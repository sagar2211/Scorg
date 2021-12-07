import { Component, OnInit, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-purchase-order-details',
  templateUrl: './purchase-order-details.component.html',
  styleUrls: ['./purchase-order-details.component.scss']
})
export class PurchaseOrderDetailsComponent implements OnInit, OnChanges {
  @Input() isTotalRevenueVisible: boolean;
  constructor() { }

  ngOnInit(): void {
  }
  ngOnChanges(): void {
  }

}
