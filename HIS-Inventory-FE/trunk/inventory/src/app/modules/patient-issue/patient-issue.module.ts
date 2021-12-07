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
import { PatientConsumptionSummeryComponent } from './component/patient-consumption-summery/patient-consumption-summery.component';
import { PatientVoucherItemListComponent } from './component/patient-voucher-item-list/patient-voucher-item-list.component';

const consumpRoute: Routes = [
  {
    path: '', component: PatientIssueHomeComponent,
    children: [
      {
        path: '', redirectTo: 'consumptionSummary', pathMatch: 'full'
      },
      {
        path: 'consumptionSummary',
        component: PatientConsumptionSummeryComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Patient Issue Summary',
          breadCrumInfo: {
            display: 'Patient Issue Summary', route: '/inventory/issue/patient/consumptionSummary', redirectTo: '',
            isFilter: false, isAddPopup: true
          },
          permissions: {
            only: PermissionsConstants.VIEW_STORE_CONSUMPTION,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
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
      }
    ]
  }
];


@NgModule({
  declarations: [
    PatientIssueHomeComponent,
    PatientConsumptionComponent,
    PatientConsumptionSummeryComponent,
    PatientVoucherItemListComponent,
  ],
  imports: [
    FormsModule,
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(consumpRoute),
    NgxDatatableModule,
    PrintDataModule
  ],
  exports: [
    PatientVoucherItemListComponent
  ],
  providers: [
    IssueService,
    TransactionsService
  ]
})
export class PatientIssueModule { }
