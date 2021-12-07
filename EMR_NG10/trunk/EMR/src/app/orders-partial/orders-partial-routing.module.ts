import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OrdersListHomeComponent } from './components/orders-list-home/orders-list-home.component';
import { OrdersListPartialComponent } from './components/orders-list-partial/orders-list-partial.component';

const routes: Routes = [
  {
    path: '', component: OrdersListHomeComponent,
    children: [
      {
        path: 'order-list-partial/:token/:patientId/:encounterId',
        component: OrdersListPartialComponent,
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdersPartialRoutingModule { }
