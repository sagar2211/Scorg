import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationHomeComponent } from './components/location-home/location-home.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { CommonService } from 'src/app/services/common.service';
import { LocationListComponent } from './components/location-list/location-list.component';
import { LocationMasterComponent } from './components/location-master/location-master.component';

const locationRoute: Routes = [
  {
    path: '', component: LocationHomeComponent,
    children: [
      {
        path: '', redirectTo: 'locationList'
      },
      {
        path: 'locationList',
        component: LocationListComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Location List',
          breadCrumInfo: {
            display: 'Location List', route: '/app/qms/locationList', redirectTo: '',
            isFilter: false, isAddPopup: true, btntext: 'ADD'
          },
          permissions: {
            only: PermissionsConstants.Location_Master_View,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        }
      },
    ]
  }
];

@NgModule({
  declarations: [
    LocationHomeComponent,
    LocationListComponent,
    LocationMasterComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    RouterModule.forChild(locationRoute),
  ]
})
export class LocationModule { }
