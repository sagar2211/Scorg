
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { NgxPermissionsService } from 'ngx-permissions';
import { environment } from 'src/environments/environment';
import { PermissionsConstants } from '../config/PermissionsConstants';
import { AuthService } from '../public/services/auth.service';
import { CommonService } from '../public/services/common.service';
import { SideMenuService } from '../public/services/sidemenu.service';
import { UsersService } from '../public/services/users.service';
// import { CommonService } from '../../services/common.service';
// import { AuthService } from '../../services/auth.service';
// import { UsersService } from 'src/app/services/users.service';
// import { Router, ActivatedRoute } from '@angular/router';

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

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private commonService: CommonService,
    private userService: UsersService,
    private sideMenuService: SideMenuService,
    private permissionsService: NgxPermissionsService
  ) { }

  ngOnInit(): void {
    console.log('LoginThroughSSOComponent');
    this.commonService.showHideAppLoader(true);
    this.activatedRoute.paramMap.subscribe(res => {
      console.log('res', res);
      // this.appId = +res.get('appId');
      this.token = res.get('token');
      this.loginThroghSSO();
    });
  }

  loginThroghSSO(): void {
    this.authService.loginThroghSSO(this.token).subscribe(res => {
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
        this.assignRoleAndRedirect(userObject);
        // this.router.navigate(['/app/user/userList']);
      } else if (res) {
        let loginPageUrl = environment.SSO_LOGIN_URL;
        loginPageUrl = environment.production && loginPageUrl ? loginPageUrl : window.location.origin;
        window.open(loginPageUrl, '_self');
      }
    });
  }

  assignRoleAndRedirect(userObject): void {
    this.userService.GetAssignedRolePermissionsByUserId(userObject.id)
      .subscribe((result) => {
        const userPermission = this.userService.userPermission;
        this.permissionsService.loadPermissions(userPermission);
        this.redirectTo();
      });
  }

  // -- redirect to purticular URL
  redirectTo(): void {
    const userInfo = this.authService.getUserInfoFromLocalStorage();
    this.userService.GetAssignedRolePermissionsByUserId(userInfo.user_id).subscribe((result) => {
      const appDetails = this.authService.getAppDetailsByAppId(userInfo['default_application_id']);
      const appData = _.find(userInfo.assigenedApplication, d => {
        return d.app_key === 'user_management';
      });
      const userPermissions = [...this.userService.userPermission];
      if (this.authService.isLoggedIn()) {
        if (this.authService.isUserLoggedIn()) {
          if (this.redirectUrl) { // -- go to previous attempt url
            this.router.navigate([this.redirectUrl]);
            this.redirectUrl = null;
          } else if (appData && appData.primary_permission && _.find(userPermissions, (o) => o === appData.primary_permission.name)) {
            const check = this.redirecToLanding(appData.primary_permission.name);
            if (check.link && check.redirect) {
              this.router.navigate(['/app/user/' + check.link]);
            } else if (userPermissions && _.find(userPermissions, (o) => o === PermissionsConstants.View_UserMaster)) {
              this.router.navigate(['/app/user/userList']);
            } else {
              this.redirectToNoPermission();
            }
          } else if (appDetails.primary_permission) {
            // redirect to main primary
            const check = this.redirecToLanding(appDetails.primary_permission.name);
            if (check.link && check.redirect) {
              this.router.navigate(['/app/user/' + check.link]);
            } else if (userPermissions && _.find(userPermissions, (o) => o === PermissionsConstants.View_UserMaster)) {
              this.router.navigate(['/app/user/userList']);
            } else {
              this.redirectToNoPermission();
            }
          } else {
            if (userPermissions && _.find(userPermissions, (o) => o === PermissionsConstants.View_UserMaster)) {
              this.router.navigate(['/app/user/userList']);
            } else {
              this.redirectToNoPermission();
            }
          }
        }
      } else {
        let loginPageUrl = environment.SSO_LOGIN_URL;
        loginPageUrl = environment.production && loginPageUrl ? loginPageUrl : window.location.origin;
        window.open(loginPageUrl, '_self');
      }
    });
  }

  redirectToNoPermission() {
    const defaultUrl = '/app/nopermission';
    this.router.navigate([defaultUrl]);
  }

  redirecToLanding(permissionName) {
    const menuList = this.sideMenuService.sideMenuList;
    let obj = {
      link: null,
      redirect: false
    }
    let loopRun = true;
    _.map(menuList, (main, mi) => {
      _.map(main.children, (child, ci) => {
        if (child.permission && child.permission === permissionName && loopRun) {
          loopRun = false;
          obj.redirect = true;
          obj.link = child.linkKey;
        }
      })
    });
    return obj;
  }

}
