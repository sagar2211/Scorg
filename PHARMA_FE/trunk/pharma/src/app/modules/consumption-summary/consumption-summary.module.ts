import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConsumptionSummaryRoutingModule } from './consumption-summary-routing.module';
import { ConsumptionSummaryHomeComponent } from './components/consumption-summary-home/consumption-summary-home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { PrintDataModule } from '../print-data/print-data.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { PatientConsumptionSummeryComponent } from './components/patient-consumption-summery/patient-consumption-summery.component';


@NgModule({
  declarations: [
    ConsumptionSummaryHomeComponent,
    PatientConsumptionSummeryComponent
  ],
  imports: [
    CommonModule,
    ConsumptionSummaryRoutingModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    PrintDataModule
  ]
})
export class ConsumptionSummaryModule { }
