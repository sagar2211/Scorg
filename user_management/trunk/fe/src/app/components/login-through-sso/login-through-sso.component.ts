import { UsersService } from 'src/app/services/users.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { CommonService } from '../../services/common.service';
import { AuthService } from '../../services/auth.service';
import { environment } from 'src/environments/environment';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { ApplicationEntityConstants } from 'src/app/shared/constants/ApplicationEntityConstants';
import { Constants } from 'src/app/config/constants';

@Component({
  selector: 'app-login-through-sso',
  templateUrl: './login-through-sso.component.html',
  styleUrls: ['./login-through-sso.component.scss']
})
export class LoginThroughSSOComponent implements OnInit {
  token: string;
  // appId: number;
  submitted = false;
  redirectUrl: string;
  errorMsg: string;
  appKey = 'qms';

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private commonService: CommonService,
    private userService: UsersService
  ) { }

  ngOnInit(): void {
    console.log('LoginThroughSSOComponent');
    this.commonService.showHideAppLoader(true);
    this.activatedRoute.paramMap.subscribe(res => {
      console.log('res', res);
      // this.appId = +res.get('appId');
      this.token = res.get('token');
      this.appKey = res.get('appKey') || 'qms';
      this.loginThroghSSO();
    });
  }

  loginThroghSSO(): void {
    this.authService.loginThroghSSO(this.token, this.appKey).subscribe(res => {
      if (res.status_message === 'Success') {
        console.log('Success', res);
        // localStorage.setItem('globals', JSON.stringify(res.data));
        const userObject = res.data;
        this.commonService.storeKeyValues = [];
        this.commonService.userListTempParams = null;
        this.commonService.getScheduleDataParams = null;
        this.userService.masterUserDetails = {};
        this.authService.redirectUrl = null;
        // store login info to local storage
        this.authService.storeLoginInfo(userObject);
        this.authService.setActiveAppKey(this.appKey);
        this.storeSettingValueOnLocalStorage();
        this.redirctAfterCheck();

      } else if (res) {
        let loginPageUrl = environment.SSO_LOGIN_URL;
        loginPageUrl = environment.production && loginPageUrl ? loginPageUrl : window.location.origin;
        window.open(loginPageUrl, '_self');
      }
    });
  }

  redirctAfterCheck() {
    const userInfo = this.authService.getUserInfoFromLocalStorage();
    const userPermissions = [...this.userService.userPermission];
    if (this.appKey === 'qms') {
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
    } else if (this.appKey === 'appointment') {
      if (userInfo.role_type === ApplicationEntityConstants.TELECALLER) {
        this.router.navigate(['/appointmentApp/appointments/searchappointment']);
      } else {
        const defaultUrl = '/appointmentApp/appointments/listfd/fduserappointmentsList';
        this.router.navigate([defaultUrl]);
      }
    }
  }

  storeSettingValueOnLocalStorage() {
    const param = [
      {
        tag_name: Constants.timeFormateKey,
        tag_question: '',
      }
    ];
    this.commonService.getQueueSettingsForMultiple(param).subscribe(forkRes => {
      if (forkRes && forkRes[0].tag_value) {
        this.commonService.updateTimeFormatInLocalStorage(JSON.parse(forkRes[0].tag_value).time_format_key);
      } else {
        this.commonService.updateTimeFormatInLocalStorage('12_hour');
      }
    });
  }

  // -- redirect to purticular URL
  redirectTo(): void {
    if (this.authService.isLoggedIn()) {
      if (this.authService.isUserLoggedIn()) {
        if (this.redirectUrl) { // -- go to previous attempt url
          this.router.navigate([this.redirectUrl]);
          this.redirectUrl = null;
        } else {
          if (this.appKey === 'qms') {
            this.router.navigate(['/app/qms/qList']);
          } else if (this.appKey === 'appointment') {
            this.router.navigate(['/appointmentApp/appointments/list/appointmentsList']);
          }

        }
      }
    } else {
      this.loginThroghSSO();
    }
  }

}
