import { Component, OnInit } from '@angular/core';
import { ReportConstants } from '../../../../config/report_constants';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '../../../../services/common.service';
import { ReportsService } from '../../services/reports.service';
import * as _ from 'lodash';
@Component({
  selector: 'app-reports-menu',
  templateUrl: './reports-menu.component.html',
  styleUrls: ['./reports-menu.component.scss']
})
export class ReportsMenuComponent implements OnInit {

  url: string;
  urlSafe: SafeResourceUrl;
  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
    public sanitizer: DomSanitizer,
    private reportService: ReportsService
  ) { }

  ngOnInit() {
    this.getSetUrl();
    // this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
    // this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl('http://172.16.100.212:55/QMSReport/PatientAppointment');
    this.commonService.routeChanged(this.route);
  }
  getSetUrl() {
    this.url = '';
    this.reportService.getReportsMenu().subscribe(res => {
      if (res.length) {
        const urlKey = _.split(location.href, '/').pop();
        const menu = _.find(res, (o) => urlKey === o.menuKey);
        if (menu) {
          if (this.commonService.getReportUrlParameters()) {
           this.url = menu.menuURL + this.commonService.getReportUrlParameters();
          } else {
          this.url = menu.menuURL;
          }
          this.url = this.url + '?v1=' + new Date().getTime();
          this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
          this.commonService.setreportUrlParametes('');
        }
      }
    });
  }
  myLoadEvent() { // after load iframe event is called
    if (this.url) {
      this.commonService.reportIframeLoaderNotify(false);
    }
  }
}
