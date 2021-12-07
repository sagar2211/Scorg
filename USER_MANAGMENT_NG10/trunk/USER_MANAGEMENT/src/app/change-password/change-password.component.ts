import { PermissionsConstants } from './../config/PermissionsConstants';
import { NgxPermissionsService, NgxRolesService } from 'ngx-permissions';
import { UsersService } from './../public/services/users.service';
import { CommonService } from './../public/services/common.service';
import { Router } from '@angular/router';
import { Constants } from './../config/constants';
import { IAlert } from './../public/models/AlertMessage';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import * as _ from 'lodash';
import { AuthService } from './../public/services/auth.service';
import { environment } from 'src/environments/environment';
// import { Entity } from './../public/models/entity.model';
// import { ApplicationEntityConstants } from './../config/ApplicationEntityConstants';
// import { EntityBasicInfoService } from './../public/services/entity-basic-info.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
changePasswordForm: FormGroup;
submitted = false;
showOldPassword;
showNewPassword;
showConfirmPassword;
alertMsg: IAlert;
cannotContainSpace: boolean;
@Input() isFromProfile: boolean;
errorMsg: string;
redirectUrl: string;

  constructor(
    private fb: FormBuilder,
    public modal: NgbActiveModal,
    private authService: AuthService,
    private router: Router,
    private commonService: CommonService,
    private userService: UsersService,
    //private entityBasicInfoService: EntityBasicInfoService,
    private rolesService: NgxRolesService,
    private permissionsService: NgxPermissionsService
  ) { }

  ngOnInit() {

    this.defaultFormObjects();
    this.showOldPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
  }

  defaultFormObjects(): void {
    this.changePasswordForm = this.fb.group({
      old_password : ['', Validators.required],
      new_password: ['', Validators.required],
      confirm_password: ['', Validators.required]
    }, {validators: this.authService.matchConfirmPassword});
    console.log(this.changePasswordForm);
  }


  get changePasswordFormControls(): any {
    return this.changePasswordForm.controls;
  }

  changePassword(): void {
    this.submitted = true;
    if (this.changePasswordForm.valid) {
      const userInfo = this.authService.getUserInfoFromLocalStorage();
      const formsValue = _.cloneDeep(this.changePasswordForm.value);
      const reqObj = {
        user_name: userInfo.user_key,
        password: formsValue.new_password,
        old_password: formsValue.old_password
      };
      this.authService.changePassword(reqObj).subscribe(res => {
        if (res.status_code === 200 && res.message === 'Password changed successfully') {
          this.alertMsg = {
            message: res.message,
            messageType: 'success',
            duration: Constants.ALERT_DURATION
          };
          this.commonService.clearUserSessionData();
          //this.router.navigate(['./']);
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
  onKeyUp(text, field): void {
    if ((text as string).indexOf(' ') >= 0) {
      text = text.replace(' ', '');
      this.alertMsg = {
        message: 'Space not allowed!',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
      if (field === 'oldpsw') {
        this.changePasswordForm.controls.old_password.patchValue(text);
      } else {
        this.changePasswordForm.controls.new_password.patchValue(text);
      }
    }
  }

  redirectToWelcomePage(): void {
    if (this.isFromProfile) {
      this.modal.close('cancel');
    } else {
      const userObj = this.authService.getUserInfoFromLocalStorage();
      userObj.id = userObj.user_id;
      this.assignRoleAndRedirect(userObj);
    }
  }

  assignRoleAndRedirect(userObject): void {
    this.userService.GetAssignedRolePermissionsByUserId(userObject.id)
      .subscribe((result) => {
        const userPermission = this.userService.userPermission;
        this.permissionsService.loadPermissions(userPermission);

        //this.entityBasicInfoService.getAllEntityList().subscribe((entity: Array<Entity>) => {
          //if (entity.length) {
            this.redirectTo();
          //}
        //});
      });
  }
  // -- redirect to purticular URL
  redirectTo(): void {
    this.submitted = false;
    this.errorMsg = '';
    if (this.authService.isLoggedIn()) {
      if (this.authService.isUserLoggedIn()) {
        if (this.redirectUrl) { // -- go to previous attempt url
          this.router.navigate([this.redirectUrl]);
          this.redirectUrl = null;
        } else {
          const userInfo = this.authService.getUserInfoFromLocalStorage();
          if (userInfo && userInfo.default_application_id) {
            const appDetails = this.authService.getAppDetailsByAppId(userInfo.default_application_id);
            this.redirectToApp(appDetails, userInfo.auth_token);
          } else {
            this.redirectToApp(null, userInfo.auth_token);
          }
        }
      } else {
        const defaultUrl = '/login';
        this.router.navigate([defaultUrl]);
      }
    }
  }
  redirectToApp(appDetails, token): void{
    const userPermissions = [...this.userService.userPermission];
    if (environment.production) {
      if (appDetails) {
        const url = appDetails.app_url.replace('#token#', token)
        window.open(url, '_self');
      } else if (userPermissions && _.find(userPermissions, (o) => o === PermissionsConstants.View_UserMaster)) {
        this.router.navigate(['/app/user/userList']);
      } else {
        const defaultUrl = '/app/nopermission';
        this.router.navigate([defaultUrl]);
      }
    } else if (userPermissions && _.find(userPermissions, (o) => o === PermissionsConstants.View_UserMaster)) {
      this.router.navigate(['/app/user/userList']);
    } else {
      const defaultUrl = '/app/nopermission';
      this.router.navigate([defaultUrl]);
    }
  }

}
