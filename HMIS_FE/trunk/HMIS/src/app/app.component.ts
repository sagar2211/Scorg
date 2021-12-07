import { slideInOut } from './config/animations';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { CommonService } from './public/services/common.service';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from './public/services/auth.service';
import { Event, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { GlobalErrorComponent } from './shared/global-error/global-error.component';
import { ThemeService } from './public/services/theme.service';

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
  innerWidth: any;
  isTabModeOn: boolean;
  constructor(
    private commonService: CommonService,
    private router: Router,
    private themeService: ThemeService,
    private authService: AuthService,
    private confirmationModalService: NgbModal) {
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

    this.commonService.onLoadingChanged.subscribe(isLoading => this.loading = isLoading);
  }

  ngOnInit(): void {
    this.themeService.setSelectedTheme('primary');
    this.innerWidth = window.innerWidth;
    this.commonService.isTabModeOn = this.innerWidth <= 1280 ? true : false;
    this.isTabModeOn = this.commonService.isTabModeOn;
    this.subcriptionOfEvents();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  subcriptionOfEvents(): void {
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

}
