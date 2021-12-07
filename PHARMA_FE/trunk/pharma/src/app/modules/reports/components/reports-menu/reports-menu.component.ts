import { AuthService } from './../../../../public/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import {CommonService} from '../../../../public/services/common.service';
import {ReportsService} from '../../services/reports.service';
import * as _ from 'lodash';
import { environment } from 'src/environments/environment';

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
    private reportService: ReportsService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.getSetUrl();
    this.commonService.routeChanged(this.route);
  }

  getSetUrl(): void{
    this.url = '';
    this.reportService.getReportsMenu().subscribe(res => {
      if (res.length) {
        const urlKey = _.split(location.href, '/').pop();
        const menu = _.find(res, (o) => urlKey === o.menuKey);
        if (menu) {
          if (this.commonService.getReportUrlParameters()) {
            this.url = environment.REPORT_API + menu.menuURL + this.commonService.getReportUrlParameters();
          } else {
            this.url = environment.REPORT_API + menu.menuURL;
          }
          this.url = this.url.replace('#token#', this.authService.getAuthToken());
          this.url = this.url.replace('#storeId#', this.authService.getLoginStoreId());
          this.url = this.url + '?v1=' + new Date().getTime();
          this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
          this.commonService.setreportUrlParametes('');
        }
      }
    });
  }
  myLoadEvent(): void{ // after load iframe event is called
    if (this.url) {
      this.commonService.reportIframeLoaderNotify(false);
    }
  }

}
