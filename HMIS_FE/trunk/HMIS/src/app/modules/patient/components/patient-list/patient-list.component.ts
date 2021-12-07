import { Component, OnInit, ViewChild, OnChanges, AfterViewInit } from '@angular/core';
import { Subject, Observable, concat, of } from 'rxjs';
import { debounceTime, takeUntil, map, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { PatientService } from "../../../../shared/services/patient.service";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { NgxPermissionsService } from 'ngx-permissions';
import { ApplicationConstants, PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { Constants } from 'src/app/config/constants';
import { PatientDetailComponent } from '../patient-detail/patient-detail.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/public/services/common.service';
import { AuthService } from 'src/app/public/services/auth.service';
import { UsersService } from 'src/app/public/services/users.service';
import { DatatableComponent } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss']
})
export class PatientListComponent implements OnInit, OnChanges {
  @ViewChild(DatatableComponent, { static: false }) public table: DatatableComponent;
  pageSize;
  page: {
    size: number, // The number of elements in the page
    totalElements: number, // The total number of elements
    totalPages: number, // The total number of pages
    pageNumber: number, // The current page number
  };
  externalPaging: boolean;
  sortUserList: { sort_order: string, sort_column: string };
  alertMsg: IAlert;
  subject: Subject<string> = new Subject();
  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  compInstance = this;
  datatableBodyElement: any;
  editPermission: boolean;
  PermissionConstantList: any = [];

  patientListFilterForm: FormGroup;
  patientList = [];
  showPatientListFilter = false;
  searchString: string;
  isNgSelectTypeHeadDisabled = false;
  isFilterApply: boolean;
  showActivePatient: boolean;
  showAddPatientPopup = false;
  $destroy: Subject<boolean> = new Subject();
  notify = {
    isPatientSelectAll: false,
    isPatientSelectAllFlag: false,
    selectedPatientIds: [],
    deSelectedPatientIds: [],
    templateName: null,
    selectedPatientCounts: 0
  };
  templateMasterList = [];
  bloodGroupList: [] = [];
  multiSelectObj: { id: string, name: string };
  genderList: any;
  patientEditPermission = false;
  settings: any;
  submitted: boolean = false;
  gender = [
    { id: 1, name: 'Male' },
    { id: 2, name: 'Female' },
    { id: 3, name: 'Transgender' },
    { id: 4, name: 'Unknown' }
  ];
  maritalStatus = [
    { id: 1, name: 'Married' },
    { id: 2, name: 'Unmarried' },
    { id: 3, name: 'Do not Want to share' }
  ];
  showAge: number;
  religion: any;
  language: any;
  occupation: any;
  relation: any;
  bloodGroups: any;
  ageUnit: any;
  nationality: any;
  title: any;
  present_cities: any;
  cities: any;
  present_states: any;
  states: any;
  present_countries: any;
  countries: any;

  appKey: any;
  isPartialLoad: boolean;
  todayDate = new Date();
  isActive: boolean;
  total_records: any;

  countriList$ = new Observable<any>();
  countriListInput$ = new Subject<any>();

  stateList$ = new Observable<any>();
  stateListInput$ = new Subject<any>();

  cityList$ = new Observable<any>();
  cityListInput$ = new Subject<any>();

  presentCountryList$ = new Observable<any>();
  presentCountryListInput$ = new Subject<any>();

  presentStateList$ = new Observable<any>();
  presentStateListInput$ = new Subject<any>();

  presentCityList$ = new Observable<any>();
  presentCityListInput$ = new Subject<any>();

  constructor(
    private patientService: PatientService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private permissionsService: NgxPermissionsService,
    private router: Router,
    private commonService: CommonService,
    private authService: AuthService,
    private userService: UsersService,
    private activatedRoute: ActivatedRoute,
  ) {
    // this.onView = this.onView.bind(this);
    this.onEdit = this.onEdit.bind(this);
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(data => {
      const token = data.get('token');
      this.appKey = data.get('appKey');
      if (token) {
        this.isPartialLoad = true;
        this.checkAndCreateUserSession(token);
        this.loadFormAndData();
        this.getDefaultLocationDataToSet()
        // this.checkAndCreateUserSession(token).then(res => {
        //   // this.getDefaultLocationDataToSet().then(r => {
        //   //   this.loadFormAndData();
        //   // })
        // })
      } else {
        this.isPartialLoad = false;
        this.loadFormAndData();
        this.getDefaultLocationDataToSet()
      }
    });
  }

