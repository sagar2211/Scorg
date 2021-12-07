import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GdnReportRoutingModule } from './gdn-report-routing.module';
import { GdnReportHomeComponent } from './components/gdn-report-home/gdn-report-home.component';
import { ReportsModule } from "../reports/reports.module";

@NgModule({
  declarations: [GdnReportHomeComponent],
  imports: [
    CommonModule,
    GdnReportRoutingModule,
    ReportsModule
  ]
})
export class GdnReportModule { }
