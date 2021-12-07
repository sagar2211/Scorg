
import { CommonService } from 'src/app/services/common.service';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { ReportConstants } from 'src/app/config/report_constants';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import * as _ from 'lodash';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-add-patient',
  templateUrl: './add-patient.component.html',
  styleUrls: ['./add-patient.component.scss']
 // providers: [CalculateAge]
})
export class AddPatientComponent implements OnInit {
  url = ReportConstants.AddPatientCommonView;
  urlSafe: SafeResourceUrl;

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
    const formType = 'full';
    const token = this.authService.getUserInfoFromLocalStorage().auth_token;
    const appKey = 'qms'
    const uhid = this.patient_Uhid;
    this.url= this.url + '/' + formType + '/' + token + '/' + appKey + '/' + uhid; // + '?v1=' + Math.random();
    console.log(this.url)
    //this.url= this.url + '/?token=' +  this.authService.getUserInfoFromLocalStorage().auth_token  +  "&patientUhid=" + this.patient_Uhid;
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
    this.commonService.routeChanged(this.route);
  }

}

