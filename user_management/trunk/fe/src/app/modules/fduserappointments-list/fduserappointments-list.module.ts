import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListHomeComponent } from './components/list-home/list-home.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { CommonService } from 'src/app/services/common.service';
import { FduserAppointmentlistComponent } from './components/fduser-appointmentlist/fduser-appointmentlist.component';
import { PatientSharedModule } from '../patient-shared/patient-shared.module';


const appRoute: Routes = [
  {
    path: '', component: ListHomeComponent,
    children: [
      {
        path: '', redirectTo: 'fduserappointmentsList'
      },
      {
        path: 'fduserappointmentsList',
        component: FduserAppointmentlistComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: {
            display: 'Manage all Appointments',
            route: 'appointmentApp/appointments/listfd/fduserappointmentsList',
            redirectTo: 'appointmentApp/appointments/book/quickbookappointment',
            isFilter: true, isAddPopup: true
          },
          permissions: {
            only: PermissionsConstants.View_Manage_All_Appointments,
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
    ]
  }
];

@NgModule({
  declarations: [
    ListHomeComponent,
    FduserAppointmentlistComponent
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
export class FduserappointmentsListModule { }
