import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { AuthService } from 'src/app/public/services/auth.service';
@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})

export class ResetPasswordComponent implements OnInit {
  @Input() userData: any;
  submitted = false;
  alertMsg: IAlert;
  resetPasswordForm: FormGroup;
  showPassword;
  defaultPassword;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    public modal: NgbActiveModal
  ) { }

  ngOnInit() {
    this.resetPasswordForm = this.fb.group({
      password: ['', Validators.required]
    });
    this.getApplicationDefaultPassword();
  }
  get f() { return this.resetPasswordForm.controls; }
  getApplicationDefaultPassword() {
    this.authService.getAppDefaultPassword().subscribe(res => {
      if (res.status_message === 'Success') {
        this.defaultPassword = res.default_password;
        this.resetPasswordForm.setValue({ password: this.defaultPassword });
      }
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.resetPasswordForm.valid) {
      this.authService.resetUserPassword(this.resetPasswordForm.value.password, this.userData.user_id).subscribe(result => {
        if (result.status_message === 'Success') {
          this.alertMsg = {
            message: 'Password reset Successfully.',
            messageType: 'success',
            duration: 3000
          };
        } else {
          this.alertMsg = {
            message: 'Something went Wrong',
            messageType: 'danger',
            duration: 3000
          };
        }
        setTimeout(() => {
          this.modal.close('cancel click');
        }, 1000);
      });
    } else {
      return;
    }
  }

}
