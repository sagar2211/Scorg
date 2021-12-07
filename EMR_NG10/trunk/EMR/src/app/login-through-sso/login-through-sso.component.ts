import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { CommonService } from './../public/services/common.service';
import { AuthService } from './../public/services/auth.service';
import { environment } from 'src/environments/environment';
import { NotificationListService } from '../public/services/notification_list';
import { PatientService } from '../public/services/patient.service';
import { UsersService } from '../public/services/users.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { SideMenuService } from '../public/services/sidemenu.service';

@Component({
  selector: 'app-login-through-sso',
  templateUrl: './login-through-sso.component.html',
  styleUrls: ['./login-through-sso.component.scss']
})
export class LoginThroughSSOComponent implements OnInit {
  token: string;
  //appId: number;
  submitted = false;
  redirectUrl: string;
  errorMsg: string;
  notificationId: string;
  appKey = 'EMR';

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private commonService: CommonService,
    private notifyService: NotificationListService,
    private patientService: PatientService,
    private userService: UsersService,
    private permissionsService: NgxPermissionsService,
    private sideMenuService: SideMenuService,
  ) { }

  ngOnInit(): void {
    // console.log('LoginThroughSSOComponent');
    this.commonService.showHideAppLoader(true);
    this.activatedRoute.paramMap.subscribe(res => {
      // console.log('LoginThroughSSOComponent', res);
      this.token = res.get('token');
      this.notificationId = res.get('notificationId') || '0';
      this.appKey = (res.get('appKey') || 'EMR').toUpperCase();
      this.loginThroghSSO(this.appKey);
    });
  }

  loginThroghSSO(appKey): void {
    this.authService.loginThroghSSO(this.token, _.toLower(appKey)).subscribe(res => {
      if (res.status_message === 'Success') {
        // localStorage.setItem('globals', JSON.stringify(res.data));
        const userObject = res.data;
        // clear old user data from service
        this.commonService.storeKeyValues = [];
        this.commonService.userListTempParams = null;
        this.commonService.getScheduleDataParams = null;
        this.commonService.masterUserDetails = {};
        this.authService.redirectUrl = null;
        // store login info to local storage
        this.authService.storeLoginInfo(userObject);
        this.authService.setActiveAppKey(this.appKey);
        // this.redirectTo();
        if (this.notificationId != '0') {
          this.redirectToNotificationLink(this.notificationId);
        }
        const userInfo = this.authService.getUserInfoFromLocalStorage();
        if (this.userService && this.userService.userPermission) {
          const userPermission = this.userService.userPermission;
          this.permissionsService.loadPermissions(userPermission);
          const key = this.authService.getActiveAppKey();
          const loginFor = this.appKey;
          const nursingStationId = this.authService.getNursingStationId();
          this.sideMenuService.redirectTo(userPermission, userInfo, key, loginFor, nursingStationId);
        } else {
          this.userService.GetAssignedRolePermissionsByUserId(+userInfo.user_id).subscribe((result) => {
            const userPermission = this.userService.userPermission;
            this.permissionsService.loadPermissions(userPermission);
            const key = this.authService.getActiveAppKey();
            const loginFor = this.appKey;
            const nursingStationId = this.authService.getNursingStationId();
            this.sideMenuService.redirectTo(userPermission, userInfo, key, loginFor, nursingStationId);
          });
        }

      } else if (res) {
        let loginPageUrl = environment.SSO_LOGIN_URL;
        loginPageUrl = environment.production && loginPageUrl ? loginPageUrl : window.location.origin;
        window.open(loginPageUrl, '_self');
      }
    });
  }

  redirectToNotificationLink(notificationId) {
    const userInfo = this.authService.getUserInfoFromLocalStorage();
    this.notifyService.getNotificationById(notificationId).subscribe(notificationResp => {
      this.userService.GetAssignedRolePermissionsByUserId(+userInfo.user_id).subscribe((result) => {
        const key = this.authService.getActiveAppKey();
        const userPermission = this.userService.userPermission;
        this.permissionsService.loadPermissions(userPermission);
        const loginFor = this.appKey;
        const nursingStationId = this.authService.getNursingStationId();
        if (notificationResp != null) {
          this.patientService.getPatientActiveVisitDetail(notificationResp.patientId).subscribe(patientResp => {
            if (patientResp) {
              let patient = patientResp[0];
              patient.type = patient.serviceType.name.toLowerCase();
              this.commonService.setActivePatientList(patient, 'add');
              if (this.commonService.getActivePatientList(patient).length <= 5) {
                const obj = {
                  type: 'add',
                  data: patient,
                  sourc: 'doctor_dashboard'
                };
                this.commonService.updateActivePatientList(obj);
                this.router.navigate([notificationResp.routeUrl]);
                //this.router.navigate(['/emr/patient/dashboard/', notificationResp.patientId]);
                //this.router.navigate(['/emr/patient/mar/chart/', notificationResp.patientId]);
              } else {
                this.sideMenuService.redirectTo(userPermission, userInfo, key, loginFor, nursingStationId);
              }
            } else {
              this.sideMenuService.redirectTo(userPermission, userInfo, key, loginFor, nursingStationId);
            }
          });
        } else {
          this.sideMenuService.redirectTo(userPermission, userInfo, key, loginFor, nursingStationId);
        }
      })
    });
  }

  // -- redirect to purticular URL
  redirectTo(userObject?): void {
    const key = this.authService.getActiveAppKey();
    const userPermission = this.userService.userPermission;
    this.permissionsService.loadPermissions(userPermission);
    const userInfo = this.authService.getUserInfoFromLocalStorage();
    const loginFor = this.appKey;
    const nursingStationId = this.authService.getNursingStationId();
    if (this.authService.isLoggedIn()) {
      if (this.authService.isUserLoggedIn()) {
        if (this.redirectUrl) { // -- go to previous attempt url
          this.router.navigate([this.redirectUrl]);
          this.redirectUrl = null;
        } else {
          this.sideMenuService.redirectTo(userPermission, userInfo, key, loginFor, nursingStationId);
        }
      }
    }
  }


}
