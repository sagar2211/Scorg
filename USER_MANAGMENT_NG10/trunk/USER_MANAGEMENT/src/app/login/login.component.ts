import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { AuthService } from './../public/services/auth.service';
import { Constants } from 'src/app/config/constants';
import { IAlert } from './../public/models/AlertMessage';
import { NgxPermissionsService } from 'ngx-permissions';
import { UsersService } from './../public/services/users.service';
import { CommonService } from './../public/services/common.service';
import { PermissionsConstants } from './../config/PermissionsConstants';
import { environment } from 'src/environments/environment';
import { SideMenuService } from '../public/services/sidemenu.service';
// import { Entity } from './../public/models/entity.model';
// import { EntityBasicInfoService } from './../public/services/entity-basic-info.service';
// import { ApplicationEntityConstants } from './../config/ApplicationEntityConstants';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  loginForm: FormGroup;
  submitted = false;
  redirectUrl: string;
  errorMsg: string;
  showPassword;
  // tslint:disable-next-line: variable-name
  loginLogUrl: string;
  $destroy: Subject<boolean> = new Subject();
  alertMsg: IAlert;
  skipLoginPage = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    //private entityBasicInfoService: EntityBasicInfoService,
    private permissionsService: NgxPermissionsService,
    private userService: UsersService,
    private commonService: CommonService,
    private sideMenuService: SideMenuService,
  ) { this.redirectTo(); }

  // private forgotPasswordModalService: NgbModal) {
  //   this._modalService = forgotPasswordModalService;
  // }

  ngOnInit() {
    // this.redirectUrl = this.authService.redirectUrl;
    this.loginLogUrl = environment.LoginLogoUrl + 'hospital-logo.png';
    this.loginForm = this.fb.group({
      user_name: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.showPassword = false;
    this.skipLoginPage = false;

    if (this.authService.isLoggedIn()) {
      this.skipLoginPage = true;
      this.redirectTo();
    } else {
      this.router.navigate(['/login']);
    }
  }
  ngAfterViewInit() {
    setTimeout(() => {
      if (this.authService.getSessionUnAuthoError()) {
        this.alertMsg = {
          message: this.authService.getSessionUnAuthoError(),
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
        this.authService.unAuthoErrorMsg = null;
        sessionStorage.clear();
      }
    }, 500);
  }
  ngOnDestroy() {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  onSubmit() {
    this.submitted = true;
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe(res => {
        if (res.status_message === 'Success' && _.has(res, 'user_details')) {
          // clear old user data from service
          this.commonService.storeKeyValues = [];
          this.commonService.userListTempParams = null;
          this.commonService.getScheduleDataParams = null;
          this.userService.masterUserDetails = {};
          this.authService.redirectUrl = null;
          // store login info to local storage
          const userObject = res.user_details;
          this.authService.storeLoginInfo(userObject);
          this.assignRoleAndRedirect(userObject);
          this.storeSettingValueOnLocalStorage();
        } else {
          this.errorMsg = res.message;
        }
      });
    }
  }
  storeSettingValueOnLocalStorage(): void {
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
  assignRoleAndRedirect(userObject): void {
    this.userService.GetAssignedRolePermissionsByUserId(userObject.id)
      .subscribe((result) => {
        const userPermission = this.userService.userPermission;
        this.permissionsService.loadPermissions(userPermission);
        //this.entityBasicInfoService.getAllEntityList().subscribe((entity: Array<Entity>) => {
        //if (entity.length) {
        this.redirectTo(userObject);
        //}
        //});
      });
  }
  // -- redirect to purticular URL
  redirectTo(userObject?): void {
    this.submitted = false;
    this.errorMsg = '';
    if (this.authService.isLoggedIn()) {
      if (this.authService.isUserLoggedIn()) {
        if (this.redirectUrl) { // -- go to previous attempt url
          this.router.navigate([this.redirectUrl]);
          this.redirectUrl = null;
        } else {
          const userInfo = this.authService.getUserInfoFromLocalStorage();
          if (userObject && userObject.first_login) {
            this.router.navigate(['./changepassword']);
          } else {
            // this.router.navigate(['/app/qms/']);
            if (userObject && userObject.default_application_id) {
              const appDetails = this.authService.getAppDetailsByAppId(userObject.default_application_id);
              this.redirectToApp(appDetails, userInfo.auth_token);
            } else {
              this.redirectToApp(null, userInfo.auth_token);
            }
          }
        }
      } else {
        if (userObject && userObject.first_login) {
          this.router.navigate(['./changepassword']);
        } else {
          this.router.navigate(['/app/user/userList']);
        }
      }
    }
  }
  redirectToApp(appDetails, token): void {
    const userInfo = this.authService.getUserInfoFromLocalStorage();
    this.userService.GetAssignedRolePermissionsByUserId(userInfo.user_id).subscribe((result) => {
      const userPermissions = [...this.userService.userPermission];
      const appData = _.find(userInfo.assigenedApplication, d => {
        return d.app_key === 'user_management';
      });
      if (environment.production) {
        if (appDetails) {
          const url = appDetails.app_url.replace('#token#', token)
          window.open(url, '_self');
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
        } else if (userPermissions && _.find(userPermissions, (o) => o === PermissionsConstants.View_UserMaster)) {
          this.router.navigate(['/app/user/userList']);
        } else {
          this.redirectToNoPermission();
        }
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
        const check = this.redirecToLanding(appDetails.primary_permission.name);
        if (check.link && check.redirect) {
          this.router.navigate(['/app/user/' + check.link]);
        } else if (userPermissions && _.find(userPermissions, (o) => o === PermissionsConstants.View_UserMaster)) {
          this.router.navigate(['/app/user/userList']);
        } else {
          this.redirectToNoPermission();
        }
      } else if (userPermissions && _.find(userPermissions, (o) => o === PermissionsConstants.View_UserMaster)) {
        this.router.navigate(['/app/user/userList']);
      } else {
        this.redirectToNoPermission();
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

  forgotPasswordRoute(): void {
    this.router.navigate(['/forgotpassword']);
  }

}
