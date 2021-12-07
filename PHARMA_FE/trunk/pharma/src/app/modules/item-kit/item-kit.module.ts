import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KitMasterHomeComponent } from './components/kit-master-home/kit-master-home.component';
import { KitMasterAddUpdateComponent } from './components/kit-master-add-update/kit-master-add-update.component';
import { KitMasterListComponent } from './components/kit-master-list/kit-master-list.component';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

const itemRoute: Routes = [
  {
    path: '', component: KitMasterHomeComponent,
    children: [
      {
        path: '', redirectTo: 'itemKitList', pathMatch: 'full'
      },
      {
        path: 'itemKitList',
        component: KitMasterListComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Item Type',
          breadCrumInfo: {
            display: 'Item Type', route: '/inventory/masters/item/itemType', redirectTo: '',
            isFilter: false, isAddPopup: true
          },
          permissions: {
            only: PermissionsConstants.VIEW_ITEM_TYPE,
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
    KitMasterHomeComponent,
    KitMasterAddUpdateComponent,
    KitMasterListComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(itemRoute),
    NgxDatatableModule
  ]
})
export class ItemKitModule { }
