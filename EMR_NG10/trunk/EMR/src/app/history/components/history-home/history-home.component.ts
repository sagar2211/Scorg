import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Constants } from 'src/app/config/constants';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonService } from '../../../public/services/common.service';
import { AuthService } from 'src/app/public/services/auth.service';

@Component({
  selector: 'app-history-home',
  templateUrl: './history-home.component.html',
  styleUrls: ['./history-home.component.scss']
})
export class HistoryHomeComponent implements OnInit, OnDestroy {
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
    this.selectedSectionMain = 'patient';
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
    if (this.router.url.includes('history/visit')) {
      this.updateSectionMain('patient');
    } else if (this.router.url.includes('history/patient')) {
      this.updateSectionMain('patient');
    } else if (this.router.url.includes('history/encounter')) {
      this.updateSectionMain('encounter');
    }
  }

  updateSectionMain(val) {
    this.selectedSectionMain = val;
    const appKey = this.authService.getActiveAppKey() === 'EMR' ? 'emr' : 'nursing';
    let appModuleUrl = appKey == 'emr' ? '/emr' : '/nursingApp/nursing';
    if (val === 'patient') {
      this.router.navigate([appModuleUrl + '/patient/history/in_out_history/', this.patientId]);
    } else if (val === 'visit') {
      this.router.navigate([appModuleUrl + '/patient/history/visit/', this.patientId]);
    } else if (val === 'encounter') {
      this.router.navigate([appModuleUrl + '/patient/history/encounter/', this.patientId]);
    }
  }

  subcriptionOfEvents() {
    this.commonService.$subAddRemoveActivePatientFromList.pipe(takeUntil(this.destroy$)).subscribe((obj: any) => {
      this.getpatientData(obj.data);
    });
    this.commonService.$subhistoryTabHideShow.pipe(takeUntil(this.destroy$)).subscribe((obj: any) => {
      if (!this.showTab) {
        this.updateSectionMain('patient');
      }
      this.showTab = obj === 'encounter' ? false : true;
    });
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
