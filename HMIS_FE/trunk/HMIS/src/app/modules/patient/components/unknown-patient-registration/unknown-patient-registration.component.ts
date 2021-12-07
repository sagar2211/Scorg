import { Component, createPlatform, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Constants } from 'src/app/config/constants';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { PatientService } from 'src/app/public/services/patient.service';
import { ApplicationConstants, PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { AuthService } from 'src/app/public/services/auth.service';
import { UsersService } from 'src/app/public/services/users.service';
import { Observable } from 'rxjs';
import { NgxPermissionsService } from 'ngx-permissions';
import * as _ from 'lodash';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/public/services/common.service';

@Component({
  selector: 'app-unknown-patient-registration',
  templateUrl: './unknown-patient-registration.component.html',
  styleUrls: ['./unknown-patient-registration.component.scss']
})
export class UnknownPatientRegistrationComponent implements OnInit {
  unknownRegistration: FormGroup;
  submitted: boolean;
  isEditable = false;
  alertMsg: IAlert;
  uhid: number;
  appKey: string;
  isPartialLoad: boolean;
  gender = [
    { id: 1, name: 'Male' },
    { id: 2, name: 'Female' },
    { id: 3, name: 'Transgender' },
    { id: 4, name: 'Unknown' }
  ];
  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private userService: UsersService,
    private permissionsService: NgxPermissionsService,
    private commonService: CommonService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(data => {
      const token = data.get('token');
      this.uhid = +data.get('uhid');
      this.appKey = data.get('appKey');
      this.isEditable = true;
      if (token) {
        this.isPartialLoad = true;
      }
      if (this.uhid === 0) {
        this.uhid = null;
      }
      if (token && this.uhid) {
        this.isPartialLoad = true;
        this.checkAndCreateUserSession(token).then(res => {
          this.loadFormAndData(this.uhid);
        })
      } else {
        this.isPartialLoad = false;
        if (token) {
          this.isPartialLoad = true;
        }
        this.loadFormAndData(this.uhid);
      }
    })
  }

  loadFormAndData(uhid?) {
    this.createForm();
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

  createForm() {
    this.unknownRegistration = this.fb.group({
      identificationMark: [null, Validators.required],
      gender: [null, Validators.required],
    })
  }

  private get isPartialViewInHmis() {
    return this.appKey == 'hmis' || this.appKey == ApplicationConstants.Registration
      || this.appKey == ApplicationConstants.IPD || this.appKey == ApplicationConstants.OPD
      || this.appKey == ApplicationConstants.Emergency || this.appKey == ApplicationConstants.Billing
      || this.appKey == ApplicationConstants.admin;
  }

  redirectToEncounter() {
    const uhId = this.uhid;
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

  onSave() {
    this.submitted = true;
    if (this.unknownRegistration.invalid) {
      return;
    }
    if (this.unknownRegistration.valid) {
      this.isEditable = false;
      this.unknownRegistration.disable();
    }
    const generatedObj = this.generateObj(this.unknownRegistration.value);
    this.patientService.saveUnknownPatient(generatedObj).subscribe((response) => {
      if (response) {
        this.uhid = response;
        this.notifyAlertMessage({
          msg: 'Patient save successfully.',
          class: 'success',
        });
      }
    })
  }

  refreshPage(){
    this.submitted = false;
    this.isEditable = true;
    this.uhid = null;
    this.unknownRegistration.enable();
    this.unknownRegistration.reset();
  }

  generateObj(obj){
    const unknownObj = {
      gender: obj.gender.name,
      identificationMark: obj.identificationMark
    }
    return unknownObj;
  }

  notifyAlertMessage(data): void {
    this.alertMsg = {
      message: data.msg,
      messageType: data.class,
      duration: Constants.ALERT_DURATION
    };
  }

  clearForm() {
    this.unknownRegistration.reset();
  }

}
