import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialIndentRoutingModule } from './material-indent-routing.module';
import { MaterialIndentHomeComponent } from './components/material-indent-home/material-indent-home.component';
import { MaterialIndentAddUpdateComponent } from './components/material-indent-add-update/material-indent-add-update.component';
import { MaterialIndentListComponent } from './components/material-indent-list/material-indent-list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DxLookupModule, DxDataGridModule } from 'devextreme-angular';
import { PrintDataModule } from "../print-data/print-data.module";

@NgModule({
  declarations: [
    MaterialIndentHomeComponent,
    MaterialIndentAddUpdateComponent,
    MaterialIndentListComponent
  ],
  imports: [
    CommonModule,
    MaterialIndentRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    DxLookupModule, 
    DxDataGridModule,
    PrintDataModule
  ]
})
export class MaterialIndentModule { }
