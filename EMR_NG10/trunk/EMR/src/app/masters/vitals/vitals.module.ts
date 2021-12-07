import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VitalsHomeComponent } from './components/vitals-home/vitals-home.component';
import { VitalsMasterComponent } from './components/vitals-master/vitals-master.component';
import { VitalsMappingComponent } from './components/vitals-mapping/vitals-mapping.component';
import { Routes, RouterModule } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from './../../config/PermissionsConstants';
import { CommonService } from './../../public/services/common.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { EmrSharedModule } from './../../emr-shared/emr-shared.module';
import { VitalsListComponent } from './components/vitals-list/vitals-list.component';
import { VitalMappingListComponent } from './components/vital-mapping-list/vital-mapping-list.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

const vitalsRoutes: Routes = [
  {
    path: '', component: VitalsHomeComponent,
    children: [
      {
        path: '', redirectTo: 'masterList', pathMatch: 'full'
      },
      {
        path: 'masterList',
        component: VitalsListComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Master List',
          breadCrumInfo: {
            display: 'Master List', route: '/emr/vitals/masterList', redirectTo: '',
            btntext: 'ADD', isFilter: false, isAddPopup: true
          },
          permissions: {
            only: PermissionsConstants.Vitals_View,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      },
      {
        path: 'addMaster',
        component: VitalsMasterComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Add Master',
          breadCrumInfo: {
            display: 'Add Master', route: '/emr/vitals/addMaster', redirectTo: '',
            btntext: 'ADD', isFilter: false, isAddPopup: false
          },
          permissions: {
            only: PermissionsConstants.Vitals_Add,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      },
      {
        path: 'updateMaster/:vitalId',
        component: VitalsMasterComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Update Master',
          breadCrumInfo: {
            display: 'Update Master', route: '/emr/vitals/updateMaster/:vitalId', redirectTo: '',
            btntext: 'ADD', isFilter: false, isAddPopup: false
          },
          permissions: {
            only: PermissionsConstants.Vitals_Update,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      },
      {
        path: 'mappingList',
        component: VitalMappingListComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Mapping List',
          breadCrumInfo: {
            display: 'Mapping List', route: '/emr/vitals/mappingList', redirectTo: '',
            btntext: 'ADD', isFilter: true, isAddPopup: true
          },
          permissions: {
            only: PermissionsConstants.Vital_Mapping_View,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      },
      {
        path: 'addMapping',
        component: VitalsMappingComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Add Mapping',
          breadCrumInfo: {
            display: 'Add Mapping', route: '/emr/vitals/addMapping', redirectTo: '',
            btntext: 'ADD', isFilter: false, isAddPopup: false
          },
          permissions: {
            only: PermissionsConstants.Vital_Mapping_Add,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      },
      {
        path: 'updateMapping/:specialtyId/:serviceTypeId',
        component: VitalsMappingComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Update Mapping',
          breadCrumInfo: {
            display: 'Update Mapping', route: '/emr/vitals/updateMapping/:specialtyId/:serviceTypeId', redirectTo: '',
            btntext: 'ADD', isFilter: false, isAddPopup: false
          },
          permissions: {
            only: PermissionsConstants.Vital_Mapping_Update,
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
    VitalsHomeComponent,
    VitalsMasterComponent,
    VitalsMappingComponent,
    VitalsListComponent,
    VitalMappingListComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    EmrSharedModule,
    FormsModule, ReactiveFormsModule, NgxDatatableModule, NgbModule,
    RouterModule.forChild(vitalsRoutes)
  ],
  entryComponents: [
    VitalsMasterComponent,
    VitalsMappingComponent
  ]
})
export class VitalsModule { }
