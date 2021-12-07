import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { PurchaseReturnAddUpdateComponent } from './components/purchase-return-add-update/purchase-return-add-update.component';
import { PurchaseReturnListHomeComponent } from './components/purchase-return-list-home/purchase-return-list-home.component';
import { PurchaseReturnListComponent } from './components/purchase-return-list/purchase-return-list.component';

const routes: Routes = [
  {
    path : '', component : PurchaseReturnListHomeComponent,
    children  : [
      {
        path: '', redirectTo: 'purchaseReturnList'
      },
      {
        path: 'purchaseReturnList',
        component: PurchaseReturnListComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
            displayName: 'GDN List',
            breadCrumInfo: {
                display: 'GDN List', route: '/inventory/transactions/gdn/purchaseReturnList', redirectTo: '',
                isFilter: false, isAddPopup: true
            },
            permissions: {
                only: PermissionsConstants.VIEW_GDN,
                redirectTo: CommonService.redirectToIfNoPermission
            },
            relatedLinks: []
        }
    },
    {
        path: 'addUpdatePurchaseReturns/:id',
        component: PurchaseReturnAddUpdateComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
            displayName: 'Manage Purchase Returns',
            breadCrumInfo: {
                display: 'Manage Purchase Returns', route: '/inventory/transactions/gdn/addUpdatePurchaseReturns', redirectTo: '',
                isFilter: false, isAddPopup: false
            },
            permissions: {
                only: PermissionsConstants.ADD_GDN,
                redirectTo: CommonService.redirectToIfNoPermission
            },
            relatedLinks: []
        }
    }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GdnRoutingModule { }
