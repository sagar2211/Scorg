import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IssueReportRoutingModule } from './issue-report-routing.module';
import { IssueReportHomeComponent } from './components/issue-report-home/issue-report-home.component';
import { ReportsModule } from "../reports/reports.module";


@NgModule({
  declarations: [IssueReportHomeComponent],
  imports: [
    CommonModule,
    IssueReportRoutingModule,
    ReportsModule
  ]
})
export class IssueReportModule { }
