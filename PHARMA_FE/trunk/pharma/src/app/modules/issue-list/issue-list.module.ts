import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IssueListRoutingModule } from './issue-list-routing.module';
import { IssueListHomeComponent } from './components/issue-list-home/issue-list-home.component';
import { DeptStoreIssueComponent } from './components/dept-store-issue/dept-store-issue.component';
import { IssueAcceptanceListComponent } from './components/issue-acceptance-list/issue-acceptance-list.component';
import { IssueSummeryListComponent } from './components/issue-summery-list/issue-summery-list.component';
import { AcceptIssueComponent } from './components/accept-issue/accept-issue.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { PrintDataModule } from '../print-data/print-data.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    IssueListHomeComponent,
    DeptStoreIssueComponent,
    IssueAcceptanceListComponent,
    IssueSummeryListComponent,
    AcceptIssueComponent
  ],
  imports: [
    CommonModule,
    IssueListRoutingModule,
    SharedModule,
    PrintDataModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class IssueListModule { }
