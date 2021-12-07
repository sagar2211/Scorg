import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemHomeComponent } from './component/item-home/item-home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { ItemMasterListComponent } from './component/item-master/item-master-list/item-master-list.component';
import { ItemMasterAddUpdateComponent } from './component/item-master/item-master-add-update/item-master-add-update.component';
import { ItemTypeComponent } from './component/item-type/item-type.component';
import { AddUpdateItemTypeComponent } from './component/add-update-item-type/add-update-item-type.component';

const itemRoute: Routes = [
  {
    path: '', component: ItemHomeComponent,
    children: [
      {
        path: '', redirectTo: 'itemType', pathMatch: 'full'
      },
      {
        path: 'itemType',
        component: ItemTypeComponent,
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
      },
      {
        path: 'itemMaster',
        component: ItemMasterListComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Item Master',
          breadCrumInfo: {
            display: 'Item Master', route: '/inventory/masters/item/itemMaster', redirectTo: '',
            isFilter: false, isAddPopup: true
          },
          permissions: {
            only: PermissionsConstants.VIEW_ITEM_MASTER,
            redirectTo: CommonService.redirectToIfNoPermission
          },
        }
      },
    ]
  }
];


@NgModule({
  declarations: [
    ItemHomeComponent,
    ItemMasterListComponent,
    ItemMasterAddUpdateComponent,
    ItemTypeComponent,
    AddUpdateItemTypeComponent,
  ],
  imports: [
    FormsModule,
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(itemRoute),
    NgxDatatableModule
  ],
  entryComponents: [
    AddUpdateItemTypeComponent,
  ]
})
export class ItemModule { }
