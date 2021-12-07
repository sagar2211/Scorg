import { Component, Input, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NgxPermissionsService } from 'ngx-permissions';
import { AuthService } from 'src/app/public/services/auth.service';
import { CommonService } from 'src/app/public/services/common.service';

@Component({
  selector: 'app-discharge-patient-home',
  templateUrl: './discharge-patient-home.component.html',
  styleUrls: ['./discharge-patient-home.component.scss']
})
export class DischargePatientHomeComponent implements OnInit {
  @Input() showMenuType = 'fixed';
  constructor(
    private ngxPermissionsService: NgxPermissionsService,
    private commonService: CommonService,
    private authService: AuthService,
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
    this.commonService.showHideMainMenuFromNavBar(false);
    const userId = +this.authService.getLoggedInUserId();
    this.commonService.GetAssignedRolePermissionsByUserId_Promise(userId).then(res => {
      this.ngxPermissionsService.loadPermissions(this.commonService.userPermission);
    });
  }


}
