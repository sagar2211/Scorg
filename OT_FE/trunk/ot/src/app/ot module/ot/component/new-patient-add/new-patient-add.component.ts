import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/public/services/auth.service';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-new-patient-add',
  templateUrl: './new-patient-add.component.html',
  styleUrls: ['./new-patient-add.component.scss']
})
export class NewPatientAddComponent implements OnInit {
  @Input() messageDetails: any;
  isShowCrossIcon = true;
  patUrl = null;
  pathUrl = null;
  urlSafe;
  constructor(
    public modal: NgbActiveModal,
    public authService: AuthService,
    public sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    const tkn = this.authService.getAuthToken();
    this.pathUrl = environment.HIS_Add_PatientCommon_API + '/Patient/Registration/?token=' + tkn + '&patientUhid=0';
    this.pathUrl = this.pathUrl + '&v1=' + new Date().getTime();
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.pathUrl);
    this.isShowCrossIcon = this.messageDetails.isShowCrossIcon !== undefined ?
      this.messageDetails.isShowCrossIcon : true;
  }

}
