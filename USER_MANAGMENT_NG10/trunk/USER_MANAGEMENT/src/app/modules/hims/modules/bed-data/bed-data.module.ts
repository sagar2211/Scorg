import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BedDataHomeComponent } from './components/bed-data-home/bed-data-home.component';
import { BedDisplayComponent } from './components/bed-display/bed-display.component';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { BedDesignDisplayComponent } from './components/bed-design-display/bed-design-display.component';
import { BedDesignNursingComponent } from './components/bed-design-nursing/bed-design-nursing.component';

const bedDisplayRoute: Routes = [
  {
    path: '', component: BedDataHomeComponent,
    children: [
      {
        path: '', redirectTo: 'display', pathMatch: 'full'
      },
      {
        path: 'display',
        component: BedDisplayComponent,
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
    BedDataHomeComponent,
    BedDisplayComponent,
    BedDesignDisplayComponent,
    BedDesignNursingComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(bedDisplayRoute),
  ]
})
export class BedDataModule { }
