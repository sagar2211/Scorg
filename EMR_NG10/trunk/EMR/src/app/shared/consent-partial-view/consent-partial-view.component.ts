import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/public/services/auth.service';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-consent-partial-view',
  templateUrl: './consent-partial-view.component.html',
  styleUrls: ['./consent-partial-view.component.scss']
})
export class ConsentPartialViewComponent implements OnInit {
  @Input() patientData;
  patientId: null;
  url = null;
  urlSafe: SafeResourceUrl = null;
  loadSource = null;
  constructor(
    public modal: NgbActiveModal,
    public authService: AuthService,
    public sanitizer: DomSanitizer,
  ) { }

  ngOnInit(): void {
    this.patientId = this.patientData.id;
    this.loadSource = 'NURSING FORM';
    this.getSetUrl();
  }

  getSetUrl(): void {
    this.url = environment.consentPartialUrl;
    this.url = this.url.replace('#token#', this.authService.getAuthToken());
    this.url = this.url.replace('#source#', this.loadSource);
    if (this.patientId) {
      this.url = this.url.replace('#patientId#', this.patientId);
    } else {
      this.url = this.url.replace('#patientId#', null);
    }
    this.url = this.url + '?v1=' + new Date().getTime();
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
  }

}
