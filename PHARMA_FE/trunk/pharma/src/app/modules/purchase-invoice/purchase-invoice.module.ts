import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PurchaseInvoiceRoutingModule } from './purchase-invoice-routing.module';
import { PurchaseInvoiceAddUpdateComponent } from './components/purchase-invoice-add-update/purchase-invoice-add-update.component';
import { PurchaseInvoiceListComponent } from './components/purchase-invoice-list/purchase-invoice-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from "../../shared/shared.module";
import { PrintDataModule } from "../print-data/print-data.module";
import { TransactionsModule } from "../transactions/transactions.module";
import { PurchaseInvoiceHomeComponent } from './components/purchase-invoice-home/purchase-invoice-home.component';

@NgModule({
  declarations: [
    PurchaseInvoiceAddUpdateComponent,
    PurchaseInvoiceListComponent,
    PurchaseInvoiceHomeComponent
  ],
  imports: [
    CommonModule,
    PurchaseInvoiceRoutingModule,
    FormsModule, 
    ReactiveFormsModule,
    SharedModule,
    PrintDataModule,
    TransactionsModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class PurchaseInvoiceModule { }
