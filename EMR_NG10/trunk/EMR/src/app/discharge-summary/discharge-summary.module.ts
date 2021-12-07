import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DischargeSummaryComponent } from './discharge-summary/discharge-summary.component';
import { DischargeSummaryFilterComponent } from './discharge-summary-filter/discharge-summary-filter.component';
import { SharedModule } from './../shared/shared.module';
import { EmrSharedModule } from './../emr-shared/emr-shared.module';
import { SectionDataDisplayByChartComponent } from './section-data-display-by-chart/section-data-display-by-chart.component';
import { SectionDataDisplayByFlatComponent } from './section-data-display-by-flat/section-data-display-by-flat.component';
import { PrintReportsModule } from './../print-reports/print-reports.module';
import { MaterialModule } from './../material/material-module';
import { AddUpdateDischargeTemplateComponent } from './add-update-discharge-template/add-update-discharge-template.component';
import {NgSelectModule} from '@ng-select/ng-select';
import { OrderDisplayOnDischargeComponent } from './order-display-on-discharge/order-display-on-discharge.component';

@NgModule({
  declarations: [
    DischargeSummaryComponent,
    DischargeSummaryFilterComponent,
    SectionDataDisplayByChartComponent,
    SectionDataDisplayByFlatComponent,
    AddUpdateDischargeTemplateComponent,
    OrderDisplayOnDischargeComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    EmrSharedModule,
    PrintReportsModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      { path: '', component: DischargeSummaryComponent }],
    ),
    MaterialModule,
  ],
  providers: [],
  entryComponents: [
    DischargeSummaryFilterComponent,
    AddUpdateDischargeTemplateComponent
  ]
})
export class DischargeSummaryModule { }
