import { takeUntil, map, debounceTime } from 'rxjs/operators';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, Event, NavigationEnd } from '@angular/router';
import { ThemeService } from '../public/services/theme.service';
import { CommonService } from '../public/services/common.service';
import { Subject } from 'rxjs';
import { UsersService } from '../public/services/users.service';
import { AuthService } from '../public/services/auth.service';
import * as _ from 'lodash';
import { Constants } from 'src/app/config/constants';
import { IAlert } from '../public/models/AlertMessage';
import { NotificationSocket } from '../public/services/notification.soclets.service';
import { NotificationListService } from '../public/services/notification_list';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  selectedModule = { displayValue: '', navLink: '', app_key: '' };
  currentUrl;
  isChatMenuSelected = false;
  isSettingMenuSelected = false;
  isHelpMenuSelected = false;
  isNotificationMenuSelected = false;
  isGridMenuSelected = false;
  isProfileMenuSelected = false;
  isLogoutMenuSelected = false;

  $navSelection = new Subject<any>();
  permissionsConstants: any;
  defaultLandingUrl;
  moduleName: string;
  showHideMainMenuStatus: boolean;

  activePatientList = [];
  currentActivePatient: any;
  hideBarIcon: boolean;
  notificationCount = '';
  notificationCounter;

  appList: any;
  loginUserName: any;

  // public emrApp = { rights: false };
  // public qmsApp = { rights: false };
  // public qmsSecurityApp = { rights: false };
  // public reportApp = { rights: false };
  // public dmsApp = { rights: false };
  keyword = 'patient_name';
  public patList = [];
  page_number = 1;
  searchPatKey = '';
  alertMsg: IAlert;
  subject: Subject<string> = new Subject();
  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private router: Router,
    private commonService: CommonService,
    private themeService: ThemeService,
    private authService: AuthService,
    private userService: UsersService,
    private notificationSocket: NotificationSocket,
    private notificationListService: NotificationListService,
    private sanitizer: DomSanitizer
  ) {
    this.permissionsConstants = commonService.permissionsConstants;

    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.urlAfterRedirects;
        this.setModuleTitleAndNav();
      }
    });
  }

  ngOnInit() {
    this.getUserAssignedApplications();
    this.moduleName = null;
    this.hideBarIcon = true;
    this.showHideMainMenuStatus = false;
    this.themeService.setSelectedTheme('primary');
    this.currentUrl = this.router.url;
    this.setModuleTitleAndNav();
    this.subsCriptionEvent();
    // this.subjectFun();
    // this.getPatientSearchData();

    // Active User Name
    this.loginUserName = this.authService.getUserInfoFromLocalStorage()?.user_name;
  }

  subsCriptionEvent() {
    // web socket notification alert posting
    this.notificationSocket.init(this.authService.getLoggedInUserId());
    this.notificationSocket.$changeEvent.subscribe((obj: any) => {
      this.handleNotificationAlert(obj);
    });

    // check for new notification available
    this.checkNewNotificationAlert();

    const sub = this.commonService.$changeEvent.pipe(takeUntil(this.$navSelection)).subscribe((obj: any) => {
      if (obj.selectedNav !== '') {
        this.highlightedSelectedMenu(obj.selectedNav);
        // sub.unsubscribe();
      }
    });
    // this.commonService.$subAddRemoveActivePatientFromList.pipe(takeUntil(this.$navSelection)).subscribe((obj: any) => {
    //   if (obj.type === 'add' && obj.sourc === 'doctor_dashboard') {
    //     this.currentActivePatient = obj.data;
    //     const patListData = _.clone(this.commonService.getActivePatientList());
    //     this.updatePatientIndex(obj.data, patListData);
    //   }
    // });
    this.commonService.$menushowHideReverse.pipe(takeUntil(this.$navSelection)).subscribe((obj: any) => {
      this.showHideMainMenuStatus = obj;
    });

    this.commonService.$menuIconShowHide.pipe(takeUntil(this.$navSelection)).subscribe((obj: any) => {
      this.hideBarIcon = obj;
    });
  }

  ngOnDestroy() {
    this.$navSelection.next(true);
    this.$navSelection.unsubscribe();
    clearInterval(this.notificationCounter);
  }

  getUserAssignedApplications() {
    const userId = this.authService.getLoggedInUserId();
    this.userService.getAssignedApplications(userId).subscribe(response => {
      this.appList = _.filter(response, (o) => o.rights === true);
      _.map(this.appList, d => {
        d.icon = d.icon.replace('<svg xmlns=', '<svg style="width: 44px; height: 38px;" xmlns=');
        if(d.app_key === 'nursing'){
          d.icon = d.icon.replace('<svg data-name', '<svg style="width: 44px; height: 38px;" data-name');
        }
        d.svgDomsanitize = this.getSvgDomSanitize(d.icon);
      })
    });
  }

  getSvgDomSanitize(svg) {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  setModuleTitleAndNav() {
    const key = this.authService.getActiveAppKey();
    this.moduleName = 'USER MANAGEMENT';
    this.commonService.selectedNavModule = this.moduleName;
    if (this.moduleName && this.moduleName === 'USER MANAGEMENT') {
      this.selectedModule.displayValue = 'USER MANAGEMENT';
      this.selectedModule.navLink = './';
    }
    this.selectedModule.app_key = _.toLower(key);
  }

  profile(): void {
    this.commonService.toggle('Profile');
  }

  settings() {
    this.commonService.toggle('Settings');
  }

  notification() {
    this.commonService.toggle('Notification');
  }

  onMenuIconClick(event, menu?) {
    if (menu === 'Notification') {
      this.notificationCount = '';
    }
    if (menu != 'Logout') {
      this.commonService.toggle(menu);
    }
    event.stopPropagation();
    menu = this.commonService.selectedNavMenu !== '' ? this.commonService.selectedNavMenu : menu;
    this.highlightedSelectedMenu(menu);
  }

  highlightedSelectedMenu(menu) {
    this.isChatMenuSelected = false;
    this.isSettingMenuSelected = false;
    this.isHelpMenuSelected = false;
    this.isNotificationMenuSelected = false;
    this.isGridMenuSelected = false;
    this.isProfileMenuSelected = false;
    this.isLogoutMenuSelected = false;

    if (menu && menu === 'Settings') {
      this.isSettingMenuSelected = true;
    } else if (menu && menu === 'Notification') {
      this.isNotificationMenuSelected = true;
    } else if (menu && menu === 'Profile') {
      this.isProfileMenuSelected = true;
    } else if (menu && menu === 'Grid') {
      this.isGridMenuSelected = true;
    } else if (menu && menu === 'Chat') {
      this.isChatMenuSelected = true;
    } else if (menu && menu === 'Help') {
      this.isHelpMenuSelected = true;
    } else if (menu && menu === 'Logout') {
      this.isLogoutMenuSelected = true;
      this.goToLogout();
    }
  }

  goToLogout(): void {
    this.authService.logout().subscribe(res => {
      if (res.status_message === 'Success') {
        this.userService.masterUserDetails = {};
        this.authService.redirectUrl = null;
        // this.router.navigateByUrl('/login');
        this.commonService.clearUserSessionData();
      }
    }, error1 => {
      this.alertMsg = {
        message: 'Something went wrong',
        messageType: 'danger',
        duration: 3000
      };
    });
  }

  getdefultLandingPageOnUserLogin(app: any) {
    // console.log(app);
    if (app.app_key === 'user_management') {
      this.defaultLandingUrl = 'user';
      this.router.navigate(['/app/user/']);
    } else if (app.app_key === 'reports') {
      this.defaultLandingUrl = 'reports';
      this.router.navigate(['/app/qms/reports']);
    } else {
      const url = app.app_url.replace('#token#', this.authService.getAuthToken());
      window.open(url, '_blank');
    }
  }

  showHideMainMenu() {
    this.showHideMainMenuStatus = !this.showHideMainMenuStatus;
    this.commonService.showHideMainMenuFromNavBar(this.showHideMainMenuStatus);
  }

  checkNewNotificationAlert() {
    const param = {
      status_ids: []
    };
    this.notificationListService.checkNewNotificationAlert(param).subscribe(res => {
      if (res.status_code === 200) {
        this.notificationCount = res.data === true ? 'New' : '';
      } else {
        this.notificationCount = '';
      }
    });
  }

  handleNotificationAlert(response: any) {
    if (response.status_code === 200) {
      if (response.message_type == 'notification' && response.data) {
        this.notificationCount = 'New';
      }
      // auto logout using web socket
      else if (response.message_type == 'logout' && response.data) {
        const userId = this.authService.getLoggedInUserId();
        const token = this.authService.getAuthToken();
        if (!this.authService.isLoggedIn() || (response.data.userId == userId && response.data.token == token)) {
          this.userService.masterUserDetails = {};
          this.authService.redirectUrl = null;
          // this.router.navigateByUrl('/login');
          this.commonService.clearUserSessionData();
        }
      }
    }
  }

  onChangeSearch(search: string) {
    this.page_number = 1;
    this.patList = [];
    this.searchPatKey = search;
    this.subject.next();
    // this.getPatientSearchData();
  }

  displayErrorMsg(message: string, messageType: string): void {
    this.alertMsg = { message, messageType, duration: Constants.ALERT_DURATION };
  }
}


