import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommunicationHomeComponent } from './components/communication-home/communication-home.component';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { CommonService } from 'src/app/public/services/common.service';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { PatientBulkNotificationComponent } from './components/patient-bulk-notification/patient-bulk-notification.component';
import { PatientListNotificationComponent } from './components/patient-list-notification/patient-list-notification.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { PatientNotificationService } from './services/patient-notification.service';
import { TemplatesService } from './services/templates.service';
import { PatientNotificationStatusComponent } from './components/patient-notification-status/patient-notification-status.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

const communicationRoute: Routes = [
  {
    path: '', component: CommunicationHomeComponent,
    children: [
      {
        path: '', redirectTo: 'patientbulksms', pathMatch: 'full'
      },
      {
        path: 'patientbulksms',
        component: PatientBulkNotificationComponent,
        // canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'PatientBulk SMS',
          breadCrumInfo: {
            display: 'Bulk SMS Notification',
            route: 'app/qms/communication/patientbulksms'
          },
          // permissions: {
          //   only: PermissionsConstants.Add_PatientMaster,
          //   redirectTo: CommonService.redirectToIfNoPermission
          // },
        }
      },
      {
        path: 'patientnotificationstatus',
        component: PatientNotificationStatusComponent,
        // canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Patient Notification Status',
          breadCrumInfo: { display: 'Patient Notification Status', route: 'app/qms/communication/patientnotificationstatus' },
          // permissions: {
          //   only: PermissionsConstants.Add_PatientMaster,
          //   redirectTo: CommonService.redirectToIfNoPermission
          // },
        }
      },
      {
        path: 'templates',
        // canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.QMS_APP_MENU,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('./../../modules/communication-templates/communication-templates.module').then(m => m.CommunicationTemplatesModule)
      },
      {
        path: 'eventCommunication',
        // canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.QMS_APP_MENU,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('./../../modules/event-communication/event-communication.module').then(m => m.EventCommunicationModule)
      }
    ],
  }
];

@NgModule({
  declarations: [
    CommunicationHomeComponent,
    PatientBulkNotificationComponent,
    PatientListNotificationComponent,
    PatientNotificationStatusComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(communicationRoute),
    NgxDatatableModule,
    BsDatepickerModule.forRoot(),
  ],
  providers: [
    PatientNotificationService,
    TemplatesService,
    NgbActiveModal
  ]
})
export class CommunicationModule { }
