import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GrnListRoutingModule } from './grn-routing.module';
import { PurchaseRecieptListComponent } from './components/purchase-reciept-list/purchase-reciept-list.component';
import { AuditLogsComponent } from "./components/audit-logs/audit-logs.component";
import { GrnHomeComponent } from './components/grn-home/grn-home.component';
import { PurchaseRecieptAddComponent } from "./components/purchase-reciept-add/purchase-reciept-add.component";
import { PurchaseRecieptUpdateComponent } from "./components/purchase-reciept-update/purchase-reciept-update.component";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from "../../shared/shared.module";
import { PrintDataModule } from "../print-data/print-data.module";
import { DxAutocompleteModule, DxDataGridModule, DxDropDownBoxModule } from 'devextreme-angular';
import { DxListModule, DxLookupModule, DxTemplateModule, DxValidatorModule } from 'devextreme-angular';
import { ItemDetailsComponent } from './components/item-details/item-details.component';

@NgModule({
  declarations: [
    PurchaseRecieptListComponent,
    AuditLogsComponent,
    GrnHomeComponent,
    PurchaseRecieptAddComponent,
    PurchaseRecieptUpdateComponent,
    ItemDetailsComponent
  ],
  imports: [
    CommonModule,
    GrnListRoutingModule,
    PrintDataModule,
    SharedModule,
    FormsModule, 
    ReactiveFormsModule,
    DxDataGridModule, 
    DxAutocompleteModule, 
    DxDropDownBoxModule,
    DxListModule, 
    DxLookupModule, 
    DxTemplateModule, 
    DxValidatorModule
  ]
})
export class GrnListModule { }
