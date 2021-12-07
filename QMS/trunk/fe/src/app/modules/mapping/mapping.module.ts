import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MappingHomeComponent } from './components/mapping-home/mapping-home.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { SectionRoomDoctorMappingComponent } from './components/section-room-doctor-mapping/section-room-doctor-mapping.component';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { CommonService } from 'src/app/services/common.service';
import { FrontDeskEntityMappingMasterListComponent } from './components/front-desk-entity-mapping-master-list/front-desk-entity-mapping-master-list.component';
import { EntityMappingForFrontDeskComponent } from './components/entity-mapping-for-front-desk/entity-mapping-for-front-desk.component';

const mapRoute: Routes = [
  {
    path: '', component: MappingHomeComponent,
    children: [
      {
        path: '', redirectTo: 'sectionDoctorMapping'
      },
      {
        path: 'sectionDoctorMapping',
        component: SectionRoomDoctorMappingComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Section Mapping Details',
          breadCrumInfo: {
            display: 'Section Mapping Details', route: '/app/qms/mapping/sectionDoctorMapping', redirectTo: '',
            isFilter: true, isAddPopup: false, btntext: 'ADD'
          }
        }
      },
      {
        path: 'sectionDoctorMapping/:sectionName',
        component: SectionRoomDoctorMappingComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Section Mapping Details',
          breadCrumInfo: {
            display: 'Section Mapping Details', route: '/app/qms/mapping/sectionDoctorMapping', redirectTo: '',
            isFilter: false, isAddPopup: false, btntext: 'ADD'
          }
        }
      },
      {
        path: 'frontDeskentityMappingList',
        component: FrontDeskEntityMappingMasterListComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: {
            display: 'Front Desk User Mappings', route: 'app/qms/mapping/frontDeskentityMappingList', redirectTo: 'app/qms/frontDeskentityMapping',
            isFilter: false, isAddPopup: true, btntext: 'ADD'
          },
          permissions: {
            only: PermissionsConstants.View_Front_Desk_Entity_Mapping,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
      {
        path: 'frontDeskentityMapping',
        component: EntityMappingForFrontDeskComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'New User Mapping', route: '/app/mapping/qms/frontDeskentityMapping' },
          permissions: {
            only: PermissionsConstants.Add_Front_Desk_Entity_Mapping,
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
    SectionRoomDoctorMappingComponent,
    FrontDeskEntityMappingMasterListComponent,
    EntityMappingForFrontDeskComponent
  ],
  imports: [
      CommonModule,
      SharedModule,
      ReactiveFormsModule,
      FormsModule,
      NgbModule,
      RouterModule.forChild(mapRoute),
  ]
})
export class MappingModule { }
