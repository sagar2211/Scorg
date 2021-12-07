import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { ReportConstants } from 'src/app/config/report_constants';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { CommonService } from 'src/app/public/services/common.service';
import { AuthService } from 'src/app/public/services/auth.service';

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss']
})
export class PatientListComponent implements OnInit {
  url = ReportConstants.PatientListCommonView;
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
    const appKey = this.authService.getActiveAppKey() ? this.authService.getActiveAppKey().toLowerCase() : 'ot';
    this.url= this.url + '/' +  this.authService.getAuthToken() +  "/" + appKey;
    this.url = this.url + '?v1=' + new Date().getTime();
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
    this.commonService.routeChanged(this.route);
  }

}