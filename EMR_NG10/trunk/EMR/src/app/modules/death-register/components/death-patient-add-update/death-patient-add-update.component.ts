import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { concat, Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { Constants } from 'src/app/config/constants';
import { PatientDeathService } from '../../services/patient-death.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/public/services/auth.service';
import { CommonService } from 'src/app/public/services/common.service';
import { UsersService } from 'src/app/public/services/users.service';
import { NgxPermissionsService } from 'ngx-permissions';

@Component({
  selector: 'app-death-patient-add-update',
  templateUrl: './death-patient-add-update.component.html',
  styleUrls: ['./death-patient-add-update.component.scss']
})
export class DeathPatientAddUpdateComponent implements OnInit {

  registerForm: FormGroup;
  submitted = false;
  showPatientSearchBox = true;
  patientList$ = new Observable<any>();
  patientListInput$ = new Subject<any>();
  deathTypeList: any;
  setAlertMessage: IAlert;
  patientDeathInfo: any;
  timeArray = {
    hrs: [],
    min: [],
    amPm: ['AM', 'PM']
  };
  timeFormateKey;
  token: any;
  encounterId: any;
  partialView = false;
  appKey: string;
  isPartialLoad: boolean;

  constructor(
    private fb: FormBuilder,
    private patientDeathService: PatientDeathService,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private commonService: CommonService,
    private router: Router,
    private userService: UsersService,
    private permissionsService: NgxPermissionsService,
  ) { }

  ngOnInit(): void {
    this.commonService.routeChanged(this.activatedRoute);
    this.timeFormateKey = this.authService.getUserInfoFromLocalStorage().timeFormat;
    // this.showPatientSearchBox = true;
    this.activatedRoute.paramMap.subscribe(data => {
      const formType = data.get('formType');
      this.token = data.get('token');
      this.encounterId = (data.get('encounterId') && data.get('encounterId') !== "undefined") ? +data.get('encounterId') : null;
      this.appKey = data.get('appKey');
      if (this.encounterId === 0) {
        this.showPatientSearchBox = true;
        this.encounterId = null;
      }
      if (this.token) {
        this.isPartialLoad = true;
      }
      if (this.token && this.encounterId) {
        this.showPatientSearchBox = false;
        this.isPartialLoad = true;
        this.checkAndCreateUserSession(this.token).then(res => {
          this.loadFormAndData(this.encounterId);
        })
      } else {
        this.isPartialLoad = false;
        this.showPatientSearchBox = true;
        this.loadFormAndData(this.encounterId);
      }
      if(this.token){
        this.isPartialLoad = true;
      }
    });
  }

  loadFormAndData(encounterId?){
    this.createForm();
    this.timeArrayGenrate();
    this.loadPatientList();
    this.loadDeathTypeList();
    this.updateInfo(encounterId);
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
    // const appId = this.authService.getAppIdByAppKey('registration');
    return this.userService.GetAssignedRolePermissionsByUserId(userId)
      .pipe(map(res => {
        const userPermission = this.userService.userPermission;
        this.permissionsService.loadPermissions(userPermission);
        // this.redirectTo();
      }));
  }

  updateInfo(encounterId) {
    this.activatedRoute.paramMap.subscribe((response: any) => {
      // if (encounterId && response.params.token) {
      //   this.encounterId = response.params.encounterId ? response.params.encounterId : response.params.uhid;
      //   this.token = response.params.token;

      // }
      if (encounterId && encounterId !== null) {
        this.partialView = true;
        const param = {
          encounterId : encounterId
        }
        this.getDeathPatientInfo(param)
      }
    })
  }

  loadDeathTypeList() {
    this.patientDeathService.getDeathTypeList().subscribe((response) => {
      this.deathTypeList = response;
    })
  }

  get f() {
    return this.registerForm.controls;
  }

  saveDeathRegister() {
    this.submitted = true;
    if (this.registerForm.invalid) {
      return;
    }
    const formObj = this.registerForm.value;
    const param = {
      id: this.patientDeathInfo.deathRegId || 0,
      patientId: formObj.patientId ? formObj.patientId : this.patientDeathInfo.patientId,
      encounterId: formObj.encounterId,
      dateOfDeath: new Date(this.patientDeathInfo.dateOfDeath),
      isPregnant: formObj.isPregnant ? formObj.isPregnant : this.patientDeathInfo.isPregnant,
      isDelivery: formObj.isDelivery ? formObj.isDelivery : this.patientDeathInfo.isDelivery,
      immediateCause: formObj.immediateCause ? formObj.immediateCause : this.patientDeathInfo.immediateCause,
      antecedentCause: formObj.antecedentCause ? formObj.antecedentCause : this.patientDeathInfo.antecedentCause,
      otherCause: formObj.otherCause ? formObj.otherCause : this.patientDeathInfo.otherCause,
      diagnosis: formObj.diagnosis ? formObj.diagnosis : this.patientDeathInfo.diagnosis,
      deathBodyHandOver: formObj.deathBodyHandOver ? formObj.deathBodyHandOver : this.patientDeathInfo.deathBodyHandOver,
      address: formObj.address ? formObj.address : this.patientDeathInfo.address,
      deathType: formObj.deathType ? formObj.deathType : this.patientDeathInfo.deathTypeName,
      deathTypeId: this.registerForm.value.deathType.deathTypeId ? this.registerForm.value.deathType.deathTypeId : this.patientDeathInfo.deathTypeId
    }
    this.patientDeathService.SaveDeathRegister(param).subscribe((response) => {
      if (response.status_message === "Success") {
        this.notifyAlertMessage({
          msg: 'Record saved successfully...',
          class: 'success',
        });
        if (this.isPartialLoad) {
          this.registerForm.patchValue({
            id: response.data
          });
          this.patientDeathInfo.deathRegId = response.data;
        } else {
          this.router.navigate(['/nursingApp/nursing/deathRegister/list']);
        }
      }
    }, error => {
      console.log(error);
    })
  }

  notifyAlertMessage(data): void {
    this.setAlertMessage = {
      message: data.msg,
      messageType: data.class,
      duration: Constants.ALERT_DURATION
    };
  }

  onPatientChange(event): void {
    if (event) {
      this.registerForm.patchValue({
        patientId : event.patientId,
        selectedPatient: event
      })
      this.getDeathPatientInfo(event);
    } else {
      this.registerForm.patchValue({
        selectedPatient: null
      })
      this.showPatientSearchBox = true;
    }
  }

  getDeathPatientInfo(event) {
    this.patientDeathService.getDeathPatientInfo(event.encounterId).subscribe((response) => {
      this.patientDeathInfo = response;
      if (this.encounterId && this.token) {
        this.registerForm.patchValue({
          selectedPatient: response
        })
      }

      this.registerForm.patchValue({
        id: response.deathRegId,
        patientId: event.patientId,
        encounterId: response.encounterId,
        dateOfDeath: new Date(response.dateOfDeath),
        isPregnant: response.isPregnant === true ? response.isPregnant = "true" : "false",
        isDelivery: response.isDelivery === true ? response.isDelivery = "true" : "false",
        immediateCause: response.immediateCause,
        antecedentCause: response.antecedentCause,
        otherCause: response.otherCause,
        diagnosis: response.diagnosis,
        deathBodyHandOver: response.deathBodyHandOver,
        address: response.address,
        deathType: response.deathTypeName,
        deathTimeHr: moment(response.dateOfDeath).format("hh"),
        deathTimeMin: moment(response.dateOfDeath).format("mm")
      });
      this.registerForm.enable();
      this.showPatientSearchBox = false;
    }, error => {
      console.log(error)
    })
  }

  createForm(): void {
    this.registerForm = this.fb.group({
      id: null,
      patientId: null,
      encounterId: null,
      selectedPatient: null,
      dateOfDeath: [new Date()],
      isPregnant: ["No"],
      isDelivery: ["No"],
      immediateCause: [null, Validators.required],
      antecedentCause: [null, Validators.required],
      otherCause: [null, Validators.required],
      diagnosis: [null, Validators.required],
      deathBodyHandOver: [null, Validators.required],
      address: [null, Validators.required],
      deathType: [null, Validators.required],
      deathTimeHr: [null, Validators.required],
      deathTimeMin: [null, Validators.required],
      deathTimeAmPm: this.timeFormateKey === '12_hour' ? [null, Validators.required] : [null],
    });
    this.registerForm.disable();
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
      visit_Type: 'IP',
    };
    return this.patientDeathService.getPatientListBySearchKeywords(param).pipe(map((res: any) => {
      return res;
    }));
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

}
