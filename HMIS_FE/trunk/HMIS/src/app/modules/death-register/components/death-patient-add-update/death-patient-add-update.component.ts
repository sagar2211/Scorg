import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ReportConstants } from 'src/app/config/report_constants';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { AuthService } from 'src/app/public/services/auth.service';
import { CommonService } from 'src/app/public/services/common.service';

@Component({
  selector: 'app-death-patient-add-update',
  templateUrl: './death-patient-add-update.component.html',
  styleUrls: ['./death-patient-add-update.component.scss']
})
export class DeathPatientAddUpdateComponent implements OnInit {

  url = ReportConstants.deathPatientRegCommonView;
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
    const token = this.route.snapshot.paramMap.get('token');
    if(uhid && token){
      console.log(uhid);
      this.patient_Uhid = uhid;
    }
    
    this.patient_Uhid = this.patient_Uhid ? this.patient_Uhid : 0;
    if(this.patient_Uhid !== 0 && token){
      this.url= this.url + '/' + token + '/nursing/' +this.patient_Uhid;
    } else {
      this.url= this.url + '/' +  this.authService.getAuthToken() +  "/nursing/" + this.patient_Uhid;
    }
    
    this.url = this.url + '?v1=' + new Date().getTime();
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
    this.commonService.routeChanged(this.route);
  }
}