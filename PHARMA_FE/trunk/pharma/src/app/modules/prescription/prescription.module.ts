import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PrescriptionRoutingModule } from './prescription-routing.module';
import { PrescriptionHomeComponent } from './components/prescription-home/prescription-home.component';
import { DxDataGridModule, DxTemplateModule } from 'devextreme-angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PrescriptionDetailComponent } from "./components/prescription-detail/prescription-detail.component";
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [PrescriptionHomeComponent, PrescriptionDetailComponent],
  imports: [
    CommonModule,
    PrescriptionRoutingModule,
    DxDataGridModule, 
    DxTemplateModule,
    FormsModule, 
    ReactiveFormsModule,
    SharedModule
  ]
})
export class PrescriptionModule { }
