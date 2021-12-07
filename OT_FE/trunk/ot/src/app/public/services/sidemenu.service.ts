
import { Injectable, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class SideMenuService {

  constructor(
    private router: Router,
  ) { }

  sideMenuList = [
    {
      linkKey: 'home',
      name: 'Dashboard',
      isActive: false,
      cssClass: 'icon-home',
      permission: [PermissionsConstants.OT_Room_View
      ],
      children: [
        {
          linkKey: 'ot/dashboards/dashboard',
          name: 'OT Dashboard',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-queue-setting',
          isVisible: true,
          permission: PermissionsConstants.OT_Room_View
        },
      ]
    },
    {
      linkKey: 'master',
      name: 'Master',
      isActive: false,
      cssClass: 'icon-masters',
      permission: [PermissionsConstants.OT_Room_View,
      PermissionsConstants.OT_Parameter_View
      ],
      children: [
        {
          linkKey: 'ot/master/roomMasterList',
          name: 'OT Room Master',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-masters',
          isVisible: true,
          permission: PermissionsConstants.OT_Room_View
        },
        {
          linkKey: 'ot/parameter/parameterList/list',
          name: 'Pre-Op Parameters Master',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-list',
          isVisible: true,
          permission: PermissionsConstants.OT_Parameter_View
        },
      ]
    },
    {
      linkKey: 'schedule',
      name: 'Schedule',
      isActive: false,
      cssClass: 'icon-calendar-alt',
      permission: [PermissionsConstants.Patient_Schedule_View
      ],
      children: [
        {
          linkKey: 'ot/schedule/ot-scheduler',
          name: 'OT Scheduler',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-calendar-alt',
          isVisible: true,
          permission: PermissionsConstants.Patient_Schedule_View
        }
      ]
    },
    {
      linkKey: 'patients',
      name: 'Patients',
      isActive: false,
      cssClass: 'icon-patients',
      permission: [PermissionsConstants.Patient_Add,
      PermissionsConstants.Patient_View
      ],
      children: [
        {
          linkKey: 'ot/patientData/patientList',
          name: 'Patient List',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-list',
          isVisible: true,
          permission: PermissionsConstants.Patient_Add
        },
        {
          linkKey: 'ot/patientData/addPatient',
          name: 'Add Patient',
          isActive: false,
          isFavourite: false,
          cssClass: 'fa-plus',
          isVisible: true,
          permission: PermissionsConstants.Patient_View
        }
      ]
    },
    {
      linkKey: 'otlist',
      name: 'OT List',
      isActive: false,
      cssClass: 'icon-list',
      permission: [PermissionsConstants.OT_Check_List_View,
      PermissionsConstants.OT_Register_View,
      PermissionsConstants.OT_Register_Add
      ],
      children: [
        {
          linkKey: 'ot/checkList/paramCheck',
          name: 'Pre Operative Check List',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-list',
          isVisible: true,
          permission: PermissionsConstants.OT_Check_List_View
        },
        {
          linkKey: 'ot/register/list',
          name: 'OT Register List',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-list',
          isVisible: true,
          permission: PermissionsConstants.OT_Register_View
        },
        {
          linkKey: 'ot/register/registerPatient/-1/add',
          name: 'OT Register',
          isActive: false,
          isFavourite: false,
          cssClass: 'fa-plus',
          isVisible: true,
          permission: PermissionsConstants.OT_Register_Add
        }
      ]
    },
    {
      linkKey: 'settings',
      name: 'Settings',
      isActive: false,
      cssClass: 'icon-cogs',
      permission: [PermissionsConstants.OT_Room_View
      ],
      children: [
        {
          linkKey: 'ot/settings/setting',
          name: 'OT Settings',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-cogs',
          isVisible: true,
          permission: PermissionsConstants.OT_Room_View
        },
      ]
    },
  ];

  redirectToApp(userPermissions, userInfo): void {
    //   const userPermissions = [...this.userService.userPermission];
    // const userInfo = this.authService.getUserInfoFromLocalStorage();
    const appData = _.find(userInfo.assigenedApplication, d => {
      return d.app_key === 'OT';
    });
    if (appData && appData.primary_permission && _.find(userPermissions, (o) => o === appData.primary_permission.name)) {
      const check = this.redirecToLanding(appData.primary_permission.name);
      if (check.link && check.redirect) {
        this.router.navigate(['/otApp/ot/' + check.link]);
      } else {
        this.router.navigate(['/otApp/welcome']);
      }
    } else {
      this.router.navigate(['/otApp/welcome']);
    }
  }

  redirecToLanding(permissionName) {
    const menuList = this.sideMenuList;
    let obj = {
      link: null,
      redirect: false
    }
    let loopRun = true;
    _.map(menuList, (main, mi) => {
      _.map(main.children, (child, ci) => {
        if (child.permission && child.permission === permissionName && loopRun) {
          loopRun = false;
          obj.redirect = true;
          obj.link = child.linkKey;
        }
      })
    });
    return obj;
  }
}
