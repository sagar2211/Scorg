import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { StockReportHomeComponent } from './components/stock-report-home/stock-report-home.component';
import { ReportsMenuComponent } from "../reports/components/reports-menu/reports-menu.component";

const routes: Routes = [
  {
    path : '',
    component : StockReportHomeComponent,
    children : [
      {
        path : '',
        redirectTo : 'stockReorder'
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
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StockReportRoutingModule { }
