import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GdnRoutingModule } from './gdn-routing.module';
import { PurchaseReturnListComponent } from './components/purchase-return-list/purchase-return-list.component';
import { PurchaseReturnListHomeComponent } from './components/purchase-return-list-home/purchase-return-list-home.component';
import { PurchaseReturnAddUpdateComponent } from './components/purchase-return-add-update/purchase-return-add-update.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from "../../shared/shared.module";
import { PrintDataModule } from "../print-data/print-data.module";
import { PurchaseReturnItemsAddUpdateComponent } from './components/purchase-return-items-add-update/purchase-return-items-add-update.component';

@NgModule({
  declarations: [
    PurchaseReturnListComponent, 
    PurchaseReturnListHomeComponent, 
    PurchaseReturnAddUpdateComponent,
    PurchaseReturnItemsAddUpdateComponent
  ],
  imports: [
    CommonModule,
    GdnRoutingModule,
    PrintDataModule,
    SharedModule,
    FormsModule, 
    ReactiveFormsModule
  ]
})
export class GdnModule { }
