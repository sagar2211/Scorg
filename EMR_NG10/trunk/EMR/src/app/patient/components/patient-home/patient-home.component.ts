import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonService } from './../../../public/services/common.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from 'src/app/public/services/auth.service';

@Component({
  selector: 'app-patient-home',
  templateUrl: './patient-home.component.html',
  styleUrls: ['./patient-home.component.scss']
})
export class PatientHomeComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<any>();
  showHideIconLabel: boolean;
  activePatientList = [];

  constructor(
    private commonService: CommonService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.showHideIconLabel = false;
    this.activePatientList = this.commonService.getActivePatientList();
    if (this.activePatientList.length === 0) {
      this.router.navigate(['dashboard/doctor']);
    }
    this.subcriptionOfEvents();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  subcriptionOfEvents(): void {
    this.commonService.$showHidePatientMenuToSortInfo.pipe(takeUntil(this.destroy$)).subscribe((obj: any) => {
      this.showHideIconLabel = !this.showHideIconLabel;
    });
  }

}
