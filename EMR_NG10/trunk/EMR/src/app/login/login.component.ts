import { CommonService } from './../public/services/common.service';
import { Constants } from './../config/constants';
import { IAlert } from './../public/models/AlertMessage';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../public/services/auth.service';
import { environment } from 'src/environments/environment';
import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { UsersService } from 'src/app/public/services/users.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { SideMenuService } from '../public/services/sidemenu.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  isReload = true;
  loginForm: FormGroup;
  alertMsg: IAlert;
  loginLogUrl: string;
  showPassword: boolean;
  submitted = false;
  errorMsg: string;
  skipLoginPage = true;
  constructor(
    private route: Router,
    private authService: AuthService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private userService: UsersService,
    private permissionsService: NgxPermissionsService,
    private sideMenuService: SideMenuService,
  ) { }

  ngOnInit(): void {
    this.skipLoginPage = false;
    this.loginLogUrl = environment.LoginLogoUrl + 'hospital-logo.png';
    this.loginForm = this.fb.group({
      user_name: [''],
      password: [''],
      loginFor: ['EMR']
    });
    this.showPassword = false;
    const formVal = this.loginForm.value;
    if (this.authService.isLoggedIn()) {
      this.skipLoginPage = true;
      const userInfo = this.authService.getUserInfoFromLocalStorage();
      this.userService.GetAssignedRolePermissionsByUserId(userInfo.user_id).subscribe((result) => {
        const userPermission = this.userService.userPermission;
        const key = this.authService.getActiveAppKey();
        const loginFor = formVal.loginFor;
        const nursingStationId = this.authService.getNursingStationId();
        this.sideMenuService.redirectTo(userPermission, userInfo, key, loginFor, nursingStationId);
      });
      this.isReload = true;
    } else {
      if (environment.SSO_LOGIN_URL) {
        window.open(environment.SSO_LOGIN_URL, '_self');
      } else {
        this.route.navigate(['/login']);
        this.isReload = false;
      }
    }
  }

  onSubmit() {
    // this.submitted = true;
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe(res => {
        if (res.status_message === 'Success' && _.has(res, 'user_details')) {
          // localStorage.setItem('globals', JSON.stringify(res.data));
          const userObject = res.user_details;
          // clear old user data from service
          this.commonService.storeKeyValues = [];
          this.commonService.userListTempParams = null;
          this.commonService.getScheduleDataParams = null;
          this.commonService.masterUserDetails = {};
          this.authService.redirectUrl = null;
          this.authService.setActiveAppKey(this.loginForm.value.loginFor);
          // store login info to local storage
          this.authService.storeLoginInfo(userObject);
          this.assignRoleAndRedirect(userObject);
          // this.redirectTo();
        } else {
          this.alertMsg = {
            message: res.message,
            messageType: 'danger',
            duration: Constants.ALERT_DURATION
          };
        }
      });
    }
  }

  assignRoleAndRedirect(userObject) {
    const formVal = this.loginForm.value;
    this.userService.GetAssignedRolePermissionsByUserId(userObject.id).subscribe((result) => {
      const userPermission = this.userService.userPermission;
      this.permissionsService.loadPermissions(userPermission);
      const userInfo = this.authService.getUserInfoFromLocalStorage();
      const key = this.authService.getActiveAppKey();
      const loginFor = formVal.loginFor;
      const nursingStationId = this.authService.getNursingStationId();
      this.sideMenuService.redirectTo(userPermission, userInfo, key, loginFor, nursingStationId)
    });
  }


}
