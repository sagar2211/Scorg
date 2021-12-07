import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/public/services/common.service';
import { NavigationEnd, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/public/services/auth.service';

@Component({
  selector: 'app-nursing-main-home',
  templateUrl: './nursing-main-home.component.html',
  styleUrls: ['./nursing-main-home.component.scss']
})
export class NursingMainHomeComponent implements OnInit {

  destroy$ = new Subject<any>();
  showHideMenu: any;
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
    private router: Router,
    private confirmationModalService: NgbModal,
    private authService: AuthService,
    ) {
    this.modalService = this.confirmationModalService;
  }

  ngOnInit(): void {
    this.showHideMenu = false;
    this.authService.setActiveAppKey('NURSING');
    this.subcriptionOfEvents();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  subcriptionOfEvents(): void {
    this.commonService.$menushowHide.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.showHideMenu = data;
    });
    this.commonService.$menushowHideReverse.pipe(takeUntil(this.destroy$)).subscribe((obj: any) => {
      this.showHideMenu = obj;
    });

  }


}
