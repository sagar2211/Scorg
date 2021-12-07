import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SaleRoutingModule } from './sale-routing.module';
import { SaleReturnComponent } from './components/sale-return/sale-return.component';
import { SaleHomeComponent } from './components/sale-home/sale-home.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DxDataGridModule } from 'devextreme-angular';
import { PatientIssueModule } from '../patient-issue/patient-issue.module';
import { SaleReturnService } from './services/sale-return.service';


@NgModule({
  declarations: [
    SaleReturnComponent,
    SaleHomeComponent,
  ],
  imports: [
    CommonModule,
    SaleRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    DxDataGridModule,
    PatientIssueModule
  ],
  providers: [
    SaleReturnService
  ]
})
export class SaleModule { }
