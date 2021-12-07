import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PurchaseOrderListComponent } from './components/purchase-order-list/purchase-order-list.component';
import { TransactionsHomeComponent } from './components/transactions-home/transactions-home.component';
import { AddUpdatePurchaseOrderComponent } from './components/add-update-purchase-order/add-update-purchase-order.component';
import { TransactionsService } from './services/transactions.service';
import { PurchaseRecieptAddUpdateComponent } from './components/purchase-reciept-add-update/purchase-reciept-add-update.component';
import { PurchaseRecieptListComponent } from './components/purchase-reciept-list/purchase-reciept-list.component';
import { ItemDetailsComponent } from './components/item-details/item-details.component';
import { AddUpdateItemPurchaseOrderComponent } from './components/add-update-item-purchase-order/add-update-item-purchase-order.component';
import { PurchaseReturnListComponent } from './components/purchase-return-list/purchase-return-list.component';
import { PurchaseReturnAddUpdateComponent } from './components/purchase-return-add-update/purchase-return-add-update.component';
import { PurchaseReturnItemsAddUpdateComponent } from './components/purchase-return-items-add-update/purchase-return-items-add-update.component';
import { TransactionsRouteModule } from './transactions-route.module';
import { PurchaseInvoiceListComponent } from './components/purchase-invoice-list/purchase-invoice-list.component';
import { PurchaseInvoiceAddUpdateComponent } from './components/purchase-invoice-add-update/purchase-invoice-add-update.component';
import { PrintDataModule } from '../print-data/print-data.module';
import { AuditLogsComponent } from './components/audit-logs/audit-logs.component';

@NgModule({
  declarations: [
    PurchaseOrderListComponent,
    TransactionsHomeComponent,
    AddUpdatePurchaseOrderComponent,
    PurchaseRecieptListComponent,
    PurchaseRecieptAddUpdateComponent,
    ItemDetailsComponent,
    AddUpdateItemPurchaseOrderComponent,
    PurchaseReturnListComponent,
    PurchaseReturnAddUpdateComponent,
    PurchaseReturnItemsAddUpdateComponent,
    PurchaseInvoiceListComponent,
    PurchaseInvoiceAddUpdateComponent,
    AuditLogsComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    SharedModule,
    TransactionsRouteModule,
    NgxDatatableModule,
    PrintDataModule
  ],
  entryComponents: [
    AddUpdateItemPurchaseOrderComponent,
    PurchaseReturnItemsAddUpdateComponent,
    AuditLogsComponent
  ],
  providers: [
    TransactionsService
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class TransactionsModule { }
