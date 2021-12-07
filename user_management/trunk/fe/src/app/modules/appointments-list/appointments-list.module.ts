import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentsListHomeComponent } from './components/appointments-list-home/appointments-list-home.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { CommonService } from 'src/app/services/common.service';
import { PrintReportsModule } from '../print-reports/print-reports.module'
import { CancelappointmentComponent } from './components/cancelappointment/cancelappointment.component';
import { PatientSharedModule } from '../patient-shared/patient-shared.module';

const appRoute: Routes = [
  {
    path: '', component: AppointmentsListHomeComponent,
    children: [
      {
        path: '', redirectTo: 'appointmentsList'
      },
      {
        path: 'appointmentsList',
        component: CancelappointmentComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: {
            display: 'Appointment List', route: 'appointmentApp/appointments/appointmentsList', redirectTo: '',
            isFilter: true, isAddPopup: true, btntext: 'ADD PATIENT'
          },
          permissions: {
            only: PermissionsConstants.View_Manage_Appointment,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: [
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
    AppointmentsListHomeComponent,
    CancelappointmentComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    RouterModule.forChild(appRoute),
    PrintReportsModule,
    PatientSharedModule
  ]
})
export class AppointmentsListModule { }
