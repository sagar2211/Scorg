import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MappingHomeComponent } from './components/mapping-home/mapping-home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsModule } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { DoctorMappingComponent } from './components/doctor-mapping/doctor-mapping.component';
import { MappedDoctorListComponent } from './components/mapped-doctor-list/mapped-doctor-list.component';
import { DoctorMappingEditComponent } from './components/doctor-mapping-edit/doctor-mapping-edit.component';
import { DoctorSearchComponent } from './components/doctor-search/doctor-search.component';
import { SharedModule } from 'src/app/shared/shared.module';

const mappingRoute: Routes = [
  {
    path: '', component: MappingHomeComponent,
    children: [
      {
        path: '', redirectTo: 'doctormapping', pathMatch: 'full'
      },
      {
        path: 'doctormapping',
        component: DoctorMappingComponent,
        data: {
          displayName: 'Documents', breadCrumInfo: { display: 'New Doctor Mapping', route: '/app/user/doctormapping' },
          permissions: {
            only: PermissionsConstants.Add_Doctor_Mapping,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        }
      },
      {
        path: 'mappeddoctorlist',
        component: MappedDoctorListComponent,
        data: {
          displayName: 'Documents', breadCrumInfo: {
            display: 'Mapped List', route: '/app/user/mappeddoctorlist', redirectTo: 'app/user/doctormapping',
            isFilter: true, isAddPopup: true, btntext: 'ADD'
          },
          permissions: {
            only: PermissionsConstants.View_Mapped_Doctor_List,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        }
      },
    ]
  }
];

@NgModule({
  declarations: [
    MappingHomeComponent,
    DoctorMappingComponent,
    MappedDoctorListComponent,
    DoctorMappingEditComponent,
    DoctorSearchComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(mappingRoute),
    SharedModule,
    NgxPermissionsModule
  ]
})
export class MappingModule { }
