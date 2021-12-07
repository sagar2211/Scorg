import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreHomeComponent } from './component/store-home/store-home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { StoreMasterComponent } from './component/store-master/store-master.component';
import { AddEditStoreMasterComponent } from './component/add-edit-store-master/add-edit-store-master.component';
import { UserStoreMappingListComponent } from './component/user-store-mapping-list/user-store-mapping-list.component';
import { UserStoreAddUpdateMappingComponent } from './component/user-store-add-update-mapping/user-store-add-update-mapping.component';

const storeRoute: Routes = [
  {
    path: '', component: StoreHomeComponent,
    children: [
      {
        path: '', redirectTo: 'storeMaster', pathMatch: 'full'
      },
      {
        path: 'storeMaster',
        component: StoreMasterComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Store Master',
          breadCrumInfo: {
            display: 'Store Master', route: '/inventory/masters/store/storeMaster', redirectTo: '',
            isFilter: false, isAddPopup: true
          },
          permissions: {
            only: PermissionsConstants.VIEW_STORE_MASTER,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      },
      {
        path: 'userStoreMapping',
        component: UserStoreMappingListComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'User Store Mapping',
          breadCrumInfo: {
            display: 'User Store Mapping', route: '/inventory/masters/store/userStoreMapping', redirectTo: '',
            btntext: 'ADD', isFilter: false, isAddPopup: true
          },
          permissions: {
            only: PermissionsConstants.VIEW_USER_STORE_MAPPING,
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
    StoreHomeComponent,
    StoreMasterComponent,
    AddEditStoreMasterComponent,
    UserStoreMappingListComponent,
    UserStoreAddUpdateMappingComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(storeRoute),
    NgxDatatableModule
  ],
  entryComponents: [
    AddEditStoreMasterComponent,
    UserStoreAddUpdateMappingComponent
  ],
})
export class StoreModule { }