  checkAndCreateUserSession(token) {
    const promise = new Promise((resolve, reject) => {
      const oldToken = this.authService.getAuthToken();
      if (!oldToken || oldToken != token) {
        this.loginThroghSSO(token).then(res => {
          resolve(true);
        });
      }
      else {
        const userId = this.authService.getLoggedInUserId()
        this.assignRoleAndRedirect(userId).subscribe(res => {
          resolve(true);
        });
      }
    });
    return promise;
  }

  loginThroghSSO(token) {
    const promise = new Promise((resolve, reject) => {
      this.authService.loginThroghSSO(token).subscribe(res => {
        if (res.status_message === 'Success') {
          // localStorage.setItem('globals', JSON.stringify(res.data));
          const userObject = res.data;
          this.commonService.storeKeyValues = [];
          this.commonService.userListTempParams = null;
          this.commonService.getScheduleDataParams = null;
          this.userService.masterUserDetails = {};
          this.authService.redirectUrl = null;
          // store login info to local storage
          this.authService.storeLoginInfo(userObject);
          this.assignRoleAndRedirect(userObject.id).subscribe(res => {
            resolve(true);
          });
        } else if (res) {
          this.router.navigate(['/error']);
          resolve(true);
        }
      });
    });
    return promise;
  }

  assignRoleAndRedirect(userId): Observable<any> {
    const appId = this.authService.getAppIdByAppKey('registration');
    return this.userService.GetAssignedRolePermissionsByUserId(userId, appId)
      .pipe(map(res => {
        const userPermission = this.userService.userPermission;
        this.permissionsService.loadPermissions(userPermission);
        // this.redirectTo();
      }));
  }

  loadFormAndData(uhid?) {
    this.patientEditPermission = _.isUndefined(this.permissionsService.getPermission(PermissionsConstants.Update_PatientMaster)) ? true : false;
    this.getFormData();
    this.getSettings();

    this.pageSize = 25;
    this.defaultObject();
    this.subjectFun();
    this.searchByFilter();
  }

  ngOnChanges() {
    this.searchByFilter();
  }

