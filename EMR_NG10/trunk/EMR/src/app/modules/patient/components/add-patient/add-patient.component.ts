
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
  selector: 'app-add-patient',
  templateUrl: './add-patient.component.html',
  styleUrls: ['./add-patient.component.scss']
 // providers: [CalculateAge]
})
export class AddPatientComponent implements OnInit {
  url = ReportConstants.AddPatientCommonView;
  urlSafe: SafeResourceUrl;
  alertMsg: IAlert;

  isModal: boolean = false;
  editPatientDetails: boolean = false;
  appId = 0;
  patient_Uhid :any;
  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
    private authService: AuthService,
    public sanitizer: DomSanitizer,
    public modal: NgbActiveModal,
  ) { }

  ngOnInit() {
    const uhid = this.route.snapshot.paramMap.get('id');
    if(uhid){
      console.log(uhid);
      this.patient_Uhid = uhid;
    }
    this.patient_Uhid = this.patient_Uhid ? this.patient_Uhid : 0;
    this.url= this.url + '/' +  this.authService.getAuthToken() +  "/emr/" + this.patient_Uhid;
    this.url = this.url + '?v1=' + new Date().getTime();
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
    this.commonService.routeChanged(this.route);
  }

}

