import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { SettingHomeComponent } from './components/setting-home/setting-home.component';
import { QmsQueueSettingsComponent } from './components/qms-queue-settings/qms-queue-settings.component';
import { TimeFormatSettingComponent } from './components/time-format-setting/time-format-setting.component';
import { FeedbackSendSettingComponent } from './components/feedback-send-setting/feedback-send-setting.component';
import { DisplayFieldSettingsComponent } from './components/display-field-settings/display-field-settings.component';
import { FieldSettingsComponent } from './components/field-settings/field-settings.component';
import { DoctorFieldSettingsComponent } from './components/doctor-field-settings/doctor-field-settings.component';
import { TemplatesService } from 'src/app/modules/qms/services/templates.service';
import { DisplayStatusMsgSettingComponent } from './components/display-status-msg-setting/display-status-msg-setting.component';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { AppointmentSlotsSettingsComponent } from './components/appointment-slots-settings/appointment-slots-settings.component';
import { CommonService } from './../../services/common.service';
import { SlotColorSettingComponent } from './components/slot-color-setting/slot-color-setting.component';
import { SettingsMenusComponent } from './components/settings-menus/settings-menus.component';
import {Constants} from "../../config/constants";
import { ApplicationSettingsComponent } from './components/application-settings/application-settings.component';
import { AppointmentStatusDisplayNameComponent } from './components/appointment-status-display-name/appointment-status-display-name.component';
import { AppointmentPrioritySettingComponent } from './components/appointment-priority-setting/appointment-priority-setting.component';
import { MaterialModule } from '../material/material-module';
import { ReminderSettingsComponent } from './components/reminder-settings/reminder-settings.component';


