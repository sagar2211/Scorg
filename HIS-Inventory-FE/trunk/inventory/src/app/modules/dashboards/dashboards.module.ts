import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardsHomeComponent } from './components/dashboards-home/dashboards-home.component';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { PurchaseOrderDetailsComponent } from './components/purchase-order-details/purchase-order-details.component';
import { PurchaseGrnDetailsComponent } from './components/purchase-grn-details/purchase-grn-details.component';
import { PurchaseGdnDetailsComponent } from './components/purchase-gdn-details/purchase-gdn-details.component';

const dashboardsRoute: Routes = [
  {
    path: '', component: DashboardsHomeComponent,
    children: [
      {
        path: '', redirectTo: 'dashboard', pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardsHomeComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Dashboard',
          breadCrumInfo: {
            display: 'Dashboard', route: '/inventory/dashboard/suppliers', redirectTo: '',
            isFilter: true, isAddPopup: true
          },
          permissions: {
            only: PermissionsConstants.VIEW_DASHBOARD,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      },
    ]
  }
];
@NgModule({
  declarations: [
    DashboardsHomeComponent,
    PurchaseOrderDetailsComponent,
    PurchaseGrnDetailsComponent,
    PurchaseGdnDetailsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(dashboardsRoute),
  ]
})
export class DashboardsModule { }
