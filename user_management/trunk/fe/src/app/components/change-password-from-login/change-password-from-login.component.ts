
import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-change-password-from-login',
  templateUrl: './change-password-from-login.component.html',
  styleUrls: ['./change-password-from-login.component.scss']
})
export class ChangePasswordFromLoginComponent implements OnInit {

  constructor(
    public router: Router,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    const userInfo = this.authService.getUserInfoFromLocalStorage();
    if (userInfo) {

    } else {
      this.router.navigate(['/login']);
    }
  }



}
