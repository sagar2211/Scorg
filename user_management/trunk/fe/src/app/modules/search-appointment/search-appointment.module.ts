import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchHomeComponent } from './components/search-home/search-home.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { CommonService } from 'src/app/services/common.service';
import { AppointmentComponent } from './components/appointment/appointment.component';
import { AppointmentViewComponent } from './components/appointment-view/appointment-view.component';
import { AvailableAppointmentDisplayComponent } from './components/available-appointment-display/available-appointment-display.component';
import { UserCalendarModule } from '../user-calendar/user-calendar.module';
import { PatientSharedModule } from '../patient-shared/patient-shared.module';

const serchRoute: Routes = [
  {
    path: '', component: SearchHomeComponent,
    children: [
      {
        path: '', redirectTo: 'searchAppointment'
      },
      {
        path: 'searchAppointment',
        component: AppointmentComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: {
            display: 'Quick Book', route: 'appointmentApp/appointments/searchAppointment', redirectTo: '',
            isFilter: false, isAddPopup: true, btntext: 'ADD PATIENT'
          },
          permissions: {
            only: PermissionsConstants.View_Call_Center_View,
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
          ]
        }
      },
    ]
  }
];

@NgModule({
  declarations: [
    SearchHomeComponent,
    AppointmentComponent,
    AppointmentViewComponent,
    AvailableAppointmentDisplayComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    RouterModule.forChild(serchRoute),
    UserCalendarModule,
    PatientSharedModule
  ]
})
export class SearchAppointmentModule { }
