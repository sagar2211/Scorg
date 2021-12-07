import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MappingHomeComponent } from './components/mapping-home/mapping-home.component';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { DepartmentToWardComponent } from './components/department-to-ward/department-to-ward.component';
import { UserToDepartmentComponent } from './components/user-to-department/user-to-department.component';
import { SpecialityToDepartmentComponent } from './components/speciality-to-department/speciality-to-department.component';
import { UserToWardComponent } from './components/user-to-ward/user-to-ward.component';
import { AddUpdateMappingPopupComponent } from './components/add-update-mapping-popup/add-update-mapping-popup.component';
import { RmoToDoctorComponent } from './components/rmo-to-doctor/rmo-to-doctor.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from '../config/PermissionsConstants';
import { CommonService } from '../public/services/common.service';
import { UserToNursingStationListComponent } from './components/user-to-nursing-station-list/user-to-nursing-station-list.component';
import { MaterialModule } from '../material/material-module';

const mappingRoutes: Routes = [
  {
    path: '', component: MappingHomeComponent,
    children: [
      {
        path: '', redirectTo: 'departmentToWard', pathMatch: 'full'
      },
      {
        path: 'departmentToWard',
        component: DepartmentToWardComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Department To Ward',
          breadCrumInfo: {
            display: 'Department To Ward', route: '/emr/mapping/departmentToWard', redirectTo: '',
            btntext: 'ADD', isFilter: false, isAddPopup: true
          },
          permissions: {
            only: PermissionsConstants.Dept_Ward_Mapping_View,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      },
      {
        path: 'userToDepartment',
        component: UserToDepartmentComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'RMO To Department',
          breadCrumInfo: {
            display: 'RMO To Department', route: '/emr/mapping/userToDepartment', redirectTo: '',
            btntext: 'ADD', isFilter: false, isAddPopup: true
          },
          permissions: {
            only: PermissionsConstants.RMO_Dept_Mapping_View,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      },
      {
        path: 'specialityToDepartment',
        component: SpecialityToDepartmentComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Speciality To Department',
          breadCrumInfo: {
            display: 'Speciality To Department', route: '/emrSettingsApp/mapping/specialityToDepartment', redirectTo: '',
            btntext: 'ADD', isFilter: false, isAddPopup: true
          },
          permissions: {
            only: PermissionsConstants.Speciality_Dept_Mapping_View,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      },
      // {
      //   path: 'userToWard',
      //   component: UserToWardComponent,
      //   canActivate: [NgxPermissionsGuard],
      //   data: {
      //     displayName: 'User To Ward',
      //     breadCrumInfo: {
      //       display: 'User To Ward', route: '/emr/mapping/userToWard', redirectTo: '',
      //       btntext: 'ADD', isFilter: false, isAddPopup: true
      //     },
      //     permissions: {
      //       only: PermissionsConstants.Nurse_Ward_Mapping_View,
      //       redirectTo: CommonService.redirectToIfNoPermission
      //     },
      //     relatedLinks: []
      //   }
      // },
      {
        path: 'rmoToDoctor',
        component: RmoToDoctorComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Department To Ward',
          breadCrumInfo: {
            display: 'Department To Ward', route: '/emr/mapping/departmentToWard', redirectTo: '',
            btntext: 'ADD', isFilter: false, isAddPopup: true
          },
          permissions: {
            only: PermissionsConstants.RMO_Doctor_Mapping_View,
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
    MappingHomeComponent,
    DepartmentToWardComponent,
    UserToDepartmentComponent,
    SpecialityToDepartmentComponent,
    UserToWardComponent,
    RmoToDoctorComponent,
    AddUpdateMappingPopupComponent,
    UserToNursingStationListComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(mappingRoutes),
    FormsModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    MaterialModule
  ],
  entryComponents: [
    AddUpdateMappingPopupComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class MappingModule { }
