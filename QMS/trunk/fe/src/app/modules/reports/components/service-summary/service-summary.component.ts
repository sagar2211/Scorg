import { CommonService } from 'src/app/services/common.service';
import { ActivatedRoute } from '@angular/router';
import { ReportConstants } from 'src/app/config/report_constants';
import { Component, OnInit } from '@angular/core';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-service-summary',
  templateUrl: './service-summary.component.html',
  styleUrls: ['./service-summary.component.scss']
})
export class ServiceSummaryComponent implements OnInit {
  url = ReportConstants.ServiceSummary;
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
