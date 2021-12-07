import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { InvestigationHistoryComponent } from './investigation-history/investigation-history.component';
import { EmrSharedModule } from './../emr-shared/emr-shared.module';
import { InvestigationHistoryHomeComponent } from './investigation-history-home/investigation-history-home.component';
import { InvestigationReportsComponent } from './investigation-reports/investigation-reports.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HistoryService } from '../history/history.service';
import { TreeModule } from '@circlon/angular-tree-component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InvestigationReportHistoryFilterComponent } from './investigation-report-history-filter/investigation-report-history-filter.component';

const investigationRoutes: Routes = [
  {
    path: '', component: InvestigationHistoryHomeComponent,
    children: [
      {
        path: '', redirectTo: 'history', pathMatch: 'full'
      },
      {
        path: 'history/:patientId',
        component: InvestigationHistoryComponent,
        canActivate: [],
        data: {}
      },
      {
        path: 'reports/:patientId',
        component: InvestigationReportsComponent,
        canActivate: [],
        data: {}
      }
    ]
  }
];

@NgModule({
  declarations: [
    InvestigationHistoryComponent,
    InvestigationHistoryHomeComponent,
    InvestigationReportsComponent,
    InvestigationReportHistoryFilterComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(investigationRoutes),
    FormsModule,
    ReactiveFormsModule,
    EmrSharedModule,
    TreeModule,
    SharedModule,
    NgbModule
  ],
  providers: [
    HistoryService
  ]
})
export class InvestigationHistoryModule { }
