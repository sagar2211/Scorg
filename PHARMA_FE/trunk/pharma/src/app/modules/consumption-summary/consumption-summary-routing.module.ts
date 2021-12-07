import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConsumptionSummaryHomeComponent } from './components/consumption-summary-home/consumption-summary-home.component';
import { PatientConsumptionSummeryComponent } from './components/patient-consumption-summery/patient-consumption-summery.component';

const routes: Routes = [
  {
    path : '',
    component : ConsumptionSummaryHomeComponent,
    children : [
      {
        path : '',
        redirectTo : 'consumptionsummary'
      },
      {
        path : 'consumptionsummary',
        component : PatientConsumptionSummeryComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConsumptionSummaryRoutingModule { }
