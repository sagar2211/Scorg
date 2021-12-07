import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomSectionHomeComponent } from './components/room-section-home/room-section-home.component';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { CommonService } from 'src/app/services/common.service';
import { RoomSectionMapListComponent } from './components/room-section-map-list/room-section-map-list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RoomSectionMapAppComponent } from './components/room-section-map-app/room-section-map-app.component';

const roomRoute: Routes = [
  {
    path: '', component: RoomSectionHomeComponent,
    children: [
      {
        path: '', redirectTo: 'roomSectionMapList'
      },
      {
        path: 'roomSectionMapList',
        component: RoomSectionMapListComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Room Section Mapping',
          breadCrumInfo: {
            display: 'Section Mapping',
            route: '/app/qms/roomSection/roomSectionMapList',
            redirectTo: 'app/qms/roomSection/addRoomSectionMapping',
            isFilter: false, isAddPopup: true, btntext: 'ADD'
          },
          permissions: {
            only: PermissionsConstants.View_Room_Section_Mapping,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        }
      },
      {
        path: 'addRoomSectionMapping',
        component: RoomSectionMapAppComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Add Room Section Mapping',
          breadCrumInfo: {
            display: 'Add Room Section Mapping',
            route: '/app/qms/roomSection/roomSection/addRoomSectionMapping',
            redirectTo: '',
            isFilter: false, isAddPopup: false, btntext: 'ADD'
          },
          permissions: {
            only: PermissionsConstants.Add_Room_Section_Mapping,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        }
      }
    ]
  }
];

@NgModule({
  declarations: [
    RoomSectionHomeComponent,
    RoomSectionMapListComponent,
    RoomSectionMapAppComponent
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
export class RoomSectionModule { }
