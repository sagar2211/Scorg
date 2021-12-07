import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ParameterListRoutingModule } from './parameter-list-routing.module';
import { ParameterListHomeComponent } from './components/parameter-list-home/parameter-list-home.component';
import { ParametarComponent } from './components/parametar/parametar.component';
import { ParametarListComponent } from './components/parametar-list/parametar-list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    ParameterListHomeComponent,
    ParametarComponent,
    ParametarListComponent
  ],
  imports: [
    CommonModule,
    ParameterListRoutingModule,
    SharedModule,
    NgxDatatableModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ParameterListModule { }
