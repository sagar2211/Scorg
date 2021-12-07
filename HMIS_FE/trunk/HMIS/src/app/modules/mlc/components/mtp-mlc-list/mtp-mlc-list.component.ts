import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ReportConstants } from 'src/app/config/report_constants';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { AuthService } from 'src/app/public/services/auth.service';
import { CommonService } from 'src/app/public/services/common.service';

@Component({
  selector: 'app-mtp-mlc-list',
  templateUrl: './mtp-mlc-list.component.html',
  styleUrls: ['./mtp-mlc-list.component.scss']
})
export class MtpMlcListComponent implements OnInit {

  url = ReportConstants.mlcListCommonView;
  urlSafe: SafeResourceUrl;
  alertMsg: IAlert;

  isModal: boolean = false;
  editPatientDetails: boolean = false;
  appId = 0;
  patient_Uhid = 0;
  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
    private authService: AuthService,
    public sanitizer: DomSanitizer,
    public modal: NgbActiveModal,
  ) { }

  ngOnInit() {
    this.patient_Uhid ? this.patient_Uhid : 0;
    this.url= this.url + '/' +  this.authService.getAuthToken() +  "/" + this.authService.getActiveAppKey().toLowerCase();
    this.url = this.url + '?v1=' + new Date().getTime();
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
    this.commonService.routeChanged(this.route);
  }

}