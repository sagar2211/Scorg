import { QSlotInfoDummy, QAppointmentDetails, QSlotInfo } from './../modules/qms/models/q-entity-appointment-details';
import { Constants } from 'src/app/config/constants';
import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpRequest, HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Provider } from '../shared/models/provider';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import * as moment from 'moment';
import * as _ from 'lodash';
import { environment } from 'src/environments/environment';
import { NgxPermissionsService } from 'ngx-permissions';
import { ApplicationEntityConstants } from '../shared/constants/ApplicationEntityConstants';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
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

  private activePatientList = [];
  private lastActivePatient: any;
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
    'PatientChart/GetPatientChartComponentsById',
    //  added for tree data load in BG
    // added for encounter history API loader
    'Patient/GetPatientVisitAllHistory'
    // added for encounter history API loader
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

  suggPinUnpinForCharts: Subject<object> = new Subject();
  public $suggPinUnpinForCharts = this.suggPinUnpinForCharts.asObservable();

  historyTabHideShow: Subject<object> = new Subject();
  public $subhistoryTabHideShow = this.historyTabHideShow.asObservable();

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

  dispalyDummyData = {
    SectionWiseLivePatientQueueData: [
      {
        LivePatientQueueData: {
          next_patient_list: [
            {
              token_no: 'NAT0005',
              full_name: 'SHITAL SUBHASH KELKAR',
              uhid: '20180100003',
              status: 'NEXT',
              patient_type: 'WALKIN',
              mobile_no: '9000000020',
              WaitTime: 0,
              room_name: ''
            },
            {
              token_no: 'NAT0456',
              full_name: 'MADHAB DUMDUM',
              uhid: '20180100004',
              status: 'NEXT',
              patient_type: 'WALKIN',
              mobile_no: '9000000060',
              WaitTime: 0,
              room_name: ''
            },
            {
              token_no: 'NAT0457',
              full_name: 'EKNATH SHINDE',
              uhid: '20180100005',
              status: 'NEXT',
              patient_type: 'WALKIN',
              mobile_no: '9001200620',
              WaitTime: 0,
              room_name: ''
            },
            {
              token_no: 'NAT0458',
              full_name: 'SAGAR SHINDE',
              uhid: '20180170003',
              status: 'NEXT',
              patient_type: 'WALKIN',
              mobile_no: '9006230020',
              WaitTime: 0,
              room_name: ''
            },
            {
              token_no: 'NAT0459',
              full_name: 'SAGARIKA PAHARIYA',
              uhid: '20180177003',
              status: 'NEXT',
              patient_type: 'WALKIN',
              mobile_no: '9006766920',
              WaitTime: 0,
              room_name: ''
            },
            {
              token_no: 'NAT0460',
              full_name: 'DEEPAK PATTNAIK',
              uhid: '20180177033',
              status: 'NEXT',
              patient_type: 'WALKIN',
              mobile_no: '9009977760',
              WaitTime: 0,
              room_name: ''
            },
            {
              token_no: 'NAT0461',
              full_name: 'AJIT DOVAL',
              uhid: '20180176033',
              status: 'NEXT',
              patient_type: 'WALKIN',
              mobile_no: '9006760588',
              WaitTime: 0,
              room_name: ''
            },
            {
              token_no: 'NAT0462',
              full_name: 'RAMESH DAS',
              uhid: '20180175033',
              status: 'NEXT',
              patient_type: 'WALKIN',
              mobile_no: '9006770440',
              WaitTime: 0,
              room_name: ''
            },
            {
              token_no: 'NAT0463',
              full_name: 'SURENDRA MOURYA',
              uhid: '2018017993',
              status: 'NEXT',
              patient_type: 'WALKIN',
              mobile_no: '9006770650',
              WaitTime: 0,
              room_name: ''
            },
            {
              token_no: 'NAT0465',
              full_name: 'SWAPNALI JADHAV',
              uhid: '2018057993',
              status: 'NEXT',
              patient_type: 'WALKIN',
              mobile_no: '9006770780',
              WaitTime: 0,
              room_name: ''
            },
            {
              token_no: 'NAT0466',
              full_name: 'VIKRAM NIKAM',
              uhid: '2016057993',
              status: 'NEXT',
              patient_type: 'WALKIN',
              mobile_no: '9006770880',
              WaitTime: 0,
              room_name: ''
            },
            {
              token_no: 'NAT0467',
              full_name: 'ANKUSH DOMARE',
              uhid: '2016957993',
              status: 'NEXT',
              patient_type: 'WALKIN',
              mobile_no: '9006777550',
              WaitTime: 0,
              room_name: ''
            },
            {
              token_no: 'NAT0468',
              full_name: 'DILIP SONAWANE',
              uhid: '2016956993',
              status: 'NEXT',
              patient_type: 'WALKIN',
              mobile_no: '9006755550',
              WaitTime: 0,
              room_name: ''
            },
            {
              token_no: 'NAT0469',
              full_name: 'PRAVIN NETAKE',
              uhid: '2016956963',
              status: 'NEXT',
              patient_type: 'WALKIN',
              mobile_no: '9006785550',
              WaitTime: 0,
              room_name: ''
            }
          ],
          calling_patient_list: [
            {
              token_no: 'NAT0785',
              full_name: 'RAVI MUKATI',
              uhid: '20180100003',
              status: 'CALLING',
              patient_type: 'WALKIN',
              mobile_no: '9000000020',
              WaitTime: 0,
              room_name: 'OPD1'
            },
            {
              token_no: 'NAT0955',
              full_name: 'EKNATH BHARTI',
              uhid: '20180100003',
              status: 'CALLING',
              patient_type: 'WALKIN',
              mobile_no: '9000000020',
              WaitTime: 0,
              room_name: 'OPD2'
            },
            {
              token_no: 'NAT0960',
              full_name: 'BHARAT KALE',
              uhid: '20180500003',
              status: 'CALLING',
              patient_type: 'WALKIN',
              mobile_no: '9200000020',
              WaitTime: 0,
              room_name: 'OPD3'
            },
            {
              token_no: 'NAT0975',
              full_name: 'SANJIV RANE',
              uhid: '2045100003',
              status: 'CALLING',
              patient_type: 'WALKIN',
              mobile_no: '9050000020',
              WaitTime: 0,
              room_name: 'OPD4'
            },
            {
              token_no: 'NAT0985',
              full_name: 'GEETA MANE',
              uhid: '20180100003',
              status: 'CALLING',
              patient_type: 'WALKIN',
              mobile_no: '9065000020',
              WaitTime: 0,
              room_name: 'OPD5'
            },
            {
              token_no: 'NAT0989',
              full_name: 'RAM MARATHE',
              uhid: '20180100003',
              status: 'CALLING',
              patient_type: 'WALKIN',
              mobile_no: '9070000020',
              WaitTime: 0,
              room_name: 'OPD6'
            },
            {
              token_no: 'NAT0155',
              full_name: 'RAHUL PAWAR',
              uhid: '20180100003',
              status: 'CALLING',
              patient_type: 'WALKIN',
              mobile_no: '9080000020',
              WaitTime: 0,
              room_name: 'OPD7'
            }
          ],
          absent_patient_list: [],
          consultation_patient_list: [],
          completed_patient_list: [],
          hold_patient_list: [],
          skip_patient_list: [{
            token_no: 'NAT021',
            full_name: 'JITENDRA PANDHARINATH LAVHALE',
            uhid: '20180100005',
            status: 'SKIP',
            room_name: 'INDRANI',
          }],
          rooms: [
            {
              room_id: 5,
              room_name: '505'
            },
            {
              room_id: 11,
              room_name: '101'
            },
            {
              room_id: 12,
              room_name: '102'
            },
            {
              room_id: 22,
              room_name: 'OPD2'
            },
            {
              room_id: 23,
              room_name: 'OPD3'
            },
            {
              room_id: 11,
              room_name: '101'
            }
          ],
          entity_tag: 'DOCTOR',
          entity_id: 2,
          entity_value_id: 346,
          entity_value: 'NATRAJ V HOS',
          entity_title: 'Dr',
          room_mapped_id: 18,
          queue_date: '2019-12-02T00:00:00',
          start_time: '09:00:00',
          end_time: '12:00:00',
          specialty: 'MD, DM (Cardiology), FACC, FICC, FCSI',
          time_per_patient: 20,
          image_url: 'https://drrescribe.com/medsonit-be/assets/doc_profile/2883.jpg?time=%2015:48:59',
          actual_start_time: '09:30:00',
          entity_delay_time: 30
        },
        room_mapping_id: 18,
        main_room_id: 22,
        room_name: 'OPD2',
        is_pause_mode: false,
        pause_time: null
      },
      {
        LivePatientQueueData: {
          next_patient_list: [
            {
              token_no: 'RR0019',
              full_name: 'KRISHNA KUMAR JHA',
              uhid: '20180100001',
              status: 'NEXT',
              patient_type: 'WALKIN',
              mobile_no: '9000000020',
              WaitTime: 0,
              room_name: ''
            },
            {
              token_no: 'NAT0456',
              full_name: 'MADHAB DUMDUM',
              uhid: '20180100004',
              status: 'NEXT',
              patient_type: 'WALKIN',
              mobile_no: '9000000060',
              WaitTime: 0,
              room_name: ''
            },
            {
              token_no: 'NAT0457',
              full_name: 'EKNATH SHINDE',
              uhid: '20180100005',
              status: 'NEXT',
              patient_type: 'WALKIN',
              mobile_no: '9000000620',
              WaitTime: 0,
              room_name: ''
            },
            {
              token_no: 'NAT0458',
              full_name: 'SAGAR SHINDE',
              uhid: '20180170003',
              status: 'NEXT',
              patient_type: 'WALKIN',
              mobile_no: '9006700020',
              WaitTime: 0,
              room_name: ''
            },
            {
              token_no: 'NAT0455',
              full_name: 'SAGARIKA PAHARIYA',
              uhid: '20180177003',
              status: 'NEXT',
              patient_type: 'WALKIN',
              mobile_no: '9006760020',
              WaitTime: 0,
              room_name: ''
            },
            {
              token_no: 'NAT0445',
              full_name: 'DEEPAK PATTNAIK',
              uhid: '20180177033',
              status: 'NEXT',
              patient_type: 'WALKIN',
              mobile_no: '9006760560',
              WaitTime: 0,
              room_name: ''
            },
            {
              token_no: 'NAT0445',
              full_name: 'AJIT DOVAL',
              uhid: '20180178033',
              status: 'NEXT',
              patient_type: 'WALKIN',
              mobile_no: '9006760550',
              WaitTime: 0,
              room_name: ''
            },
            {
              token_no: 'NAT0445',
              full_name: 'RAMESH DAS',
              uhid: '20180179033',
              status: 'NEXT',
              patient_type: 'WALKIN',
              mobile_no: '9006770550',
              WaitTime: 0,
              room_name: ''
            },
            {
              token_no: 'NAT05',
              full_name: 'SURESH KAMBLE',
              uhid: '20180175033',
              status: 'NEXT',
              patient_type: 'WALKIN',
              mobile_no: '9006770550',
              WaitTime: 0,
              room_name: ''
            },
          ],
          calling_patient_list: [
            {
              token_no: 'RR0219',
              full_name: 'AKASH CHIMIK',
              uhid: '20180100001',
              status: 'CALLING',
              patient_type: 'WALKIN',
              mobile_no: '9000000020',
              WaitTime: 0,
              room_name: 'OPD2'
            }
          ],
          absent_patient_list: [],
          consultation_patient_list: [],
          completed_patient_list: [],
          hold_patient_list: [],
          skip_patient_list: [{
            token_no: 'RR0112',
            full_name: 'JITENDRA PANDHARINATH LAVHALE',
            uhid: '20180100005',
            status: 'SKIP',
            room_name: 'INDRANI',
          }],
          rooms: [
            {
              room_id: 3,
              room_name: '504'
            },
            {
              room_id: 5,
              room_name: '505'
            },
            {
              room_id: 21,
              room_name: 'OPD1'
            },
            {
              room_id: 22,
              room_name: 'OPD2'
            },
            {
              room_id: 23,
              room_name: 'OPD3'
            }
          ],
          entity_tag: 'DOCTOR',
          entity_id: 2,
          entity_value_id: 356,
          entity_value: 'RAMA RAO',
          entity_title: 'Dr',
          room_mapped_id: 25,
          queue_date: '2019-12-02T00:00:00',
          start_time: '06:00:00',
          end_time: '22:00:00',
          specialty: 'ABDOMINAL TRANSPLANT',
          time_per_patient: 15,
          image_url: null,
          actual_start_time: '07:00:00',
          entity_delay_time: 60
        },
        room_mapping_id: 25,
        main_room_id: 21,
        room_name: 'OPD1',
        is_pause_mode: true,
        pause_time: '10'
      },
      {
        LivePatientQueueData: {
          next_patient_list: [
            {
              token_no: 'MJ0019',
              full_name: 'KUMAR SANU',
              uhid: '20180100001',
              status: 'NEXT',
              patient_type: 'WALKIN',
              mobile_no: '9000000020',
              WaitTime: 0,
              room_name: ''
            },
            {
              token_no: 'MJ0005',
              full_name: 'SHITAL SUBHASH KELKAR',
              uhid: '20180100003',
              status: 'NEXT',
              patient_type: 'WALKIN',
              mobile_no: '9000000020',
              WaitTime: 0,
              room_name: ''
            },
            {
              token_no: 'MJ0456',
              full_name: 'MADHAB DUMDUM',
              uhid: '20180100004',
              status: 'NEXT',
              patient_type: 'WALKIN',
              mobile_no: '9000000060',
              WaitTime: 0,
              room_name: ''
            },
            {
              token_no: 'MJ0457',
              full_name: 'EKNATH SHINDE',
              uhid: '20180100005',
              status: 'NEXT',
              patient_type: 'WALKIN',
              mobile_no: '9000000620',
              WaitTime: 0,
              room_name: ''
            },
            {
              token_no: 'MJ0458',
              full_name: 'SAGAR SHINDE',
              uhid: '20180170003',
              status: 'NEXT',
              patient_type: 'WALKIN',
              mobile_no: '9006700020',
              WaitTime: 0,
              room_name: ''
            },
            {
              token_no: 'MJ0455',
              full_name: 'SAGARIKA PAHARIYA',
              uhid: '20180177003',
              status: 'NEXT',
              patient_type: 'WALKIN',
              mobile_no: '9006760020',
              WaitTime: 0,
              room_name: ''
            },
            {
              token_no: 'MJ0445',
              full_name: 'DEEPAK PATTNAIK',
              uhid: '20180177033',
              status: 'NEXT',
              patient_type: 'WALKIN',
              mobile_no: '9006760560',
              WaitTime: 0,
              room_name: ''
            },
            {
              token_no: 'MJ0445',
              full_name: 'AJIT DOVAL',
              uhid: '20180176033',
              status: 'NEXT',
              patient_type: 'WALKIN',
              mobile_no: '9006760550',
              WaitTime: 0,
              room_name: ''
            },
            {
              token_no: 'MJ0445',
              full_name: 'RAMESH DAS',
              uhid: '20180175033',
              status: 'NEXT',
              patient_type: 'WALKIN',
              mobile_no: '9006770550',
              WaitTime: 0,
              room_name: ''
            }
          ],
          calling_patient_list: [
            {
              token_no: 'MJ0119',
              full_name: 'KUMAR ARVIND',
              uhid: '20180100001',
              status: 'CALLING',
              patient_type: 'WALKIN',
              mobile_no: '9000000020',
              WaitTime: 0,
              room_name: 'OPD3'
            },
            {
              token_no: 'MJ0105',
              full_name: 'SHITAL JAIN',
              uhid: '20180100003',
              status: 'CALLING',
              patient_type: 'WALKIN',
              mobile_no: '9000000020',
              WaitTime: 0,
              room_name: ''
            }
          ],
          absent_patient_list: [],
          consultation_patient_list: [],
          completed_patient_list: [],
          hold_patient_list: [],
          skip_patient_list: [{
            token_no: 'MJ0225',
            full_name: 'JITENDRA PANDHARINATH LAVHALE',
            uhid: '20180100005',
            status: 'SKIP',
            room_name: 'INDRANI',
          }],
          rooms: [
            {
              room_id: 3,
              room_name: '504'
            },
            {
              room_id: 5,
              room_name: '505'
            },
            {
              room_id: 21,
              room_name: 'OPD1'
            },
            {
              room_id: 22,
              room_name: 'OPD2'
            },
            {
              room_id: 23,
              room_name: 'OPD3'
            }
          ],
          entity_tag: 'DOCTOR',
          entity_id: 2,
          entity_value_id: 356,
          entity_value: 'MAYUR JAIN',
          entity_title: 'Dr',
          room_mapped_id: 25,
          queue_date: '2019-12-02T00:00:00',
          start_time: '06:00:00',
          end_time: '22:00:00',
          specialty: 'SURGERY',
          time_per_patient: 15,
          image_url: null,
          actual_start_time: '07:00:00',
          entity_delay_time: 60
        },
        room_mapping_id: 25,
        main_room_id: 21,
        room_name: 'OPD1',
        is_pause_mode: true,
        pause_time: '10'
      },
      {
        LivePatientQueueData: {
          next_patient_list: [
            {
              token_no: 'SK0025',
              full_name: 'AMIT KAMBLE',
              uhid: '20180100001',
              status: 'NEXT',
              patient_type: 'WALKIN',
              mobile_no: '9000000020',
              WaitTime: 0,
              room_name: ''
            },
            {
              token_no: 'SK0005',
              full_name: 'SUBHASH KELKAR',
              uhid: '20180100003',
              status: 'NEXT',
              patient_type: 'WALKIN',
              mobile_no: '9000000020',
              WaitTime: 0,
              room_name: ''
            },
            {
              token_no: 'SK0456',
              full_name: 'MADHAB DUMDUM',
              uhid: '20180100004',
              status: 'NEXT',
              patient_type: 'WALKIN',
              mobile_no: '9000000060',
              WaitTime: 0,
              room_name: ''
            },
            {
              token_no: 'SK0457',
              full_name: 'EKNATH SHINDE',
              uhid: '20180100005',
              status: 'NEXT',
              patient_type: 'WALKIN',
              mobile_no: '9000000620',
              WaitTime: 0,
              room_name: ''
            },
            {
              token_no: 'SK0458',
              full_name: 'SAGAR SHINDE',
              uhid: '20180170003',
              status: 'NEXT',
              patient_type: 'WALKIN',
              mobile_no: '9006700020',
              WaitTime: 0,
              room_name: ''
            },
            {
              token_no: 'SK0455',
              full_name: 'SAGARIKA PAHARIYA',
              uhid: '20180177003',
              status: 'NEXT',
              patient_type: 'WALKIN',
              mobile_no: '9006760020',
              WaitTime: 0,
              room_name: ''
            },
            {
              token_no: 'SK0445',
              full_name: 'DEEPAK PATTNAIK',
              uhid: '20180177033',
              status: 'NEXT',
              patient_type: 'WALKIN',
              mobile_no: '9006760560',
              WaitTime: 0,
              room_name: ''
            },
            {
              token_no: 'SK0445',
              full_name: 'AJIT DOVAL',
              uhid: '20180176033',
              status: 'NEXT',
              patient_type: 'WALKIN',
              mobile_no: '9006760550',
              WaitTime: 0,
              room_name: ''
            },
            {
              token_no: 'SK0445',
              full_name: 'RAMESH DAS',
              uhid: '20180175033',
              status: 'NEXT',
              patient_type: 'WALKIN',
              mobile_no: '9006770550',
              WaitTime: 0,
              room_name: ''
            }
          ],
          calling_patient_list: [
            {
              token_no: 'SK0114',
              full_name: 'RAHUL DESAI',
              uhid: '20180100088',
              status: 'CALLING',
              patient_type: 'WALKIN',
              mobile_no: '9000070020',
              WaitTime: 0,
              room_name: 'OPD4'
            },
            {
              token_no: 'SK0115',
              full_name: 'NIHAL DIKSHIT',
              uhid: '20180100089',
              status: 'CALLING',
              patient_type: 'WALKIN',
              mobile_no: '9000096020',
              WaitTime: 0,
              room_name: ''
            }
          ],
          absent_patient_list: [],
          consultation_patient_list: [],
          completed_patient_list: [],
          hold_patient_list: [],
          skip_patient_list: [{
            token_no: 'SK0236',
            full_name: 'JITENDRA PANDHARINATH LAVHALE',
            uhid: '20180100005',
            status: 'SKIP',
            room_name: 'INDRANI',
          }],
          rooms: [
            {
              room_id: 3,
              room_name: '504'
            },
            {
              room_id: 5,
              room_name: '505'
            },
            {
              room_id: 21,
              room_name: 'OPD1'
            },
            {
              room_id: 22,
              room_name: 'OPD2'
            },
            {
              room_id: 23,
              room_name: 'OPD3'
            }
          ],
          entity_tag: 'DOCTOR',
          entity_id: 2,
          entity_value_id: 356,
          entity_value: 'SHEKHAR KUMAR',
          entity_title: 'Dr',
          room_mapped_id: 25,
          queue_date: '2019-12-02T00:00:00',
          start_time: '06:00:00',
          end_time: '22:00:00',
          specialty: 'SURGERY',
          time_per_patient: 15,
          image_url: null,
          actual_start_time: '07:00:00',
          entity_delay_time: 60
        },
        room_mapping_id: 25,
        main_room_id: 21,
        room_name: 'OPD3',
        is_pause_mode: true,
        pause_time: '10'
      }
    ],
    template_type: null,
    field_settings: null,
    display_type: null
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
    let loginPageUrl = environment.SSO_LOGIN_URL;
    loginPageUrl = environment.production && loginPageUrl ? loginPageUrl : window.location.origin;
    // clear local storage, cookies, cache and navigate to login
    localStorage.clear();
    this.authService.deleteCookie('auth_token');
    this.storeKeyValues = [];
    this.userListTempParams = null;
    this.getScheduleDataParams = null;
    window.location.href = loginPageUrl;
    this.manageAppointmentFilterData = null;
    this.setCurrentSelectedProvider(null);
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

  updatePinUnpinForChart(val) {
    this.suggPinUnpinForCharts.next(val);
  }

  updateHistoryTabHideShow(val) {
    this.historyTabHideShow.next(val);
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

  setDummyDataVal(JsonData, displayTemplateType) {
    this.dispalyDummyData.template_type = displayTemplateType;
    this.dispalyDummyData.field_settings = JSON.stringify(JsonData);
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
    } else if (timeVal) {
      console.log("Use detault 24_hour time format when timeFormateKey is: " + timeFormateKey);
      updateTimeVal = moment(moment().format('YYYY-MM-DD') + ' ' + timeVal).format('HH:mm');
    }
    return timeVal ? updateTimeVal : null;
  }

  // -- convert main appointment list to flat objects
  convertAppointmentDataToFlatList(list: Array<QSlotInfo>, timeFormateKey, queueType?, queuename?, queueTypeId?, queueValueId?): Array<QSlotInfoDummy> {
    const tempList = [];
    list.forEach(r => {
      // let t = r as QSlotInfo;
      if (r.appointments.length) {
        r.appointments.forEach(v => {
          let t = r as QSlotInfo;
          v.queueType = queueType ? queueType : '';
          v.queueName = queuename ? queuename : '';
          v.queueTypeId = queueTypeId ? queueTypeId : 0;
          v.queueValueId = queueValueId ? queueValueId : 0;
          t = Object.assign(v, t);
          v.slotTime = _.clone(this.convertTime(timeFormateKey, v.slotTime));
          tempList.push(Object.assign({}, t));
        });
      } else {
        // v.slotTime = _.clone(this.convertTime(timeFormateKey, v.slotTime));
        // tempList.push(t);
      }
    });
    return tempList;
  }

  public updateAppointmentStatusDisplayNameSetting(data) {
    let url = `${environment.baseUrlAppointment}/Appointment/UpdateAppointmentDisplayName`;
    return this.http.post(url, data).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success') {
          return res.status_message;
        } else {
          return null;
        }
      })
    );
  }
  public getAppointmentStatusDisplayNameSetting() {
    let url = `${environment.baseUrlAppointment}/AppointmentBooking/getAppointmentStatusMaster`;
    return this.http.get(url).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success') {
          return res;
        } else {
          return null;
        }
      })
    );
  }

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

  getQueueSettingsForMultiple(param, template?): Observable<any> {
    let reqUrl = `${environment.baseUrlAppointment}/QMSSettings/getMultipleQmsSettings`;
    if (template && template === '9') {
      reqUrl = `${environment.baseUrlAppointmentForDisplayTemplate9}/QMSSettings/getMultipleQmsSettings`;
    }
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

  getActivePatientList(patient?) {
    if (patient) {
      return this.activePatientList.filter(res => res.serviceType.name === patient.serviceType.name);
    } else {
      return this.activePatientList;
    }
  }

  setActivePatientList(patient, type) {
    const patExistIndx = _.findIndex(this.activePatientList, pat => {
      return _.toNumber(pat.patientData.id) === _.toNumber(patient.patientData.id);
    });
    if (type === 'add') {
      if (patExistIndx === -1) {
        this.setLastActivePatient(patient);
        this.activePatientList.push(patient);
      } else {
        this.setLastActivePatient(this.activePatientList[patExistIndx]);
      }
    } else if (type === 'remove') {
      if (patExistIndx !== -1) {
        this.activePatientList.splice(patExistIndx, 1);
      }
    }
  }

  updateActivePatientList(data) {
    this.addRemoveActivePatientFromList.next(data);
  }
  getpreviousUrl() {
    return this.previousUrl;
  }
  setpreviousUrl(url) {
    this.previousUrl = url;
  }

  getLastActivePatient() {
    return this.lastActivePatient;
  }

  setLastActivePatient(patient) {
    this.lastActivePatient = patient;
  }

  getActivePatintData(patientId) {
    const patExistIndx = _.findIndex(this.activePatientList, pat => {
      return _.toNumber(pat.patientData.id) === _.toNumber(patientId);
    });
    return this.activePatientList[patExistIndx];
  }

  getPatientMonitoringDateTime(patientId) {
    if (!this.activePatientMonitoringDateTime[patientId]) {
      this.activePatientMonitoringDateTime[patientId] = false;
    }
    return this.activePatientMonitoringDateTime;
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

  getReferPatientList(param) {
    const url = `${environment.dashboardBaseURL}/Refer/GetReferPatientList`;
    return this.http.post(url, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success') {
          return res;
        } else {
          return null;
        }
      })
    );
  }

  getDepartmentList(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/HISView/getDepartmentList`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data.length > 0) {
        return res.data;
      } else {
        return [];
      }
    }));
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
    const appKey = this.authService.getActiveAppKey() || 'qms';

    if (appKey === 'qms') {
      if (userInfo.role_type === ApplicationEntityConstants.DOCTOR
        && _.find(userPermissions, (o) => o === PermissionsConstants.View_Queue)) {
        this.router.navigate(['/app/qms/qList']);
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
      }
    } else if (appKey === 'appointment') {
      if (userInfo.role_type === ApplicationEntityConstants.TELECALLER) {
        this.router.navigate(['/appointmentApp/appointments/searchappointment']);
      } else {
        const defaultUrl = '/appointmentApp/appointments/listfd/fduserappointmentsList';
        this.router.navigate([defaultUrl]);
      }
    } else {
      const defaultUrl = '/app/nopermission';
      this.router.navigate([defaultUrl]);
    }
  }
  getPatientTypePriority() {
    const url = `${environment.baseUrlAppointment}/QMSSettings/getPatientTypePriority`;
    return this.http.get(url).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success') {
          return res;
        } else {
          return null;
        }
      })
    );
  }
  savePatientTypePriority(param): Observable<any> {
    const reqUrl = `${environment.baseUrlAppointment}/QMSSettings/savePatientTypePriority`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success') {
        return res;
      } else {
        return [];
      }
    }));
  }
}
