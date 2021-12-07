import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { PurchaseOrderHomeComponent } from './components/purchase-order-home/purchase-order-home.component';
import { PurchaseOrderListComponent } from './components/purchase-order-list/purchase-order-list.component';
import { AddUpdatePurchaseOrderComponent } from './components/add-update-purchase-order/add-update-purchase-order.component';

const routes: Routes = [
  {
    path : '', component : PurchaseOrderHomeComponent,
    children: [
      {
        path: '', redirectTo: 'purchaseOrders'
      },
      {
          path: 'purchaseOrders',
          component: PurchaseOrderListComponent,
          canActivate: [NgxPermissionsGuard],
          data: {
              breadCrumInfo: {},
              permissions: {
                  only: PermissionsConstants.VIEW_PURCHASE_ORDER,
                  redirectTo: CommonService.redirectToIfNoPermission
              },
              relatedLinks: []
          }
      },
      {
        path: 'addPurchaseOrder',
        component: AddUpdatePurchaseOrderComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
            displayName: 'Add PO',
            breadCrumInfo: {
                display: 'Add PO', route: '/inventory/transactions/po/addPurchaseOrder', redirectTo: '',
                isFilter: false, isAddPopup: false
            },
            permissions: {
                only: PermissionsConstants.ADD_PURCHASE_ORDER,
                redirectTo: CommonService.redirectToIfNoPermission
            },
            relatedLinks: []
        }
    },
    {
      path: 'addCopyPurchaseOrder/:purOrdrId',
      component: AddUpdatePurchaseOrderComponent,
      canActivate: [NgxPermissionsGuard],
      data: {
          displayName: 'Add PO',
          breadCrumInfo: {
              display: 'Add PO', route: '/inventory/transactions/po/addPurchaseOrder', redirectTo: '',
              isFilter: false, isAddPopup: false
          },
          permissions: {
              only: PermissionsConstants.ADD_PURCHASE_ORDER,
              redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
      }
  },
    {
        path: 'editPurchaseOrder/:purOrdrId',
        component: AddUpdatePurchaseOrderComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
            displayName: 'Edit PO',
            breadCrumInfo: {
                display: 'Edit PO', route: '/inventory/transactions/po/editPurchaseOrder/:purOrdrId', redirectTo: '',
                isFilter: false, isAddPopup: false
            },
            permissions: {
                only: PermissionsConstants.UPDATE_PURCHASE_ORDER,
                redirectTo: CommonService.redirectToIfNoPermission
            },
            relatedLinks: []
        }
    },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PurchaseOrdersRoutingModule { }
