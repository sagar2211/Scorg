import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GrnScheduleRoutingModule } from './grn-schedule-routing.module';
import { GrnScheduleHomeComponent } from './components/grn-schedule-home/grn-schedule-home.component';
import { ReportsModule } from "../reports/reports.module";

@NgModule({
  declarations: [GrnScheduleHomeComponent],
  imports: [
    CommonModule,
    GrnScheduleRoutingModule,
    ReportsModule
  ]
})
export class GrnScheduleModule { }
