import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardHomeComponent } from './components/dashboard-home/dashboard-home.component';
import { SharedModule } from './../shared/shared.module';
import { DoctorDashboardComponent } from './components/doctor-dashboard/doctor-dashboard.component';
// import { ChartService } from './../public/services/chart.service';
import { NgxPermissionsGuard, NgxPermissionsModule } from 'ngx-permissions';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AdminDashboardDonutChartComponent } from './components/admin-dashboard-donut-chart/admin-dashboard-donut-chart.component';
import { AdminDashboardMultilineChartComponent } from './components/admin-dashboard-multiline-chart/admin-dashboard-multiline-chart.component';
import { AdminDashboardMultiseriesBarChartComponent } from './components/admin-dashboard-multiseries-bar-chart/admin-dashboard-multiseries-bar-chart.component';
import { AdminDashboardStackedBarChartComponent } from './components/admin-dashboard-stacked-bar-chart/admin-dashboard-stacked-bar-chart.component';
import { ServiceEfficiencyLineChartComponent } from './components/service-efficiency-line-chart/service-efficiency-line-chart.component';
// import { QmsQlistLibModule } from '@qms/qlist-lib';
import { NurseDashboardComponent } from './components/nurse-dashboard/nurse-dashboard.component';
import { ChartService } from './../public/services/chart.service';
import { QueueService } from './../public/services/queue.service';
import { DashBoardService } from './services/dashboard.service';
import { DashboardOtPatientComponent } from './components/dashboard-ot-patient/dashboard-ot-patient.component';
import { PermissionsConstants } from '../config/PermissionsConstants';
import { CommonService } from '../public/services/common.service';
import { DashboardOtPatientInfoComponent } from './components/dashboard-ot-patient-info/dashboard-ot-patient-info.component';

const dashboardRoutes: Routes = [
  {
    path: '', redirectTo: 'doctor', pathMatch: 'full'
  },
  {
    path: 'doctor',
    component: DoctorDashboardComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      breadCrumInfo: {},
      permissions: {
        only: PermissionsConstants.Doctor_Dashboard_View,
        redirectTo: CommonService.redirectToIfNoPermission
      }
    },
  },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      breadCrumInfo: { display: 'Admin Dashboard', route: 'dashboard/admin' },
      permissions: {
        only: PermissionsConstants.Admin_Dashboard_View,
        redirectTo: CommonService.redirectToIfNoPermission
      }
    },
  },
  {
    path: 'nurse',
    component: NurseDashboardComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      breadCrumInfo: { display: 'Nurse Dashboard', route: 'dashboard/Nurse' },
      permissions: {
        only: PermissionsConstants.Nurse_Dashboard_View,
        redirectTo: CommonService.redirectToIfNoPermission
      }
    },
  }
];
@NgModule({
  declarations: [
    DashboardHomeComponent,
    DoctorDashboardComponent,
    AdminDashboardComponent,
    AdminDashboardDonutChartComponent,
    AdminDashboardMultilineChartComponent,
    AdminDashboardMultiseriesBarChartComponent,
    AdminDashboardStackedBarChartComponent,
    ServiceEfficiencyLineChartComponent,
    NurseDashboardComponent,
    DashboardOtPatientComponent,
    DashboardOtPatientInfoComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(dashboardRoutes),
    SharedModule
  ],
  providers: [QueueService, ChartService, DashBoardService],
  schemas: [
    NO_ERRORS_SCHEMA,
    CUSTOM_ELEMENTS_SCHEMA
  ]

})
export class DashboardModule { }
