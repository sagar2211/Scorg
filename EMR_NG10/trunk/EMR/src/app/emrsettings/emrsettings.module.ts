import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmrSettingHomeComponent } from './components/emr-setting-home/emr-setting-home.component';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { EmrSharedModule } from '../emr-shared/emr-shared.module';

const settingRoutes: Routes = [
  {
    path: '', component: EmrSettingHomeComponent,
    children: [
      {
        path: '', redirectTo: 'list', pathMatch: 'full'
      },
      // {
      //   path: 'list',
      //   component: FormListComponent,
      //   canActivate: [NgxPermissionsGuard],
      //   data: {
      //     breadCrumInfo: {},
      //     permissions: {
      //       only: PermissionsConstants.Doctor_Dashboard_View,
      //       redirectTo: CommonService.redirectToIfNoPermission
      //     }
      //   },
      // },
      // {
      //   path: 'form/:type',
      //   component: FormComponent,
      //   canActivate: [NgxPermissionsGuard],
      //   data: {
      //     breadCrumInfo: {},
      //     permissions: {
      //       only: PermissionsConstants.Doctor_Dashboard_View,
      //       redirectTo: CommonService.redirectToIfNoPermission
      //     }
      //   },
      // },
    ]
  }
];

@NgModule({
  declarations: [
    EmrSettingHomeComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(settingRoutes),
    SharedModule,
    EmrSharedModule,
  ]
})
export class EmrsettingsModule { }
