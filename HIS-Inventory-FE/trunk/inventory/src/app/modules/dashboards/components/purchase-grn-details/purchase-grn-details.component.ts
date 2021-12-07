import { Component, OnInit, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-purchase-grn-details',
  templateUrl: './purchase-grn-details.component.html',
  styleUrls: ['./purchase-grn-details.component.scss']
})
export class PurchaseGrnDetailsComponent implements OnInit, OnChanges {
  @Input() isOPPatientVisible: boolean;
  @Input() selectedSummary: string;
  constructor() { }

  ngOnInit(): void {
  }
  ngOnChanges(): void {
  }

}