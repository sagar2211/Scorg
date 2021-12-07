import { Component, OnInit } from '@angular/core';
import { NgxPermissionsService } from 'ngx-permissions';
import { AuthService } from 'src/app/public/services/auth.service';
import { CommonService } from 'src/app/public/services/common.service';

@Component({
  selector: 'app-emr-settings-main-home',
  templateUrl: './emr-settings-main-home.component.html',
  styleUrls: ['./emr-settings-main-home.component.scss']
})
export class EmrSettingsMainHomeComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private commonService: CommonService,
    private ngxPermissionsService: NgxPermissionsService,
  ) { }

  ngOnInit(): void {
    this.authService.setActiveAppKey('emr-settings');
    localStorage.setItem('loginFor', JSON.stringify('emr-settings'));
    this.ngxPermissionsService.loadPermissions(this.commonService.userPermission);
  }

}
