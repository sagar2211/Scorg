import { Constants } from './../config/constants';
import { takeUntil, map, debounceTime } from 'rxjs/operators';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, Event, NavigationEnd } from '@angular/router';
import { ThemeService } from './../public/services/theme.service';
import { CommonService } from './../public/services/common.service';
import { Subject } from 'rxjs';
import { AuthService } from './../public/services/auth.service';
import { PatientService } from './../public/services/patient.service';
import { IAlert } from './../public/models/AlertMessage';
import { NotificationSocket } from './../public/services/notification.soclets.service';
import * as _ from 'lodash';
import { NotificationListService } from '../public/services/notification_list';
import { EncounterPatient } from '../public/models/encounter-patient.model';
import { AuthIntercept } from '../auth/auth.intercept';
import { UsersService } from '../public/services/users.service';
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
  showHidePatientMenu: boolean;

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

  keyword = 'patient_name';
  public patList = [];
  page_number = 1;
  searchPatKey = '';
  alertMsg: IAlert;
  patientObj: EncounterPatient;
  subject: Subject<string> = new Subject();
  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private router: Router,
    private commonService: CommonService,
    private themeService: ThemeService,
    private authService: AuthService,
    private userService: UsersService,
    private notificationListService: NotificationListService,
    private patientService: PatientService,
    private notificationSocket: NotificationSocket,
    private authIntercept: AuthIntercept,
    private sanitizer: DomSanitizer
  ) {
    this.permissionsConstants = commonService.permissionsConstants;

    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        if (this.router.url.includes('/emr/patient/')) {
          this.showHideMainMenuStatus = false;
          this.showHidePatientMenu = false;
        } else {
          this.showHideMainMenuStatus = !this.showHideMainMenuStatus;
        }
        this.currentUrl = event.urlAfterRedirects;
        // console.log(this.currentUrl);
        this.setModuleTitleAndNav();
        // if (!this.authIntercept.unAuthorizedReq()) {
        //   this.checkNewNotificationAlert();
        // }
      }
    });
  }

  ngOnInit() {
    this.getUserAssignedApplications();
    this.moduleName = null;
    this.hideBarIcon = true;
    this.showHideMainMenuStatus = false;
    this.showHidePatientMenu = false;
    this.themeService.setSelectedTheme('primary');
    this.currentUrl = this.router.url;
    this.setModuleTitleAndNav();
    this.subsCriptionEvent();
    this.subjectFun();
    this.getPatientSearchData();

    // Load active patient list and current patient
    const patListData = _.clone(this.commonService.getActivePatientList());
    if (patListData.length > 0) {
      this.currentActivePatient = patListData[0];
      this.updatePatientIndex(patListData[0], patListData);
    }

    // Active User Name
    this.loginUserName = this.authService.getUserInfoFromLocalStorage()?.user_name;
  }

  subsCriptionEvent() {
    // web socket notification alert posting
    this.notificationSocket.init(this.authService.getLoggedInUserId());
    this.notificationSocket.$changeEvent.subscribe((obj: any) => {
      this.handleSocketMessage(obj);
    });

    // check for new notification available
    this.checkNewNotificationAlert();

    const sub = this.commonService.$changeEvent.pipe(takeUntil(this.$navSelection)).subscribe((obj: any) => {
      if (obj.selectedNav !== '') {
        this.highlightedSelectedMenu(obj.selectedNav);
        // sub.unsubscribe();
      }
    });
    this.commonService.$subAddRemoveActivePatientFromList.pipe(takeUntil(this.$navSelection)).subscribe((obj: any) => {
      if (obj.type === 'add' && obj.sourc === 'doctor_dashboard') {
        this.currentActivePatient = obj.data;
        const patListData = _.clone(this.commonService.getActivePatientList());
        this.updatePatientIndex(obj.data, patListData);
      }
    });
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
    this.commonService.getAssignedApplications(userId).subscribe(response => {
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
    this.moduleName = 'ot';
    // this.moduleName = this.currentUrl.split('/')[2];
    this.commonService.selectedNavModule = this.moduleName;
    if (this.moduleName && this.moduleName === 'ot') {
      this.selectedModule.navLink = '/otApp';
      this.selectedModule.displayValue = 'OT';
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
    if (app.app_key === 'ot') {
      this.defaultLandingUrl = 'user';
      this.router.navigate(['/otApp/']);
    } else {
      const url = app.app_url.replace('#token#', this.authService.getAuthToken());
      window.open(url, '_blank');
    }
  }

  showHideMainMenu() {
    if (this.router.url.includes('/emr/patient/')) {
      this.commonService.showHidePatientMenuToSortInfoComp();
    } else {
      this.showHideMainMenuStatus = !this.showHideMainMenuStatus;
      this.commonService.showHideMainMenuFromNavBar(this.showHideMainMenuStatus);
    }
  }

  goToPatientPage(patient, indx) {
    if (this.commonService.isTabModeOn || this.showHideMainMenuStatus) {
      this.commonService.showHideMainMenuFromNavBar(false);
    }
    this.showHideMainMenuStatus = false;
    this.showHidePatientMenu = false;
    this.commonService.setActivePatientList(patient, 'add');
    const obj = {
      type: 'add',
      data: patient,
      sourc: 'navbar'
    };
    this.commonService.updateActivePatientList(obj);
    if (indx > 1) {
      this.updatePatientIndex(patient, this.activePatientList);
    }
    this.currentActivePatient = patient;
    // if (patient.type === 'ip') {
    this.router.navigate(['/emr/patient/dashboard/', patient.patientData.id]);
    // } else if (patient.type === 'op') {
    //   this.router.navigate(['/emr/patient/opd/progress_notes/', patient.patientData.id]);
    // }
  }

  updatePatientIndex(patient, list) {
    const patListData = list.filter((pat: any) => pat.patientData.id !== patient.patientData.id);
    this.activePatientList = [];
    this.activePatientList = patListData;
    this.activePatientList.unshift(patient);
    // _.map(patListData, pat => {
    //   this.activePatientList.push(pat);
    // });
  }

  removeFromPatientList(patient, patIndx) {
    this.activePatientList.splice(patIndx, 1);
    this.commonService.setActivePatientList(patient, 'remove');
    if (this.activePatientList.length === 0) {
      this.router.navigate(['/emr/dashboard/doctor']);
    } else {
      // const patId = this.activePatientList[this.activePatientList.length - 1].patientData.id;
      // this.commonService.setLastActivePatient(this.activePatientList[this.activePatientList.length - 1]);
      // this.router.navigate(['/emr/patient/dashboard/', patId]);
      this.goToPatientPage(this.activePatientList[0], 0);
    }
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

  handleSocketMessage(response: any) {
    if (response.status_code === 200) {
      if (response.message_type == 'notification' && response.data) {
        this.notificationCount = 'New';
      }
      // auto logout using web socket
      else if (response.message_type == 'logout' && response.data) {
        const userId = this.authService.getLoggedInUserId();
        const token = this.authService.getAuthToken();
        if (!this.authService.isLoggedIn() || !token || (response.data.userId == userId && response.data.token == token)) {
          this.userService.masterUserDetails = {};
          this.authService.redirectUrl = null;
          // this.router.navigateByUrl('/login');
          this.commonService.clearUserSessionData();
        }
      }
    }
  }

  getPatientSearchData() {
    const params = {
      search_string: this.searchPatKey ? this.searchPatKey : '',
      page_number: this.page_number,
      limit: 5
    };
    // if (this.moduleName === 'emr' || this.defaultLandingUrl === 'emr') {
    return this.patientService.getQuickPatientList(params).subscribe(res => {
      if (res.length > 0) {
        this.patList = _.concat(this.patList, res);
        return this.patList = _.uniqBy(this.patList, 'patient_id');
      } else {
        return;
      }
    });
    // }
  }

  selectEvent(item) {
    this.searchPatKey = '';
    this.patList = [];
    this.page_number = 1;
    return this.patientService.getPatientActiveVisitDetail(item.patient_id).subscribe(res => {
      if (res) {
        this.selectedPatient(res[0]);
      } else {
        this.getPatientSearchData();
        this.displayErrorMsg('This patient has no IP/OP record.', 'danger');
        // return [];
      }
    });
  }

  selectedPatient(patient) {
    patient.type = patient.serviceType.name.toLowerCase();
    this.commonService.setActivePatientList(patient, 'add');
    if (this.commonService.getActivePatientList(patient).length <= 5) {
      const obj = {
        type: 'add',
        data: patient,
        sourc: 'doctor_dashboard'
      };
      if (this.showHideMainMenuStatus) {
        this.showHideMainMenu();
      }
      this.commonService.updateActivePatientList(obj);
      this.getPatientSearchData();
      this.router.navigate(['/emr/patient/dashboard/', patient.patientData.id]);

    } else {
      this.displayErrorMsg('Max 5 Patient Allowed', 'danger');
    }
  }

  subjectFun() {
    this.subject
      .pipe(debounceTime(500), takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.getPatientSearchData();
      }
      );
    this.commonService.$showHidePatientMenuToSortInfo.pipe(takeUntil(this.$navSelection)).subscribe((obj: any) => {
      this.showHidePatientMenu = !this.showHidePatientMenu;
    });
  }

  onChangeSearch(search: string) {
    this.page_number = 1;
    this.patList = [];
    this.searchPatKey = search;
    this.subject.next();
  }

  onScroll() {
    if (this.patList.length !== 0) {
      this.page_number = this.page_number + 1;
    }
    this.getPatientSearchData();
  }

  closed($event) {
    if (this.searchPatKey !== '') {
      this.onChangeSearch('');
    }
  }

  displayErrorMsg(message: string, messageType: string): void {
    this.alertMsg = { message, messageType, duration: Constants.ALERT_DURATION };
  }
}


