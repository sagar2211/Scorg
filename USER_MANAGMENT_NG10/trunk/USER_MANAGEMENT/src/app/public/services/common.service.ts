import { Constants } from 'src/app/config/constants';
import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpRequest, HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Provider } from './../models/provider';
import { PermissionsConstants } from './../../config/PermissionsConstants';
import * as moment from 'moment';
import * as _ from 'lodash';
import { environment } from 'src/environments/environment';
import { NgxPermissionsService } from 'ngx-permissions';
import { ApplicationEntityConstants } from './../../config/ApplicationEntityConstants';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
// import { QSlotInfoDummy, QSlotInfo } from './../modules/qms/models/q-entity-appointment-details';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(
    private http: HttpClient,
    private router: Router,
    private ngxPermissionsService: NgxPermissionsService,
    private authService: AuthService,
    private userService: UsersService,
  ) { }

  permissionsConstants = PermissionsConstants;

  // userPermissions = [PermissionsConstants.USER_MGMT_MENU,
  //   PermissionsConstants.QMS_APP_MENU,
  //   PermissionsConstants.ADMIN_DASHBOARD,
  //   PermissionsConstants.CALL_CENTER_DASHBOARD,
  //   PermissionsConstants.DOCTORDASHBOARD,
  //   PermissionsConstants.FRONTDESK ];
  reporturlParams = '';
  selectedNavMenu = '';
  selectedNavModule = '';
  currentSelectedProvider: Provider = null;
  isAddButtonDisable = false;
  sideBarTitle = '';
  isOpen = false;
  ConstantNav = { isShowAddPopup: false, isShowFilter: false };
  qlistStatus = { checkInStatus: '', isCheckIn: false, isCheckOut: false };
  previousUrl = '';
  change: Subject<object> = new Subject();
  public $changeEvent = this.change.asObservable();
  instructionSliderOpenClose: Subject<object> = new Subject();
  public $subInstructionSliderOpenClose = this.instructionSliderOpenClose.asObservable();
  onLoadingChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
  activatedRoute: Subject<ActivatedRoute> = new Subject();
  public $activatedRouteChange = this.activatedRoute.asObservable();
  userListTempParams = null;
  getScheduleDataParams = null;
  public checkInStatus = new Subject();
  addPopup = new Subject<any>();
  public $addPopupEvent = this.addPopup.asObservable();

  currentSelectedEntity: any = null;
  /**
   * Stores all currently active requests
   */

  private requests: HttpRequest<any>[] = [];
  skipUrlList = ['appointment/getSingleAppointmentSlotByEntity',
    'PatientMonitor/GetPatientMonitorDataByObservations',
    'browser/MAIN/concepts',
    'browser/MAIN/descriptions',
    'QueueTransaction/updateAppointmentQueue',
    'AppointmentBooking/getEntityAppointmentBookingBySequence',
    //  added for tree data load in BG
    'Patient/GetPatientDocumentDetails',
    'PatientChart/GetPatientChartComponentsById'
    //  added for tree data load in BG
  ];
  activatedRouteCopy = null;

  public sendFilterEvent = new Subject<{ isFrom?: string, data?: any, dateFlag?: boolean }>();
  public $recieveFilterEvent = this.sendFilterEvent.asObservable();

  sendEntitySettingEvent: Subject<object> = new Subject();
  public $sendEntitySettingEvent = this.sendEntitySettingEvent.asObservable();

  sendBookEventFromQlistForFdUser: Subject<any> = new Subject<any>();
  public $bookEventFromQlistForFdUser = this.sendBookEventFromQlistForFdUser.asObservable();

  public bookAppEvent: Subject<any> = new Subject<any>();
  public $receiveBookAppEvent = this.bookAppEvent.asObservable();

  errorEvent: Subject<object> = new Subject();
  public $getErrorEvent = this.errorEvent.asObservable();

  logSliderOpenClose: Subject<object> = new Subject();
  public $logSliderOpenClose = this.logSliderOpenClose.asObservable();

  menushowHide: Subject<object> = new Subject();
  public $menushowHide = this.menushowHide.asObservable();

  menushowHideReverse: Subject<object> = new Subject();
  public $menushowHideReverse = this.menushowHideReverse.asObservable();

  menuIconShowHide: Subject<object> = new Subject();
  public $menuIconShowHide = this.menuIconShowHide.asObservable();

  patientMenushowHide: Subject<object> = new Subject();
  public $patientMenushowHide = this.patientMenushowHide.asObservable();

  showHidePatientMenuToSortInfo: Subject<object> = new Subject();
  public $showHidePatientMenuToSortInfo = this.showHidePatientMenuToSortInfo.asObservable();

  addRemoveActivePatientFromList: Subject<object> = new Subject();
  public $subAddRemoveActivePatientFromList = this.addRemoveActivePatientFromList.asObservable();

  sessionOutEvent: Subject<object> = new Subject();
  public $getsessionOutEvent = this.sessionOutEvent.asObservable();

  iframeNotifyLoader: Subject<object> = new Subject();
  public $iframeNotifyLoader = this.iframeNotifyLoader.asObservable();

  // logOutEvent: Subject<object> = new Subject();
  // public $getlogOutEvent = this.logOutEvent.asObservable();

  filterDataByUrl: Array<{ url: string, data: any }> = [];
  manageAppointmentFilterData: any;
  doctorFieldSettingDefaultObj = [
    // maskType: true: pre, false: post
    { id: 1, name: 'Name', key: 'name', isWord: false, maskType: '', numberOfCharacter: '' },
    { id: 2, name: 'Speciality', key: 'speciality', isWord: false, maskType: '', numberOfCharacter: '' },
  ];

  patientFieldSettingDefaultObj = [
    // maskType: true: pre, false: post
    { id: 1, name: 'Name', key: 'name', isWord: false, maskType: '', numberOfCharacter: '' },
    { id: 2, name: 'Contact', key: 'contact', isWord: false, maskType: '', numberOfCharacter: '' },
  ];

  queueDisplaySettingDefaultObj = {
    queue_display_type: ''
  };

  timeFormatSetting = {
    time_format_key: '12_hour'
  };

  feedbackSetting = {
    send_feedback: 'off'
  };

  queueSkipSettingDefaultObj = {
    available_slot: '',
    skip_setting_min: '',
    no_of_repeat_calling: '',
  };
  suggestionPanelSettings = {
    isPin: true,
    suggestionIsShow: true
  };

  // -- store values against keys:
  storeKeyValues: Array<{ key: string, value: any, isDataLoaded: boolean }> = [];
  // tslint:disable-next-line:ban-types
  defaultValuesByKey: Object = {
    queue_filter_setting: {
      displayType: 'grid',
      isShowSlot: false
    },
    patient_field_setting: this.patientFieldSettingDefaultObj,
    doctor_field_setting: this.doctorFieldSettingDefaultObj,
    queue_display_setting: this.queueDisplaySettingDefaultObj,
    queue_skip_setting: this.queueSkipSettingDefaultObj,
    time_format_key: this.timeFormatSetting,
    send_feedback_patient: this.feedbackSetting,
    suggestion_panel_setting: { ...this.suggestionPanelSettings }
  };

  activePatientMonitoringDateTime = {};

  static redirectToIfNoPermission(rejectedPermissionName: string) {
    // alert("You don't have permission (" + rejectedPermissionName + ") to see this page.");
    return {
      navigationCommands: [],
      navigationExtras: {
        skipLocationChange: true
      }
    };
  }

  setreportUrlParametes(obj) {
    this.reporturlParams = obj;
  }
  getReportUrlParameters() {
    return this.reporturlParams;
  }


  setqListStatus(obj) {
    this.qlistStatus = obj;
  }

  getqListStatus() {
    return this.qlistStatus;
  }

  clearUserSessionData() {
    const parentAppUrl = window.location.ancestorOrigins.length ? window.location.ancestorOrigins[0] : '';
    if (parentAppUrl) {
      this.router.navigate(['/nopermission']);
      //window.top.location.href = parentAppUrl;
    } else {
      let loginPageUrl = environment.SSO_LOGIN_URL;
      loginPageUrl = environment.production && loginPageUrl ? loginPageUrl : window.location.origin;
      // clear local storage, cookies, cache and navigate to login
      localStorage.clear();
      this.authService.deleteCookie('auth_token');
      this.storeKeyValues = [];
      this.userListTempParams = null;
      this.getScheduleDataParams = null;
      this.manageAppointmentFilterData = null;
      this.setCurrentSelectedProvider(null);
      window.location.href = loginPageUrl;
    }
  }

  toggle(title, isFrom?) {
    if (title === undefined && this.isOpen) {
      this.isOpen = false;
    } else if (title === undefined && !this.isOpen) {
      return;
    } else if (this.sideBarTitle !== title) {
      this.isOpen = true;
    } else {
      this.isOpen = !this.isOpen;
    }
    this.sideBarTitle = title;
    this.setNavMenuSelected(title, this.isOpen);
    this.change.next({ title, isOpen: this.isOpen, isFrom, selectedNav: this.selectedNavMenu });
  }

  openCloseInstruction(val) {
    this.instructionSliderOpenClose.next(val);
  }

  openCloselogSlider(val) {
    this.logSliderOpenClose.next(val);
  }

  showHideMainMenuFromNavBar(status) {
    this.menushowHide.next(status);
  }

  showHideMainMenuReverse(status) {
    this.menushowHideReverse.next(status);
  }

  showHideMenuIconNavbar(status) {
    this.menuIconShowHide.next(status);
  }

  showHidePatientMenu() {
    this.patientMenushowHide.next();
  }

  showHidePatientMenuToSortInfoComp() {
    this.showHidePatientMenuToSortInfo.next();
  }

  entitySettingPopUpValue(val) {
    this.sendEntitySettingEvent.next(val);
  }

  eventFromQlistForFdUser() {
    this.sendBookEventFromQlistForFdUser.next();
  }

  commonErrorEvent(val) {
    this.errorEvent.next(val);
  }

  sessionTimeOutEvent(val) {
    this.sessionOutEvent.next(val);
  }

  reportIframeLoaderNotify(val) {
    this.iframeNotifyLoader.next(val);
  }

  // sessionlogOutEvent(val) {
  //   this.logOutEvent.next(val);
  // }


  // Adds request to the storage and notifies observers

  onStarted(req: HttpRequest<any>): void {
    const isSkip = this.skipUrlList.some(s => {
      return req.url.includes(s);
    });
    const skipArrayApiList = ['Notification/GetUserNotificationCount'
    ];
    const skipUrl = _.filter(skipArrayApiList, skpUrl => {
      return req.url.includes(skpUrl);
    }).length ? true : false;
    if (!isSkip && !skipUrl) {
      this.requests.push(req);
      this.notify();
    }

  }

  // Removes request from the storage and notifies observers

  onFinished(req: HttpRequest<any>): void {
    const index = this.requests.indexOf(req);
    if (index !== -1) {
      this.requests.splice(index, 1);
    }
    this.notify();
  }

  // Notifies observers about whether there are any requests on fly
  private notify(): void {
    this.onLoadingChanged.emit(this.requests.length !== 0);
  }
  showHideAppLoader(isShow: boolean): void {
    this.onLoadingChanged.emit(isShow);
  }

  routeChanged(activatedRoute: ActivatedRoute) {
    this.activatedRouteCopy = activatedRoute;
    this.activatedRoute.next(this.activatedRouteCopy);
  }

  setPopupFlag(isAddPopup: boolean, isFilterPopup: boolean, redirectFrom = '') {
    this.ConstantNav.isShowAddPopup = isAddPopup;
    this.ConstantNav.isShowFilter = isFilterPopup;
    if (isAddPopup) {
      this.isAddButtonDisable = true;
    } else {
      this.isAddButtonDisable = false;
    }
    this.addPopup.next({ isShowAddPopup: isAddPopup, isShowFilterPopup: isFilterPopup, redirectFromPage: redirectFrom });
  }

  clearPopupFlag() {
    this.ConstantNav.isShowAddPopup = false;
    this.ConstantNav.isShowFilter = false;
    this.addPopup.next();
  }

  /**
   * if doctor is mapped to more than one entity,
   * this method will get the current selected enity details
   * */

  getCurrentSelectedProvider(): Provider {
    return this.currentSelectedProvider;
  }

  /**
   * if doctor is mapped to more than one entity,
   * this method will set the current selected enity details
   * */
  setCurrentSelectedProvider(provider: Provider) {
    this.currentSelectedProvider = provider;
  }

  setFilterValuesByUrl(url, data) {
    const findData = this.filterDataByUrl.find((f: any) => f.url === url);
    if (findData) {
      findData.data = data;
    } else {
      this.filterDataByUrl.push({ url, data });
    }
  }

  getFilterDataByUrl(url: string): { url: string, data: any } {
    const findData = this.filterDataByUrl.find((f: any) => f.url === url);
    if (findData) {
      return findData;
    } else {
      return null;
    }
  }

  getQueueSettings(key, userId?): Observable<any> {
    const reqUrl = `${environment.baseUrlAppointment}/QMSSettings/getQmsSettings`;
    if (key === Constants.timeFormateKey) {
      userId = '';
    }
    const param = { tag_name: key, tag_question: userId };
    if (this.getObjectByKeys(key, this.storeKeyValues)) {
      return of(this.getObjectByKeys(key, this.storeKeyValues));
    }
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success' && res.QmsSettingList.length > 0) {
          this.setObjectsByKeys(key, res.QmsSettingList[0].tag_value, this.storeKeyValues, true);
          if (key === Constants.timeFormateKey) {
            this.updateTimeFormatInLocalStorage(JSON.parse(res.QmsSettingList[0].tag_value).time_format_key);
          }
          if (key === Constants.feedbackSendKey || key === Constants.allowLapsedTimeBooking) {
            res.QmsSettingList[0].tag_value = JSON.stringify(res.QmsSettingList[0].tag_value);
          }
          return JSON.parse(res.QmsSettingList[0].tag_value);
        } else {
          this.setObjectsByKeys(key, [], this.storeKeyValues);
          if (key === Constants.timeFormateKey) {
            this.setObjectsByKeys(key, '{ "time_format_key": "12_hour" }', this.storeKeyValues);
            this.updateTimeFormatInLocalStorage('12_hour');
          }
          return this.getObjectByKeys(key, this.storeKeyValues);
          // if (key === Constants.patientFieldSettingKey) {
          //   return this.patientFieldSettingDefaultObj;
          // } else if (key === Constants.doctorFieldSettingKey) {
          //   return this.doctorFieldSettingDefaultObj;
          // } else if (key === Constants.queueDisplaySettingKey) {
          //   return this.queueDisplaySettingDefaultObj;
          // } else if (key === Constants.queueSkipSettingKey) {
          //   return this.queueSkipSettingDefaultObj;
          // } else if (key === Constants.timeFormateKey) {
          //   return this.timeFormatSetting;
          // } else {
          //   return null;
          // }
        }
      })
    );
  }

  SaveQueueSettings(key, obj, userId?): Observable<any> {
    if (key === Constants.timeFormateKey) {
      userId = '';
    }
    const QmsSettingObj = {
      QmsSettingList: [
        {
          tag_name: key,
          tag_question: userId ? userId : '',
          tag_value: obj
        }
      ]
    };
    const reqUrl = `${environment.baseUrlAppointment}/QMSSettings/saveQmsSettings`;
    // this.QmsSettingList.push(data);
    return this.http.post(reqUrl, QmsSettingObj).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        this.setObjectsByKeys(key, obj, this.storeKeyValues, true);
        if (key === Constants.timeFormateKey) {
          const keyVal = JSON.parse(obj).time_format_key;
          this.updateTimeFormatInLocalStorage(keyVal);
        }
        return res.status_message;
      } else {
        return null;
      }
    }));
  }

  getObjectByKeys(key: string, locaVarName: Array<any>): any {
    const indx = locaVarName.findIndex(l => l.key === key);
    if (indx !== -1) {
      try {
        return JSON.parse(locaVarName[indx].value);
      } catch (error) {
        return locaVarName[indx].value;
      }
    } else {
      return null;
    }
  }

  // -- maintain local data with keys
  setObjectsByKeys(key: string, value: any, locaVarName: Array<any>, isDataLoaded?) {
    const indx = locaVarName.findIndex(l => l.key === key);
    if (indx !== -1) {
      locaVarName[indx].value = value;
    } else {
      if (isDataLoaded) {
        locaVarName.push({
          key, value, isDataLoaded
        });
      } else {
        if (this.defaultValuesByKey.hasOwnProperty(key)) {
          locaVarName.push({
            key, value: JSON.stringify(this.defaultValuesByKey[key]), isDataLoaded
          });
        }
      }
    }
  }

  updateTimeFormatInLocalStorage(keyVal) {
    const globals = JSON.parse(localStorage.getItem('globals'));
    globals.timeFormat = keyVal;
    localStorage.setItem('globals', JSON.stringify(globals));
  }

  setNavMenuSelected(toggleMenu, isOpen) {
    this.selectedNavMenu = '';
    if ((this.selectedNavModule === 'qms' || this.selectedNavModule === './' || this.selectedNavModule === 'user')
      && !isOpen
      && (toggleMenu === 'Settings' || toggleMenu === 'Notification' || toggleMenu === 'Profile' || toggleMenu === 'Help')) {
      this.selectedNavMenu = 'Grid';
    } else if ((this.selectedNavModule === 'chat') && !isOpen && (toggleMenu === 'Settings' || toggleMenu === 'Notification' || toggleMenu === 'Profile' || toggleMenu === 'Help')) {
      this.selectedNavMenu = 'Chat';
    }
  }

  // -- convert time against time format ie 12 or 24 format
  convertTime(timeFormateKey, timeVal) {
    let updateTimeVal = null;
    if (timeFormateKey === '12_hour' && timeVal) {
      updateTimeVal = moment(moment().format('YYYY-MM-DD') + ' ' + timeVal).format('hh:mm A');
    } else if (timeFormateKey === '24_hour' && timeVal) {
      updateTimeVal = moment(moment().format('YYYY-MM-DD') + ' ' + timeVal).format('HH:mm');
    }
    return timeVal ? updateTimeVal : null;
  }

  // -- convert main appointment list to flat objects
  // convertAppointmentDataToFlatList(list: Array<QSlotInfo>, timeFormateKey, queueType?, queuename?, queueTypeId?, queueValueId?): Array<QSlotInfoDummy> {
  //   const tempList = [];
  //   list.forEach(r => {
  //     // let t = r as QSlotInfo;
  //     if (r.appointments.length) {
  //       r.appointments.forEach(v => {
  //         let t = r as QSlotInfo;
  //         v.queueType = queueType ? queueType : '';
  //         v.queueName = queuename ? queuename : '';
  //         v.queueTypeId = queueTypeId ? queueTypeId : 0;
  //         v.queueValueId = queueValueId ? queueValueId : 0;
  //         t = Object.assign(v, t);
  //         v.slotTime = _.clone(this.convertTime(timeFormateKey, v.slotTime));
  //         tempList.push(Object.assign({}, t));
  //       });
  //     } else {
  //       // v.slotTime = _.clone(this.convertTime(timeFormateKey, v.slotTime));
  //       // tempList.push(t);
  //     }
  //   });
  //   return tempList;
  // }

  saveApplicationSettings(settingList: any): Observable<any> {
    const QmsSettingObj = {
      QmsSettingList: settingList
    };
    const reqUrl = `${environment.baseUrlAppointment}/QMSSettings/saveQmsSettings`;
    return this.http.post(reqUrl, QmsSettingObj).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.status_code === 200) {
        return res.status_message;
      } else {
        return null;
      }

    }));
  }

  getQueueSettingsForMultiple(param): Observable<any> {
    let reqUrl = `${environment.baseUrlAppointment}/QMSSettings/getMultipleQmsSettings`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.QmsSettingList.length > 0) {
        _.map(res.QmsSettingList, list => {
          this.setObjectsByKeys(_.toLower(list.tag_name), list.tag_value, this.storeKeyValues, true);
        });
        return res.QmsSettingList;
      } else {
        return [];
      }
    })
    );
  }

  getpreviousUrl() {
    return this.previousUrl;
  }
  setpreviousUrl(url) {
    this.previousUrl = url;
  }

  getuserpermissionForlib() {
    const PermissionsConstant = {};
    const permissionKeyList = ['Queue_skip', 'Queue_complete', 'Queue_Edit_Appointment', 'Queue_Appointment_History', 'Queue_Not_Present',
      'Queue_In_Consultation', 'Queue_call', 'Queue_Book_Appointment', 'Queue_CheckIn_CheckOut',
      'Queue_Edit_Appointment', 'Queue_Extend_Hour', 'Queue_Delay_Notification', 'Queue_Print', 'Add_PatientMaster', 'recheck_book_appointment']
    _.map(permissionKeyList, (key) => {
      PermissionsConstant[key] = this.ngxPermissionsService.getPermission(PermissionsConstants[key]);
      // PermissionsConstantsList.push(obj);
    });
    return PermissionsConstant;
  }

  public getSnowedCTData(text, semanticTags?) {
    semanticTags = (semanticTags) ? semanticTags : [];
    text = text ? text : '';
    // const url = `${environment.SNOWMED_URL}/concepts?activeFilter=true&term=${text}&offset=0&limit=50`;
    const url = `${environment.SNOWMED_URL}/descriptions?limit=50&active=true&conceptActive=true&lang=english&type=900000000000003001&semanticTags=${semanticTags}&term=${text}`;
    return this.http.get(url).pipe(
      map((res: any) => {
        return res;
      }),
      catchError((err) => of([])),
    );
  }

  redirectQmsAsPerRoleType() {
    const userInfo = this.authService.getUserInfoFromLocalStorage();
    const userPermissions = [...this.userService.userPermission];
    if (userInfo.role_type === ApplicationEntityConstants.DOCTOR
      && _.find(userPermissions, (o) => o === PermissionsConstants.View_Queue)) {
      this.router.navigate(['/app/qms/']);
    } else if (userInfo.role_type === ApplicationEntityConstants.FRONTDESK
      && _.find(userPermissions, (o) => o === PermissionsConstants.View_Front_Desk)) {
      this.router.navigate(['/app/qms/dashboard/frontDesk']);
    } else if (userInfo.role_type === ApplicationEntityConstants.ADMIN
      && _.find(userPermissions, (o) => o === PermissionsConstants.View_Admin_Dashboard)) {
      this.router.navigate(['/app/qms/dashboard/admin']);
    } else if (userInfo.role_type === ApplicationEntityConstants.SERVICE_OPERATOR
      && _.find(userPermissions, (o) => o === PermissionsConstants.View_Queue)) {
      this.router.navigate(['/app/qms/qList']);
    } else if (userInfo.role_type === ApplicationEntityConstants.NURSE) {
      this.router.navigate(['/app/emr/dashboard/doctor']);
    } else if (userInfo.role_type === ApplicationEntityConstants.TELECALLER
      && _.find(userPermissions, (o) => o === PermissionsConstants.View_Call_Center_View)) {
      this.router.navigate(['/app/qms/appointments/searchAppointment']);
    } else {
      const defaultUrl = '/app/nopermission';
      this.router.navigate([defaultUrl]);
    }
  }
}
