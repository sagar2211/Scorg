import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuggestionSettingComponent } from './components/suggestion-setting/suggestion-setting.component';
import { RouterModule, Routes } from '@angular/router';
import { SuggestionConfigurationHomeComponent } from './components/suggestion-configuration-home/suggestion-configuration-home.component';
import { PatientChartService } from '../patient-chart/patient-chart.service';
import { EMRService } from './../public/services/emr-service';
import { ModifyDataBySectionKeyPipe } from '../patient-chart/modify-data-by-section-key.pipe';
import { SharedModule } from './../shared/shared.module';
import { EmrSharedModule } from '../emr-shared/emr-shared.module';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from '../config/PermissionsConstants';
import { CommonService } from '../public/services/common.service';

const mappingRoutes: Routes = [
  {
    path: '', component: SuggestionConfigurationHomeComponent,
    children: [
      {
        path: '', redirectTo: 'suggestionSetting', pathMatch: 'full'
      },
      {
        path: 'suggestionSetting',
        component: SuggestionSettingComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Suggestion Setting',
          breadCrumInfo: {
            display: 'Suggestion Setting', route: '/emr/examinationLabel/suggestionSetting', redirectTo: '',
            btntext: 'ADD', isFilter: false, isAddPopup: false
          },
          permissions: {
            only: PermissionsConstants.Suggestion_Configuration_View,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      }
    ]
  }
];

@NgModule({
  declarations: [
    SuggestionConfigurationHomeComponent,
    SuggestionSettingComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    EmrSharedModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(mappingRoutes)
  ],
  providers: [
    PatientChartService,
    EMRService,
    ModifyDataBySectionKeyPipe
  ]
})
export class SuggestionsConfigurationModule { }
