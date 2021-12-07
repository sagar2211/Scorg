import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ReportHomeComponent } from './components/report-home/report-home.component';
import { BookingSummeryComponent } from './components/booking-summery/booking-summery.component';
import { BookingComponent } from './components/booking/booking.component';
import { QueueSummeryComponent } from './components/queue-summery/queue-summery.component';
import { QueueListComponent } from './components/queue-list/queue-list.component';
import { SmsComponent } from './components/sms/sms.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { PatientAppointmentHistoryComponent } from './components/patient-appointment-history/patient-appointment-history.component';
import { ServiceSummaryComponent } from './components/service-summary/service-summary.component';
import { ServiceScheduleSummaryComponent } from './components/service-schedule-summary/service-schedule-summary.component';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { CommonService } from './../../services/common.service';
import { ReportsMenuComponent } from './components/reports-menu/reports-menu.component';

const reportsRoutes: Routes = [
  {
    path: '', component: ReportHomeComponent,
    children: [
      {
        path: '', redirectTo: 'patientAppointment', pathMatch: 'full'
      },
      {
        path: 'patientAppointment',
        component: ReportsMenuComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Patient Appointment', route: 'app/qms/reports/patientAppointment' },
          permissions: {
            only: PermissionsConstants.Patient_Appointment_View,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
      {
        // path: 'bookingReport',
        path: 'patientAppointmentTypeSummary',
        component: ReportsMenuComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Patient Appointment Type Summary', route: 'app/qms/reports/patientAppointmentTypeSummary' },
          permissions: {
            only: PermissionsConstants.Patient_Appointment_Type_Summary_View,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
      {
        path: 'queueReport',
        component: ReportsMenuComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Queue Report', route: 'app/qms/reports/queueReport' },
          permissions: {
            only: PermissionsConstants.Queue_Report_View,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
      {
        path: 'patientAppointmentHistory',
        component: ReportsMenuComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Patient Appointment History', route: 'app/qms/reports/patientAppointmentHistory' },
          permissions: {
            only: PermissionsConstants.Patient_Appointment_History_View,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
      {
        path: 'serviceScheduleSummary',
        component: ReportsMenuComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Service Schedule Summary', route: 'app/qms/reports/serviceScheduleSummary' },
          permissions: {
            only: PermissionsConstants.Service_Schedule_Summary_View,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
      {
        path: 'servicesSummary',
        component: ReportsMenuComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Services Summary', route: 'app/qms/reports/servicesSummary' },
          permissions: {
            only: PermissionsConstants.Service_Summary_View,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
      {
        path: 'userActivityReport',
        component: ReportsMenuComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'User Activity Report', route: 'app/qms/reports/userActivityReport' },
          permissions: {
            only: PermissionsConstants.User_Activity_Report_View ,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
      {
        path: 'userLoginLogReport',
        component: ReportsMenuComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'User Login Log Report', route: 'app/qms/reports/userLoginLogReport' },
          permissions: {
            only: PermissionsConstants.User_Login_Log_Report_View,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
      {
        path: 'roomSectionMappingReport',
        component: ReportsMenuComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Room Section Mapping Report', route: 'app/qms/reports/roomSectionMappingReport' },
          permissions: {
            only: PermissionsConstants.Room_Section_Mapping_Report_View,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
      {
        path: 'appointmentSlotwiseMisReport',
        component: ReportsMenuComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Appointment Slotwise MIS Report', route: 'app/qms/reports/appointmentSlotwiseMisReport' },
          permissions: {
            only: PermissionsConstants.Appointment_Slotwise_MIS_Report_View,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
      {
        path: 'entityHolidayReport',
        component: ReportsMenuComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Provider Holiday Report', route: 'app/qms/reports/entityHolidayReport' },
          permissions: {
            only: PermissionsConstants.Entity_Holiday_Report_View,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
      {
        path: 'patientMasterReport',
        component: ReportsMenuComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Patient Master Report', route: 'app/qms/reports/patientMasterReport' },
          permissions: {
            only: PermissionsConstants.Patient_Master_Report_View,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
      {
        path: 'roomEntityMappingReport',
        component: ReportsMenuComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Room Provider Mapping Report', route: 'app/qms/reports/roomEntityMappingReport' },
          permissions: {
            only: PermissionsConstants.Room_Entity_Mapping_Report_View,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
      {
        path: 'emailSmsTransactionReport',
        component: ReportsMenuComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Email Sms Transaction Report', route: 'app/qms/reports/emailSmsTransactionReport' },
          permissions: {
            only: PermissionsConstants.Email_SMS_Transaction_Report_View,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
    ]
  }];

@NgModule({
  declarations: [
    ReportHomeComponent,
    BookingSummeryComponent,
    BookingComponent,
    QueueSummeryComponent,
    QueueListComponent,
    SmsComponent,
    PatientAppointmentHistoryComponent,
    ServiceSummaryComponent,
    ServiceScheduleSummaryComponent,
    ReportsMenuComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(reportsRoutes),
    SharedModule
  ]
})
export class ReportsModule { }
