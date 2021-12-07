import { CommonService } from 'src/app/services/common.service';
import { ReportConstants } from 'src/app/config/report_constants';
import { Component, OnInit } from '@angular/core';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-service-schedule-summary',
  templateUrl: './service-schedule-summary.component.html',
  styleUrls: ['./service-schedule-summary.component.scss']
})
export class ServiceScheduleSummaryComponent implements OnInit {
  url = ReportConstants.ServiceScheduleSummary;
  urlSafe: SafeResourceUrl;
  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
    public sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.url = this.url + '?v1=' + new Date().getTime();
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
    this.commonService.routeChanged(this.route);
  }
}
