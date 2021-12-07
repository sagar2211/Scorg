import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ReportHomeComponent } from './components/report-home/report-home.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from '../../config/PermissionsConstants';
import { CommonService } from '../../public/services/common.service';
import { ReportsMenuComponent } from './components/reports-menu/reports-menu.component';
import { DxDataGridModule, DxTemplateModule } from 'devextreme-angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

const reportsRoutes: Routes = [
  {
    path: '', component: ReportHomeComponent,
    children: [
      {
        path: '', redirectTo: 'grnDateWise', pathMatch: 'full'
      },
      {
        path: 'grnSchedule',
        canActivate: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.VIEW_GRN_DATEWISE_REPORT,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('../grn-schedule/grn-schedule.module').then(m => m.GrnScheduleModule)
      },
      {
        path: 'gdnReport',
        canActivate: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.VIEW_GDN_DATEWISE_REPORT,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('../gdn-report/gdn-report.module').then(m => m.GdnReportModule)
      },
      {
        path: 'issueReport',
        canActivate: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.VIEW_GDN_DATEWISE_REPORT,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('../issue-report/issue-report.module').then(m => m.IssueReportModule)
      },
      {
        path: 'stockReport',
        canActivate: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.VIEW_GDN_DATEWISE_REPORT,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('../stock-report/stock-report.module').then(m => m.StockReportModule)
      },
      {
        path: 'prescription',
        canActivate: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.VIEW_GDN_DATEWISE_REPORT,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('../prescription/prescription.module').then(m => m.PrescriptionModule)
      },
      {
        path: 'itemLedger',
        component: ReportsMenuComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Item Ledger', route: '/inventory/reports/itemLedger' },
          permissions: {
            // only: PermissionsConstants.GRN_Datewise_Report_View,
            only: PermissionsConstants.VIEW_ITEM_LEDGER,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
    ]
  }];

@NgModule({
  declarations: [
    ReportHomeComponent,
    ReportsMenuComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(reportsRoutes),
    SharedModule,
    DxDataGridModule,
    DxTemplateModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ReportsModule { }
