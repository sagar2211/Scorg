import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { PurchaseOrdersRoutingModule } from './purchase-orders-routing.module';
import { PurchaseOrderHomeComponent } from './components/purchase-order-home/purchase-order-home.component';
import { PurchaseOrderListComponent } from './components/purchase-order-list/purchase-order-list.component';
import { AddUpdatePurchaseOrderComponent } from './components/add-update-purchase-order/add-update-purchase-order.component';
import { AddUpdateItemPurchaseOrderComponent } from './components/add-update-item-purchase-order/add-update-item-purchase-order.component';
import { TransactionsService } from '../transactions/services/transactions.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from "../../shared/shared.module";
import { PrintDataModule } from "../print-data/print-data.module";
import { TransactionsModule } from "../transactions/transactions.module";
import { DxAutocompleteModule, DxDataGridModule, DxDropDownBoxModule } from 'devextreme-angular';
import { DxListModule, DxLookupModule, DxTemplateModule, DxValidatorModule } from 'devextreme-angular';




@NgModule({
  declarations: [PurchaseOrderHomeComponent, PurchaseOrderListComponent, AddUpdatePurchaseOrderComponent, AddUpdateItemPurchaseOrderComponent],
  imports: [
    CommonModule,
    PurchaseOrdersRoutingModule,
    FormsModule, 
    ReactiveFormsModule,
    SharedModule,
    PrintDataModule,
    TransactionsModule,
    DxAutocompleteModule, 
    DxDataGridModule, 
    DxDropDownBoxModule,
    DxListModule, 
    DxLookupModule, 
    DxTemplateModule, 
    DxValidatorModule,
    NgxDatatableModule
  ],
  providers: [
    TransactionsService
  ],
  entryComponents: [
    AddUpdateItemPurchaseOrderComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class PurchaseOrdersModule { }
