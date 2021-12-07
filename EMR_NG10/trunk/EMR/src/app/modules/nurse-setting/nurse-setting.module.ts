import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingHomeComponent } from './components/setting-home/setting-home.component';
import { SettingsComponent } from './components/settings/settings.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';

const nursingSetRoute: Routes = [
  {
    path: '', component: SettingHomeComponent,
    children: [
      {
        path: '', redirectTo: 'settingOne', pathMatch: 'full'
      },
      {
        path: 'settingOne',
        component: SettingsComponent,
        // canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Setting',
          breadCrumInfo: {
            display: 'Setting', route: '/emr/ot/master/roomMasterList', redirectTo: ''
          },
          // permissions: {
          //   only: PermissionsConstants.OT_Room_View,
          //   redirectTo: CommonService.redirectToIfNoPermission
          // },
          relatedLinks: []
        }
      }
    ]
  }
];


@NgModule({
  declarations: [
    SettingHomeComponent,
    SettingsComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(nursingSetRoute),
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
  ]
})
export class NurseSettingModule { }
