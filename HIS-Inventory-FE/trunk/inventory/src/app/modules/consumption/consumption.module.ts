import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConsumptionHomeComponent } from './component/consumption-home/consumption-home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { StoreConsumptionSummaryComponent } from './component/store-consumption-summary/store-consumption-summary.component';
import { StoreConsumptionComponent } from './component/store-consumption/store-consumption.component';
import { IssueService } from '../issue/services/issue.service';
import { TransactionsService } from '../transactions/services/transactions.service';
import { PrintDataModule } from '../print-data/print-data.module';
const consumpRoute: Routes = [
  {
    path: '', component: ConsumptionHomeComponent,
    children: [
      {
        path: '', redirectTo: 'storeConsumptionSummary', pathMatch: 'full'
      },
      {
        path: 'storeConsumptionSummary',
        component: StoreConsumptionSummaryComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Store Consumption Summary',
          breadCrumInfo: {
            display: 'Store Consumption Summary', route: '/inventory/issue/consumption/storeConsumptionSummary', redirectTo: '',
            isFilter: false, isAddPopup: false
          },
          permissions: {
            only: PermissionsConstants.VIEW_STORE_CONSUMPTION,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      },
      {
        path: 'storeConsumption/:id',
        component: StoreConsumptionComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Store Consumption',
          breadCrumInfo: {
            display: 'Store Consumption',
            route: '/inventory/issue/consumption/storeConsumption',
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
    ConsumptionHomeComponent,
    StoreConsumptionSummaryComponent,
    StoreConsumptionComponent
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

  ],
  providers: [
    IssueService,
    TransactionsService
  ]
})
export class ConsumptionModule { }
