import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../public/services/auth.service';
import * as _ from 'lodash';
import { Constants } from '../config/constants';
import { IAlert } from '../public/models/AlertMessage';

@Component({
  selector: 'app-reset-forgot-password',
  templateUrl: './reset-forgot-password.component.html',
  styleUrls: ['./reset-forgot-password.component.scss']
})
export class ResetForgotPasswordComponent implements OnInit {
  resetForgotPasswordForm: FormGroup;
  submitted = false;
  errorMsg: string;
  showNewPassword;
  showConfirmPassword;
  alertMsg: IAlert;
  resetPasswordUserId: number;
  validateToken: string;
  isResetPassword = false;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private activeRoute: ActivatedRoute,
    private router: Router
    ) { }

  ngOnInit() {
    this.validateToken = this.activeRoute.snapshot.params.id;
    this.resetForgotPasswordForm = this.fb.group({
      new_password: ['', Validators.required],
      confirm_password: ['', Validators.required]
    }, { validators: this.authService.matchConfirmPassword });

    this.showNewPassword = false;
    this.showConfirmPassword = false;
    console.log(this.resetForgotPasswordForm);
    const reqObj = {
      token: this.validateToken
    };
    this.authService.validateTokenToResetPassword(reqObj).subscribe(res => {
      if (res.status_message === 'Invalid token') {
        this.router.navigate(['./']);
        this.alertMsg = {
          message: 'Reset password link has been expired.',
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
      } else {
        this.resetPasswordUserId = res.userid;
      }
    });
  }

  get resetForgotPasswordFormControls() {
    return this.resetForgotPasswordForm.controls;
  }

  onSubmit() {
     this.submitted = true;
     if (this.resetForgotPasswordForm.valid) {
      const reqObj = {
        user_id: this.resetPasswordUserId,
        password: this.resetForgotPasswordForm.controls.confirm_password.value,
        token: this.validateToken
      };
      this.authService.ResetForgottedPassword(reqObj).subscribe(res => {
        if (res.status_message === 'Success' && res.message === 'Password changed successfully') {
          this.submitted = false;
          this.isResetPassword = true;
          this.alertMsg = {
            message: 'Password reset successfully.',
            messageType: 'success',
            duration: Constants.ALERT_DURATION
          };
          //this.router.navigate(['./']);
        } else if (res.status_message === 'Success' && res.message !== 'Password changed successfully') {
          this.submitted = false;
          this.resetForgotPasswordForm.patchValue({ new_password: '', confirm_password: '' });
          this.alertMsg = {
            message: 'New password should be different than your last 3 passwords.',
            messageType: 'warning',
            duration: Constants.ALERT_DURATION
          };
        }
      });
    }
  }

}
