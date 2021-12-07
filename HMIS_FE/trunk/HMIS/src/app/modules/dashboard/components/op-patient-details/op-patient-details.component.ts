import { Component, OnInit, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-op-patient-details',
  templateUrl: './op-patient-details.component.html',
  styleUrls: ['./op-patient-details.component.scss']
})
export class OpPatientDetailsComponent implements OnInit, OnChanges {
  @Input() isOPPatientVisible: boolean;
  @Input() selectedSummary: string;
  @Input() dashboardData;
  constructor() { }

  ngOnInit(): void {
  }
  ngOnChanges(): void {
  }

}