  defaultObject() {
    this.isFilterApply = false;
    this.showActivePatient = true;
    this.page = { size: 25, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortUserList = { sort_order: 'asc', sort_column: 'registrationDate' };
    this.searchString = '';
    this.externalPaging = true;
    this.defaultSearchFilter();
  }

  defaultSearchFilter() {
    var obj = {};
    obj['uhid'] = [null];
    obj['patientName'] = [null];
    obj['mobile'] = [null];
    _.map(this.settings, itr => {
      if (itr.isSearchable && itr.key !== 'title' && itr.key !== 'firstname' && itr.key !== 'middlename' && itr.key !== 'lastname' && itr.key !== 'mobile')
        obj[itr.key] = [null];
    })
    obj['activeEncounter'] = [false];
    obj['isPatientUnknown'] = [false];
    obj['isPatientTemporary'] = [false];
    obj['isPatientActive'] = [true];
    obj['isPatientLive'] = [true];
    this.patientListFilterForm = this.fb.group(obj)   
    this.setDefaultLocation();
  }

  searchByFilter(showFilter?) {
    let param = {}
    param['uhid'] = this.patientListFilterForm.value['uhid'];
    param['patientName'] = this.patientListFilterForm.value['patientName'];
    param['mobile'] = this.patientListFilterForm.value['mobile'];
    param['activeEncounter'] = this.patientListFilterForm.value['activeEncounter'];
    param['isUnknownUhid'] = this.patientListFilterForm.value['isPatientUnknown'];
    param['isTempUhid'] = this.patientListFilterForm.value['isPatientTemporary'];
    param['isActive'] = this.patientListFilterForm.value['isPatientActive'];
    param['isLive'] = this.patientListFilterForm.value['isPatientLive'];
    param["sortOrder"] = this.sortUserList.sort_order;
    param["sortColumn"] = this.sortUserList.sort_column;
    param["searchText"] = this.searchString ? this.searchString : '';
    param["page"] = this.page.pageNumber;
    param["pageSize"] = this.page.size;
    if (!_.isUndefined(showFilter)) {
      this.searchString = null;
      param["searchText"] = null;
      const frmVal = this.patientListFilterForm.getRawValue();
      _.map(this.settings, itr => {
        if (itr.key === 'gender' && itr.isSearchable) {
          param[itr.key] = this.patientListFilterForm.value ? this.patientListFilterForm.value[itr.key]?.name : null;
        } else if (itr.key === 'bloodgroup' && itr.isSearchable) {
          param[itr.key] = this.patientListFilterForm.value ? this.patientListFilterForm.value[itr.key]?.BldName : null;
        } else if (itr.key === 'nationality' && itr.isSearchable) {
          param[itr.key] = this.patientListFilterForm.value ? this.patientListFilterForm.value[itr.key]?.NnlName : null;
        } else if (itr.key === 'marital_status' && itr.isSearchable) {
          param[itr.key] = this.patientListFilterForm.value ? this.patientListFilterForm.value[itr.key]?.name : null;
        } else if (itr.key === 'relation' && itr.isSearchable) {
          param[itr.key] = this.patientListFilterForm.value ? this.patientListFilterForm.value[itr.key]?.RspName : null;
        } else if (itr.key === 'country' && itr.isSearchable) {
          param[itr.key] = frmVal && frmVal.country ? frmVal.country : null;
        } else if (itr.key === 'state' && itr.isSearchable) {
          param[itr.key] = frmVal && frmVal.state ? frmVal.state : null;
        } else if (itr.key === 'city' && itr.isSearchable) {
          param[itr.key] = frmVal && frmVal.city ? frmVal.city : null;
        } else if (itr.key === 'present_country' && itr.isSearchable) {
          param[itr.key] = frmVal && frmVal.present_country ? frmVal.present_country : null;
        } else if (itr.key === 'present_state' && itr.isSearchable) {
          param[itr.key] = frmVal && frmVal.present_state ? frmVal.present_state : null;
        } else if (itr.key === 'present_city' && itr.isSearchable) {
          param[itr.key] = frmVal && frmVal.present_city ? frmVal.present_city : null;
        } else if ((itr.key === 'religion') && itr.isSearchable) {
          param[itr.key] = this.patientListFilterForm.value ? this.patientListFilterForm.value[itr.key]?.rlgId : 0;
        } else if (itr.key === 'occupation' && itr.isSearchable) {
          param[itr.key] = this.patientListFilterForm.value ? this.patientListFilterForm.value[itr.key]?.ocpId : 0;
        } else if (itr.key === 'language' && itr.isSearchable) {
          param[itr.key] = this.patientListFilterForm.value ? this.patientListFilterForm.value[itr.key]?.langId : 0;
        } else if (itr.isSearchable && itr.key !== 'title' && itr.key !== 'firstname' && itr.key !== 'middlename' && itr.key !== 'lastname' && itr.key !== 'mobile') {
          param[itr.key] = this.patientListFilterForm.value ? this.patientListFilterForm.value[itr.key] : null;
        }
      })
    }
    this.patientService.getAllPatientList(param).subscribe(res => {
      if (res && res.data.length > 0) {
        this.patientList = res.data;
        this.total_records = res.total_records;
        this.page.totalElements = res.total_records;
        _.map(this.patientList, itr => {
          itr.registrationDate = moment(itr.registrationDate).format('DD-MM-YYYY');
        })
        if (showFilter) {
          this.showSearchFilter();
        }
      } else {
        this.patientList = [];
        this.page.totalElements = 0;
      }
    }, error => {
      this.notifyAlertMessage({
        msg: error,
        class: 'danger',
      });
    })
  }

  notifyAlertMessage(data): void {
    this.alertMsg = {
      message: data.msg,
      messageType: data.class,
      duration: Constants.ALERT_DURATION
    };
  }

  subjectFun(onSearch?) {
    // -- Subscribe to the subject, which is triggered from search input and when section clicked
    // -- When the debounce time has passed, we call getActiveScheduleData()
    this.subject
      .pipe(debounceTime(500), takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.page.pageNumber = 1;
        // const openSearchPopup = onSearch? onSearch :true;
        this.searchByFilter();
      }
      );
  }

  getSettings() {
    this.patientService.getSettingDetails().subscribe((response) => {
      if (response) {
        _.map(response, itr => {
          if (itr.HsetTagname === 'PATIENT' && itr.HsetQuestion === 'REGISTRATION_FORM') {
            this.settings = JSON.parse(itr.HsetValue);
            this.defaultObject();
          }
        })
      }
    })
  }

  clearSearchFilter() {   
    this.getDefaultLocationDataToSet().then(r => {
      this.searchString = null;
      this.patientListFilterForm.reset();
      this.defaultSearchFilter();
      this.searchByFilter();
      this.setDefaultLocation();
    })
  }

  showSearchFilter() {
    this.showPatientListFilter = !this.showPatientListFilter;
    // this.commonService.setPopupFlag(false, this.showPatientListFilter);
  }

