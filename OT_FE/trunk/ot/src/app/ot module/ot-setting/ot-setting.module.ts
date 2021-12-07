import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingHomeComponent } from './components/setting-home/setting-home.component';
import { SettingComponent } from './components/setting/setting.component';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';

const setRoutes: Routes = [
  {
    path: '', component: SettingHomeComponent,
    children: [
      {
        path: '', redirectTo: 'setting', pathMatch: 'full'
      },
      {
        path: 'setting',
        component: SettingComponent,
        // canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'setting', route: 'app/qms/patient/addPatient' },
          // permissions: {
          //   only: PermissionsConstants.Add_PatientMaster,
          //   redirectTo: CommonService.redirectToIfNoPermission
          // },
          relatedLinks: []
        },
      }
    ]
  }
];

@NgModule({
  declarations: [
    SettingHomeComponent,
    SettingComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(setRoutes),
    SharedModule,
  ]
})
export class OtSettingModule { }
