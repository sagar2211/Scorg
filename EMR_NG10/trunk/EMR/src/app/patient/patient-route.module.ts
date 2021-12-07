import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PatientHomeComponent } from './components/patient-home/patient-home.component';

const patientRoutes: Routes = [
  {
    path: '', component: PatientHomeComponent,
    children: [
      {
        path: '', redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        loadChildren: () => import('../modules/patient-dashboard/patient-dashboard.module').then(m => m.PatientDashboardModule)
      },
      {
        path: 'allDocuments',
        loadChildren: () => import('../modules/patient-documents/patient-documents.module').then(m => m.PatientDocumentsModule)
      },
      {
        path: 'allPacs',
        loadChildren: () => import('../modules/patient-pacs/patient-pacs.module').then(m => m.PatientPacsModule)
      },
      {
        path: 'history',
        loadChildren: () => import('../history/history.module').then(m => m.HistoryModule)
      },
      { // -- working
        path: 'dynamic-chart/:patientId/:chartId',
        loadChildren: () => import('../dynamic-chart/dynamic-chart.module').then(m => m.DynamicChartModule),
      },
      {
        path: 'mar',
        loadChildren: () => import('../mar-chart/mar-chart.module').then(m => m.MarChartModule)
      },
      { // --working
        path: 'intake_output/:patientId',
        loadChildren: () => import('../intakeoutputchart/intakeoutputchart.module').then(m => m.IntakeoutputchartModule)
      },
      {
        path: 'allTeam',
        loadChildren: () => import('../modules/patient-care-team/patient-care-team.module').then(m => m.PatientCareTeamModule)
      },
      {
        path: 'icu',
        loadChildren: () => import('../modules/patient-icu/patient-icu.module').then(m => m.PatientIcuModule)
      },
      {
        path: 'icu_flow_sheet/:patientId',
        loadChildren: () => import('../icuflowsheet/icuflowsheet.module').then(m => m.IcuflowsheetModule),
      },
      {
        path: 'other',
        loadChildren: () => import('../modules/patient-other/patient-other.module').then(m => m.PatientOtherModule)
      },
      {
        path: 'orders',
        loadChildren: () => import('../orders/orders.module').then(m => m.OrdersModule),
      },
      {
        path: 'dischargesummary/:patientId',
        loadChildren: () => import('../discharge-summary/discharge-summary.module').then(m => m.DischargeSummaryModule),
      },
      {
        path: 'investigationHistory',
        loadChildren: () => import('../investigation-history/investigation-history.module').then(m => m.InvestigationHistoryModule),
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(patientRoutes)],
  exports: [RouterModule]
})
export class PatientRouteModule { }
