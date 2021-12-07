import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ReportHomeComponent } from './components/report-home/report-home.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from '../../config/PermissionsConstants';
import { CommonService } from '../../public/services/common.service';
import { ReportsMenuComponent } from './components/reports-menu/reports-menu.component';

const reportsRoutes: Routes = [
  {
    path: '', component: ReportHomeComponent,
    children: [
      {
        path: '', redirectTo: 'grnDateWise', pathMatch: 'full'
      },
      {
        path: 'grnDateWise',
        component: ReportsMenuComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'GRN Date Wise Report', route: '/inventory/reports/grnDateWise' },
          permissions: {
            only: PermissionsConstants.VIEW_GRN_DATEWISE_REPORT,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
      {
        path: 'grnItemWise',
        component: ReportsMenuComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'GRN Item Wise Report', route: '/inventory/reports/grnItemWise' },
          permissions: {
            // only: PermissionsConstants.GRN_Datewise_Report_View,
            only: PermissionsConstants.VIEW_GRN_ITEMWISE_REPORT,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
      {
        path: 'gdnDateWise',
        component: ReportsMenuComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'GDN Date Wise Report', route: '/inventory/reports/gdnDateWise' },
          permissions: {
            // only: PermissionsConstants.GRN_Datewise_Report_View,
            only: PermissionsConstants.VIEW_GDN_DATEWISE_REPORT,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
      {
        path: 'gdnItemWise',
        component: ReportsMenuComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'GDN Item Wise Report', route: '/inventory/reports/gdnItemWise' },
          permissions: {
            // only: PermissionsConstants.GRN_Datewise_Report_View,
            only: PermissionsConstants.VIEW_GDN_ITEMWISE_REPORT,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
      {
        path: 'issue',
        component: ReportsMenuComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Issue Report', route: '/inventory/reports/issue' },
          permissions: {
            // only: PermissionsConstants.GRN_Datewise_Report_View,
            only: PermissionsConstants.VIEW_ISSUE_REPORT,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
      {
        path: 'issueItemWIse',
        component: ReportsMenuComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: {display: 'Issue Item wise Report', route: '/inventory/reports/issueItemWIse'},
          permissions: {
            // only: PermissionsConstants.GRN_Datewise_Report_View,
            only: PermissionsConstants.VIEW_ISSUE_ITEM_WISE_REPORT,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        }
      },
      {
        path: 'issueReturn',
        component: ReportsMenuComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Issue Return Report', route: '/inventory/reports/issueReturn' },
          permissions: {
            // only: PermissionsConstants.GRN_Datewise_Report_View,
            only: PermissionsConstants.VIEW_ISSUE_RETURN_REPORT,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
      {
        path: 'stockReorder',
        component: ReportsMenuComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Stock Reorder Report', route: '/inventory/reports/stockReorder' },
          permissions: {
            // only: PermissionsConstants.GRN_Datewise_Report_View,
            only: PermissionsConstants.VIEW_STOCK_REORDER_REPORT,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
      {
        path: 'stockExpDate',
        component: ReportsMenuComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Stock Expiry Date Report', route: '/inventory/reports/stockExpDate' },
          permissions: {
            // only: PermissionsConstants.GRN_Datewise_Report_View,
            only: PermissionsConstants.VIEW_STOCK_EXPIRY_DATE_REPORT,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
      {
        path: 'stock',
        component: ReportsMenuComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Stock  Report', route: '/inventory/reports/stock' },
          permissions: {
            // only: PermissionsConstants.GRN_Datewise_Report_View,
            only: PermissionsConstants.VIEW_STOCK_REPORT,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
      {
        path: 'openingStock',
        component: ReportsMenuComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Opening Stock Report', route: '/inventory/reports/openingStock' },
          permissions: {
            // only: PermissionsConstants.GRN_Datewise_Report_View,
            only: PermissionsConstants.VIEW_OPENING_STOCK_REPORT,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
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
    SharedModule
  ]
})
export class ReportsModule { }
