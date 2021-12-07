import { ChartService } from './../../services/chart.service';
import { QmsModule } from './../qms/qms.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { DashboardHomeComponent } from './components/dashboard-home/dashboard-home.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { DoctorDashboardComponent } from './components/doctor-dashboard/doctor-dashboard.component';
import { CallCenterDashboardComponent } from './components/call-center-dashboard/call-center-dashboard.component';
import { FrontDeskDashboardComponent } from './components/front-desk-dashboard/front-desk-dashboard.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { AdminDashboardDonutChartComponent } from '../dashboard/components/admin-dashboard-donut-chart/admin-dashboard-donut-chart.component';
import { AdminDashboardStackedBarChartComponent } from '../dashboard/components/admin-dashboard-stacked-bar-chart/admin-dashboard-stacked-bar-chart.component';
import { AdminDashboardMultilineChartComponent } from '../dashboard/components/admin-dashboard-multiline-chart/admin-dashboard-multiline-chart.component';
import { AdminDashboardMultiseriesBarChartComponent } from './components/admin-dashboard-multiseries-bar-chart/admin-dashboard-multiseries-bar-chart.component';
import { DashBoardService } from './services/dashboard.service';
import { ServiceEfficiencyLineChartComponent } from './components/service-efficiency-line-chart/service-efficiency-line-chart.component';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { CommonService } from './../../services/common.service';
import { MaterialModule } from './../material/material-module';
import { ChartsModule, ThemeService } from 'ng2-charts';
import { AdminOpdSlotSdGraphComponent } from './components/admin-opd-slot-sd-graph/admin-opd-slot-sd-graph.component';
import { QmsQlistLibModule } from '@qms/qlist-lib';
import { ScheduleMakerService } from '../schedule/services/schedule-maker.service';
import { EntitySettingsModule } from '../entity-settings/entity-settings.module';

const dashboardRoutes: Routes = [
  {
    path: '', component: DashboardHomeComponent,
    children: [
      {
        path: '', redirectTo: 'admin', pathMatch: 'full'
      },
      {
        path: 'admin',
        component: AdminDashboardComponent,
        // canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Admin Dashboard', breadCrumInfo: { display: 'Admin Dashboard', route: 'app/qms/dashboard/admin' },
          permissions: {
            only: PermissionsConstants.View_Admin_Dashboard,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
      {
        path: 'doctor',
        component: DoctorDashboardComponent,
        // canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Doctor Dashboard', route: 'app/qms/dashboard/doctor' },
          permissions: {
            only: PermissionsConstants.View_DoctorDashboard,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
      {
        path: 'callCenter',
        component: CallCenterDashboardComponent,
        // canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Call Center Dashboard', route: 'app/qms/dashboard/callCenter' },
          permissions: {
            only: PermissionsConstants.View_Call_Center_Dashboard,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
      {
        path: 'frontDesk',
        component: FrontDeskDashboardComponent,
        // canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Front Desk Dashboard', route: 'app/qms/dashboard/frontDesk' },
          permissions: {
            only: PermissionsConstants.View_Front_Desk,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
    ]
  }];

@NgModule({
  declarations: [
    DashboardHomeComponent,
    AdminDashboardComponent,
    DoctorDashboardComponent,
    CallCenterDashboardComponent,
    FrontDeskDashboardComponent,
    AdminDashboardDonutChartComponent,
    AdminDashboardStackedBarChartComponent,
    AdminDashboardMultilineChartComponent,
    AdminDashboardMultiseriesBarChartComponent,
    ServiceEfficiencyLineChartComponent,
    AdminOpdSlotSdGraphComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(dashboardRoutes),
    SharedModule,
    QmsModule,
    MaterialModule,
    ChartsModule,
    QmsQlistLibModule,
    EntitySettingsModule
  ],
  providers: [
    DashBoardService,
    ChartService,
    ScheduleMakerService,
    ThemeService
  ]
})
export class DashboardModule { }
