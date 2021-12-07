import { Entity } from './../../modules/schedule/models/entity.model';
import { PermissionsConstants } from './../../shared/constants/PermissionsConstants';
import { ApplicationEntityConstants } from './../../shared/constants/ApplicationEntityConstants';
import { EntityBasicInfoService } from './../../modules/schedule/services/entity-basic-info.service';
import { NgxPermissionsService, NgxRolesService } from 'ngx-permissions';
import { UsersService } from './../../services/users.service';
import { CommonService } from './../../services/common.service';
import { Router } from '@angular/router';
import { Constants } from './../../config/constants';
import { IAlert } from 'src/app/models/AlertMessage';
import { AuthService } from './../../services/auth.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import * as _ from 'lodash';
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
    private entityBasicInfoService: EntityBasicInfoService,
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


  get changePasswordFormControls() {
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
  onKeyUp(text, field) {
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

  redirectToWelcomePage() {
    if (this.isFromProfile) {
      this.modal.close('cancel');
    } else {
      const userObj = this.authService.getUserInfoFromLocalStorage();
      userObj.id = userObj.user_id;
      this.assignRoleAndRedirect(userObj);
    }
  }

  assignRoleAndRedirect(userObject) {
    this.userService.GetAssignedRolePermissionsByUserId(userObject.id)
      .subscribe((result) => {
        const userPermission = this.userService.userPermission;
        this.permissionsService.loadPermissions(userPermission);

        this.entityBasicInfoService.getAllEntityList().subscribe((entity: Array<Entity>) => {
          if (entity.length) {
            this.redirectTo();
          }
        });
      });
  }
  // -- redirect to purticular URL
  redirectTo() {
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
          const hasEmrPermission = userInfo.assigenedApplication.some(s => s.app_id === 6);

          if (userInfo.role_type === ApplicationEntityConstants.DOCTOR
            && _.find(userPermissions, (o) => o === PermissionsConstants.View_Queue)) {
            if (hasEmrPermission) {
              this.router.navigate(['/app/emr/dashboard/doctor']);
            } else {
              this.router.navigate(['/app/qms/qList']);
            }
          } else if (userInfo.role_type === ApplicationEntityConstants.FRONTDESK
            && _.find(userPermissions, (o) => o === PermissionsConstants.View_Front_Desk)) {
            if (hasEmrPermission) {
              this.router.navigate(['/app/emr/dashboard/admin']);
            } else {
              this.router.navigate(['/app/qms/dashboard/frontDesk']);
            }
          } else if (userInfo.role_type === ApplicationEntityConstants.ADMIN
            && _.find(userPermissions, (o) => o === PermissionsConstants.View_Admin_Dashboard)) {
            if (hasEmrPermission) {
              this.router.navigate(['/app/emr/dashboard/admin']);
            } else {
              this.router.navigate(['/app/qms/dashboard/admin']);
            }
          } else if (userInfo.role_type === ApplicationEntityConstants.SERVICE_OPERATOR
            && _.find(userPermissions, (o) => o === PermissionsConstants.View_Queue)) {
            if (hasEmrPermission) {
              this.router.navigate(['/app/emr/dashboard/admin']);
            } else {
              this.router.navigate(['/app/qms/qList']);
            }
          } else if (userInfo.role_type === ApplicationEntityConstants.NURSE) {
            if (hasEmrPermission) {
              this.router.navigate(['/app/emr/dashboard/nurse']);
            } else {
            this.router.navigate(['/app/emr/dashboard/doctor']);
            }
          } else {
            // let viewPermissions = _.find(this.userService.userPermission, (o) => { return o.indexOf('View - ') });
            const defaultUrl = '/login';
            this.router.navigate([defaultUrl]);
          }
        }
      } else {
        this.router.navigate(['/userMenus/userList']);
      }
    }
  }
}
