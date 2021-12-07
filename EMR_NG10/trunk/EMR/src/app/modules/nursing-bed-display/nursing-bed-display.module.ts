import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BedDisplayHomeComponent } from './components/bed-display-home/bed-display-home.component';
import { NursingBedDisplayHomeComponent } from './components/nursing-bed-display-home/nursing-bed-display-home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { NotificationPopupComponent } from './components/notification-popup/notification-popup.component';
import { EmrOrderListComponent } from './components/emr-order-list/emr-order-list.component';
import { HisServiceOrderComponent } from './components/his-service-order/his-service-order.component';
import { EmrSharedModule } from 'src/app/emr-shared/emr-shared.module';

const nurseDisplayRoute: Routes = [
  {
    path: '', component: BedDisplayHomeComponent,
    children: [
      {
        path: '', redirectTo: 'display', pathMatch: 'full'
      },
      {
        path: 'display',
        component: NursingBedDisplayHomeComponent,
        // canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Bed Display',
          breadCrumInfo: {
            display: 'Bed Display', route: '/emr/ot/master/roomMasterList', redirectTo: '',
            isFilter: false, isAddPopup: true
          },
          permissions: {
            // only: PermissionsConstants.OT_Room_View,
            // redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      }
    ]
  }
];



@NgModule({
  declarations: [
    BedDisplayHomeComponent,
    NursingBedDisplayHomeComponent,
    NotificationPopupComponent,
    EmrOrderListComponent,
    HisServiceOrderComponent,
  ],
  imports: [
    // OrdersModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(nurseDisplayRoute),
    EmrSharedModule
  ]
})
export class NursingBedDisplayModule { }
