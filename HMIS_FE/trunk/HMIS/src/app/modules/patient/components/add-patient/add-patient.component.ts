import { Component, OnInit, ViewChild, } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { AddPatientModel } from "./add-patient-model";
import { PatientService } from "../../../../shared/services/patient.service";
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { WebcamImage } from 'ngx-webcam';
import { Subject, Observable, concat, of } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PhotoCapturePopupComponent } from '../photo-capture-popup/photo-capture-popup.component';
import { IAlert } from '../../../../public/models/AlertMessage';
import { Constants } from '../../../../config/constants';
import { environment } from 'src/environments/environment';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { ConfirmationPopupComponent } from 'src/app/shared/confirmation-popup/confirmation-popup.component';
import { CommonService } from 'src/app/public/services/common.service';
import { UsersService } from 'src/app/public/services/users.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { AuthService } from 'src/app/public/services/auth.service';
import { ApplicationConstants, PermissionsConstants } from 'src/app/config/PermissionsConstants';
import * as moment from 'moment';

@Component({
  selector: 'app-add-patient',
  templateUrl: './add-patient.component.html',
  styleUrls: ['./add-patient.component.scss']
})
export class AddPatientComponent implements OnInit {

  @ViewChild('ff') myForm;
  public webcamImage: WebcamImage = null;
  private trigger: Subject<void> = new Subject<void>();

  registrationForm: FormGroup;
  submitted = false;
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
  dob;
  todayDate = new Date();
  countries: any;
  states: any;
  cities: any;
  religion: any;
  language: any;
  occupation: any;
  alertMsg: IAlert;
  settings: any;
  formType: any;
  nationality: any;
  ageUnit: any;
  bloodGroups: any;
  selectedFiles: any;
  webcamStart = false;
  title: any;
  relation: any;
  age: any;
  showAge: any;
  present_address_checkbox = true;
  staff_dependent_checkbox = false;
  imgBaseUrl = environment.baseUrlHis;
  uploadedImg: any;
  searchString: any;

  patientList$ = new Observable<any>();
  patientListInput$ = new Subject<any>();
  patientList: Array<any> = [];

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

  staffList$ = new Observable<any>();
  staffListInput$ = new Subject<any>();

