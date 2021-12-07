import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { StockComponent } from './stock/stock.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from "../../shared/shared.module";

const reportsRoutes: Routes = [
    {
      path: 'stock-info',
      component: StockComponent,
      canActivate: [NgxPermissionsGuard]
    }
  ];
@NgModule({
  declarations: [
    StockComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    NgxDatatableModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(reportsRoutes),
    NgSelectModule,
  ]
})
export class StockDetailsModule { }
