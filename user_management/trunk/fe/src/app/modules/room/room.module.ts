import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomHomeComponent } from './components/room-home/room-home.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { CommonService } from 'src/app/services/common.service';
import { RoomListComponent } from './components/room-list/room-list.component';
import { RoomMasterComponent } from './components/room-master/room-master.component';

const roomRoute: Routes = [
  {
    path: '', component: RoomHomeComponent,
    children: [
      {
        path: '', redirectTo: 'roomList'
      },
      {
        path: 'roomList',
        component: RoomListComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Room List',
          breadCrumInfo: {
            display: 'Room List', route: '/app/qms/room/roomList', redirectTo: '',
            isFilter: false, isAddPopup: true, btntext: 'ADD'
          },
          permissions: {
            only: PermissionsConstants.View_Room_Master,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        }
      }
    ]
  }
];


@NgModule({
  declarations: [
    RoomHomeComponent,
    RoomListComponent,
    RoomMasterComponent
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
export class RoomModule { }
