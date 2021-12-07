import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { concat, Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { PatientDeathService } from 'src/app/modules/death-register/services/patient-death.service';
import { MtpMlcService } from '../../services/mtp-mlc.service';
import * as moment from 'moment';
import { EMRService } from 'src/app/public/services/emr-service';
import { AuthService } from 'src/app/public/services/auth.service';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { Constants } from 'src/app/config/constants';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/public/services/common.service';
import { UsersService } from 'src/app/public/services/users.service';
import { NgxPermissionsService } from 'ngx-permissions';
@Component({
  selector: 'app-mtp-mlc-add-update',
  templateUrl: './mtp-mlc-add-update.component.html',
  styleUrls: ['./mtp-mlc-add-update.component.scss']
})
export class MtpMlcAddUpdateComponent implements OnInit {
  registerForm: FormGroup;
  showPatientSearchBox = true;
  patientList$ = new Observable<any>();
  patientListInput$ = new Subject<any>();
  mlcTypeList = [];
  identificationTypeList = [];
  destroy$ = new Subject<any>();
  doctorList$ = new Observable<any>();
  docListInput$ = new Subject<string>();
  timeArray = {
    hrs: [],
    min: [],
    amPm: ['AM', 'PM']
  };
  alertMsg: IAlert;
  mlcId = 0;
  timeFormateKey;
  submitted = false;
  isPartialLoad = false;
  token = null;
  loadForm = false;
  loadAs = 'popup'; // popup / page
  constructor(
    private fb: FormBuilder,
    private mtpMlcService: MtpMlcService,
    private patientDeathService: PatientDeathService,
    private emrService: EMRService,
    private router: Router,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private commonService: CommonService,
    private userService: UsersService,
    private permissionsService: NgxPermissionsService,
  ) { }

  ngOnInit(): void {
    this.commonService.routeChanged(this.activatedRoute);
    this.activatedRoute.paramMap.subscribe(data => {
      this.mlcId = +data.get('id') !== 0 ? +data.get('id') : null;
      if (!data.get('token')) {
        this.timeFormateKey = this.authService.getUserInfoFromLocalStorage().timeFormat;
        this.initCall();
        if (this.mlcId) {
          this.getMlcDataById().then(res => {
            // this.registerForm.enable();
            this.showPatientSearchBox = false;
          });
        } else {
          // this.registerForm.disable();
          this.showPatientSearchBox = true;
          this.loadPatientList();
        }
      } else {
        this.isPartialLoad = true;
        this.loadAs = data.get('loadAs');
        this.authService.partialPageToken = data.get('token') ? data.get('token') : data["params"]["token"];
        const token = data.get('token') ? data.get('token') : data["params"]["token"];
        this.loginThroghSSO(token).then(res1 => {
          if (res1) {
            this.initCall();
            if (this.mlcId) {
              this.getMlcDataById().then(res => {
                // this.registerForm.enable();
                this.showPatientSearchBox = false;
              });
            } else {
              // this.registerForm.disable();
              // this.showPatientSearchBox = true;
              this.loadPatientList();
            }
          }
        });
      }
    });
  }

  initCall() {
    this.createForm();
    this.timeArrayGenrate();
    this.getMlcTypeList().subscribe();
    this.getIdentificationTypeList().subscribe();
    this.loadDoctorList();
  }

  loginThroghSSO(token) {
    const promise = new Promise((resolve, reject) => {
      this.authService.loginThroghSSO(token, 'emr').subscribe(res => {
        if (res.status_message === 'Success') {
          const userObject = res.data;
          this.commonService.storeKeyValues = [];
          this.commonService.userListTempParams = null;
          this.commonService.getScheduleDataParams = null;
          this.userService.masterUserDetails = {};
          this.authService.redirectUrl = null;
          // store login info to local storage
          this.authService.storeLoginInfo(userObject);
          this.assignRoleAndRedirect(userObject);
          resolve(true);
        } else if (res) {
          resolve(false);
        }
      });
    });
    return promise;
  }

  assignRoleAndRedirect(userObject): void {
    this.userService.GetAssignedRolePermissionsByUserId(userObject.id)
      .subscribe((result) => {
        const userPermission = this.userService.userPermission;
        this.permissionsService.loadPermissions(userPermission);
        // this.redirectTo();
      });
  }

  getMlcDataById() {
    const promise = new Promise((resolve, reject) => {
      this.mtpMlcService.getMLCByID(this.mlcId).subscribe(res => {
        // console.log(res);
        this.updateEditData(res.data);
        resolve(res);
      });
    });
    return promise;
  }

  updateEditData(data) {
    this.registerForm.patchValue({
      id: data.mlcId || this.mlcId || 0,
      patientId: data.patientId || data.patientId,
      selectedPatient: {
        activePrescription: false,
        admissionDate: data.admissionDate,
        age: data.age,
        bedNo: data.bedNo,
        dob: data.dob,
        encounterId: data.encounterId,
        gender: data.gender,
        mobileNo: data.mobileNo,
        patientId: data.patientId,
        patientName: data.patientName,
        visitNo: data.visitNo,
        visitType: data.visitType
      },
      mlcRecNo: data.mlcRecordNo || null,
      mlcDate: data.mlcDate ? new Date(data.mlcDate) : new Date(),
      vehicleNo: data.vehicleNo || null,
      mlcType: {
        mlcType: data.mlcType,
        mlcTypeId: data.mlcTypeId,
      },
      reportingDoctor: {
        user_id: data.reportingDoctorId,
        user_name: data.reportingDoctorName
      },
      broughtDead: data.isDead || false,
      incidentDate: data.incidentDate ? new Date(data.incidentDate) : new Date(),
      incidentTimeHr: this.timeFormateKey === '12_hour' ? moment(new Date(data.incidentTime)).format('hh') : moment(new Date(data.incidentTime)).format('HH'),
      incidentTimeMin: moment(new Date(data.incidentTime)).format('mm'),
      incidentTimeAmPm: moment(new Date(data.incidentTime)).format('A'),
      locationDetail: data.locationDetails || null,
      informarName: data.informerName || null,
      informarAge: data.informerAge || null,
      informarAdd: data.informerAddress || null,
      informarPhone: data.informerPhone || null,
      informarMobile: data.informerMobile || null,
      policeName: data.nameOfPolice || null,
      buckleNo: data.buckleNo || null,
      mlcTimeHr: this.timeFormateKey === '12_hour' ? moment(new Date(data.mlcTime)).format('hh') : moment(new Date(data.mlcTime)).format('HH'),
      mlcTimeMin: moment(new Date(data.mlcTime)).format('mm'),
      mlcTimeAmPm: moment(new Date(data.mlcTime)).format('A'),
      policeStationAdd: data.policeAddress || null,
      identificationType: {
        identificationType: data.identificationTypeName,
        identificationTypeId: data.identificationTypeId
      },
      identificationTypeNo: data.identificationNumber || null,
    });
    if (!data.mlcType) {
      this.registerForm.patchValue({
        mlcType: null
      });
    }
    if (!data.reportingDoctorId) {
      this.registerForm.patchValue({
        reportingDoctor: null
      });
    }
    if (!data.identificationTypeId) {
      this.registerForm.patchValue({
        identificationType: null
      });
    }
    if (!data.incidentTime) {
      this.registerForm.patchValue({
        incidentTimeHr: null,
        incidentTimeMin: null,
        incidentTimeAmPm: null,
      });
    }
    if (!data.mlcTime) {
      this.registerForm.patchValue({
        mlcTimeHr: null,
        mlcTimeMin: null,
        mlcTimeAmPm: null,
      });
    }
  }

  timeArrayGenrate() {
    if (this.timeFormateKey === '12_hour') {
      this.timeArray.hrs = [];
      for (let i = 0; i < 12; i++) {
        const time = (i < 10 ? '0' + i : i);
        this.timeArray.hrs.push(time);
      }
    } else {
      for (let i = 0; i < 24; i++) {
        const time = (i < 10 ? '0' + i : i);
        this.timeArray.hrs.push(time);
      }
    }
    for (let i = 0; i < 60; i++) {
      const time = (i < 10 ? '0' + i : i);
      this.timeArray.min.push(time);
    }
  }

  generateSaveObj() {
    const param = this.registerForm.getRawValue();
    param.mlcId = param.id;
    if (this.timeFormateKey === '12_hour') {
      param.incidentTime = new Date(moment().format('YYYY/MM/DD') + ' ' + param.incidentTimeHr + ':' + param.incidentTimeMin + ' ' + param.incidentTimeAmPm);
      param.mlcTime = new Date(moment().format('YYYY/MM/DD') + ' ' + param.mlcTimeHr + ':' + param.mlcTimeMin + ' ' + param.mlcTimeAmPm);
    } else {
      param.incidentTime = new Date(moment().format('YYYY/MM/DD') + ' ' + param.incidentTimeHr + ':' + param.incidentTimeMin);
      param.mlcTime = new Date(moment().format('YYYY/MM/DD') + ' ' + param.mlcTimeHr + ':' + param.mlcTimeMin);
    }
    param.identificationTypeId = param.identificationType?.identificationTypeId,
      param.identificationNumber = param.identificationTypeNo;
    param.informerAddress = param.informarAdd;
    param.locationDetails = param.locationDetail;
    param.mlcTypeId = param.mlcType.mlcTypeId;
    param.reportingDoctorId = param.reportingDoctor.user_id;
    param.encounterId = param.selectedPatient.encounterId;
    param.mlcTypeId = param.mlcType ? param.mlcType.mlcTypeId : 0;
    param.reportingDoctorId = param.reportingDoctor ? param.reportingDoctor.user_id : 0;
    param.isDead = param.broughtDead;
    param.mlcRecordNo = param.mlcRecNo;
    param.informerName = param.informarName;
    param.informerAge = param.informarAge;
    param.informerAdd = param.informarAdd;
    param.informerPhone = param.informarPhone;
    param.informerMobile = param.informarMobile;
    param.nameOfPolice = param.policeName;
    param.policeAddress = param.policeStationAdd;
    return param;
  }

  saveDeathRegister() {
    this.submitted = true;
    if (this.registerForm.valid) {
      this.submitted = false;
      const param = this.generateSaveObj();
      this.mtpMlcService.saveMLC(param).subscribe(res => {
        if (res) {
          this.alertMsg = {
            messageType: 'success',
            message: 'MLC Data Updated Successfully!',
            duration: Constants.ALERT_DURATION
          };
          if (this.isPartialLoad) {
            this.registerForm.patchValue({
              id: res.data
            })
          } else {
            this.router.navigate(['/nursingApp/nursing/mlc/list/']);
          }
        }
      });
    }
  }

  onPatientChange(event): void {
    if (event) {
      if (event.encounterId) {
        this.mlcId = event.encounterId;
        this.getMlcDataById().then(res => {
          // this.registerForm.enable();
          this.showPatientSearchBox = false;
        });
      } else {
        this.registerForm.patchValue({
          patientId: event.patientId,
          selectedPatient: event
        });
        // this.registerForm.enable();
        this.showPatientSearchBox = false;
      }
    } else {
      this.registerForm.patchValue({
        selectedPatient: null
      });
      // this.registerForm.disable();
    }
  }

  createForm(): void {
    this.registerForm = this.fb.group({
      id: 0,
      patientId: [null, Validators.required],
      selectedPatient: null,
      mlcRecNo: null,
      mlcDate: [new Date(), Validators.required],
      vehicleNo: [null, Validators.required],
      mlcType: [null, Validators.required],
      reportingDoctor: [null, Validators.required],
      broughtDead: false,
      incidentDate: [new Date(), Validators.required],
      incidentTimeHr: [null, Validators.required],
      incidentTimeMin: [null, Validators.required],
      incidentTimeAmPm: [null],
      locationDetail: [null, Validators.required],
      informarName: [null, Validators.required],
      informarAge: [null, Validators.required],
      informarAdd: [null, Validators.required],
      informarPhone: [null, Validators.required],
      informarMobile: [null],
      policeName: [null, Validators.required],
      buckleNo: [null, Validators.required],
      mlcTimeHr: [null, Validators.required],
      mlcTimeMin: [null, Validators.required],
      mlcTimeAmPm: [null],
      policeStationAdd: [null, Validators.required],
      identificationType: [null],
      identificationTypeNo: [null],
    });
    this.loadForm = true;

  }

  get getFrmCntrols() {
    return this.registerForm.controls;
  }

  private loadPatientList(searchTxt?) {
    this.patientList$ = concat(
      this.getPatientListByType(searchTxt ? searchTxt : ''), // default items
      this.patientListInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.getPatientListByType(term ? term : (searchTxt ? searchTxt : '')).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  enablePatientSearch(val) {
    this.showPatientSearchBox = val;
  }

  getPatientListByType(searchText): Observable<any> {
    const param = {
      search_string: searchText,
      page_number: 1,
      limit: 50,
      visit_Type: '',
    };
    return this.patientDeathService.getPatientListBySearchKeywords(param).pipe(map((res: any) => {
      return res;
    }));
  }

  getMlcTypeList(): Observable<any> {
    return this.mtpMlcService.getMLCTypeList().pipe(map((res: any) => {
      this.mlcTypeList = res;
      return res;
    }));
  }

  getIdentificationTypeList(): Observable<any> {
    return this.mtpMlcService.getIdentificationTypeList().pipe(map((res: any) => {
      this.identificationTypeList = res;
      return res;
    }));
  }

  onMlcTypeChange(val) {
    // this.registerForm.patchValue({
    //   mlcType: val
    // });
  }

  onUserSelect(val) {
    // this.registerForm.patchValue({
    //   reportingDoctor: val
    // });
  }

  private loadDoctorList(searchTxt?) {
    this.doctorList$ = concat(
      this.getDoctorList(searchTxt), // default items
      this.docListInput$.pipe(
        distinctUntilChanged(),
        switchMap(term => this.getDoctorList(term).pipe(
          catchError(() => of([])), // empty list on error
        ))
      )
    );
  }

  getDoctorList(searchText): Observable<any> {
    const reqParam = {
      search_keyword: searchText,
      dept_id: 0,
      speciality_id: 0,
      role_type_id: 0,
      limit: 100
    };
    return this.emrService.getUsersList(reqParam).pipe(map(res => res));
  }

}
