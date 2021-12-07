import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManufactureHomeComponent } from './component/manufacture-home/manufacture-home.component';
import { Routes, RouterModule } from '@angular/router';
import { AddEditManufacturerComponent } from './component/add-edit-manufacturer/add-edit-manufacturer.component';
import { ManufacturerMasterComponent } from './component/manufacturer-master/manufacturer-master.component';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';


const manufactureRoute: Routes = [
  {
    path: '', component: ManufactureHomeComponent,
    children: [
      {
        path: '', redirectTo: 'manufacturer', pathMatch: 'full'
      },
      {
        path: 'manufacturer',
        component: ManufacturerMasterComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Manufacturer',
          breadCrumInfo: {
            display: 'Manufacturer', route: '/inventory/masters/manufacture/manufacturer', redirectTo: '',
            isFilter: false, isAddPopup: true
          },
          permissions: {
            only: PermissionsConstants.VIEW_MANUFACTURER,
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
    ManufactureHomeComponent,
    AddEditManufacturerComponent,
    ManufacturerMasterComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(manufactureRoute),
    NgxDatatableModule
  ],
  providers: [
    AddEditManufacturerComponent
  ]
})
export class ManufactureModule { }
