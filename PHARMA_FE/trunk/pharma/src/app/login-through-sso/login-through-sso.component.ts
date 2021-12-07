import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { CommonService } from './../public/services/common.service';
import { AuthService } from './../public/services/auth.service';
import { environment } from 'src/environments/environment';
import { MappingService } from '../public/services/mapping.service';
import { UsersService } from '../public/services/users.service';
import { SideMenuService } from '../public/services/sidemenu.service';

@Component({
  selector: 'app-login-through-sso',
  templateUrl: './login-through-sso.component.html',
  styleUrls: ['./login-through-sso.component.scss']
})
export class LoginThroughSSOComponent implements OnInit {
  token: string;
  appId: number;
  submitted = false;
  redirectUrl: string;
  errorMsg: string;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private commonService: CommonService,
    private mappingService: MappingService,
    private userService: UsersService,
    private sideMenuService: SideMenuService,
  ) { }

  ngOnInit(): void {
    // console.log('LoginThroughSSOComponent');
    this.commonService.showHideAppLoader(true);
    this.activatedRoute.paramMap.subscribe(res => {
      // console.log('LoginThroughSSOComponent', res);
      this.token = res.get('token');
      this.loginThroghSSO();
    });
  }

  loginThroghSSO(): void {
    this.authService.loginThroghSSO(this.token).subscribe(res => {
      if (res.status_message === 'Success') {
        // localStorage.setItem('globals', JSON.stringify(res.data));
        const userObject = res.data;
        // clear old user data from service
        this.commonService.storeKeyValues = [];
        this.commonService.userListTempParams = null;
        this.commonService.getScheduleDataParams = null;
        this.commonService.masterUserDetails = {};
        this.authService.redirectUrl = null;
        // store login info to local storage
        this.authService.storeLoginInfo(userObject);
        // check if store details exist
        if (!userObject.hasOwnProperty('storeId')) {
          this.GetUserStoreMappingByUserId(userObject.id);
        } else {
          const userPermissions = [...this.userService.userPermission];
          const userInfo = this.authService.getUserInfoFromLocalStorage();
          this.sideMenuService.redirectToApp(userPermissions, userInfo);
        }
      } else if (res) {
        let loginPageUrl = environment.SSO_LOGIN_URL;
        loginPageUrl = environment.production && loginPageUrl ? loginPageUrl : window.location.origin;
        window.open(loginPageUrl, '_self');
      }
    });
  }

  // -- redirect to purticular URL
  redirectTo(userObject?): void {
    if (this.authService.isLoggedIn()) {
      if (this.authService.isUserLoggedIn()) {
        if (this.redirectUrl) { // -- go to previous attempt url
          this.router.navigate([this.redirectUrl]);
          this.redirectUrl = null;
        } else {
          this.router.navigate(['emr/dashboard']);
        }
      }
    }
  }

  GetUserStoreMappingByUserId(userId): void {
    this.mappingService.GetUserStoreMappingByUserId(userId).subscribe(res => {
      const stores = res;
      if (!stores.length) {
        this.router.navigate(['/noStore']);
      } else if (stores.length === 1) {
        this.authService.setStoreDetails(stores[0]);
        const userPermissions = [...this.userService.userPermission];
        const userInfo = this.authService.getUserInfoFromLocalStorage();
        this.sideMenuService.redirectToApp(userPermissions, userInfo);
      } else {
        this.router.navigate(['/selectStore']);
      }
    });
  }
}
