import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserHomeComponent } from './components/user-home/user-home.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { UserLeftMenusComponent } from './components/user-left-menus/user-left-menus.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { UserRegistrationComponent } from './components/user-registration/user-registration.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxPermissionsModule } from 'ngx-permissions';
import { UserServiceCenterMappingComponent } from './components/user-service-center-mapping/user-service-center-mapping.component';
import { ServiceCenterAddUpdateMappingComponent } from './components/service-center-add-update-mapping/service-center-add-update-mapping.component';
import { CasePaperValidityComponent } from './components/case-paper-validity/case-paper-validity.component';
import { DxTemplateModule, DxDataGridModule } from 'devextreme-angular';

const userRoute: Routes = [
  {
    path: '', component: UserHomeComponent,
    children: [
      {
        path: '', redirectTo: 'userList', pathMatch: 'full'
      },
      {
        path: 'userList',
        component: UserListComponent,
        data: {
          displayName: 'Documents',
          breadCrumInfo: {
            display: 'User List', route: '/app/user/userList', redirectTo: 'app/user/userRegistration',
            isFilter: true, isAddPopup: true, btntext: 'ADD'
          },
          permissions: {
            only: PermissionsConstants.View_UserMaster,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: [
            {
              displayName: 'User Registration',
              routeLink: '/app/user/userRegistration',
              permission: PermissionsConstants.Add_UserMaster
            },
            {
              displayName: 'Role List',
              routeLink: '/app/user/role',
              permission: PermissionsConstants.View_RoleMaster
            },
            {
              displayName: 'Permissions',
              routeLink: '/app/user/managePermissions',
              permission: PermissionsConstants.View_RolePermission
            }
          ]
        }
      },
      {
        path: 'userRegistration',
        component: UserRegistrationComponent,
        data: {
          breadCrumInfo: { display: 'User Registration', route: 'app/user/userRegistration' },
          permissions: {
            only: PermissionsConstants.Add_UserMaster,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: [
            {
              displayName: 'User List',
              routeLink: '/app/user/userList',
              permission: PermissionsConstants.View_UserMaster
            },
            {
              displayName: 'Mapped List',
              routeLink: '/app/user/mappeddoctorlist',
              permission: PermissionsConstants.View_Mapped_Doctor_List
            },
          ]
        },
        // data: { displayName: 'Documents' }
      },
      {
        path: 'userRegistration/:id',
        component: UserRegistrationComponent,
        data: {
          breadCrumInfo: { display: 'Edit User', route: 'app/user/userRegistration' },
          permissions: {
            only: PermissionsConstants.Update_UserMaster,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        // data: { displayName: 'Documents' }
      },
      {
        path: 'userServiceCenterMapping',
        component: UserServiceCenterMappingComponent
        // data: { displayName: 'Documents' }
      },
      {
        path: 'casePaperValidity',
        component: CasePaperValidityComponent
      },
      {
        path: 'roleAndPermission',
        loadChildren: () => import('../../modules/roles-and-permission/roles-and-permission.module').then(m => m.RolesAndPermissionModule)
      },
      {
        path: 'mapping',
        loadChildren: () => import('../../modules/mapping/mapping.module').then(m => m.MappingModule)
      },
      {
        path: 'certificateApp',
        loadChildren: () => import('../../modules/certificate-master/certificate-master.module').then(m => m.CertificateMasterModule)
      },
    ]
  }
];

@NgModule({
  declarations: [
    UserHomeComponent,
    UserListComponent,
    UserLeftMenusComponent,
    ResetPasswordComponent,
    UserRegistrationComponent,
    UserServiceCenterMappingComponent,
    ServiceCenterAddUpdateMappingComponent,
    CasePaperValidityComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(userRoute),
    NgxDatatableModule,
    SharedModule,
    NgxPermissionsModule,
    DxDataGridModule,
    DxTemplateModule
  ]
})
export class UserModule { }
