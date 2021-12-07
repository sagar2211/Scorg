import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardHomeComponent } from './components/dashboard-home/dashboard-home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { DashboardRevenueComponent } from './components/dashboard-revenue/dashboard-revenue.component';
import { TotalRevenueDetailsComponent } from './components/total-revenue-details/total-revenue-details.component';
import { OpPatientDetailsComponent } from './components/op-patient-details/op-patient-details.component';
import { IpPatientDetailsComponent } from './components/ip-patient-details/ip-patient-details.component';
import { DxChartModule, DxPieChartModule } from 'devextreme-angular';
import { TotalRevenueComponent } from './components/total-revenue/total-revenue.component';
import { OpPatientComponent } from './components/op-patient/op-patient.component';
import { IpPatientComponent } from './components/ip-patient/ip-patient.component';
import { OtherPatientComponent } from './components/other-patient/other-patient.component';
import { RevenueSummeryComponent } from './components/revenue-summery/revenue-summery.component';
import { CollectionSummeryComponent } from './components/collection-summery/collection-summery.component';
import { BedOccupancyComponent } from './components/bed-occupancy/bed-occupancy.component';

const dashRoute: Routes = [
  {
    path: '', component: DashboardHomeComponent,
    children: [
      {
        path: '', redirectTo: 'revenue', pathMatch: 'full'
      },
      {
        path: 'revenue',
        component: DashboardRevenueComponent
      },
      { path: 'revenue/:token/:appKey', component: DashboardRevenueComponent },
    ]
  }
];

@NgModule({
  declarations: [
    DashboardHomeComponent,
    DashboardRevenueComponent,
    TotalRevenueDetailsComponent,
    OpPatientDetailsComponent,
    IpPatientDetailsComponent,
    TotalRevenueComponent,
    OpPatientComponent,
    IpPatientComponent,
    OtherPatientComponent,
    RevenueSummeryComponent,
    CollectionSummeryComponent,
    BedOccupancyComponent
  ],
  exports: [
    DashboardRevenueComponent,
    TotalRevenueDetailsComponent,
    OpPatientDetailsComponent,
    IpPatientDetailsComponent,
    TotalRevenueComponent,
    OpPatientComponent,
    IpPatientComponent,
    OtherPatientComponent,
    RevenueSummeryComponent,
    CollectionSummeryComponent,
    BedOccupancyComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(dashRoute),
    DxPieChartModule,
    DxChartModule
  ]
})
export class DashboardModule { }
