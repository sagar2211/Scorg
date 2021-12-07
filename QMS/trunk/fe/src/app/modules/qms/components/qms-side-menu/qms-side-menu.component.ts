import { CommonService } from 'src/app/services/common.service';
import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { AuthService } from './../../../../services/auth.service';
import { Constants } from './../../../../config/constants';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { NgxPermissionsService } from 'ngx-permissions';
import { UsersService } from './../../../../services/users.service';
import { ReportsService } from "../../../reports/services/reports.service";
import { ReportMenuRoutingDetails } from "../../../reports/models/report-menus-model";
import { SideMenuService } from 'src/app/services/sidemenu.service';

@Component({
  selector: 'app-qms-side-menu',
  templateUrl: './qms-side-menu.component.html',
  styleUrls: ['./qms-side-menu.component.scss']
})
export class QmsSideMenuComponent implements OnInit {

  sideBarArray = [];
  userInfo: any;
  settingKey = '';
  favouriteMenusList: Array<any> = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private commonService: CommonService,
    private userService: UsersService,
    private permissionsService: NgxPermissionsService,
    private reportsService: ReportsService,
    private sideMenuService: SideMenuService,
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.checkCurrentActive();
      }
    });
  }

  ngOnInit() {
    this.settingKey = Constants.DEFAULT_LANDING_PAGE;
    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    this.sideBarArray = this.sideMenuService.sideMenuListQms;

    this.commonService.getQueueSettings(this.settingKey, this.userInfo.user_id).subscribe(res => {
      if (res) {
        this.favouriteMenusList = res;
        this.favouriteMenusList.forEach((fav: any) => {
          const i = this.sideBarArray.findIndex(r => r.linkKey === fav.parentMenu && fav.masterModule === 'qms');
          if (i !== -1) {
            this.sideBarArray[i].children.forEach(e => {
              const childKey = fav.favouriteRouteUrl.split('/')[fav.favouriteRouteUrl.split('/').length - 1];
              const localKey = e.linkKey.split('/')[e.linkKey.split('/').length - 1];
              if (localKey === childKey) {
                e.isFavourite = true;
              } else {
                e.isFavourite = false;
              }
            });
          } else {

          }
        });
      }
    });
    this.checkCurrentActive();
    this.getReportsMenus();
  }

  checkCurrentActive() {
    let spiltCoutnt = 0;
    // if (this.router.url.includes('qms/schedule')) {
    //   spiltCoutnt = this.route.snapshot._urlSegment.segments.length - 4;
    // }
    spiltCoutnt = (Object.keys(this.route.snapshot.firstChild.params).length === 0 ?
      Object.keys(this.route.snapshot.firstChild.queryParams).length :
      Object.keys(this.route.snapshot.firstChild.params).length) + 1;

    const isAnyParentActive = !!(_.find(this.sideBarArray, (o) => o.isActive === true));
    const splitUrl = this.router.url.split('/')[this.router.url.split('/').length - spiltCoutnt];
    _.map(this.sideBarArray, (v) => {
      v.isActive = (isAnyParentActive) ? v.isActive : false;
      _.map(v.children, (child) => {
        const localKey = child.linkKey.split('/')[child.linkKey.split('/').length - 1];
        if (splitUrl === localKey) {
          child.isActive = true;
          v.isActive = (isAnyParentActive) ? v.isActive : true;
        } else {
          child.isActive = false;
        }
      });
    });
  }

  updateParentActive(index) {
    _.map(this.sideBarArray, (v) => {
      v.isActive = false;
    });
    this.sideBarArray[index].isActive = true;
  }

  saveFavourite(parentItem, childItem, $event): void {
    $event.stopPropagation();
    parentItem.children.forEach(c => {
      c.isFavourite = false;
    });
    childItem.isFavourite = true;
    const indx = this.favouriteMenusList.findIndex(f => f.parentMenu === parentItem.linkKey && f.masterModule === 'qms');
    if (indx !== -1) {
      this.favouriteMenusList[indx].favouriteRouteUrl = 'app/qms/' + childItem.linkKey;
    } else {
      this.favouriteMenusList.push({
        masterModule: 'qms',
        parentMenu: parentItem.linkKey,
        favouriteRouteUrl: 'app/qms/' + childItem.linkKey
      });
    }
    this.commonService.SaveQueueSettings(this.settingKey, JSON.stringify(this.favouriteMenusList), this.userInfo.user_id).subscribe();
  }

  onMenuClick(parentUrl): void {
    const indx = this.favouriteMenusList.findIndex(f => f.parentMenu === parentUrl.linkKey && f.masterModule === 'qms');
    // check user has permission or not of fav. menu
    if (indx !== -1) {
      const userPermissions = [...this.userService.userPermission];
      const menuList = _.find(this.sideBarArray, (o) => { return o.linkKey == this.favouriteMenusList[indx].parentMenu; });
      const subMenu = menuList ? _.find(menuList.children, (o) => { return this.favouriteMenusList[indx].favouriteRouteUrl.endsWith('app/qms/' + o.linkKey) }) : undefined;
      if (subMenu) {
        let permission = _.find(userPermissions, (o) => { return o == subMenu.permission; })
        if (permission)
          this.router.navigate([this.favouriteMenusList[indx].favouriteRouteUrl]);
      } else {
        this.router.navigate([this.favouriteMenusList[indx].favouriteRouteUrl]);
      }
    }
  }

  getReportsMenus(): void {
    this.reportsService.getReportsMenu().subscribe(res => {
      if (res && res.length) {
        const reportsMenuDetails = [];
        _.map(res, (menu) => {
          const obj: ReportMenuRoutingDetails = {
            linkKey: 'reports/' + menu.menuKey,
            name: menu.menuName,
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-clipboard-list-check',
            isVisible: true,
            permission: this.setReportPermission(menu.menuKey)
          };
          reportsMenuDetails.push(obj);
        });
        const index = this.sideBarArray.findIndex(r => r.linkKey === 'reports');
        if (index !== -1) {
          this.sideBarArray[index].children = reportsMenuDetails;
        }
      }
    });
  }

  setReportPermission(key) {
    let permission = '';
    switch (key) {
      case 'patientAppointment':
        permission = PermissionsConstants.Patient_Appointment_View;
        break;
      case 'patientAppointmentTypeSummary':
        permission = PermissionsConstants.Patient_Appointment_Type_Summary_View;
        break;
      case 'queueReport':
        permission = PermissionsConstants.Queue_Report_View;
        break;
      case 'patientAppointmentHistory':
        permission = PermissionsConstants.Patient_Appointment_History_View;
        break;
      case 'serviceScheduleSummary':
        permission = PermissionsConstants.Service_Schedule_Summary_View;
        break;
      case 'servicesSummary':
        permission = PermissionsConstants.Service_Summary_View;
        break;
      case 'userActivityReport':
        permission = PermissionsConstants.User_Activity_Report_View;
        break;
      case 'userLoginLogReport':
        permission = PermissionsConstants.User_Login_Log_Report_View;
        break;
      case 'appointmentSlotwiseMisReport':
        permission = PermissionsConstants.Appointment_Slotwise_MIS_Report_View;
        break;
      case 'entityHolidayReport':
        permission = PermissionsConstants.Entity_Holiday_Report_View;
        break;
      case 'patientMasterReport':
        permission = PermissionsConstants.Patient_Master_Report_View;
        break;
      case 'roomEntityMappingReport':
        permission = PermissionsConstants.Room_Entity_Mapping_Report_View;
        break;
      case 'emailSmsTransactionReport':
        permission = PermissionsConstants.Email_SMS_Transaction_Report_View;
        break;
      case 'roomSectionMappingReport':
        permission = PermissionsConstants.Room_Section_Mapping_Report_View;
        break;

    }
    return permission;
  }

}
