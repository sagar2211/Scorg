import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SummeryIndentRoutingModule } from './summery-indent-routing.module';
import { SummaryIndentHomeComponent } from './components/summary-indent-home/summary-indent-home.component';
import { MaterialIndentSummeryListComponent } from './components/material-indent-summery-list/material-indent-summery-list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [SummaryIndentHomeComponent, MaterialIndentSummeryListComponent],
  imports: [
    CommonModule,
    SummeryIndentRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class SummeryIndentModule { }
