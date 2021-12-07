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
    private reportsService: ReportsService
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
    this.sideBarArray = [
      {
        linkKey: '',
        name: 'Home',
        isActive: false,
        cssClass: 'icon-home',
        permission: [PermissionsConstants.View_Admin_Dashboard,
        PermissionsConstants.View_DoctorDashboard,
        PermissionsConstants.View_Call_Center_Dashboard,
        PermissionsConstants.View_Front_Desk
        ],
        children: [
          {
            linkKey: 'dashboard/admin',
            name: 'Admin Dashboard',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-queue-setting',
            isVisible: true,
            permission: PermissionsConstants.View_Admin_Dashboard
          },
          {
            linkKey: 'dashboard/doctor',
            name: 'Doctor Dashboard',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-user-md',
            isVisible: true,
            permission: PermissionsConstants.View_DoctorDashboard
          },
          // {
          //   linkKey: 'dashboard/callCenter',
          //   name: 'Call Center Dashboard',
          //   isActive: false,
          //   isFavourite: false,
          //   cssClass: 'icon-user-headset',
          //   isVisible: true,
          //   permission: PermissionsConstants.View_Call_Center_Dashboard
          // },
          {
            linkKey: 'dashboard/frontDesk',
            name: 'Front Desk Dashboard',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-front-desk-dashboard',
            isVisible: true,
            permission: PermissionsConstants.View_Front_Desk
          },
          // {
          //   linkKey: 'entityUser',
          //   name: 'Entity User',
          //   isActive: false,
          //   isFavourite: false,
          //   cssClass: 'icon-dashboard',
          //   isVisible: true,
          //   permission: PermissionsConstants.View_EntityUser
          // }
        ]
      },
      {
        linkKey: 'scheduleSetting',
        name: 'Schedule',
        isActive: false,
        cssClass: 'icon-clipboard-list',
        permission: [PermissionsConstants.Add_Schedule,
        PermissionsConstants.View_Schedule,
        PermissionsConstants.View_Front_Desk_Entity_Mapping,
          //PermissionsConstants.Add_Front_Desk_Entity_Mapping,
        ],
        children: [
          {
            linkKey: 'schedule/addScheduleMaster',
            name: 'Add Schedule',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-notes-medical',
            isVisible: true,
            permission: PermissionsConstants.Add_Schedule
          },
          {
            linkKey: 'schedule/activeScheduleList',
            name: 'Schedule List',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-clipboard-list-check',
            isVisible: true,
            permission: PermissionsConstants.View_Schedule
          },
          {
            linkKey: 'schedule/updateTimeSchedule',
            name: 'Update Time Schedule',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-link',
            isVisible: false,
            permission: PermissionsConstants.Add_TimeSchedule
          },
          {
            linkKey: 'mapping/frontDeskentityMappingList',
            name: 'Front Desk Provider Mappings',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-front-desk-mapping',
            isVisible: true,
            permission: PermissionsConstants.View_Front_Desk_Entity_Mapping
          },
          {
            linkKey: 'mapping/frontDeskentityMapping',
            name: 'Add Front Desk Provider Mappings',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-front-desk-mapping',
            isVisible: false,
            permission: PermissionsConstants.Add_Front_Desk_Entity_Mapping
          }
        ]
      },
      {
        linkKey: 'queueSetting',
        name: 'Settings',
        isActive: false,
        cssClass: 'icon-queue-setting',
        permission: [PermissionsConstants.View_Room_Master,
        PermissionsConstants.View_Section_Master,
        // PermissionsConstants.Add_Section_Master,
        // PermissionsConstants.Update_Section_Master,
        PermissionsConstants.View_Room_Section_Mapping,
        // PermissionsConstants.Add_Room_Section_Mapping,
        PermissionsConstants.View_Room_Entity_Mapping,
        // PermissionsConstants.Update_Room_Entity_Mapping,
        // PermissionsConstants.Add_Room_Entity_Mapping,
        PermissionsConstants.View_Queue_Settings,
        PermissionsConstants.View_Time_Format_Settings,
        PermissionsConstants.View_Patient_Feedback_Settings,
        PermissionsConstants.View_Set_Feedback_Template,
        PermissionsConstants.View_Display_Field_Settings,
        PermissionsConstants.View_Templates,
        PermissionsConstants.View_Template_Mapping,
        PermissionsConstants.View_Reminder_Settings,
        PermissionsConstants.View_Display_Status_Settings,
        PermissionsConstants.View_Slot_Color_Settings,
        PermissionsConstants.View_App_Settings,
        PermissionsConstants.View_Section_Mapping_Details
        ],
        children: [
          {
            linkKey: 'room/roomList',
            name: 'Room Master',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-room',
            isVisible: true,
            permission: PermissionsConstants.View_Room_Master
          },
          {
            linkKey: 'location/locationList',
            name: 'Location Master',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-room',
            isVisible: true,
            permission: PermissionsConstants.Location_Master_View
          },
          {
            linkKey: 'section/sectionList',
            name: 'Section Master',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-chart-pie-alt',
            isVisible: true,
            permission: PermissionsConstants.View_Section_Master
          },
          {
            linkKey: 'section/addSection',
            name: 'Add Section',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-link',
            isVisible: false,
            permission: PermissionsConstants.Add_Section_Master
          },
          {
            linkKey: 'section/updateSection',
            name: 'Add Section',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-link',
            isVisible: false,
            permission: PermissionsConstants.Update_Section_Master
          },
          {
            linkKey: 'roomSection/roomSectionMapList',
            name: 'Room Section Mapping',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-room-section-map',
            isVisible: true,
            permission: PermissionsConstants.View_Room_Section_Mapping
          },
          {
            linkKey: 'roomSection/addRoomSectionMapping',
            name: 'Add Section Mapping',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-link',
            isVisible: false,
            permission: PermissionsConstants.Add_Room_Section_Mapping
          },
          {
            linkKey: `mapping/sectionDoctorMapping`,
            name: 'Section Mapping Details',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon fa-fw icon-room-section-map mr-1',
            isVisible: true,
            permission: PermissionsConstants.View_Section_Mapping_Details
          },
          {
            linkKey: 'entityRoom/entityRoomMapList',
            name: 'Room Provider Mapping',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-link',
            isVisible: true,
            permission: PermissionsConstants.View_Room_Entity_Mapping
          },
          {
            linkKey: 'entityRoom/updateEntityRoomMap',
            name: 'Room Provider Mapping',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-link',
            isVisible: false,
            permission: PermissionsConstants.Update_Room_Entity_Mapping
          },
          {
            linkKey: 'entityRoom/entityRoomMap',
            name: 'Add Provider Room',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-entity-room-map',
            isVisible: false,
            permission: PermissionsConstants.Add_Room_Entity_Mapping
          },
          // {
          //   linkKey: 'queueDisplaySettings',
          //   name: 'Display Settings',
          //   isActive: false,
          //   cssClass: 'icon-tv'
          // },
          // {
          //   linkKey: 'templates',
          //   name: 'Templates',
          //   isActive: false,
          //   isFavourite: false,
          //   cssClass: 'icon-templates',
          //   isVisible: true,
          //   permission: PermissionsConstants.View_Templates
          // },
          // {
          //   linkKey: 'templateMapping',
          //   name: 'Templates Mapping',
          //   isActive: false,
          //   isFavourite: false,
          //   cssClass: 'icon-templates-mapping',
          //   isVisible: true,
          //   permission: PermissionsConstants.View_Template_Mapping
          // },
          {
            linkKey: 'settings/settings_menu',
            name: 'Settings',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-cogs',
            isVisible: true,
            permission: PermissionsConstants.View_App_Settings
          },
        ]
      },
      {
        linkKey: 'appointments',
        name: 'Queue',
        isActive: false,
        cssClass: 'icon-calendar-day',
        permission: [PermissionsConstants.View_Queue,
        PermissionsConstants.View_Manage_Calendar,
        ],
        children: [
          {
            linkKey: 'qList',
            name: 'Queue List',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-queue-list',
            isVisible: true,
            permission: PermissionsConstants.View_Queue
          },
          {
            linkKey: 'appointments/settings/entitySettings',
            name: 'Manage Calendar',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-manage-calender',
            isVisible: true,
            permission: PermissionsConstants.View_Manage_Calendar
          }
        ]
      },
      {
        linkKey: 'patient',
        name: 'Patients',
        isActive: false,
        cssClass: 'icon-users',
        permission: [PermissionsConstants.Add_PatientMaster,
        PermissionsConstants.View_PatientMaster
        ],
        children: [
          {
            linkKey: 'patient/addPatient',
            name: 'Add Patient',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-user-plus',
            isVisible: true,
            permission: PermissionsConstants.Add_PatientMaster
          },
          {
            linkKey: 'patient/patientList',
            name: 'Patient List',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-users',
            isVisible: true,
            permission: PermissionsConstants.View_PatientMaster
          },
          {
            linkKey: 'patient/referpatientList',
            name: 'Refer Patient List',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-users',
            isVisible: !_.isUndefined(_.find(this.userInfo.assigenedApplication, (o) => o.app_name === 'EMR' && o.rights === true)) ? true : false,
            permission: PermissionsConstants.View_PatientMaster
          }
        ]
      },
      {
        linkKey: 'reports',
        name: 'Reports',
        isActive: false,
        cssClass: 'icon-reports',
        permission: [PermissionsConstants.View_Reports],
        children: []
      }
    ];

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
