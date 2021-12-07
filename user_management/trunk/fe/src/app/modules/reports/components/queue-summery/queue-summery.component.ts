import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../../services/common.service';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ReportConstants } from 'src/app/config/report_constants';

@Component({
  selector: 'app-queue-summery',
  templateUrl: './queue-summery.component.html',
  styleUrls: ['./queue-summery.component.scss']
})
export class QueueSummeryComponent implements OnInit {
  url = ReportConstants.QueueReport;
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
