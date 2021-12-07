import { Entity } from 'src/app/modules/schedule/models/entity.model';

import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import * as _ from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EntityBasicInfoService } from './../../modules/schedule/services/entity-basic-info.service';
import { environment } from 'src/environments/environment';
import { ApplicationEntityConstants } from 'src/app/shared/constants/ApplicationEntityConstants';
import { Subject, forkJoin } from 'rxjs';
import { Constants } from 'src/app/config/constants';
import { IAlert } from 'src/app/models/AlertMessage';
import { NgxPermissionsService, NgxRolesService } from 'ngx-permissions';
import { UsersService } from '../../services/users.service';
import { CommonService } from 'src/app/services/common.service';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
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
  appkey = 'qms'
  // tslint:disable-next-line: variable-name
  loginLogUrl: string;
  $destroy: Subject<boolean> = new Subject();
  alertMsg: IAlert;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private entityBasicInfoService: EntityBasicInfoService,
    private rolesService: NgxRolesService,
    private permissionsService: NgxPermissionsService,
    private userService: UsersService,
    private commonService: CommonService,
    private modalService: NgbModal
  ) { this.redirectTo(); }

  // private forgotPasswordModalService: NgbModal) {
  //   this._modalService = forgotPasswordModalService;
  // }

  ngOnInit() {
    // this.redirectUrl = this.authService.redirectUrl;
    this.loginLogUrl = environment.LoginLogoUrl + 'hospital-logo.png';
    this.loginForm = this.fb.group({
      user_name: ['', Validators.required],
      password: ['', Validators.required],
      loginFor: ['qms']
    });
    this.showPassword = false;

    const isReload = true;
    if (this.authService.isLoggedIn()) {
      this.redirectTo();
    } else {
      if (environment.SSO_LOGIN_URL) {
        window.open(environment.SSO_LOGIN_URL, '_self');
      } else {
        if (isReload) {
          this.router.navigate(['/login']);
        }
      }
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
      this.appkey = this.loginForm.value.loginFor;
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
          this.authService.setActiveAppKey(this.loginForm.value.loginFor);
        } else {
          this.errorMsg = res.message;
        }
      });
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
  assignRoleAndRedirect(userObject) {
    this.userService.GetAssignedRolePermissionsByUserId(userObject.id)
      .subscribe((result) => {
        const userPermission = this.userService.userPermission;
        this.permissionsService.loadPermissions(userPermission);

        this.entityBasicInfoService.getAllEntityList().subscribe((entity: Array<Entity>) => {
          if (entity.length) {
            this.redirectTo(userObject);
          }
        });
      });
  }
  // -- redirect to purticular URL
  redirectTo(userObject?) {
    this.submitted = false;
    this.errorMsg = '';
    if (this.authService.isLoggedIn()) {
      if (this.authService.isUserLoggedIn()) {
        if (this.redirectUrl) { // -- go to previous attempt url
          this.router.navigate([this.redirectUrl]);
          this.redirectUrl = null;
        } else {
          const userInfo = this.authService.getUserInfoFromLocalStorage();
          const userPermissions = [...this.userService.userPermission];
          if (this.appkey === 'qms') {
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
              this.router.navigate(['/app/qms/qList']);
            }
          } else if (this.appkey === 'appointment') {
            if (userInfo.role_type === ApplicationEntityConstants.TELECALLER
              && _.find(userPermissions, (o) => o === PermissionsConstants.View_Call_Center_View)) {
              this.router.navigate(['/appointmentApp/appointments/searchAppointment']);
            } else {
              const defaultUrl = '/appointmentApp/appointments/listfd/fduserappointmentsList';
              this.router.navigate([defaultUrl]);
            }
          } else {
            // let viewPermissions = _.find(this.userService.userPermission, (o) => { return o.indexOf('View - ') });
            const defaultUrl = '/app/nopermission';
            this.router.navigate([defaultUrl]);
          }
        }
      } else {
        if (userObject && userObject.first_login) {
          this.router.navigate(['./changepassword']);
        } else {
          this.router.navigate(['/userMenus/userList']);
        }
      }
    }
  }

  forgotPasswordRoute(): void {
    this.router.navigate(['/forgotpassword']);
  }

}
