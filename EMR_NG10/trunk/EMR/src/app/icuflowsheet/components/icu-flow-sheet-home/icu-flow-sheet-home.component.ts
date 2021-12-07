import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Constants } from 'src/app/config/constants';
import { CommonService } from './../../../public/services/common.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/public/services/auth.service';

@Component({
  selector: 'app-icu-flow-sheet-home',
  templateUrl: './icu-flow-sheet-home.component.html',
  styleUrls: ['./icu-flow-sheet-home.component.scss']
})
export class IcuFlowSheetHomeComponent implements OnInit, OnDestroy {
  patientId: any;
  destroy$ = new Subject<any>();
  patientObj: any;
  typeOfRoute: string;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.typeOfRoute = 'ipd';
    this.getpatientData();
    this.subcriptionOfEvents();

    const appKey = this.authService.getActiveAppKey() === 'EMR' ? 'emr' : 'nursing';
    let appModuleUrl = appKey == 'emr' ? '/emr' : '/nursingApp/nursing';
    this.router.navigate([appModuleUrl + '/patient/icu_flow_sheet/sheet/' + this.patientId]);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  subcriptionOfEvents() {
    this.commonService.$subAddRemoveActivePatientFromList.pipe(takeUntil(this.destroy$)).subscribe((obj: any) => {
      this.getpatientData(obj.data);
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
