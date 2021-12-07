import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StockReportRoutingModule } from './stock-report-routing.module';
import { StockReportHomeComponent } from './components/stock-report-home/stock-report-home.component';
import { ReportsModule } from "../reports/reports.module";

@NgModule({
  declarations: [StockReportHomeComponent],
  imports: [
    CommonModule,
    StockReportRoutingModule,
    ReportsModule
  ]
})
export class StockReportModule { }
