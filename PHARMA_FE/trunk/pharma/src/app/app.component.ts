import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError, Event } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { CommonService } from './public/services/common.service';
import { AuthService } from './public/services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { map, takeUntil } from 'rxjs/operators';
import { GlobalErrorComponent } from './shared/global-error/global-error.component';
import { slideInOut } from './config/animations';
import * as moment from 'moment';
import { SessionoutpopupComponent } from './sessionoutpopup/sessionoutpopup.component';
import { NgIdleServiceService } from './public/services/ng-idle-service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    slideInOut
  ]
})
export class AppComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<any>();
  showHideMenu: boolean;
  showMenuType: string;
  loading = false;
  globalError = false;
  errorMsgDetails: any;
  modalService: NgbModal;
  islogOut = false;
  isAutoLogout = false;
  menuState = 'out';
  isOpen = false;
  sideBarTitle = '';
  idleOnTimeout$: any;

  constructor(
    private commonService: CommonService,
    private router: Router,
    private authService: AuthService,
    private confirmationModalService: NgbModal,
    private bnIdle: NgIdleServiceService
  ) {
    this.modalService = confirmationModalService;
  }

  ngOnInit(): void {
    this.subcriptionOfEvents();
    this.commonService.onLoadingChanged.subscribe(isLoading => this.loading = isLoading);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  subcriptionOfEvents(): void {
    // Show loader on basis of route
    this.router.events.subscribe((event: Event) => {
      switch (true) {
        case event instanceof NavigationStart: {
          this.loading = true;
          break;
        }

        case event instanceof NavigationEnd:
        case event instanceof NavigationCancel:
        case event instanceof NavigationError: {
          this.loading = false;
          break;
        }
        default: {
          break;
        }
      }
    });

    this.commonService.$changeEvent.subscribe((obj: any) => {
      if (obj.isFrom !== 'sidebar') {
        this.isOpen = obj.isOpen;
        this.sideBarTitle = obj.title;
        this.menuState = this.isOpen === false ? 'out' : 'in';
      }
    });

    // after loading iframe for report need to false loader.
    this.commonService.$iframeNotifyLoader.pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.loading = res ? true : false;
    });

    this.commonService.$getErrorEvent.pipe(takeUntil(this.destroy$)).subscribe(res => {
      if (res) {
        this.globalError = true;
        if (this.modalService && this.modalService.hasOpenModals()) {
          this.modalService.dismissAll();
        }
        this.errorModalPopup();
      }
    });

    this.commonService.$getsessionOutEvent.pipe(takeUntil(this.destroy$)).subscribe(res => {
      if (res) {
        // after api call in application start timer as per user set value.
        this.checksessionTimeOut();
      }
    });
    this.checksessionTimeOut(); // after appication load initatiate sessiontime and stop timer.
  }

  errorModalPopup(): void {
    this.errorMsgDetails = {
      modalBody: 'Something Went Wrong'
    };
    const modalInstance = this.confirmationModalService.open(GlobalErrorComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        windowClass: 'global-error-popup',
      });
    modalInstance.result.then((result) => { }, (reason) => { });
    modalInstance.componentInstance.errorMsgDetails = this.errorMsgDetails;
  }

  checksessionTimeOut(): void  {
    const sessionExpireTimeInSec = this.authService.getUserInfoFromLocalStorage() && this.authService.getUserInfoFromLocalStorage().session_expire_minutes ?
      (+this.authService.getUserInfoFromLocalStorage().session_expire_minutes) * 60 : 300;
    const sessionexpiretime = sessionExpireTimeInSec - 120; // 2 min befor popup will display.
    this.idleOnTimeout$ = this.bnIdle.startWatching(sessionexpiretime).pipe(takeUntil(this.destroy$)).subscribe((isTimedOut: boolean) => {
      if (isTimedOut && !this.idleOnTimeout$.isStopped) {
        this.idleOnTimeout$.unsubscribe();
        this.checkSessionIsIdle().subscribe(sessionIdleTime => {
          // check server idle time out if its less than UI Idle time then restart watcher
          if (sessionIdleTime <= (sessionexpiretime - 20)) {
            this.checksessionTimeOut();
          } else {
            this.islogOut = false;
            this.isAutoLogout = false;
            if (this.modalService.hasOpenModals()) {
              this.modalService.dismissAll();
            }
            const unAuthorizedReq = ['login', 'display/displayList', 'forgotpassword', 'resetforgotpassword/:id', 'external/book-appointment']; // -- give state url
            if (!unAuthorizedReq.some(v => this.router.url.includes(v)) && this.authService.getUserInfoFromLocalStorage()) {
              this.sessionExpirePopup();
            }
          }
        });
      }

    });
  }

  sessionExpirePopup(): void  {
    this.errorMsgDetails = {
      modalBody: 'Need More Time ?'
    };
    const modalInstance = this.confirmationModalService.open(SessionoutpopupComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        windowClass: 'session-out-popup',
      });
    modalInstance.result.then((result) => {
      if (result === 'No') {
        this.checksessionExist();
      } else if (result === 'Yes') {
        this.islogOut = true;
        this.isAutoLogout = false;
      } else if (result === 'logout') {
        this.islogOut = false;
        this.isAutoLogout = true;
      }
    }, (reason) => {
    });
    modalInstance.componentInstance.errorMsgDetails = this.errorMsgDetails;
  }

  checksessionExist(): void {
    const token = this.authService.getUserInfoFromLocalStorage().auth_token;
    this.authService.issessionExpire(token).subscribe(res => {
      if (res.status_message === 'Success') {
        console.log('success');
      }
    });
  }

  checkSessionIsIdle(): Observable<any> {
    const token = this.authService.getUserInfoFromLocalStorage().auth_token;
    return this.authService.getUserSessionDetail(token).pipe(map(res => {
      if (res.status_message === 'Success' && res.user_details) {
        const lastAccessedTime = moment(new Date(res.user_details?.lastAccessedTime));
        const sessionIdleTime = moment().diff(lastAccessedTime, 'seconds');
        return sessionIdleTime;
      } else {
        return -1;
      }
    }));
  }

}

