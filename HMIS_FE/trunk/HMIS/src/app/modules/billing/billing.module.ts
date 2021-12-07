import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BillingService } from './services/billing.service';
import { BillingRouteModule } from './billing-route.module';
import { DxAutocompleteModule, DxDataGridModule, DxDropDownBoxModule, DxPopupModule } from 'devextreme-angular';
import { DxListModule, DxLookupModule, DxTemplateModule } from 'devextreme-angular';
import { PatientBillComponent } from './components/patient-bill/patient-bill.component';
import { BillingHomeComponent } from './components/billing-home/billing-home.component';
import { AttachComponentServiceComponent } from './components/attach-component-service/attach-component-service.component';
import { PatientAdvancePaymentComponent } from './components/patient-advance-payment/patient-advance-payment.component';
import { BillPaymentComponent } from './components/bill-payment/bill-payment.component';
import { PatientInsuranceUtilizationComponent } from './components/patient-insurance-utilization/patient-insurance-utilization.component';
import { PrintDataModule } from '../print-data/print-data.module';
import { PatientEncounterDetailComponent } from 'src/app/shared/patient-encounter-detail/patient-encounter-detail.component';
import { PatientInfoCommonComponent } from 'src/app/shared/patient-info-common/patient-info-common.component';
import { PatientBillConcessionComponent } from './components/patient-bill-concession/patient-bill-concession.component';
import { PatientInsuranceDetailComponent } from './components/patient-insurance-detail/patient-insurance-detail.component';

@NgModule({
  declarations: [
    BillingHomeComponent,
    PatientBillComponent,
    PatientInfoCommonComponent,
    PatientEncounterDetailComponent,
    BillPaymentComponent,
    PatientAdvancePaymentComponent,
    AttachComponentServiceComponent,
    PatientInsuranceUtilizationComponent,
    PatientBillConcessionComponent,
    PatientInsuranceDetailComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    SharedModule,
    BillingRouteModule,
    DxDataGridModule,
    DxAutocompleteModule,
    DxTemplateModule,
    DxLookupModule,
    DxListModule,
    DxDropDownBoxModule,
    PrintDataModule,
    DxPopupModule
  ],
  entryComponents: [
    PatientBillComponent
  ],
  providers: [
    BillingService
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class BillingModule { }
