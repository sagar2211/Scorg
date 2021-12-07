import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TransactionsHomeComponent } from './components/transactions-home/transactions-home.component';
import { TransactionsService } from './services/transactions.service';
import { TransactionsRouteModule } from './transactions-route.module';
import { CommonModule } from '@angular/common';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PrintDataModule } from '../print-data/print-data.module';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { DxAutocompleteModule, DxDataGridModule, DxDropDownBoxModule } from 'devextreme-angular';
import { DxListModule, DxLookupModule, DxTemplateModule, DxValidatorModule } from 'devextreme-angular';

@NgModule({
  declarations: [
    TransactionsHomeComponent
  ],
  imports: [
    TransactionsRouteModule,
    // FormsModule,
    // ReactiveFormsModule,
    // CommonModule,
    // SharedModule,
    // NgxDatatableModule,
    // PrintDataModule,
    // NgOptionHighlightModule,
    // DxDataGridModule,
    // DxAutocompleteModule,
    // DxTemplateModule,
    // DxLookupModule,
    // DxListModule,
    // DxDropDownBoxModule,
    // DxValidatorModule
  ],
  providers: [
    TransactionsService
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class TransactionsModule { }
