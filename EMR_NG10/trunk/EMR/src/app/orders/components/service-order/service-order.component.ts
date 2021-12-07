import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ReportConstants } from 'src/app/config/report_constants';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { AuthService } from 'src/app/public/services/auth.service';
import { CommonService } from 'src/app/public/services/common.service';

@Component({
  selector: 'app-service-order',
  templateUrl: './service-order.component.html',
  styleUrls: ['./service-order.component.scss']
})
export class ServiceOrderComponent implements OnInit, OnDestroy {
  url = ReportConstants.PostServiceOrderPartialUrl;
  urlSafe: SafeResourceUrl;
  alertMsg: IAlert;
  patientId: string = null;
  patientObj: any;
  destroy$ = new Subject();
  loadPage = false;
  constructor(private route: ActivatedRoute,
    private commonService: CommonService,
    private authService: AuthService,
    public sanitizer: DomSanitizer,
  ) { }

  ngOnInit(): void {
    this.getpatientData();
    this.afterGetPatData();
    this.commonService.routeChanged(this.route);
    this.commonService.$subAddRemoveActivePatientFromList.pipe(takeUntil(this.destroy$)).subscribe((obj: any) => {
      this.loadPage = false;
      this.getpatientData(obj.data);
      this.afterGetPatData();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }


  afterGetPatData() {
    this.urlSafe = null;
    this.patientId = this.patientId; // this.patientId ||
    this.url = this.url + '?token=' + this.authService.getAuthToken() + '&patientUhid=' + this.patientId;
    this.url = this.url + '&v1=' + new Date().getTime();
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
    this.loadPage = true;
  }

  getpatientData(patient?) {
    if (patient) {
      this.patientObj = patient;
    } else {
      this.patientObj = this.commonService.getLastActivePatient();
    }
    this.patientId = this.patientObj.patientData.id;
  }



}