  patientInfo: any;
  present_states: any;
  present_cities: any;
  present_countries: any;
  isPartialLoad: boolean;
  permissionConstant: any = PermissionsConstants;
  appKey: string;
  encounterInfo: any;
  isEditable = true;
  uhid: any;
  lastname = '';
  middlename = '';
  firstname = '';
  dependantEmpName: any;
  isPatTypeTemp: boolean;
  assignUhidCheckbox = true;
  patIsUnknown = false;
  patIsTemp = false;
  searchKeyword;
  isQms = false;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private activatedRoute: ActivatedRoute,
    private modalService: NgbModal,
    private commonService: CommonService,
    private userService: UsersService,
    private router: Router,
    private permissionsService: NgxPermissionsService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(data => {
      const formType = data.get('formType');
      const token = data.get('token');
      this.uhid = (data.get('uhid') && data.get('uhid') !== "undefined") ? data.get('uhid') : null;
      this.appKey = data.get('appKey');
      this.isQms = (this.appKey === 'qms' || this.appKey === 'QMS') ? true : false;
      this.isPatTypeTemp = data.get('patType') == 'temp';
      if (this.isPatTypeTemp) {
        this.patIsTemp = true;
      }
      if (this.uhid === 0) {
        this.uhid = null;
      }
      if (token) {
        this.isPartialLoad = true;
      }
      if (token && this.uhid) {
        this.isPartialLoad = true;
        this.checkAndCreateUserSession(token).then(res => {
          this.getDefaultLocationDataToSet().then(r => {
            this.loadFormAndData(this.uhid);
          });   
        })
      } else {
        this.isPartialLoad = false;
        this.getDefaultLocationDataToSet().then(r => {
          this.loadFormAndData(this.uhid);
        });        
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
    this.getFormType();
    this.loadStaffData();
    this.getSettings();
    this.getFormData();
    this.loadPatientList();
    if (uhid && uhid !== '0') {
      const param = {
        uhid: this.uhid
      }
      this.onPatientChange(param);
    }
  }

  private get isPartialViewInHmis() {
    return this.appKey == 'hmis' || this.appKey == ApplicationConstants.Registration
      || this.appKey == ApplicationConstants.IPD || this.appKey == ApplicationConstants.OPD
      || this.appKey == ApplicationConstants.Emergency || this.appKey == ApplicationConstants.Billing
      || this.appKey == ApplicationConstants.admin || this.appKey == ApplicationConstants.OT;
  }

  redirectToEncounter() {
    const uhId = this.patientInfo?.PatUhid || this.uhid;
    const parentAppUrl = window.location.ancestorOrigins.length ? window.location.ancestorOrigins[0] : '';
    const appName = window.location.href.indexOf('/hmis-fe/') != -1 && this.isPartialViewInHmis ? '/hmis-web' : '';
    if (parentAppUrl && this.isPartialViewInHmis && uhId) {
      const appKeyName = '/' + (this.appKey == 'hmis' ? ApplicationConstants.Registration : this.appKey);
      let redirectionUrl = parentAppUrl + appName + appKeyName + '/PatientEncounter/PatientEncounterDetails?uhid=' + uhId;
      window.top.location.href = redirectionUrl;
    } else {
      console.error('parentAppUrl: ' + parentAppUrl);
      console.error('isPartialViewInHmis: ' + this.isPartialViewInHmis);
      console.error('uhId: ' + uhId);
    }
  }

  redirectToServiceOrder() {
    const uhId = this.patientInfo?.PatUhid;
    const parentAppUrl = window.location.ancestorOrigins.length ? window.location.ancestorOrigins[0] : '';
    if (parentAppUrl && uhId && this.appKey == 'hmis') {
      let redirectionUrl = parentAppUrl + '/ServiceOrder/ServiceOrderDetails?uhid=' + uhId;
      window.top.location.href = redirectionUrl;
    }
  }

  redirectToServiceEstimation() {
    const uhId = this.patientInfo?.PatUhid;
    const parentAppUrl = window.location.ancestorOrigins.length ? window.location.ancestorOrigins[0] : '';
    if (parentAppUrl && uhId) {
      let redirectionUrl = parentAppUrl + '/ServiceEstimation/ServiceEstimationDetails?uhId=' + uhId;
      window.top.location.href = redirectionUrl;
    }
  }

  private loadPatientList(searchTxt?): void {
    this.patientList$ = concat(
      this.patientService.getQuickPatientList(searchTxt ? searchTxt : ''), // default items
      this.patientListInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.patientService.getQuickPatientList(term ? term : (searchTxt ? searchTxt : '')).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  loadStaffData(searchTxt?) {
    this.staffList$ = concat(
      this.patientService.getStaffList(searchTxt ? searchTxt : ''), // default items
      this.staffListInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.patientService.getStaffList(term ? term : (searchTxt ? searchTxt : '')).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  getFormType() {
    this.activatedRoute.paramMap.subscribe((params) => {
      this.formType = params.get('formType');
    })
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
    if (countryId) {
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
  }

  loadCityData(searchTxt?, stateId?) {
    const param = {
      searchText: searchTxt ? searchTxt : '',
      limit: 100,
      stateId: stateId && Number.isInteger(stateId) ? stateId : 0,
    }

    if (stateId) {
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
    if (countryId) {
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
  }

  loadPresentCityData(stateId?, searchTxt?) {
    const param = {
      searchText: searchTxt ? searchTxt : '',
      limit: 100,
      stateId: stateId && Number.isInteger(stateId) ? stateId : 0,
    }
    if (stateId) {
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

  }

  onCountryChange(evt, address_type) {
    if (address_type === 'permanent_address') {
      if (evt?.countryId) {
        this.loadStateData('', evt.countryId);
        this.registrationForm.get('state').enable();
        this.registrationForm.get('city').disable();
        this.registrationForm.patchValue({
          state: null,
          city: null,
          pincode: null
        });
      } else {
        this.registrationForm.patchValue({
          state: null,
          city: null,
          pincode: null
        });
        this.registrationForm.get('state').disable();
        this.registrationForm.get('city').disable();
        this.loadCountryData();
      }
    } else if (address_type === 'present_address') {
      if (evt?.countryId) {
        this.loadPresentStateData(evt.countryId, '');
        this.registrationForm.get('present_state').enable();
        this.registrationForm.get('present_city').disable();
        this.registrationForm.patchValue({
          present_state: null,
          present_city: null,
          present_pincode: null
        });
      } else {
        this.registrationForm.get('present_state').disable();
        this.registrationForm.get('present_city').disable();
        this.registrationForm.patchValue({
          present_state: null,
          present_city: null,
          present_pincode: null
        });
        this.loadPresentCountryData();
      }
    }
  }

  onStateChange(evt, address_type) {
    if (address_type === 'permanent_address') {
      if (evt?.stateId) {
        this.loadCityData('', evt.stateId);
        this.registrationForm.get('city').enable();
        this.registrationForm.patchValue({
          city: null,
          pincode: null
        });
      } else {
        this.registrationForm.get('city').disable();
        this.registrationForm.patchValue({
          pincode: null
        });
        this.loadStateData('', this.registrationForm.value.country);
      }
    } else if (address_type === 'present_address') {
      if (evt?.stateId) {
        this.loadPresentCityData(evt.stateId, '');
        this.registrationForm.get('present_city').enable();
        this.registrationForm.patchValue({
          present_city: null,
          present_pincode: null
        });
      } else {
        this.registrationForm.get('present_city').disable();
        this.registrationForm.patchValue({
          present_city: null,
          present_pincode: null
        });
        this.loadPresentStateData(this.registrationForm.value.present_country, '');
      }
    }
  }

  onCityChange(evt, address_type) {
    if (address_type === 'permanent_address') {
      if (evt?.cityId) {

      } else {
        this.loadCityData('', this.registrationForm.value.state);
      }
    } else if (address_type === 'present_address') {
      if (evt?.cityId) {

      } else {
        this.loadPresentCityData(this.registrationForm.value.present_state, '');
      }
    }
  }

  getSettings() {
    this.patientService.getSettingDetails().subscribe((response) => {
      if (response) {
        _.map(response, itr => {
          if (itr.HsetTagname === 'PATIENT' && itr.HsetQuestion === 'REGISTRATION_FORM') {
            this.settings = JSON.parse(itr.HsetValue);
          }
        });
        this.createRegistrationForm();
      }
    })
  }

  getFieldLabel(keys: any) {
    const fields = _.filter(this.settings, itr => {
      return (_.find(keys, obj => {
        if (this.formType !== "short") {
          return (obj === itr.key) && itr.isVisible;
        } else {
          return (obj === itr.key) && itr.isVisible && itr.shortRegField;
        }
      }))
    })
    const labelName = _.map(fields, (itr, index) => {
      return (index != 0 ? '/' : '') + itr.label
    })
    if (labelName[1] === "/BLOODGROUP") {
      labelName[1] = "/BLOOD GROUP"
    } else if (labelName[0] === 'MARITAL STATUS' && labelName[1] === '/NATIONALITY') {
      labelName[0] = "NATIONALITY";
      labelName[1] = "/MARITAL STATUS";
    } else if (labelName[0] === "ANNUAL INCOME") {
      labelName[1] = "/LANGUAGE";
    }
    if (labelName.length > 0) {
      // labelName.push(" :");
    }
    return labelName;
  }

  getFormValidationField(isMandatory, regularExpression, val) {
    let validVal = [val];
    regularExpression = regularExpression ? new RegExp(regularExpression) : null;
    if (isMandatory) {
      validVal = [val, Validators.required];
    }
    if (regularExpression) {
      validVal = [val, Validators.pattern(regularExpression)];
    }
    if (isMandatory && regularExpression) {
      validVal = [val, [Validators.required, Validators.pattern(regularExpression)]];
    }
    return validVal;
  }

  createRegistrationForm() {
    this.registrationForm = this.fb.group({
      PatImage: this.uploadedImg,
      assignUhid: this.assignUhidCheckbox,
      title: this.getFormValidationField(this.settings[0].isMandatory, this.settings[0].regularExpression, null),
      firstname: this.getFormValidationField(this.settings[1].isMandatory, this.settings[1].regularExpression, null),
      middlename: this.getFormValidationField(this.settings[2].isMandatory, this.settings[2].regularExpression, null),
      lastname: this.getFormValidationField(this.settings[3].isMandatory, this.settings[3].regularExpression, null),
      father_title: this.getFormValidationField(this.settings[31].isMandatory, this.settings[31].regularExpression, null),
      fatherfirstname: this.getFormValidationField(this.settings[31].isMandatory, this.settings[31].regularExpression, null),
      fathermiddlename: this.getFormValidationField(this.settings[32].isMandatory, this.settings[32].regularExpression, null),
      fatherlastname: this.getFormValidationField(this.settings[33].isMandatory, this.settings[33].regularExpression, null),
      gender: this.getFormValidationField(this.settings[34].isMandatory, this.settings[34].regularExpression, null),
      bloodgroup: this.getFormValidationField(this.settings[7].isMandatory, this.settings[7].regularExpression, null),
      dob: this.getFormValidationField(this.settings[5].isMandatory, this.settings[5].regularExpression, null),
      age: this.getFormValidationField(this.settings[6].isMandatory, this.settings[6].regularExpression, ''),
      age_unit: this.getFormValidationField(this.settings[6].isMandatory, this.settings[6].regularExpression, 4),
      nationality: this.getFormValidationField(this.settings[27].isMandatory, this.settings[27].regularExpression, null),
      marital_status: this.getFormValidationField(this.settings[8].isMandatory, this.settings[8].regularExpression, null),
      staff_dependent_checkbox: [false],
      staff_dependent: this.getFormValidationField(this.settings[13].isMandatory, this.settings[13].regularExpression, null),
      relation: this.getFormValidationField(this.settings[13].isMandatory, this.settings[13].regularExpression, null),
      mobile: this.getFormValidationField(this.settings[10].isMandatory, this.settings[10].regularExpression, ''),
      alternate_number: this.getFormValidationField(this.settings[11].isMandatory, this.settings[11].regularExpression, ''),
      email: this.getFormValidationField(this.settings[9].isMandatory, this.settings[9].regularExpression, ''),
      phone_number: this.getFormValidationField(this.settings[12].isMandatory, this.settings[12].regularExpression, null),
      permanent_address: this.getFormValidationField(this.settings[16].isMandatory, this.settings[16].regularExpression, null),
      country: this.getFormValidationField(this.settings[17].isMandatory, this.settings[17].regularExpression, null),
      state: this.getFormValidationField(this.settings[18].isMandatory, this.settings[18].regularExpression, null),
      city: this.getFormValidationField(this.settings[19].isMandatory, this.settings[19].regularExpression, null),
      pincode: this.getFormValidationField(this.settings[20].isMandatory, this.settings[20].regularExpression, null),
      present_address_checkbox: [true],
      present_address: this.getFormValidationField(this.settings[21].isMandatory, this.settings[21].regularExpression, null),
      present_country: this.getFormValidationField(this.settings[22].isMandatory, this.settings[22].regularExpression, null),
      present_state: this.getFormValidationField(this.settings[23].isMandatory, this.settings[23].regularExpression, null),
      present_city: this.getFormValidationField(this.settings[24].isMandatory, this.settings[24].regularExpression, null),
      present_pincode: this.getFormValidationField(this.settings[25].isMandatory, this.settings[25].regularExpression, null),
      religion: this.getFormValidationField(this.settings[26].isMandatory, this.settings[26].regularExpression, null),
      occupation: this.getFormValidationField(this.settings[28].isMandatory, this.settings[28].regularExpression, null),
      annual_income: this.getFormValidationField(this.settings[29].isMandatory, this.settings[29].regularExpression, ''),
      language: this.getFormValidationField(this.settings[27].isMandatory, this.settings[27].regularExpression, null),
      idententy_1: this.getFormValidationField(this.settings[14].isMandatory, this.settings[14].regularExpression, ''),
      idententy_2: this.getFormValidationField(this.settings[15].isMandatory, this.settings[15].regularExpression, ''),
      remarks: this.getFormValidationField(this.settings[30].isMandatory, this.settings[30].regularExpression, ''),
      isActive: [true],
      isAlive: [true],
      patType: this.isPatTypeTemp ? true : false,
      isUpdateUhid: false
    });
    this.registrationForm.get('staff_dependent').disable();
    this.registrationForm.get('relation').disable();
    this.setDefaultLocation();
  }

  setFullname(name) {
    if (name === 'firstname') {
      this.firstname = this.registrationForm.value.firstname ? this.registrationForm.value.firstname : '';
    } else if (name === 'middlename') {
      this.middlename = this.registrationForm.value.middlename ? this.registrationForm.value.middlename : '';
    } else if (name === 'lastname') {
      this.lastname = this.registrationForm.value.lastname ? this.registrationForm.value.lastname : '';
    }
  }

  uploadFile(event) {
    this.selectedFiles = event.target.files;
    if (this.selectedFiles) {
      this.patientService.uploadProfilePic(this.selectedFiles).subscribe((response) => {
        this.uploadedImg = response;
        this.registrationForm.patchValue({
          PatImage: this.uploadedImg
        })
      })
    }
  }

  openPopup() {
    const modalRef = this.modalService.open(PhotoCapturePopupComponent, {
      keyboard: false,
      size: 'xl',
      windowClass: "photo-capture-popup",
    });
    modalRef.result.then((result) => {
      if (result != 'cancel') {
        return;
      } else {
        return;
      }
    });
    // modalRef.componentInstance.name = true;
    // this.webcamStart = true;
  }

  ageCalculator(date) {
    if (date) {
      var a = moment(moment().format("YYYY-MM-DD"));
      var b = moment(moment(date).format("YYYY-MM-DD"));

      var years = a.diff(b, 'year');
      b.add(years, 'years');

      var months = a.diff(b, 'months');
      b.add(months, 'months');

      var given = moment(date, "YYYY-MM-DD");
      var current = moment().startOf('day');
      var days = moment.duration(given.diff(current)).asDays();
      days = days < 0 ? days * -1 : days;
      days = Math.ceil(days);
      if (years > 0) {
        this.showAge = years
        this.registrationForm.patchValue({
          dob: date,
          age: this.showAge,
          age_unit: 4
        })
      } else if (months > 0) {
        this.showAge = months
        this.registrationForm.patchValue({
          dob: date,
          age: this.showAge,
          age_unit: 3
        })
      } else if (days > 7) {
        this.showAge = days / 7;

        this.showAge = this.showAge.toFixed()
        this.registrationForm.patchValue({
          dob: date,
          age: this.showAge,
          age_unit: 2
        })
      } else if (days <= 7 && days >= 0) {
        this.showAge = days;
        this.showAge = this.showAge < 0 ? this.showAge * -1 : this.showAge;
        this.showAge = this.showAge.toFixed()
        this.registrationForm.patchValue({
          dob: date,
          age: this.showAge,
          age_unit: 1
        })
      }
    }
  }

  onAgeInputChange() {
    // const age = this.registrationForm.value.age;
    const age_unit = this.registrationForm.value.age_unit;
    if (this.showAge && age_unit) {
      if (age_unit === 1) {
        let date = new Date(moment().subtract(this.showAge, 'days').format("YYYY/MM/DD"));
        this.dob = date;
        // let bornDay = moment(new Date()).subtract(this.showAge, "days").format("DD-MM-YYYY");
        // let currentyear = moment(bornDay, "DD/MM/YYYY").year();
        // let currentmonth = moment(bornDay, 'YYYY/MM/DD').format('M');
        // let currentday = bornDay.split('-')[0];//moment(bornDay, 'YYYY/MM/DD').format('D');
        // const date = new Date(currentyear + '/' + currentmonth + '/' + currentday)
        // this.dob = date;
        this.registrationForm.patchValue({
          dob: date,
        })
      } else if (age_unit === 2) {
        let date = new Date(moment().subtract(+this.showAge * 7, "days").format("YYYY/MM/DD"));
        // let bornDay = moment(new Date()).subtract(this.showAge * 7, "days").format("DD-MM-YYYY");
        // let currentyear = moment(bornDay, "DD/MM/YYYY").year();
        // let currentmonth = moment(bornDay, 'YYYY/MM/DD').format('M');
        // let currentday = bornDay.split('-')[0];
        // const date = new Date(currentyear + '/' + currentmonth + '/' + currentday)
        this.dob = date;
        this.registrationForm.patchValue({
          dob: date,
        })
      } else if (age_unit === 3) {
        let date = new Date(moment().subtract(this.showAge, 'months').format("YYYY/MM/DD"));
        this.dob = date;
        // let currentyear = moment(new Date(), "DD/MM/YYYY").year();
        // let currentmonth: any = moment(new Date(), 'YYYY/MM/DD').format('M');
        // let currentday = moment(new Date(), 'YYYY/MM/DD').format('D');
        // let bornMonth = +currentmonth - this.showAge
        // const date = new Date(currentyear + '/' + bornMonth + '/' + currentday)
        this.dob = date;
        this.registrationForm.patchValue({
          dob: date,
        })
      } else if (age_unit === 4) {
        let date = new Date(moment().subtract(this.showAge, 'years').format("YYYY/MM/DD"));
        // let currentyear = moment(new Date(), "DD/MM/YYYY").year();
        // let currentmonth = moment(new Date(), 'YYYY/MM/DD').format('M');
        // let currentday = moment(new Date(), 'YYYY/MM/DD').format('D');
        // let bornyear = currentyear - this.showAge
        // const date = new Date(bornyear + '/' + currentmonth + '/' + currentday)
        //console.log(date)
        this.dob = date;
        this.registrationForm.patchValue({
          dob: date,
        })
      }
    } else {
      this.dob = null;
      this.registrationForm.patchValue({
        age: null,
        dob: null,
        // age_unit: 4
      })
    }
  }

  clearForm() {
    this.getDefaultLocationDataToSet().then(res => {
      this.searchKeyword = null;
      this.firstname = null;
      this.middlename = null;
      this.lastname = null;
      this.uhid = null;
      this.dob = null;
      this.dependantEmpName = null;
      this.encounterInfo = null;
      this.uploadedImg = null;
      this.patientInfo = null;
      this.registrationForm.reset();
      this.isEditable = true;
      this.registrationForm.enable();
      this.onStaffChange();
      this.registrationForm.patchValue({
        isActive: true,
        isAlive: true,
      })
      this.setDefaultLocation();
    })    
  }

  get f() { return this.registrationForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.registrationForm.invalid) {
      return;
    }
    if (this.staff_dependent_checkbox && !this.registrationForm.value.staff_dependent) {
      return;
    }
    if (this.registrationForm.valid) {
      this.isEditable = false;
      this.registrationForm.disable();
    }

    const addPatientModel = new AddPatientModel();
    addPatientModel.generateObject(this.registrationForm.getRawValue(), this.patientInfo, this.encounterInfo, this.uhid);
    addPatientModel.PatIsUnknown = this.patIsUnknown ? this.patIsUnknown : false;
    addPatientModel.PatType = this.patIsTemp ? 'temp' : '';

    // return false

    this.patientService.savePatient(addPatientModel).subscribe(res => {
      if (res && res.status_message === 'Success' && res.status_code === 200) {
        this.notifyAlertMessage({
          msg: res.message,
          class: 'success',
        });
        this.uhid = res?.data?.Id;
        const param = {
          uhid: this.uhid
        }
        this.dob = addPatientModel.PatDob ? new Date(moment(addPatientModel.PatDob, "DD/MM/YYYY").format('YYYY/MM/DD')) : null;
        // this.patientInfo.PatUhid = this.uhid;
        if (this.appKey === 'hmis' && this.registrationForm.value.isActive 
        && (!this.encounterInfo 
        || (this.encounterInfo && this.encounterInfo.penType !== 'IP' && this.encounterInfo.penIsactive === 'N')
            || !addPatientModel.PatUhid)) {
          setTimeout(() => {
            this.onPatientChange(param);
            const messageDetails = {
              modalTitle: 'Confirm',
              modalBody: 'Do you want to encounter patient?',
              buttonType: 'yes_no',
            };
            const modalInstance = this.modalService.open(ConfirmationPopupComponent, {
              ariaLabelledBy: 'modal-basic-title',
              backdrop: 'static',
              keyboard: false
            });
            modalInstance.result.then((result) => {
              if (result == 'yes') {
                this.redirectToEncounter();
              }
            });
            modalInstance.componentInstance.messageDetails = messageDetails;
          }, 1500);
        }
      } else {
        this.notifyAlertMessage({
          msg: 'Something went wrong.',
          class: 'danger',
        });
      }
    }, error => {
      this.notifyAlertMessage({
        msg: error,
        class: 'danger',
      });
    })
    // this.registrationForm.reset();
    // alert(JSON.stringify(addPatientModel));
  }

  notifyAlertMessage(data): void {
    this.alertMsg = {
      message: data.msg,
      messageType: data.class,
      duration: Constants.ALERT_DURATION
    };
  }

  onPatientChange(evt) {
    if (evt) {
      let param = {
        uhId: evt.uhid,
      }
      this.patientService.getPatientDetail(param).subscribe((response) => {
        if (response?.patInfo.length > 0) {
          this.encounterInfo = null;
          this.patientInfo = response?.patInfo[0];
          this.patIsUnknown = this.patientInfo?.PatIsUnknown === 'Y' ? true : false;
          this.patIsTemp = this.patientInfo?.PatIsTemp === 'Y' ? true : false;
          if (this.patientInfo?.PatIsUnknown === 'N' && this.patientInfo?.PatIsTemp === 'N') {
            if (this.patientInfo?.PatPrmncntId) {
              this.loadCountryData(this.patientInfo?.PatPrmncountry);
            }
            if (this.patientInfo?.PatPrmnstaId) {
              this.loadStateData(this.patientInfo?.PatPrmnstate, this.patientInfo?.PatPrmncntId);
            }
            if (this.patientInfo?.PatPrmnctyId) {
              this.loadCityData(this.patientInfo?.PatPrmncity, this.patientInfo?.PatPrmnstaId);
            }

            if (this.patientInfo?.PatRescntId) {
              this.loadPresentCountryData(this.patientInfo?.PatRescountry);
            }
            if (this.patientInfo?.PatResstaId) {
              this.loadPresentStateData(this.patientInfo?.PatRescntId, this.patientInfo?.PatResstate);
            }
            if (this.patientInfo?.PatResctyId) {
              this.loadPresentCityData(this.patientInfo?.PatResstaId, this.patientInfo?.PatRescity);
            }
          }
        }
        if (response?.encounterInfo?.length > 0) {
          this.encounterInfo = response.encounterInfo[0];
          this.encounterInfo.admissionDate = this.encounterInfo.admissionDate ? moment(this.encounterInfo.admissionDate).format('DD-MM-YYYY hh:mm A') : null;
        }
        this.patchValue();
      })
    } else {
      // this.patientInfo = null;
      // this.uploadedImg = null;
      // this.registrationForm.reset();
    }

  }

  deletePic() {
    this.selectedFiles = null;
    if (this.uploadedImg) {
      this.uploadedImg = null;
      this.registrationForm.patchValue({
        PatImage: this.uploadedImg
      })
    }
  }

  onEmployeeChange(evt) {
    if (evt) {
      this.dependantEmpName = evt.fullName;
    } else {
      this.dependantEmpName = null;
    }
  }

  onAssignUhid() {
    if (this.assignUhidCheckbox) {
      this.registrationForm.enable();
      this.onStaffChange();
    } else {
      this.firstname = this.patientInfo?.PatFullname;
      this.registrationForm.reset();
      this.registrationForm.disable();

    }
  }

  patchValue() {
    this.onAssignUhid();
    this.uploadedImg = this.patientInfo?.PatImage ? this.patientInfo?.PatImage : null;
    this.dob = this.patientInfo?.PatDob ? new Date(this.patientInfo?.PatDob) : null;
    this.uhid = this.patientInfo?.PatUhid;
    this.firstname = this.patientInfo?.PatFirstname;
    this.middlename = this.patientInfo?.PatMiddlename;
    this.lastname = this.patientInfo?.PatLastname;
    this.registrationForm.patchValue({
      PatImage: this.uploadedImg,
      PatIsUnknown: this.patIsUnknown,
      title: this.patientInfo?.PatTtlId ? this.patientInfo?.PatTtlId : null,
      firstname: this.patientInfo?.PatFirstname ? this.patientInfo?.PatFirstname : null,
      middlename: this.patientInfo?.PatMiddlename ? this.patientInfo?.PatMiddlename : null,
      lastname: this.patientInfo?.PatLastname ? this.patientInfo?.PatLastname : null,
      father_title: this.patientInfo?.PatFatherTtlId ? this.patientInfo?.PatFatherTtlId : null,
      fatherfirstname: this.patientInfo?.PatFatherFirstname ? this.patientInfo?.PatFatherFirstname : null,
      fathermiddlename: this.patientInfo?.PatFatherMiddlename ? this.patientInfo?.PatFatherMiddlename : null,
      fatherlastname: this.patientInfo?.PatFatherLastname ? this.patientInfo?.PatFatherLastname : null,
      gender: this.patientInfo?.PatGender ? this.patientInfo?.PatGender : null,
      bloodgroup: this.patientInfo?.PatBldId ? this.patientInfo?.PatBldId : null,
      dob: this.patientInfo?.PatDob ? new Date(this.patientInfo?.PatDob) : null,
      age: this.patientInfo?.PatAge ? this.patientInfo?.PatAge : null,
      age_unit: this.patientInfo?.PatAguId ? this.patientInfo?.PatAguId : null,
      nationality: this.patientInfo?.PatNnlId ? this.patientInfo?.PatNnlId : null,
      marital_status: this.patientInfo?.PatMaritalstatus ? +this.patientInfo?.PatMaritalstatus : null,
      staff_dependent_checkbox: this.patientInfo?.PatIsempdependant === 'Y' ? true : false,
      staff_dependent: this.patientInfo?.PatEmpCode ? this.patientInfo?.PatEmpCode : null,
      relation: this.patientInfo?.PatAttendRspId ? this.patientInfo?.PatAttendRspId : null,
      mobile: this.patientInfo?.PatMobileno ? this.patientInfo?.PatMobileno : null,
      alternate_number: this.patientInfo?.PatAlternateno ? this.patientInfo?.PatAlternateno : null,
      email: this.patientInfo?.PatEmailid ? this.patientInfo?.PatEmailid : null,
      phone_number: this.patientInfo?.PatPhoneno ? this.patientInfo?.PatPhoneno : null,
      permanent_address: (this.patientInfo?.PatPrmnaddress1 || '') + ' ' + (this.patientInfo?.PatPrmnaddress2 || '') + ' ' + (this.patientInfo?.PatPrmnaddress3 || ''),
      country: this.patientInfo?.PatPrmncntId ? this.patientInfo?.PatPrmncntId : null,
      state: this.patientInfo?.PatPrmnstaId ? this.patientInfo?.PatPrmnstaId : null,
      city: this.patientInfo?.PatPrmnctyId ? this.patientInfo?.PatPrmnctyId : null,
      pincode: this.patientInfo?.PatPrmnPincode ? this.patientInfo?.PatPrmnPincode : null,
      present_address_checkbox: this.patientInfo?.PatIssameaddress === 'Y' ? true : false,
      present_address: (this.patientInfo?.PatResaddress1 || '') + ' ' + (this.patientInfo?.PatResaddress2 || '') + ' ' + (this.patientInfo?.PatResaddress3 || ''),
      present_country: this.patientInfo?.PatRescntId ? this.patientInfo?.PatRescntId : null,
      present_state: this.patientInfo?.PatResstaId ? this.patientInfo?.PatResstaId : null,
      present_city: this.patientInfo?.PatResctyId ? this.patientInfo?.PatResctyId : null,
      present_pincode: this.patientInfo?.PatResPincode ? this.patientInfo?.PatResPincode : null,
      religion: this.patientInfo?.PatRlgId ? this.patientInfo?.PatRlgId : null,
      occupation: this.patientInfo?.PatOcpId ? this.patientInfo?.PatOcpId : null,
      annual_income: this.patientInfo?.PatAnnualincome ? this.patientInfo?.PatAnnualincome.toFixed(2) : 0,
      language: this.patientInfo?.PatLngId ? this.patientInfo?.PatLngId : null,
      idententy_1: this.patientInfo?.PatAdharno ? this.patientInfo?.PatAdharno : null,
      idententy_2: this.patientInfo?.PatPanno ? this.patientInfo?.PatPanno : null,
      remarks: this.patientInfo?.PatRemarks ? this.patientInfo?.PatRemarks : null,
      isActive: this.patientInfo?.PatIsactive === 'Y' ? true : false,
      isAlive: this.patientInfo?.PatIslive === 'Y' ? true : false,
      isUpdateUhid: (this.patientInfo?.PatIsUnknown === 'Y' || this.patientInfo?.PatIsTemp === 'Y') ? true : false
    })
    if(this.patientInfo?.PatIsempdependant === 'Y'){
      this.staff_dependent_checkbox = true;
    }

    if (!this.patIsUnknown && !this.patIsTemp) {
      this.isEditable = false;
      this.registrationForm.disable();
    } else if (this.patIsUnknown || this.patIsTemp) {
      this.isEditable = true;
      this.registrationForm.enable();
    }
  }

  editForm() {
    this.submitted = false;
    this.isEditable = true;
    this.registrationForm.enable();
    if (this.encounterInfo) {
      this.registrationForm.controls.isActive.disable();
      this.registrationForm.controls.isAlive.disable();
    }
    this.onStaffChange();
  }

  onTitleChange(evt) {
    if (evt.TtlName === 'MR') {
      this.registrationForm.patchValue({
        gender: 'Male'
      })
    } else if (evt.TtlName === 'MRS' || evt.TtlName === 'MISS') {
      this.registrationForm.patchValue({
        gender: 'Female'
      })
    } else if (evt.TtlName === 'FOETUS OF') {
      this.registrationForm.patchValue({
        gender: 'Unknown'
      })
    } else {
      this.registrationForm.patchValue({
        gender: null
      })
    }
  }

  onStaffChange() {
    if (this.staff_dependent_checkbox === false) {
      this.registrationForm.get('staff_dependent').disable();
      this.registrationForm.get('relation').disable();
      this.registrationForm.patchValue({
        staff_dependent: null,
        relation: null
      })
      this.dependantEmpName = null;
    } else {
      this.registrationForm.get('staff_dependent').enable();
      this.registrationForm.get('relation').enable();
    }
  }

  onGenderChange(evt) {
    const frmData = this.registrationForm.getRawValue();
    if (frmData.gender && frmData.gender.id === 1 && (frmData.title !== 1)) {
      this.registrationForm.patchValue({
        title: null
      });
    } else if (frmData.gender && frmData.gender.id === 2 && !_.includes([2, 3, 8], frmData.title)) {
      this.registrationForm.patchValue({
        title: null
      });
    } else {
      this.registrationForm.patchValue({
        title: null
      });
    }
    const titlList = this.title;
  }  

  setDefaultLocation(){
    if(this.patientService.defaultLocationData){
      const locData = this.patientService.defaultLocationData.data;
      if (this.registrationForm.get('country') && locData.country) {
        this.registrationForm.patchValue({
          country: locData.country.countryId,
        })
      }
      if (this.registrationForm.get('state') && locData.state) {
        this.registrationForm.patchValue({
          state: locData.state.stateId,
        })
        this.registrationForm.get('state').enable();
      }
      if (this.registrationForm.get('city') && locData.city) {
        this.registrationForm.patchValue({
          city: locData.city.cityId,
        })
        this.registrationForm.get('city').enable();
      }
      if (this.registrationForm.get('present_country') && locData.country) {
        this.registrationForm.patchValue({
          present_country: locData.country.countryId,
        })
      }
      if (this.registrationForm.get('present_state') && locData.state) {
        this.registrationForm.patchValue({
          present_state: locData.state.stateId,
        })
        this.registrationForm.get('present_state').enable();
      }
      if (this.registrationForm.get('present_city') && locData.city) {
        this.registrationForm.patchValue({
          present_city: locData.city.cityId,
        })
        this.registrationForm.get('present_city').enable();
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
