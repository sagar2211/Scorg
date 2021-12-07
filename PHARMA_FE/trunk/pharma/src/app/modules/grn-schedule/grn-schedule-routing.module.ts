import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { GrnScheduleHomeComponent } from './components/grn-schedule-home/grn-schedule-home.component';
import { ReportsMenuComponent } from '../reports/components/reports-menu/reports-menu.component';

const routes: Routes = [
  {
    path : '',
    component : GrnScheduleHomeComponent,
    children : [
      {
        path : '',
        redirectTo : 'grnDateWise'
      },
      {
        path: 'grnDateWise',
        component: ReportsMenuComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'GRN Date Wise Report', route: '/inventory/reports/grnSchedule/grnDateWise' },
          permissions: {
            only: PermissionsConstants.VIEW_GRN_DATEWISE_REPORT,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        }
      },
      {
        path: 'grnItemWise',
        component: ReportsMenuComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'GRN Item Wise Report', route: '/inventory/reports/grnSchedule/grnItemWise' },
          permissions: {
            // only: PermissionsConstants.GRN_Datewise_Report_View,
            only: PermissionsConstants.VIEW_GRN_ITEMWISE_REPORT,
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
export class GrnScheduleRoutingModule { }
