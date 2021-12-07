import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { AuthService } from './../public/services/auth.service';
import { CommonService } from './../public/services/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { GlobalErrorComponent } from './../shared/global-error/global-error.component';
import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { EncounterPatient } from '../public/models/encounter-patient.model';

@Component({
  selector: 'app-emr-home-dashboard',
  templateUrl: './emr-home-dashboard.component.html',
  styleUrls: ['./emr-home-dashboard.component.scss']
})
export class EmrHomeDashboardComponent implements OnInit {
  destroy$ = new Subject<any>();
  showHideMenu: any;
  showMenuType: string;
  loading = false;
  globalError = false;
  errorMsgDetails: any;
  modalService: NgbModal;
  islogOut = false;
  isAutoLogout = false;
  // menuState = 'out';
  // isOpen = false;
  // sideBarTitle = '';

  constructor(
    private commonService: CommonService,
    private authService: AuthService,
    private router: Router,
    private confirmationModalService: NgbModal) {
    this.modalService = this.confirmationModalService;
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if ((event.url.includes('/patient/')
          || event.url.includes('opd')
          || event.url.includes('ipd'))) {
          this.showMenuType = 'slide';
        }
        else {
          this.showMenuType = 'fixed';
        }
        this.commonService.showHideMenuIconNavbar(this.showMenuType === 'slide' ? true : false);
      }
      // else if (event instanceof NavigationEnd) {
      //   this.loading = true;
      // }
    });
  }

  ngOnInit(): void {
    this.showHideMenu = false;
    this.subcriptionOfEvents();
    this.getRecentPatientList();
    localStorage.setItem('loginFor', JSON.stringify('EMR'));
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  getRecentPatientList() {
    const userId = this.authService.getLoggedInUserId();
    this.commonService.getAllRecentPatientList(userId).subscribe(res => {
      if (res.length > 0) {
        res.forEach(element => {
          const pat = new EncounterPatient();
          pat.generateObject(element);
          this.commonService.setActivePatientList(pat, 'add');
        });
      }
    });
  }

  subcriptionOfEvents(): void {
    this.commonService.$menushowHide.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.showHideMenu = data;
    });
    this.commonService.$menushowHideReverse.pipe(takeUntil(this.destroy$)).subscribe((obj: any) => {
      this.showHideMenu = obj;
    });

    // this.commonService.$changeEvent.subscribe((obj: any) => {
    //   if (obj.isFrom !== 'sidebar') {
    //     this.isOpen = obj.isOpen;
    //     this.sideBarTitle = obj.title;
    //     this.menuState = this.isOpen === false ? 'out' : 'in';
    //   }
    // });

  }

}
