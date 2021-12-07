import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IssueHomeComponent } from './component/issue-home/issue-home.component';
import { MaterialIndentSummeryListComponent } from './component/material-indent-summery-list/material-indent-summery-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { IssueRoutingModule } from './issue-routing.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { IssueService } from './services/issue.service';
import { DeptStoreIssueComponent } from './component/dept-store-issue/dept-store-issue.component';
import { IssueSummeryListComponent } from './component/issue-summery-list/issue-summery-list.component';
import { IssueAcceptanceListComponent } from './component/issue-acceptance-list/issue-acceptance-list.component';
import { AcceptIssueComponent } from './components/accept-issue/accept-issue.component';
import { PrintDataModule } from '../print-data/print-data.module';
import {TransactionsService} from "../transactions/services/transactions.service";

@NgModule({
  declarations: [
    IssueHomeComponent,
    MaterialIndentSummeryListComponent,
    DeptStoreIssueComponent,
	  IssueSummeryListComponent,
    DeptStoreIssueComponent,
    IssueAcceptanceListComponent,
    AcceptIssueComponent,
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
