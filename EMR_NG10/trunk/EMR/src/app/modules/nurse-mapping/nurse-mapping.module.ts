import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NurseMappingHomeComponent } from './components/nurse-mapping-home/nurse-mapping-home.component';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NursingStationMappingComponent } from './components/nursing-station-mapping/nursing-station-mapping.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { MaterialModule } from 'src/app/material/material-module';

const nursingMapRoute: Routes = [
  {
    path: '', component: NurseMappingHomeComponent,
    children: [
      {
        path: '', redirectTo: 'nursingStationMapping', pathMatch: 'full'
      },
      {
        path: 'nursingStationMapping',
        component: NursingStationMappingComponent,
        // canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Nurse To Nursing Station',
          breadCrumInfo: {
            display: 'Bed Display', route: '/emr/ot/master/roomMasterList', redirectTo: ''
          },
          // permissions: {
          //   only: PermissionsConstants.OT_Room_View,
          //   redirectTo: CommonService.redirectToIfNoPermission
          // },
          relatedLinks: []
        }
      }
    ]
  }
];

@NgModule({
  declarations: [
    NurseMappingHomeComponent,
    NursingStationMappingComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(nursingMapRoute),
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    SharedModule,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class NurseMappingModule { }
