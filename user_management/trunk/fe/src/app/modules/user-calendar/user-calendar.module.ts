import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarHomeComponent } from './components/calendar-home/calendar-home.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { CommonService } from 'src/app/services/common.service';
import { CalendarComponent } from './components/calendar/calendar.component';
import { FlatpickrModule } from 'angularx-flatpickr';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { CalendarControlsComponent } from './components/calendar-controls/calendar-controls.component';
import { PrintReportsModule } from '../print-reports/print-reports.module';

const calRoute: Routes = [
  {
    path: '', component: CalendarHomeComponent,
    children: [
      {
        path: '', redirectTo: 'calendar', pathMatch: 'full'
      },
      {
        path: 'calendar',
        component: CalendarComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: {
            display: 'Calendar', route: 'app/qms/calendarUser/appointments/calendar', isFilter: true, isAddPopup: false
          },
          permissions: {
            only: PermissionsConstants.View_Calendar_View,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: [
            {
              displayName: 'Manage Appointment',
              routeLink: 'appointmentApp/appointments/appointmentsList',
              permission: PermissionsConstants.View_Manage_Appointment
            },
            {
              displayName: 'Manage Calendar',
              routeLink: 'appointmentApp/appointments/settings/entitySettings',
              permission: PermissionsConstants.View_Manage_Calendar
            },
            {
              displayName: 'Queue List',
              routeLink: 'app/qms/qList',
              permission: PermissionsConstants.View_Queue
            },
            {
              displayName: 'Doctor Dashboard',
              routeLink: 'app/qms/dashboard/doctor',
              permission: PermissionsConstants.View_DoctorDashboard
            }
          ]
        },
      },
    ]
  }
];

@NgModule({
  declarations: [
    CalendarHomeComponent,
    CalendarComponent,
    CalendarControlsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    RouterModule.forChild(calRoute),
    FlatpickrModule.forRoot(),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    PrintReportsModule,
  ],
  exports: [
    CalendarComponent,
    CalendarControlsComponent
  ]
})
export class UserCalendarModule { }
