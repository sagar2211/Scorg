import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndentHomeComponent } from './components/indent-home/indent-home.component';
import { MaterialIndentAddUpdateComponent } from './components/material-indent-add-update/material-indent-add-update.component';
import { MaterialIndentListComponent } from './components/material-indent-list/material-indent-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { IndentService } from './services/indent.service';
import { IndentRoutingModule } from './indent-routing.module';
import {TransactionsService} from "../transactions/services/transactions.service";


@NgModule({
  declarations: [
    IndentHomeComponent,
    MaterialIndentAddUpdateComponent,
    MaterialIndentListComponent,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    SharedModule,
    IndentRoutingModule,
    NgxDatatableModule,
  ],
  entryComponents: [
  ],
  providers: [
    IndentService,
    TransactionsService
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class IndentModule { }
