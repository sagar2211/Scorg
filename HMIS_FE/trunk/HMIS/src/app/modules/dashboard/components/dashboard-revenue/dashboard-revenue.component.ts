import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxPermissionsService } from 'ngx-permissions';
import { AuthService } from 'src/app/public/services/auth.service';
import { CommonService } from 'src/app/public/services/common.service';
import { UsersService } from 'src/app/public/services/users.service';

@Component({
  selector: 'app-dashboard-revenue',
  templateUrl: './dashboard-revenue.component.html',
  styleUrls: ['./dashboard-revenue.component.scss']
})
export class DashboardRevenueComponent implements OnInit {

  isTotalRevenueVisible: boolean;
  isOPPatientVisible: boolean;
  isIPPatientVisible: boolean;
  isMobile = window.innerWidth <= 768 ? true : false;
  dashboardData = null;
  loadDashboard = false;
  appKey = 'billing';
  isPartialLoad = false;

  constructor(
    private commonService: CommonService,
    private usersService: UsersService,
    private authService: AuthService,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private userService: UsersService,
    private permissionsService: NgxPermissionsService,
  ) {
  }

  ngOnInit(): void {
    this.activeRoute.paramMap.subscribe(data => {
      const token = data.get('token');
      this.appKey = data.get('appKey');
      if (token) {
        this.isPartialLoad = true;
        this.loginThroghSSO(token).then(res1 => {
          this.loadDashboard = false;
          this.isTotalRevenueVisible = false;
          this.isOPPatientVisible = false;
          this.isIPPatientVisible = false;
          this.getRevenueData();
        });
      }
      else
      {
        this.loadDashboard = false;
        this.isTotalRevenueVisible = false;
        this.isOPPatientVisible = false;
        this.isIPPatientVisible = false;
        this.getRevenueData();
      }
    })
  }

  loginThroghSSO(token) {
    const promise = new Promise((resolve, reject) => {
      this.authService.loginThroghSSO(token).subscribe(res => {
        if (res.status_message === 'Success') {
          const userObject = res.data;
          this.commonService.storeKeyValues = [];
          this.commonService.userListTempParams = null;
          this.commonService.getScheduleDataParams = null;
          this.userService.masterUserDetails = {};
          this.authService.redirectUrl = null;
          // store login info to local storage
          this.authService.storeLoginInfo(userObject);
          this.assignRoleAndRedirect(userObject);
          resolve(true);
        } else if (res) {
          resolve(false);
        }
      });
    });
    return promise;
  }

  assignRoleAndRedirect(userObject): void {
    const appId = this.authService.getAppIdByAppKey(this.appKey);
    this.userService.GetAssignedRolePermissionsByUserId(userObject.id, appId)
      .subscribe((result) => {
        const userPermission = this.userService.userPermission;
        this.permissionsService.loadPermissions(userPermission);
      });
  }

  showTotalRevenueDetail() {
    this.isTotalRevenueVisible = !this.isTotalRevenueVisible;
  }

  showOPPatientDetail() {
    this.isOPPatientVisible = !this.isOPPatientVisible;
  }

  showIPPatientDetail() {
    this.isIPPatientVisible = !this.isIPPatientVisible;
  }

  updateOtherEvent(val, evt) {
    if (val === 'isTotalRevenueVisible') {
      this.isTotalRevenueVisible = evt;
      this.isOPPatientVisible = false;
      this.isIPPatientVisible = false;
    } else if (val === 'isOPPatientVisible') {
      this.isTotalRevenueVisible = false;
      this.isOPPatientVisible = evt;
      this.isIPPatientVisible = false;
    } else if (val === 'isIPPatientVisible') {
      this.isTotalRevenueVisible = false;
      this.isOPPatientVisible = false;
      this.isIPPatientVisible = evt;
    }
    this.commonService.updateRevnewDashboardDetailShow(val);
  }

  getRevenueData() {
    this.usersService.getAllRevenueDashboardData().subscribe(res => {
      this.dashboardData = res;
      this.loadDashboard = true;
      console.log(res);
    })
  }
}
