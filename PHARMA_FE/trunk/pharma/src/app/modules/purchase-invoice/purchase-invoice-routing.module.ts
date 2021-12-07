import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { PurchaseInvoiceAddUpdateComponent } from './components/purchase-invoice-add-update/purchase-invoice-add-update.component';
import { PurchaseInvoiceHomeComponent } from './components/purchase-invoice-home/purchase-invoice-home.component';
import { PurchaseInvoiceListComponent } from './components/purchase-invoice-list/purchase-invoice-list.component';

const piroutes: Routes = [
    {
        path : '',
        component : PurchaseInvoiceHomeComponent,
        children : [
            {
                path : '',
                redirectTo : 'purchaseInvoiceList',
            },
            {
                path: 'purchaseInvoiceList',
                component: PurchaseInvoiceListComponent,
                canActivate: [NgxPermissionsGuard],
                data: {
                    displayName: 'Purchase Invoice List',
                    breadCrumInfo: {
                        display: 'Purchase Invoice List',
                        route: '/inventory/transactions/purchaseInvoice/purchaseInvoiceList',
                        redirectTo: '/inventory/transactions/purchaseInvoice/purchaseInvoiceAddUpdate/-1',
                        isFilter: false, isAddPopup: true
                    },
                    permissions: {
                        only: PermissionsConstants.VIEW_PURCHASE_INVOICE,
                        redirectTo: CommonService.redirectToIfNoPermission
                    },
                    relatedLinks: []
                }
            },
            {
                path: 'purchaseInvoiceAddUpdate/:id',
                component: PurchaseInvoiceAddUpdateComponent,
                canActivate: [NgxPermissionsGuard],
                data: {
                    displayName: 'Purchase Invoice Add Update',
                    breadCrumInfo: {
                        display: 'Purchase Invoice Add Update', route: '',
                        redirectTo: '',
                        isFilter: false, isAddPopup: false
                    },
                    permissions: {
                        only: PermissionsConstants.ADD_PURCHASE_INVOICE,
                        redirectTo: CommonService.redirectToIfNoPermission
                    },
                    relatedLinks: []
                }
            },
        ]
    }
];

@NgModule({
  imports: [RouterModule.forChild(piroutes)],
  exports: [RouterModule]
})
export class PurchaseInvoiceRoutingModule { }
