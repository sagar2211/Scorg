import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntityRoomHomeComponent } from './components/entity-room-home/entity-room-home.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { CommonService } from 'src/app/services/common.service';
import { EntityRoomMapListComponent } from './components/entity-room-map-list/entity-room-map-list.component';
import { EntityRoomMapComponent } from './components/entity-room-map/entity-room-map.component';

const roomRoute: Routes = [
  {
    path: '', component: EntityRoomHomeComponent,
    children: [
      {
        path: '', redirectTo: 'entityRoomMapList'
      },
      {
        path: 'entityRoomMapList',
        component: EntityRoomMapListComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Entity Room',
          breadCrumInfo: {
            display: 'Entity Room', route: '/app/qms/entityRoom/entityRoomMapList', redirectTo: 'app/qms/entityRoom/entityRoomMap',
            isFilter: false, isAddPopup: true, btntext: 'ADD'
          },
          permissions: {
            only: PermissionsConstants.View_Room_Entity_Mapping,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        }
      },
      {
        path: 'entityRoomMap',
        component: EntityRoomMapComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Entity Room Mapping',
          breadCrumInfo: { display: 'Entity Room Mapping', route: '/app/qms/entityRoom/entityRoomMap' },
          permissions: {
            only: PermissionsConstants.Add_Room_Entity_Mapping,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        }
      },
      {
        path: 'updateEntityRoomMap/:entityId/:entityName/:entityKey/:providerId/:providerName',
        component: EntityRoomMapComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Entity Room Mapping',
          breadCrumInfo: { display: 'Entity Room Mapping', route: '/app/qms/entityRoom/updateEntityRoomMap/:entityId/:entityName/:entityKey/:providerId/:providerName' },
          permissions: {
            only: PermissionsConstants.Update_Room_Entity_Mapping,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        }
      },
    ]
  }
];


@NgModule({
  declarations: [
    EntityRoomHomeComponent,
    EntityRoomMapListComponent,
    EntityRoomMapComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    RouterModule.forChild(roomRoute),
  ]
})
export class RoomEntityModule { }
