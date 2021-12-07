import { Component, OnInit } from '@angular/core';
import { AuthService } from './../../../public/services/auth.service';
import { ConsultationService } from './../../../public/services/consultation.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-image-anotation',
  templateUrl: './image-anotation.component.html',
  styleUrls: ['./image-anotation.component.scss']
})
export class ImageAnotationComponent implements OnInit {
  clonedCustomProperties: any = {};
  base64result: string;
  fabricInstance;
  userId: number;
  patientId: any;
  visitNo: string;
  baseUrl = 'https://drrescribe.com/application/app.html#/access/imageAnotation';
  iframeUrl: any;
  isHide = true;

  constructor(
    private authService: AuthService,
    private consultationService: ConsultationService,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {
    this.userId = this.authService.getLoggedInUserId();
  }

  ngOnInit() {
    this.consultationService.getPatientObj('patientId', true).subscribe(res => {
      this.patientId = this.consultationService.getPatientObj('patientId');
      this.visitNo = this.consultationService.getPatientObj('visitNo');
      this.iframeUrl = `${this.baseUrl}/${this.userId}/${this.patientId}/${this.visitNo ? this.visitNo : ''}`;
      this.iframeUrl = this.iframeUrl + '?v1=' + new Date().getTime();
      this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.iframeUrl);
      this.isHide = true;
    });
  }

  picked(event, field) {
    // this.currentId = field;
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      const file: File = fileList[0];
      // this.sellersPermitFile = file;
      this.handleInputChange(file);
    } else {
      alert('No file selected');
    }
  }

  handleInputChange(files) {
    const file = files;
    const pattern = /image-*/;
    const reader = new FileReader();
    if (!file.type.match(pattern)) {
      alert('invalid format');
      return;
    }
    reader.onloadend = this._handleReaderLoaded.bind(this);
    reader.readAsDataURL(file);
  }

  _handleReaderLoaded(e) {
    const reader = e.target;
    this.base64result = reader.result.substr(reader.result.indexOf(',') + 1);
  }

  navigate() {
    this.router.navigate(['/emr/patient/icu_flow_sheet/sheet/', this.patientId]);
  }
}
