import { Component, OnInit, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-ip-patient-details',
  templateUrl: './ip-patient-details.component.html',
  styleUrls: ['./ip-patient-details.component.scss']
})
export class IpPatientDetailsComponent implements OnInit, OnChanges {
  @Input() isIPPatientVisible: boolean;
  @Input() selectedSummary: string;
  @Input() dashboardData;
  constructor() { }

  ngOnInit(): void {
  }
  ngOnChanges(): void {
  }

}
