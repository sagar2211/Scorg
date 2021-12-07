import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SupplierHomeComponent } from './component/supplier-home/supplier-home.component';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SuppliersComponent } from './component/suppliers/suppliers.component';
import { AddEditSupplierComponent } from './component/add-edit-supplier/add-edit-supplier.component';
import { CommonModule } from '@angular/common';
import { AddEditItemSupplierTaxMasterComponent } from './component/add-edit-item-supplier-tax-master/add-edit-item-supplier-tax-master.component';
import { ItemSupplierTaxMasterComponent } from './component/item-supplier-tax-master/item-supplier-tax-master.component';

const supplierRoute: Routes = [
  {
    path: '', component: SupplierHomeComponent,
    children: [
      {
        path: '', redirectTo: 'list', pathMatch: 'full'
      },
      {
        path: 'list',
        component: SuppliersComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Suppliers',
          breadCrumInfo: {
            display: 'Suppliers', route: '/inventory/masters/suppliers/list', redirectTo: '',
            isFilter: false, isAddPopup: true
          },
          permissions: {
            only: PermissionsConstants.VIEW_SUPPLIER,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      },
      {
        path: 'itemSupplierTaxMaster/:id',
        component: ItemSupplierTaxMasterComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Item Supplier Tax Master',
          breadCrumInfo: {
            display: 'Item Supplier Tax Master', route: '/inventory/masters/suppliers/itemSupplierTaxMaster', redirectTo: '',
            btntext: 'ADD', isFilter: false, isAddPopup: true
          },
          permissions: {
            only: PermissionsConstants.VIEW_ITEM_SUPPLIER_TAX_MASTER,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      },
    ]
  }
];

@NgModule({
  declarations: [
    SupplierHomeComponent,
    SuppliersComponent,
    AddEditSupplierComponent,
    AddEditItemSupplierTaxMasterComponent,
    ItemSupplierTaxMasterComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(supplierRoute),
    NgxDatatableModule
  ],
  entryComponents: [
    AddEditSupplierComponent,
    AddEditItemSupplierTaxMasterComponent
  ],
  providers: []
})
export class SupplierModule { }
