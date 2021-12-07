import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaxHomeComponent } from './component/tax-home/tax-home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { TaxMasterComponent } from './component/tax-master/tax-master.component';
import { AddEditTaxMasterComponent } from './component/add-edit-tax-master/add-edit-tax-master.component';

const taxRoute: Routes = [
  {
    path: '', component: TaxHomeComponent,
    children: [
      {
        path: '', redirectTo: 'taxMaster', pathMatch: 'full'
      },
      {
        path: 'taxMaster',
        component: TaxMasterComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Tax Master',
          breadCrumInfo: {
            display: 'Tax Master', route: '/inventory/tax/masters/taxMaster', redirectTo: '',
            isFilter: false, isAddPopup: true
          },
          permissions: {
            only: PermissionsConstants.VIEW_TAX_MASTER,
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
    TaxHomeComponent,
    TaxMasterComponent,
    AddEditTaxMasterComponent,
  ],
  imports: [
    FormsModule,
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(taxRoute),
    NgxDatatableModule
  ],
  entryComponents: [
    AddEditTaxMasterComponent
  ],
})
export class TaxModule { }
