import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { CommonService } from 'src/app/services/common.service';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { ReportConstants } from 'src/app/config/report_constants';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-list-patient',
  templateUrl: './list-patient.component.html',
  styleUrls: ['./list-patient.component.scss']
})
export class ListPatientComponent implements OnInit {
  url = ReportConstants.AddPatientListView;
  urlSafe: SafeResourceUrl;
  isModal: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
    private authService: AuthService,
    public sanitizer: DomSanitizer,
    public modal: NgbActiveModal,
  ) { }

  ngOnInit() {
    const token = this.authService.getUserInfoFromLocalStorage().auth_token;
    const appKey = 'qms'
    this.url= this.url + '/' + token + '/' + appKey;
    this.url = this.url + '?v1=' + new Date().getTime();
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
    this.commonService.routeChanged(this.route);
  }

}
