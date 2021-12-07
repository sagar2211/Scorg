import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { TransactionsHomeComponent } from './components/transactions-home/transactions-home.component';

const transactionRoutes: Routes = [
    {
        path: '', component: TransactionsHomeComponent,
        children: [
            {
                path: '', redirectTo: 'po', pathMatch: 'full'
            },
            {
                path: 'po',
                canActivate: [NgxPermissionsGuard],
                data: {
                    breadCrumInfo: {},
                    permissions: {
                        only: PermissionsConstants.VIEW_GRN,
                        redirectTo: CommonService.redirectToIfNoPermission
                    },
                    relatedLinks: []
                },
                loadChildren: () => import('../purchase-orders/purchase-orders.module').then(m => m.PurchaseOrdersModule)
            },
            {
                path: 'grn',
                canActivate: [NgxPermissionsGuard],
                data: {
                    breadCrumInfo: {},
                    permissions: {
                        only: PermissionsConstants.VIEW_GRN,
                        redirectTo: CommonService.redirectToIfNoPermission
                    },
                    relatedLinks: []
                },
                loadChildren: () => import('../grn/grn.module').then(m => m.GrnListModule)
            },
            {
                path: 'gdn',
                canActivate: [NgxPermissionsGuard],
                data: {
                    breadCrumInfo: {},
                    permissions: {
                        only: PermissionsConstants.VIEW_GDN,
                        redirectTo: CommonService.redirectToIfNoPermission
                    },
                    relatedLinks: []
                },
                loadChildren: () => import('../gdn/gdn.module').then(m => m.GdnModule)
            },
            {
                path: 'purchaseInvoice',
                canActivate: [NgxPermissionsGuard],
                data: {
                    breadCrumInfo: {},
                    permissions: {
                        only: PermissionsConstants.VIEW_GDN,
                        redirectTo: CommonService.redirectToIfNoPermission
                    },
                    relatedLinks: []
                },
                loadChildren: () => import('../purchase-invoice/purchase-invoice.module').then(m => m.PurchaseInvoiceModule)
            }
        ]
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(transactionRoutes),
    ],
    exports: [RouterModule]
})
export class TransactionsRouteModule { }
