import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OtMasterHomeComponent } from './component/ot-master-home/ot-master-home.component';
import { AuthGuard } from 'src/app/auth/auth.guard';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { OtRoomMasterComponent } from './component/ot-room-master/ot-room-master.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { OtRoomMasterListComponent } from './component/ot-room-master-list/ot-room-master-list.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

const otMasterRoute: Routes = [
  {
    path: '', component: OtMasterHomeComponent,
    children: [
      {
        path: '', redirectTo: 'roomMasterList', pathMatch: 'full'
      },
      {
        path: 'roomMasterList',
        component: OtRoomMasterListComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'OT Room Master List',
          breadCrumInfo: {
            display: 'OT Room Master List', route: '/otApp/ot/master/roomMasterList', redirectTo: '',
            isFilter: false, isAddPopup: true
          },
          permissions: {
            only: PermissionsConstants.OT_Room_View,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      },
      {
        path: 'roomMaster',
        component: OtRoomMasterComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'OT Room Master',
          breadCrumInfo: {
            display: 'OT Room Master', route: '/otApp/ot/master/roomMaster', redirectTo: '',
            isFilter: false, isAddPopup: false
          },
          permissions: {
            only: PermissionsConstants.OT_Room_Add,
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
    OtMasterHomeComponent,
    OtRoomMasterComponent,
    OtRoomMasterListComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    SharedModule,
    //EmrSharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(otMasterRoute),
    NgxDatatableModule,
    NgbModule
  ]
})
export class MasterOtModule { }
