import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/public/services/common.service';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/public/services/auth.service';

@Component({
  selector: 'app-investigation-history-home',
  templateUrl: './investigation-history-home.component.html',
  styleUrls: ['./investigation-history-home.component.scss']
})
export class InvestigationHistoryHomeComponent implements OnInit, OnDestroy {
  selectedSectionMain: string;
  patientId: any;
  destroy$ = new Subject<any>();
  patientObj: any;
  showTab: boolean;

  constructor(
    private router: Router,
    private commonService: CommonService,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.selectedSectionMain = 'history';
    this.getpatientData();
    this.checkUrlForActiveSection();
    this.subcriptionOfEvents();
    this.showTab = true;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  checkUrlForActiveSection() {
    if (this.router.url.includes('patient/investigationHistory/history')) {
      this.updateSectionMain('history');
    } else if (this.router.url.includes('patient/investigationHistory/reports')) {
      this.updateSectionMain('reports');
    }
  }

  updateSectionMain(val) {
    this.selectedSectionMain = val;
    const appKey = this.authService.getActiveAppKey() === 'EMR' ? 'emr' : 'nursing';
    let appModuleUrl = appKey == 'emr' ? '/emr' : '/nursingApp/nursing';
    if (val === 'history') {
      this.router.navigate([appModuleUrl + '/patient/investigationHistory/history/', this.patientId]);
    } else if (val === 'reports') {
      this.router.navigate([appModuleUrl + '/patient/investigationHistory/reports/', this.patientId]);
    }
  }

  subcriptionOfEvents() {
    this.commonService.$subAddRemoveActivePatientFromList.pipe(takeUntil(this.destroy$)).subscribe((obj: any) => {
      this.getpatientData(obj.data);
    });
    // this.commonService.$subhistoryTabHideShow.pipe(takeUntil(this.destroy$)).subscribe((obj: any) => {
    //   if (!this.showTab) {
    //     this.updateSectionMain('reports');
    //   }
    //   this.selectedSectionMain = 'reports';
    // });
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