const settingsRoutes: Routes = [
  {
    path: '', component: SettingHomeComponent,
    children: [
      {
        path: '', redirectTo: 'settings_menu', pathMatch: 'full'
      },
      {
        path: 'settings_menu',
        component: SettingsMenusComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Settings',
          breadCrumInfo: { display: 'Settings', route: '/app/qms/settings/settings_menu' },
          permissions: {
            only: PermissionsConstants.View_App_Settings,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        children: [
          {
            path: '', redirectTo: 'appointmentslotssettings', pathMatch: 'full'
          },
          {
            path: 'queue',
            component: QmsQueueSettingsComponent,
            canActivate: [NgxPermissionsGuard],
            data: {
              displayName: 'Queue Settings',
              breadCrumInfo: { display: 'Queue Settings', route: '/app/qms/settings/settings_menu/queue' },
              permissions: {
                only: PermissionsConstants.View_Queue_Settings,
                redirectTo: Constants.DEFAULT_LANDING_SETTING_PATH
              }
            }
          },
          {
            path: 'timeFormate',
            component: TimeFormatSettingComponent,
            canActivate: [NgxPermissionsGuard],
            data: {
              displayName: 'Time Format Setting',
              breadCrumInfo: { display: 'Time Format Setting', route: '/app/qms/settings/settings_menu/timeFormate' },
              permissions: {
                only: PermissionsConstants.View_Time_Format_Settings,
                redirectTo: CommonService.redirectToIfNoPermission
              }
            }
          },
          {
            path: 'patientFeedback',
            component: FeedbackSendSettingComponent,
            canActivate: [NgxPermissionsGuard],
            data: {
              displayName: 'Patient Feedback Setting',
              breadCrumInfo: { display: 'Patient Feedback Setting', route: '/app/qms/settings/settings_menu/patientFeedback' },
              permissions: {
                only: PermissionsConstants.View_Patient_Feedback_Settings,
                redirectTo: Constants.DEFAULT_LANDING_SETTING_PATH
              }
            }
          },
          {
            path: 'displayfield',
            component: DisplayFieldSettingsComponent,
            canActivate: [NgxPermissionsGuard],
            data: {
              displayName: 'Display Field Settings',
              breadCrumInfo: { display: 'Display Field Setting', route: '/app/qms/settings/settings_menu/displayfield' },
              permissions: {
                only: PermissionsConstants.View_Display_Field_Settings,
                redirectTo: Constants.DEFAULT_LANDING_SETTING_PATH
              }
            }
          },
          {
            path: 'displaystatussetting',
            component: DisplayStatusMsgSettingComponent,
            canActivate: [NgxPermissionsGuard],
            data: {
              displayName: 'Display Status Settings',
              breadCrumInfo: { display: 'Display Status Settings', route: '/app/qms/settings/settings_menu/displaystatussetting' },
              permissions: {
                only: PermissionsConstants.View_Display_Status_Settings,
                redirectTo: Constants.DEFAULT_LANDING_SETTING_PATH
              }
            }
          },
          {
            path: 'appointmentslotssettings',
            component: AppointmentSlotsSettingsComponent,
            canActivate: [NgxPermissionsGuard],
            data: {
              displayName: 'Appointment Slots Setting',
              breadCrumInfo: { display: 'Appointment Slots Setting', route: '/app/qms/settings/settings_menu/appointmentslotssettings' },
              permissions: {
                only: PermissionsConstants.View_Display_Status_Settings,
                redirectTo: Constants.DEFAULT_LANDING_SETTING_PATH
              }
            }
          },
          {
            path: 'slotcolorsetting',
            component: SlotColorSettingComponent,
            canActivate: [NgxPermissionsGuard],
            data: {
              displayName: 'Slot Color Setting',
              breadCrumInfo: { display: 'Slot Color Setting', route: '/app/qms/settings/settings_menu/slotcolorsetting' },
              permissions: {
                only: PermissionsConstants.View_Slot_Color_Settings,
                redirectTo: Constants.DEFAULT_LANDING_SETTING_PATH
              }
            }
          },
          {
            path: 'applicationSettings',
            component: ApplicationSettingsComponent,
            data: {
              breadCrumInfo: { display: 'Application Setting', route: 'app/qms/settings/settings_menu/applicationSettings' },
              permissions: {
                only: PermissionsConstants.Application_Settings_View,
                redirectTo: Constants.DEFAULT_LANDING_SETTING_PATH
              }
            },
          },
          {
            path: 'appointmentdisplaynamesetting',
            component: AppointmentStatusDisplayNameComponent,
            data:{
              permissions: {
              only: PermissionsConstants.View_Display_Status_Settings
              }
            }
          },
          {
            path: 'appointmentprioritysetting',
            component: AppointmentPrioritySettingComponent,
            data: {
              permissions: {
              only: PermissionsConstants.View_Display_Status_Settings
              }
            }
          },
          {
            path: 'reminder',
            component: ReminderSettingsComponent,
            data: {
              displayName: 'Reminder Settings',
              breadCrumInfo: {
                display: 'Patient Notification Status',
                route: 'app/qms/communication/patientnotificationstatus'
              },
              // permissions: {
              //   only: PermissionsConstants.Add_PatientMaster,
              //   redirectTo: CommonService.redirectToIfNoPermission
              // },
            }
          }
        ]
      },
    ]
  }];

@NgModule({
  declarations: [
    SettingHomeComponent,
    QmsQueueSettingsComponent,
    TimeFormatSettingComponent,
    FeedbackSendSettingComponent,
    DisplayFieldSettingsComponent,
    FieldSettingsComponent,
    DoctorFieldSettingsComponent,
    DisplayStatusMsgSettingComponent,
    AppointmentSlotsSettingsComponent,
    SlotColorSettingComponent,
    SettingsMenusComponent,
    ApplicationSettingsComponent,
    AppointmentStatusDisplayNameComponent,
    AppointmentPrioritySettingComponent,
    ReminderSettingsComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(settingsRoutes),
    SharedModule,
    MaterialModule
  ],
  providers: [TemplatesService]
})
export class SettingsModule { }
