import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { GdnReportHomeComponent } from './components/gdn-report-home/gdn-report-home.component';
import { ReportsMenuComponent } from "../reports/components/reports-menu/reports-menu.component";

const routes: Routes = [
  {
    path : '',
    component : GdnReportHomeComponent,
    children : [
      {
        path : '',
        redirectTo : 'gdnDateWise'
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
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GdnReportRoutingModule { }
