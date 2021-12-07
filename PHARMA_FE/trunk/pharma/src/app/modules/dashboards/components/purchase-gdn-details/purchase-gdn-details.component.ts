import { Component, OnInit, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-purchase-gdn-details',
  templateUrl: './purchase-gdn-details.component.html',
  styleUrls: ['./purchase-gdn-details.component.scss']
})
export class PurchaseGdnDetailsComponent implements OnInit, OnChanges {
  @Input() isIPPatientVisible: boolean;
  @Input() selectedSummary: string;
  constructor() { }

  ngOnInit(): void {
  }
  ngOnChanges(): void {
  }

}
