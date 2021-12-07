import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../../services/common.service';
import { ActivatedRoute } from '@angular/router';
import { ReportConstants } from 'src/app/config/report_constants';
import * as _ from 'lodash';


@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit {
  url = ReportConstants.PatientAppointment;
  urlSafe: SafeResourceUrl;
  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
    public sanitizer: DomSanitizer
  ) {
    if (!_.isUndefined(this.route.snapshot.params.path)) {
      this.url = ReportConstants.PatientAppointment + this.route.snapshot.params.path;
    }
   }

  ngOnInit() {
    this.url = this.url + '?v1=' + new Date().getTime();
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
    this.commonService.routeChanged(this.route);
  }

}
