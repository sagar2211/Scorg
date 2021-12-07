import { Constants } from './../../config/constants';
import { IAlert } from './../../models/AlertMessage';
import { AuthService } from './../../services/auth.service';
import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  submitted = false;
  alertMsg: IAlert;
  isMailSent = false;
  loadForm: boolean;
  constructor(
    public fb: FormBuilder,
    public router: Router,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.loadForm = false;
    this.defaultFormObject();
  }

  defaultFormObject(): void {
    this.forgotPasswordForm = this.fb.group({
      user_name: ['', Validators.required]
    });
    this.loadForm = true;
  }
  get forgotPasswordFrmControls() {
    return this.forgotPasswordForm.controls;
  }
  forgotPassword(): void {
    this.submitted = true;
    const formValue = _.cloneDeep(this.forgotPasswordForm.value);
    const currentUrl = window.location;
    const reqObj = {
      login_id: formValue.user_name,
      page_link: currentUrl.origin + '/#/resetforgotpassword/'
    };
    this.authService.forgotPassword(reqObj).subscribe(res => {
      if (res.status_code === 200 && res.status_message === 'Email send successfully') {
        this.isMailSent = true;
        this.submitted = false;
        this.forgotPasswordForm.patchValue({ user_name: '' });
        this.alertMsg = {
          message: 'Link sent Successfully.',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
      } else if (res.status_message === 'Error' && res.status_code === 400) {
        this.alertMsg = {
          message: 'User name is invalid! plese enter valid user name.',
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
        this.submitted = false;
        this.forgotPasswordForm.patchValue({ user_name: '' });
      } else {
        this.alertMsg = {
          message: 'Somthing went wrong!',
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
      }
    });
  }

  cancelForgotPassword(): void {
    this.router.navigate(['/login']);
  }
}
