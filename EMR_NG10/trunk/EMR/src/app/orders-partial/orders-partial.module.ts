import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { OrdersPartialRoutingModule } from './orders-partial-routing.module';
import { OrdersListPartialComponent } from './components/orders-list-partial/orders-list-partial.component';
import { OrdersListHomeComponent } from './components/orders-list-home/orders-list-home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [OrdersListPartialComponent, OrdersListHomeComponent],
  imports: [
    CommonModule,
    OrdersPartialRoutingModule,
    NgxDatatableModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class OrdersPartialModule { }
