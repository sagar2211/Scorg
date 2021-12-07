import { ReportConstants } from 'src/app/config/report_constants';
import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../../services/common.service';
import { ActivatedRoute } from '@angular/router';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-booking-summery',
  templateUrl: './booking-summery.component.html',
  styleUrls: ['./booking-summery.component.scss']
})
export class BookingSummeryComponent implements OnInit {
  url = ReportConstants.PatientAppointmentTypeSummary;
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
