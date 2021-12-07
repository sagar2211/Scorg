import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { PurchaseRecieptListComponent } from './components/purchase-reciept-list/purchase-reciept-list.component';
import { GrnHomeComponent } from './components/grn-home/grn-home.component';
import { CommonService } from 'src/app/public/services/common.service';
import { PurchaseRecieptAddComponent } from "./components/purchase-reciept-add/purchase-reciept-add.component";
import { PurchaseRecieptUpdateComponent } from "./components/purchase-reciept-update/purchase-reciept-update.component";

const routes: Routes = [
  {
    path: '', component: GrnHomeComponent,
    children: [
      {
        path: '', redirectTo: 'purchaseRecieptList'
      },
      {
        path: 'purchaseRecieptList',
        component: PurchaseRecieptListComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: {},
          permissions: {
            only: PermissionsConstants.VIEW_GRN,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
      {
        path: 'purchaseRecieptAdd/:id',
        component: PurchaseRecieptAddComponent,
        canActivate: [NgxPermissionsGuard],
                data: {
                    displayName: 'GRN List',
                    breadCrumInfo: {
                        display: 'GRN List',
                        route: '/inventory/transactions/grn/purchaseRecieptList',
                        redirectTo: '/inventory/transactions/grn/purchaseRecieptUpdate/-1',
                        isFilter: false, isAddPopup: true
                    },
                    permissions: {
                        only: PermissionsConstants.VIEW_GRN,
                        redirectTo: CommonService.redirectToIfNoPermission
                    },
                    relatedLinks: []
                }
    },
    {
      path: 'purchaseRecieptUpdate/:id',
      component: PurchaseRecieptUpdateComponent,
      canActivate: [NgxPermissionsGuard],
      data: {
          displayName: 'GRN Add/Update',
          breadCrumInfo: {},
          permissions: {
              only: PermissionsConstants.ADD_GRN,
              redirectTo: CommonService.redirectToIfNoPermission
          }
      }
  },
    {
      path: 'purchaseRecieptCopy/:id',
      component: PurchaseRecieptUpdateComponent,
      canActivate: [NgxPermissionsGuard],
      data: {
          displayName: 'GRN Add/Copy',
          breadCrumInfo: {},
          permissions: {
              only: PermissionsConstants.ADD_GRN,
              redirectTo: CommonService.redirectToIfNoPermission
          }
      }
  },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GrnListRoutingModule { }