  getFormData() {
    this.patientService.getTitleMaster().subscribe((response) => {
      if (response) {
        this.title = response;
      }
    })
    this.patientService.getNationality().subscribe((response) => {
      if (response) {
        this.nationality = response;
      }
    })
    this.patientService.getAgeunit().subscribe((response) => {
      if (response) {
        this.ageUnit = response;
      }
    })
    this.patientService.getBloodGroup().subscribe((response) => {
      if (response) {
        this.bloodGroups = response;
      }
    })
    this.patientService.getRelation().subscribe((response) => {
      if (response) {
        this.relation = response;
      }
    })
    this.patientService.getOccupation().subscribe((response) => {
      if (response) {
        this.occupation = response;
      }
    })
    this.patientService.getLanguage().subscribe((response) => {
      if (response) {
        this.language = response;
      }
    })
    this.patientService.getReligion().subscribe((response) => {
      if (response) {
        this.religion = response;
      }
    })    
  }

  loadCountryData(searchTxt?) {
    const param = {
      search_text: searchTxt ? searchTxt : '',
      limit: 100
    }

    this.countriList$ = concat(
      this.patientService.getCountryData(param), // default items
      this.countriListInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.patientService.getCountryData(term ? term : (param)).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  loadStateData(searchTxt?, countryId?) {
    const param = {
      searchText: searchTxt ? searchTxt : '',
      limit: 100,
      countryId: countryId && Number.isInteger(countryId) ? countryId : 0,
    }
    this.stateList$ = concat(
      this.patientService.getStateData(param, countryId), // default items
      this.stateListInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.patientService.getStateData(term ? term : (param), countryId).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  loadCityData(searchTxt?, stateId?) {
    const param = {
      searchText: searchTxt ? searchTxt : '',
      limit: 100,
      stateId: stateId && Number.isInteger(stateId) ? stateId : 0,
    }
    this.cityList$ = concat(
      this.patientService.getCityData(param, stateId), // default items
      this.cityListInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.patientService.getCityData(term ? term : (param), stateId).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  loadPresentCountryData(searchTxt?) {
    const param = {
      search_text: searchTxt ? searchTxt : '',
      limit: 100
    }
    this.presentCountryList$ = concat(
      this.patientService.getCountryData(param), // default items
      this.presentCountryListInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.patientService.getCountryData(term ? term : (param)).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  loadPresentStateData(countryId?, searchTxt?) {
    const param = {
      searchText: searchTxt ? searchTxt : '',
      limit: 100,
      countryId: countryId && Number.isInteger(countryId) ? countryId : 0,
    }
    this.presentStateList$ = concat(
      this.patientService.getStateData(param, countryId), // default items
      this.presentStateListInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.patientService.getStateData(term ? term : (param), countryId).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  loadPresentCityData(stateId?, searchTxt?) {
    const param = {
      searchText: searchTxt ? searchTxt : '',
      limit: 100,
      stateId: stateId && Number.isInteger(stateId) ? stateId : 0,
    }
    this.presentCityList$ = concat(
      this.patientService.getCityData(param, stateId), // default items
      this.presentCityListInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.patientService.getCityData(term ? term : (param), stateId).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  onCountryChange(evt, address_type) {
    if (address_type === 'permanent_address') {
      if (evt?.countryId) {
        this.loadStateData(null, evt.countryId);
        this.patientListFilterForm.get('state').enable();
        this.patientListFilterForm.get('city').disable();
        this.patientListFilterForm.patchValue({
          state: null,
          city: null,
        });
      } else {
        this.loadCountryData();
        this.patientListFilterForm.patchValue({
          state: null,
          city: null,
        });
         this.patientListFilterForm.get('state').disable();
        this.patientListFilterForm.get('city').disable();
      }
    } else if (address_type === 'present_address') {
      if (evt?.countryId) {
        this.patientListFilterForm.get('present_state').enable();
        this.patientListFilterForm.get('present_city').disable();
        this.loadPresentStateData(evt.countryId, null);
        this.patientListFilterForm.patchValue({
          present_state: null,
          present_city: null,
        });
      } else {
        this.patientListFilterForm.get('present_state').disable();
        this.patientListFilterForm.get('present_city').disable();
        this.loadCountryData();
        this.patientListFilterForm.patchValue({
          present_state: null,
          present_city: null,
        });
      }
    }
  }

  onStateChange(evt, address_type) {
    const formData = this.patientListFilterForm.getRawValue();
    if (address_type === 'permanent_address') {
      if (evt?.stateId) {
        this.patientListFilterForm.get('city').enable();
        this.loadCityData(null, evt.stateId);
        this.patientListFilterForm.patchValue({
          city: null,
        });
      } else {
        this.loadStateData('', formData.country);
        this.patientListFilterForm.get('city').disable();
        this.patientListFilterForm.patchValue({
          city: null,
        });
      }
    } else if (address_type === 'present_address') {
      if (evt?.stateId) {
        this.patientListFilterForm.patchValue({
          present_city: null,
        });
        this.loadPresentStateData(evt.stateId, null);
         this.patientListFilterForm.get('present_city').enable();
      } else {
        this.patientListFilterForm.patchValue({
          present_city: null,
        });
        this.patientListFilterForm.get('present_city').disable();
        this.loadStateData(formData.present_country, '');
        this.present_cities = null;
      }
    }
  }

  onView(patient) {
    const parentAppUrl = window.location.ancestorOrigins.length ? window.location.ancestorOrigins[0] : '';
    if (this.appKey === 'emr') {
      this.patientService.getPatientActiveVisitDetail(patient.uhid).subscribe((res) => {
        if (res) {
          let redirectionUrl = '';
          const appName = window.location.href.includes('hmis-fe') ? '/emr-web' : '';
          redirectionUrl = parentAppUrl + appName + '/#/viewOnlyPatient/' + patient.uhid;
          window.top.location.href = redirectionUrl;
        } else {
          this.notifyAlertMessage({
            msg: 'This patient has no IP/OP record.',
            class: 'danger',
          });
        }
      });


    } else {
      const modalRef = this.modalService.open(PatientDetailComponent, {
        keyboard: false,
        size: 'sm',
        windowClass: "patient-detail",
      });
      modalRef.componentInstance.patientData = patient;
      modalRef.result.then((result) => {
        if (result != 'cancel') {
          return;
        } else {
          return;
        }
      });
    }

  }

  ageCalculator(date) {
    if (date) {
      const convertAge = new Date(date);
      const timeDiff = Math.abs(Date.now() - convertAge.getTime());
      this.showAge = Math.floor((timeDiff / (1000 * 3600 * 24)) / 365);
      this.patientListFilterForm.patchValue({
        dob: date,
        age: this.showAge
      })
    }
  }

  dateChange(date) {
    if (date) {
      this.patientListFilterForm.patchValue({
        registrationdate: date
      })
    }
  }

  onEdit(evt) {
    const parentAppUrl = window.location.ancestorOrigins.length ? window.location.ancestorOrigins[0] : '';
    if (this.appKey === 'emr') {
      let redirectionUrl = '';
      const appName = window.location.href.includes('/hmis-fe/') ? '/emr-web' : '';
      redirectionUrl = parentAppUrl + appName + '/#/' + this.appKey + '/patientData/addPatient/' + evt.uhid;
      window.top.location.href = redirectionUrl;
    } else if (this.appKey === 'nursing') {
      let redirectionUrl = '';
      const appName = window.location.href.includes('/hmis-fe/') ? '/emr-web' : '';
      redirectionUrl = parentAppUrl + appName + '/#/nursingApp/' + this.appKey + '/patientData/addPatient/' + evt.uhid;
      window.top.location.href = redirectionUrl;
    } else if (this.appKey === 'ot') {
      let redirectionUrl = '';
      const appName = window.location.href.includes('/hmis-fe/') ? '/ot-web' : '';
      redirectionUrl = parentAppUrl + appName + '/#/otApp/' + this.appKey + '/patientData/addPatient/' + evt.uhid;
      window.top.location.href = redirectionUrl;
    } else if (evt) {
      // navigate to url
      if (parentAppUrl && this.isPartialViewInHmis) {
        const appName = window.location.href.indexOf('/hmis-fe/') != -1 ? '/hmis-web' : '';
        const appKeyName = '/' + (this.appKey == 'hmis' ? ApplicationConstants.Registration : this.appKey);
        let redirectionUrl = parentAppUrl + appName + appKeyName + '/Patient/Registration?uhid=' + evt.uhid;
        window.top.location.href = redirectionUrl;
      } else {
        let redirectionUrl = '/app/patient/patientRegistration/full/' + evt.uhid;
        this.router.navigate([redirectionUrl]);
      }
    }
  }

  private get isPartialViewInHmis() {
    return this.appKey == 'hmis' || this.appKey == ApplicationConstants.Registration
      || this.appKey == ApplicationConstants.IPD || this.appKey == ApplicationConstants.OPD
      || this.appKey == ApplicationConstants.Emergency || this.appKey == ApplicationConstants.Billing
      || this.appKey == ApplicationConstants.admin || this.appKey == ApplicationConstants.OT;
  }

  onRowPrepared(evt: any): void {
    if (evt.data && evt.rowType === 'data' && evt.data.isLive === 'NO') {
      evt.rowElement.style.color = "red";
    }
  }

  onDelete() {

  }

  onPageSizeChanged(newPageSize) {
    this.sortUserList = { sort_order: 'asc', sort_column: 'registrationDate' };
    this.page.size = Number(newPageSize);
    this.page.pageNumber = 1;
    this.searchByFilter();
  }

  onFooterPage(event): void {
    this.page.pageNumber = event.page;
    this.searchByFilter();
  }

  onSortChanged(event) {
    if (event.sorts.length > 0) {
      const obj = event.sorts[0];
      this.sortUserList.sort_order = obj.dir;
      this.sortUserList.sort_column = this.getSortColumnName(obj.prop);
      this.searchByFilter();
    }
  }

  getSortColumnName(clmName) {
    if (clmName === 'id') {
      return 'groupId';
    } else if (clmName === 'name') {
      return 'aliasName';
    } else if (clmName === 'desc') {
      return 'groupDesc';
    } else if (clmName === 'isActive') {
      return 'isActive';
    } else {
      return clmName;
    }
  }

  onSetPage(pageInfo) {
    this.table.offset = pageInfo.offset - 1;
    if (this.externalPaging) {
      return;
    }
  }

  onCityChange(evt, address_type) {
    if (address_type === 'permanent_address') {
      if (evt?.cityId) {

      } else {
        this.loadCityData('', this.patientListFilterForm.value.state);
      }
    } else if (address_type === 'present_address') {
      if (evt?.cityId) {

      } else {
        this.loadPresentCityData(this.patientListFilterForm.value.present_state, '');
      }
    }
  }

  setDefaultLocation(){
    if(this.patientService.defaultLocationData){
      const locData = this.patientService.defaultLocationData.data;
      if (this.patientListFilterForm.get('country') && locData.country) {
        this.patientListFilterForm.patchValue({
          country: locData.country.countryId,
        })
      }
      if (this.patientListFilterForm.get('state') && locData.state) {
        this.patientListFilterForm.patchValue({
          state: locData.state.stateId,
        })
        this.patientListFilterForm.get('state').enable();
      }
      if (this.patientListFilterForm.get('city') && locData.city) {
        this.patientListFilterForm.patchValue({
          city: locData.city.cityId,
        })
        this.patientListFilterForm.get('city').enable();
      }
      if (this.patientListFilterForm.get('present_country') && locData.country) {
        this.patientListFilterForm.patchValue({
          present_country: locData.country.countryId,
        })
      }
      if (this.patientListFilterForm.get('present_state') && locData.state) {
        this.patientListFilterForm.patchValue({
          present_state: locData.state.stateId,
        })
        this.patientListFilterForm.get('present_state').enable();
      }
      if (this.patientListFilterForm.get('present_city') && locData.city) {
        this.patientListFilterForm.patchValue({
          present_city: locData.city.cityId,
        })
         this.patientListFilterForm.get('present_city').enable();
      }
    }    
  }

  getDefaultLocationDataToSet(){
    const promise = new Promise((resolve, reject) => {
     this.patientService.getDefaultLocationDataToSet().subscribe((response) => {
       if(response && response.data){
         if(response.data.country){
           this.loadCountryData(response.data.country.countryName);
           this.loadPresentCountryData(response.data.country.countryName);           
         }else{
           this.loadCountryData();
           this.loadPresentCountryData();
         }
         if(response.data.state){
           this.loadStateData(response.data.state.stateName,response.data.country.countryId);
           this.loadPresentStateData(response.data.country.countryId, response.data.state.stateName);           
         }else {
            this.loadStateData('',response.data.country.countryId);
           this.loadPresentStateData(response.data.country.countryId, ''); 
         }
         if(response.data.city){
           this.loadCityData(response.data.city.cityName,response.data.state.stateId);
           this.loadPresentCityData(response.data.state.stateId, response.data.city.cityName);           
         }else{
            this.loadCityData('',response.data.state.stateId);
           this.loadPresentCityData(response.data.state.stateId, ''); 
         }
       }
       resolve(true);
      })
    });
    return promise;
  }
}
