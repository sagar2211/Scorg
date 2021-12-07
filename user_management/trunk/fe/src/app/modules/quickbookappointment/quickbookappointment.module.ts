import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuickBookHomeComponent } from './components/quick-book-home/quick-book-home.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { CommonService } from 'src/app/services/common.service';
import { QuickBookAppointmentComponent } from './components/quick-book-appointment/quick-book-appointment.component';
import { PatientSharedModule } from '../patient-shared/patient-shared.module';

const appRoute: Routes = [
  {
    path: '', component: QuickBookHomeComponent,
    children: [
      {
        path: '', redirectTo: 'quickbookappointment'
      },
      {
        path: 'quickbookappointment',
        component: QuickBookAppointmentComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: {
            display: 'Quick Book Appointment',
            route: 'appointmentApp/appointments/book/quickbookappointment',
            redirectTo: '',
            isFilter: false, isAddPopup: false
          },
          permissions: {
            only: PermissionsConstants.View_Quick_Book_Appointment,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: [
            {
              displayName: 'FrontDesk Dashboard',
              routeLink: 'app/qms/dashboard/frontDesk',
              permission: PermissionsConstants.View_Front_Desk
            }
          ]
        }
      },
      {
        path: 'quickbookappointment/:eid/:evalueid',
        component: QuickBookAppointmentComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Quick Book Appointment',
          route: 'appointmentApp/appointments/book/quickbookappointment'
        },
          permissions: {
            only: PermissionsConstants.View_Quick_Book_Appointment,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      }
    ]
  }
];

@NgModule({
  declarations: [
    QuickBookHomeComponent,
    QuickBookAppointmentComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    RouterModule.forChild(appRoute),
    PatientSharedModule
  ]
})
export class QuickbookappointmentModule { }
