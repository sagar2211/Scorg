import { CommonService } from './../public/services/common.service';
import { Constants } from './../config/constants';
import { IAlert } from './../public/models/AlertMessage';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../public/services/auth.service';
import { environment } from 'src/environments/environment';
import { Component, OnInit } from '@angular/core';
import { Route } from '@angular/compiler/src/core';
import * as _ from 'lodash';
import { UsersService } from 'src/app/public/services/users.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { MappingService } from "../public/services/mapping.service";
import { forkJoin } from "rxjs";
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
    private permissionsService: NgxPermissionsService,
    private mappingService: MappingService,
    private sideMenuService: SideMenuService,
    private userService: UsersService,
  ) { }

  ngOnInit(): void {
    this.skipLoginPage = false;
    this.loginLogUrl = environment.LoginLogoUrl + 'hospital-logo.png';
    this.loginForm = this.fb.group({
      user_name: [''],
      password: ['']
    });
    this.showPassword = false;

    if (this.authService.isLoggedIn()) {
      this.skipLoginPage = true;
      const storeId = this.authService.getLoginStoreId();
      if (storeId) {
        const userInfo = this.authService.getUserInfoFromLocalStorage();
        this.userService.GetAssignedRolePermissionsByUserId(userInfo.id).subscribe((result) => {
          const userPermissions = [...this.userService.userPermission];
          this.sideMenuService.redirectToApp(userPermissions, userInfo);
        });
      } else {
        this.route.navigate(['/selectStore']);
      }
      // this.route.navigate(['/selectStore']);
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
          // store login info to local storage
          this.authService.storeLoginInfo(userObject);
          this.postLoginActions(userObject);
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

  postLoginActions(userObject): void {
    const forkJoins: any[] = [];
    const assignedRolePermissionsByUserId = this.userService.GetAssignedRolePermissionsByUserId(userObject.id);
    forkJoins.push(assignedRolePermissionsByUserId);
    const getStoreListByUserId = this.mappingService.GetUserStoreMappingByUserId(userObject.id);
    forkJoins.push(getStoreListByUserId);
    forkJoin(forkJoins).subscribe(([assignedRolePermissions, storesList]) => {
      const userPermission = this.userService.userPermission;
      this.permissionsService.loadPermissions(userPermission);
      // this.route.navigate(['/inventory']);
      const stores: any = storesList;
      if (!stores.length) {
        this.route.navigate(['/noStore']);
      } else if (stores.length === 1) {
        const userInfo = this.authService.getUserInfoFromLocalStorage();
        this.sideMenuService.redirectToApp(userPermission, userInfo);
      } else {
        this.route.navigate(['/selectStore']);
      }
    });
  }

}
