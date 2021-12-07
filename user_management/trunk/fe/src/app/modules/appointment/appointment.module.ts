import { ScheduleMakerService } from './../schedule/services/schedule-maker.service';
import { Routes, Router, RouterModule } from '@angular/router';
import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentHomeComponent } from './components/appointment-home/appointment-home.component';
import { AppointmentsMenuComponent } from './components/appointments-menu/appointments-menu.component';
import { CalendarService } from './../../services/calendar.service';
import { QueueService } from 'src/app/modules/qms/services/queue.service';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { CommonService } from './../../services/common.service';
import { AuthGuard } from 'src/app/auth/auth.guard';

const appoitnmentRoutes: Routes = [
  {
    path: '', component: AppointmentHomeComponent,
    children: [
      {
        path: '', redirectTo: 'search', pathMatch: 'full'
      },
      {
        path: 'settings',
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.View_Room_Master,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('../../modules/entity-settings/entity-settings.module').then(m => m.EntitySettingsModule)
      },
      {
        path: 'calendarUser',
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.View_Room_Master,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('../../modules/user-calendar/user-calendar.module').then(m => m.UserCalendarModule)
      },
      {
        path: 'search',
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.View_Room_Master,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('../../modules/search-appointment/search-appointment.module').then(m => m.SearchAppointmentModule)
      },
      {
        path: 'list',
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.View_Room_Master,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('../../modules/appointments-list/appointments-list.module').then(m => m.AppointmentsListModule)
      },
      {
        path: 'listfd',
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.View_Room_Master,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('../../modules/fduserappointments-list/fduserappointments-list.module').then(m => m.FduserappointmentsListModule)
      },
      {
        path: 'book',
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.View_Room_Master,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('../../modules/quickbookappointment/quickbookappointment.module').then(m => m.QuickbookappointmentModule)
      },
    ]
  }];

@NgModule({
  declarations: [
    AppointmentHomeComponent,
    AppointmentsMenuComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(appoitnmentRoutes),
  ],
  exports: [RouterModule],
  providers: [CalendarService, QueueService, ScheduleMakerService]
})
export class AppointmentModule { }
