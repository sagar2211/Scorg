import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { AddUpdatePurchaseOrderComponent } from './components/add-update-purchase-order/add-update-purchase-order.component';
import { PurchaseInvoiceAddUpdateComponent } from './components/purchase-invoice-add-update/purchase-invoice-add-update.component';
import { PurchaseInvoiceListComponent } from './components/purchase-invoice-list/purchase-invoice-list.component';
import { PurchaseOrderListComponent } from './components/purchase-order-list/purchase-order-list.component';
import { PurchaseRecieptAddUpdateComponent } from './components/purchase-reciept-add-update/purchase-reciept-add-update.component';
import { PurchaseRecieptListComponent } from './components/purchase-reciept-list/purchase-reciept-list.component';
import { PurchaseReturnAddUpdateComponent } from './components/purchase-return-add-update/purchase-return-add-update.component';
import { PurchaseReturnListComponent } from './components/purchase-return-list/purchase-return-list.component';
import { TransactionsHomeComponent } from './components/transactions-home/transactions-home.component';

const transactionRoutes: Routes = [
    {
        path: '', component: TransactionsHomeComponent,
        children: [
            {
                path: '', redirectTo: 'purchaseOrders', pathMatch: 'full'
            },
            {
                path: 'purchaseOrders',
                component: PurchaseOrderListComponent,
                canActivate: [NgxPermissionsGuard],
                data: {
                    displayName: 'Purchase Orders',
                    breadCrumInfo: {
                        display: 'Purchase Orders', route: '/inventory/transactions/purchaseOrders', redirectTo: '',
                        isFilter: false, isAddPopup: true
                    },
                    permissions: {
                        only: PermissionsConstants.VIEW_PURCHASE_ORDER,
                        redirectTo: CommonService.redirectToIfNoPermission
                    },
                    relatedLinks: []
                }
            },
            {
                path: 'purchaseRecieptList',
                component: PurchaseRecieptListComponent,
                canActivate: [NgxPermissionsGuard],
                data: {
                    displayName: 'GRN List',
                    breadCrumInfo: {
                        display: 'GRN List',
                        route: '/inventory/transactions/purchaseRecieptList',
                        redirectTo: '/inventory/transactions/purchaseRecieptAddUpdate/-1',
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
                path: 'purchaseRecieptAddUpdate/:id',
                component: PurchaseRecieptAddUpdateComponent,
                canActivate: [NgxPermissionsGuard],
                data: {
                    displayName: 'GRN Add/Update',
                    breadCrumInfo: {
                        display: 'GRN Add/Update',
                        route: '/inventory/transactions/purchaseRecieptAddUpdate/-1',
                        redirectTo: '/inventory/transactions/purchaseRecieptList',
                        isFilter: false, isAddPopup: false
                    },
                    permissions: {
                        only: PermissionsConstants.ADD_GRN,
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
                        display: 'Add PO', route: '/inventory/transactions/addPurchaseOrder', redirectTo: '',
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
                        display: 'Edit PO', route: '/inventory/transactions/editPurchaseOrder/:purOrdrId', redirectTo: '',
                        isFilter: false, isAddPopup: false
                    },
                    permissions: {
                        only: PermissionsConstants.UPDATE_PURCHASE_ORDER,
                        redirectTo: CommonService.redirectToIfNoPermission
                    },
                    relatedLinks: []
                }
            },
            {
                path: 'purchaseReturnList',
                component: PurchaseReturnListComponent,
                canActivate: [NgxPermissionsGuard],
                data: {
                    displayName: 'GDN List',
                    breadCrumInfo: {
                        display: 'GDN List', route: '/inventory/transactions/purchaseReturnList', redirectTo: '',
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
                        display: 'Manage Purchase Returns', route: '/inventory/transactions/addUpdatePurchaseReturns', redirectTo: '',
                        isFilter: false, isAddPopup: false
                    },
                    permissions: {
                        only: PermissionsConstants.ADD_GDN,
                        redirectTo: CommonService.redirectToIfNoPermission
                    },
                    relatedLinks: []
                }
            },
            {
                path: 'purchaseInvoiceList',
                component: PurchaseInvoiceListComponent,
                canActivate: [NgxPermissionsGuard],
                data: {
                    displayName: 'Purchase Invoice List',
                    breadCrumInfo: {
                        display: 'Purchase Invoice List',
                        route: '/inventory/transactions/purchaseInvoiceList',
                        redirectTo: '/inventory/transactions/purchaseInvoiceAddUpdate/-1',
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
    imports: [
        RouterModule.forChild(transactionRoutes),
    ],
    exports: [RouterModule]
})
export class TransactionsRouteModule { }
