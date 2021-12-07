import { CommonService } from 'src/app/services/common.service';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { ReportConstants } from 'src/app/config/report_constants';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-patient-appointment-history',
  templateUrl: './patient-appointment-history.component.html',
  styleUrls: ['./patient-appointment-history.component.scss']
})
export class PatientAppointmentHistoryComponent implements OnInit {
  url = ReportConstants.PatientAppointmentHistory;
  urlSafe: SafeResourceUrl;
  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
    public sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
    this.commonService.routeChanged(this.route);
  }

}
