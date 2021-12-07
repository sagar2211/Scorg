import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoleAndPermissionHomeComponent } from './components/role-and-permission-home/role-and-permission-home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxPermissionsModule } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { RoleComponent } from './components/role/role.component';
import { RolePermissionsComponent } from './components/role-permissions/role-permissions.component';

const roleRoute: Routes = [
  {
    path: '', component: RoleAndPermissionHomeComponent,
    children: [
      {
        path: '', redirectTo: 'role', pathMatch: 'full'
      },
      {
        path: 'role',
        component: RoleComponent,
        data: {
          displayName: 'Documents', breadCrumInfo: {
            display: 'Role List', route: '/app/roleAndPermission/user/role', redirectTo: '',
            isFilter: true, isAddPopup: true, btntext: 'ADD'
          },
          permissions: {
            only: PermissionsConstants.View_RoleMaster,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        }
      },
      {
        path: 'managePermissions',
        component: RolePermissionsComponent,
        data: {
          displayName: 'Documents',
          breadCrumInfo: { display: 'Manage Permissions',
          route: '/app/user/roleAndPermission/managePermissions'
        },
          permissions: {
            only: PermissionsConstants.View_RolePermission,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        }
      },
      {
        path: 'managePermissions/:id',
        component: RolePermissionsComponent,
        data: {
          displayName: 'Documents',
          breadCrumInfo: { display: 'Manage Permissions',
          route: '/app/user/roleAndPermission/managePermissions'
        },
          permissions: {
            only: PermissionsConstants.View_RolePermission,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        }
      },
    ]
  }
];

@NgModule({
  declarations: [
    RoleAndPermissionHomeComponent,
    RoleComponent,
    RolePermissionsComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(roleRoute),
    SharedModule,
    NgxPermissionsModule
  ]
})
export class RolesAndPermissionModule { }
