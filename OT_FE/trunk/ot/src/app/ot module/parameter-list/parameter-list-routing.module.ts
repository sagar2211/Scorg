import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ParameterListHomeComponent } from './components/parameter-list-home/parameter-list-home.component';
import { ParametarComponent } from './components/parametar/parametar.component';
import { ParametarListComponent } from './components/parametar-list/parametar-list.component';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';

const routes: Routes = [
  {
    path : '',
    component : ParameterListHomeComponent,
    children : [
      {
        path : '',
        redirectTo : ''
      },
      {
        path: 'list',
        component: ParametarComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Pre-Op Parameters Master list',
          breadCrumInfo: {
            display: 'Pre-Op Parameters Master list', route: '/otApp/ot/parameters/parameterList/list', redirectTo: '',
            isFilter: false, isAddPopup: true
          },
          permissions: {
            only: PermissionsConstants.OT_Parameter_View,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      },
      {
        path: 'registerParameter',
        component: ParametarComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Register Parameter',
          breadCrumInfo: {
            display: 'Register Parameter', route: '/otApp/ot/parameters/parameterList/registerParameter', redirectTo: '',
            isFilter: false, isAddPopup: false
          },
          permissions: {
            only: PermissionsConstants.OT_Register_View,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ParameterListRoutingModule { }
