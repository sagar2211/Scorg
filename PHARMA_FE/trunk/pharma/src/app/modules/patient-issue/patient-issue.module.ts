import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientIssueHomeComponent } from './component/patient-issue-home/patient-issue-home.component';
import { Routes, RouterModule } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { PrintDataModule } from '../print-data/print-data.module';
import { IssueService } from '../issue/services/issue.service';
import { TransactionsService } from '../transactions/services/transactions.service';
import { PatientConsumptionComponent } from './component/patient-consumption/patient-consumption.component';
import { PatientVoucherItemListComponent } from './component/patient-voucher-item-list/patient-voucher-item-list.component';
import { DxAutocompleteModule, DxDataGridModule, DxDropDownBoxModule, DxListModule, DxLookupModule, DxPopupModule, DxTemplateModule } from 'devextreme-angular';
import { BatchListComponent } from './component/batch-list/batch-list.component';
import { ItemDataGridComponent } from './component/item-data-grid/item-data-grid.component';
import { AllSaleComponent } from './component/all-sale/all-sale.component';
import { AddPatientSaleComponent } from './component/add-patient-sale/add-patient-sale.component';
import { ShowTotalValueComponent } from './component/show-total-value/show-total-value.component';
import { ShowPaymentComponent } from './component/show-payment/show-payment.component';
import { ShowPatientPrescriptionComponent } from './component/show-patient-prescription/show-patient-prescription.component';
import { ShowIndentItemDataComponent } from './component/show-indent-item-data/show-indent-item-data.component';
import { CounterPatientBlockComponent } from './component/counter-patient-block/counter-patient-block.component';
import { AddUpdateAccountComponent } from './component/add-update-account/add-update-account.component';
import { AttachPatientToAccountComponent } from './component/attach-patient-to-account/attach-patient-to-account.component';
import { SelectPatientFromAccountComponent } from './component/select-patient-from-account/select-patient-from-account.component';
import { PatientAdvancePaymentComponent } from './component/patient-advance-payment/patient-advance-payment.component';
import { PaymentHistoryComponent } from './component/payment-history/payment-history.component';

const consumpRoute: Routes = [
  {
    path: '', component: PatientIssueHomeComponent,
    children: [
      {
        path: '', redirectTo: 'consumptionSummary', pathMatch: 'full'
      },
      {
        path: 'consumptionSummary',
        canActivate: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.VIEW_STORE_CONSUMPTION,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('../consumption-summary/consumption-summary.module').then(m => m.ConsumptionSummaryModule)
      },
      {
        path: 'consumption/:id',
        component: PatientConsumptionComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Patient Issue',
          breadCrumInfo: {
            display: 'Patient Issue',
            route: '/inventory/issue/patient/consumption',
            redirectTo: '',
            isFilter: false, isAddPopup: false
          },
          permissions: {
            only: PermissionsConstants.ADD_STORE_CONSUMPTION,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      },
      {
        path: 'allsale/:id',
        component: AllSaleComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Sale',
          breadCrumInfo: {
            display: 'Patient Issue',
            route: '/inventory/issue/patient/consumption',
            redirectTo: '',
            isFilter: false, isAddPopup: false
          },
          permissions: {
            only: PermissionsConstants.ADD_STORE_CONSUMPTION,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      }
    ]
  }
];


@NgModule({
  declarations: [
    PatientIssueHomeComponent,
    PatientConsumptionComponent,
    PatientVoucherItemListComponent,
    BatchListComponent,
    ItemDataGridComponent,
    AllSaleComponent,
    AddPatientSaleComponent,
    ShowTotalValueComponent,
    ShowPaymentComponent,
    ShowPatientPrescriptionComponent,
    ShowIndentItemDataComponent,
    CounterPatientBlockComponent,
    AddUpdateAccountComponent,
    AttachPatientToAccountComponent,
    SelectPatientFromAccountComponent,
    PatientAdvancePaymentComponent,
    PaymentHistoryComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(consumpRoute),
    NgxDatatableModule,
    PrintDataModule,
    DxDataGridModule,
    DxAutocompleteModule,
    DxTemplateModule,
    DxLookupModule,
    DxListModule,
    DxDropDownBoxModule,
    DxPopupModule,
    DxAutocompleteModule
  ],
  exports: [
    PatientVoucherItemListComponent,
    PatientAdvancePaymentComponent,
    CounterPatientBlockComponent
  ],
  providers: [
    IssueService,
    TransactionsService
  ]
})
export class PatientIssueModule { }
