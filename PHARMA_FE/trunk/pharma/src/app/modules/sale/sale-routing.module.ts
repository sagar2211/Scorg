import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SaleHomeComponent } from './components/sale-home/sale-home.component';
import { SaleReturnComponent } from './components/sale-return/sale-return.component';

const routes: Routes = [
  {
    path : '',
    component : SaleHomeComponent,
    children : [
      {
        path : '',
        redirectTo : 'salereturn'
      },
      {
        path : 'salereturn',
        component : SaleReturnComponent
      },
      {
        path : 'salereturn/:consumptionId',
        component : SaleReturnComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SaleRoutingModule { }
