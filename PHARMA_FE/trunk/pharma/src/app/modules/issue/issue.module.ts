import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IssueHomeComponent } from './component/issue-home/issue-home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { IssueRoutingModule } from './issue-routing.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { IssueService } from './services/issue.service';
import { PrintDataModule } from '../print-data/print-data.module';
import {TransactionsService} from "../transactions/services/transactions.service";

@NgModule({
  declarations: [
    IssueHomeComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    SharedModule,
    IssueRoutingModule,
    NgxDatatableModule,
    PrintDataModule
  ],
  entryComponents: [
  ],
  providers: [
    IssueService,
    TransactionsService
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class IssueModule { }
