import { Component, OnInit } from '@angular/core';
import {Constants} from '../../../../config/constants';
import {PermissionsConstants} from '../../../../shared/constants/PermissionsConstants';
import {AuthService} from '../../../../services/auth.service';
import {CommonService} from '../../../../services/common.service';
import {UsersService} from '../../../../services/users.service';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import * as _ from  'lodash';
@Component({
  selector: 'app-settings-menus',
  templateUrl: './settings-menus.component.html',
  styleUrls: ['./settings-menus.component.scss']
})
export class SettingsMenusComponent implements OnInit {
  settingKey = '';
  userInfo: any;
  settingsArray: any = {};

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private commonService: CommonService,
    private userService: UsersService
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.setChildSettingRoutes();
        this.checkCurrentActive();
      }
    });
  }

  ngOnInit() {
    this.commonService.routeChanged(this.route);
    this.setChildSettingRoutes();
  }

  checkCurrentActive() {
    let spiltCoutnt = 0;
    // if (this.router.url.includes('qms/schedule')) {
    //   spiltCoutnt = this.route.snapshot._urlSegment.segments.length - 4;
    // }
    spiltCoutnt = (Object.keys(this.route.snapshot.firstChild.params).length === 0 ?
      Object.keys(this.route.snapshot.firstChild.queryParams).length :
      Object.keys(this.route.snapshot.firstChild.params).length) + 1;

    const splitUrl = this.router.url.split('/')[this.router.url.split('/').length - spiltCoutnt];
    _.map(this.settingsArray.children, (child) => {
      const localKey = child.linkKey;
      if (splitUrl === localKey) {
        child.isActive = true;
      } else {
        child.isActive = false;
      }
    });
  }

  setChildSettingRoutes() {
    this.settingKey = Constants.DEFAULT_LANDING_PAGE;
    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    this.settingsArray = {
      permission: [
        PermissionsConstants.View_Queue_Settings,
        PermissionsConstants.View_Time_Format_Settings,
        PermissionsConstants.View_Patient_Feedback_Settings,
        PermissionsConstants.View_Set_Feedback_Template,
        PermissionsConstants.View_Display_Field_Settings,
        PermissionsConstants.View_Reminder_Settings,
        PermissionsConstants.View_Display_Status_Settings,
        PermissionsConstants.View_Slot_Color_Settings,
        PermissionsConstants.View_Display_Status_Settings,
      ],
      children: [
        {
          linkKey: 'queue',
          name: 'Queue',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-queue-setting',
          isVisible: true,
          permission: PermissionsConstants.View_Queue_Settings
        },
        {
          linkKey: 'timeFormate',
          name: 'Time Format',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-clock',
          isVisible: true,
          permission: PermissionsConstants.View_Time_Format_Settings
        },
        {
          linkKey: 'patientFeedback',
          name: 'Patient Feedback',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-patient-feedback',
          isVisible: true,
          permission: PermissionsConstants.View_Patient_Feedback_Settings
        },
        {
          linkKey: 'displayfield',
          name: 'Display Field',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-tv',
          isVisible: true,
          permission: PermissionsConstants.View_Display_Field_Settings
        },
        {
          linkKey: 'displaystatussetting',
          name: 'Display Status',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-display-status-settings',
          isVisible: true,
          permission: PermissionsConstants.View_Display_Status_Settings
        },
        {
          linkKey: 'appointmentslotssettings',
          name: 'Appointment Slots',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-manage-appointment',
          isVisible: true,
          permission: PermissionsConstants.Appointment_Slot_Setting_View
        },
        {
          linkKey: 'slotcolorsetting',
          name: 'Slot Color',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-slot-color',
          isVisible: true,
          permission: PermissionsConstants.View_Slot_Color_Settings
        },
        {
          linkKey: 'appointmentdisplaynamesetting',
          name: 'Appointment Status',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-appointment-status',
          isVisible: true,
          permission: PermissionsConstants.View_Display_Status_Settings
        },
        {
          linkKey: 'appointmentprioritysetting',
          name: 'Appointment Priority ',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-appointment-status',
          isVisible: true,
          permission: PermissionsConstants.View_Display_Status_Settings
        },
        {
          linkKey: 'reminder',
          name: 'Reminder Settings ',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-appointment-status',
          isVisible: true,
          // permission: PermissionsConstants.View_Display_Status_Settings
        }
      ]
    };
  }

}
