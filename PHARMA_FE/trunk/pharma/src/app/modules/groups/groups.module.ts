import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { GroupHomeComponent } from './component/group-home/group-home.component';
import { MainGroupComponent } from './component/main-group/main-group.component';
import { SubGroupComponent } from './component/sub-group/sub-group.component';
import { AddUpdateMainGroupComponent } from './component/add-update-main-group/add-update-main-group.component';
import { AddUpdateSubGroupComponent } from './component/add-update-sub-group/add-update-sub-group.component';

const groupRoute: Routes = [
  {
    path: '', component: GroupHomeComponent,
    children: [
      {
        path: '', redirectTo: 'primaryGroup', pathMatch: 'full'
      },
      {
        path: 'primaryGroup',
        component: MainGroupComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Primary Group',
          breadCrumInfo: {
            display: 'Primary Group', route: '/inventory/masters/groups/primaryGroup', redirectTo: '',
            isFilter: true, isAddPopup: true
          },
          permissions: {
            only: PermissionsConstants.VIEW_PRIMARY_GROUP,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      },
      {
        path: 'subGroup',
        component: SubGroupComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Sub Group',
          breadCrumInfo: {
            display: 'Sub Group', route: '/inventory/masters/groups/subGroup', redirectTo: '',
            isFilter: false, isAddPopup: true
          },
          permissions: {
            only: PermissionsConstants.VIEW_SUB_GROUP,
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
    GroupHomeComponent,
    MainGroupComponent,
    SubGroupComponent,
    AddUpdateMainGroupComponent,
    AddUpdateSubGroupComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(groupRoute),
    NgxDatatableModule
  ],
  entryComponents: [
    AddUpdateMainGroupComponent,
    AddUpdateSubGroupComponent
  ]
})
export class GroupsModule { }
