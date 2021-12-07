import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NgxPermissionsService } from 'ngx-permissions';
import { AuthService } from 'src/app/public/services/auth.service';
import { CommonService } from 'src/app/public/services/common.service';

@Component({
  selector: 'app-emr-setting-home',
  templateUrl: './emr-setting-home.component.html',
  styleUrls: ['./emr-setting-home.component.scss']
})
export class EmrSettingHomeComponent implements OnInit {
  showMenuType: string;
  constructor(
    private ngxPermissionsService: NgxPermissionsService,
    private authService: AuthService,
    private commonService: CommonService,
    private router: Router
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if ((event.url.includes('/patient/')
          || event.url.includes('opd')
          || event.url.includes('ipd'))) {
          this.showMenuType = 'slide';
        }
        else {
          this.showMenuType = 'fixed';
        }
        this.commonService.showHideMenuIconNavbar(this.showMenuType === 'slide' ? true : false);
      }
    });
  }

  ngOnInit(): void {
    localStorage.setItem('loginFor', JSON.stringify('emr-settings'));
    const userId = +this.authService.getLoggedInUserId();
    this.commonService.GetAssignedRolePermissionsByUserId_Promise(userId).then(res => {
      this.ngxPermissionsService.loadPermissions(this.commonService.userPermission);
    });
  }

}
