import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonService } from './public/services/common.service';
import { slideInOut } from './config/animations';
import { AuthService } from './public/services/auth.service';
import { UsersService } from './public/services/users.service';
import { map, takeUntil } from 'rxjs/operators';
import { Observable, Subject, Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SessionoutpopupComponent } from './sessionoutpopup/sessionoutpopup.component';
import { Event, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { NgIdleServiceService } from './public/services/ng-idle-service';
import { GlobalErrorComponent } from './shared/global-error/global-error.component';
import * as moment from 'moment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    slideInOut
  ]
})
export class AppComponent implements OnDestroy, OnInit {
  loading: boolean = false;
  title = 'user-managment';
  menuState = 'out';
  isOpen = false;
  sideBarTitle = '';
  destroy$ = new Subject();
  globalError: boolean = false;
  errorMsgDetails: any;
  modalService: NgbModal;
  islogOut: boolean = false;
  isAutoLogout: boolean = false;
  //startwatchingcall;
  private idleOnTimeout$;

  constructor(
    private commonService: CommonService,
    private authService: AuthService,
    private userService: UsersService,
    private confirmationModalService: NgbModal,
    // private userIdle: UserIdleService,
    private bnIdle: NgIdleServiceService,
    public router: Router
  ) {
    this.modalService = confirmationModalService;
  }

  ngOnInit() {
    this.subscriptionOfEvent();
  }

  subscriptionOfEvent() {
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
          if (!event['url'].includes('app/qms/reports')) { // for reprot after dom load need to change value of this.loading
            this.loading = false;
          }
          break;
        }
        default: {
          break;
        }
      }
    });
    this.commonService.onLoadingChanged.subscribe(isLoading => this.loading = isLoading);

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
        if (this.modalService.hasOpenModals()) {
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
    //this.idleOnTimeout$.unsubscribe();
  }

  errorModalPopup(): void  {
    this.errorMsgDetails = {
      modalBody: 'Something Went Wrong'
    }
    const modalInstance = this.confirmationModalService.open(GlobalErrorComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        windowClass: 'global-error-popup',
      });
    modalInstance.result.then((result) => {
      if (result === 'Ok') {
      }
    }, (reason) => {

    });
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
