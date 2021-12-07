import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DoctorShareSettingHomeComponent } from './components/doctor-share-setting-home/doctor-share-setting-home.component';
import { SharePolicySettingComponent } from './components/share-policy-setting/share-policy-setting.component';
import { DoctorSharePolicyComponent } from './components/doctor-share-policy/doctor-share-policy.component';
import { GlobalShareSettingComponent } from './components/global-share-setting/global-share-setting.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { DxAutocompleteModule, DxDataGridModule, DxDropDownBoxModule, DxListModule, DxLookupModule, DxTemplateModule } from 'devextreme-angular';

const settingRoute: Routes = [
  {
    path: '', component: DoctorShareSettingHomeComponent,
    children: [
      {
        path: '', redirectTo: 'globalShareSetting', pathMatch: 'full'
      },
      {
        path: 'globalShareSetting',
        component: GlobalShareSettingComponent
      },
      {
        path: 'sharePolicySetting',
        component: SharePolicySettingComponent
      },
      {
        path: 'doctorShare',
        component: DoctorSharePolicyComponent
      },
    ]
  }
];

@NgModule({
  declarations: [
    DoctorShareSettingHomeComponent,
    SharePolicySettingComponent,
    DoctorSharePolicyComponent,
    GlobalShareSettingComponent],
  imports: [
    FormsModule,
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(settingRoute),
    DxDataGridModule,
    DxAutocompleteModule,
    DxTemplateModule,
    DxLookupModule,
    DxListModule,
    DxDropDownBoxModule,
  ]
})
export class DoctorShareSettingsModule { }
