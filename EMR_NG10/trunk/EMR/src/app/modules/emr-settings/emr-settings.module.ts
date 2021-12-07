import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmrSettingHomeComponent } from './components/emr-setting-home/emr-setting-home.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { EmrSettingSideMenuComponent } from './components/emr-setting-side-menu/emr-setting-side-menu.component';
import { WelcomeEmrSettingComponent } from './components/welcome-emr-setting/welcome-emr-setting.component';

const settingsRoute: Routes = [
  {
    path: '', component: EmrSettingHomeComponent,
    children: [
      {
        path: '', redirectTo: 'charts', pathMatch: 'full'
      },
      {
        path: 'charts',
        loadChildren: () => import('../../patient-chart/patient-chart.module').then(m => m.PatientChartModule)
      },
      {
        path: 'faqTemplates',
        loadChildren: () => import('../../gereratefaqtemplates/gereratefaqtemplates.module').then(m => m.GereratefaqtemplatesModule)
      },
      {
        path: 'scoreTemplate',
        loadChildren: () => import('../../score-template/score-template.module').then(m => m.ScoreTemplateModule)
      },
      {
        path: 'examinationLabel',
        loadChildren: () => import('../../examination-label/examination-label.module').then(m => m.ExaminationLabelModule)
      },
      {
        path: 'prescriptionTemplate',
        loadChildren: () => import('../../prescription-templates/prescription-templates.module').then(m => m.PrescriptionTemplatesModule)
      },
      {
        path: 'suggestionConfiguration',
        loadChildren: () => import('../../suggestions-configuration/suggestions-configuration.module').then(m => m.SuggestionsConfigurationModule)
      },
      {
        path: 'mapping',
        loadChildren: () => import('../../mapping/mapping.module').then(m => m.MappingModule)
      },
      {
        path: 'favorites',
        loadChildren: () => import('../../favorite/favorite.module').then(m => m.FavoriteModule)
      },
      {
        path: 'vitals',
        loadChildren: () => import('../../masters/vitals/vitals.module').then(m => m.VitalsModule)
      },
      {
        path: 'ordersSettings',
        loadChildren: () => import('../../modules/order-settings/order-settings.module').then(m => m.OrderSettingsModule)
      },
      {
        path: 'welcome',
        component: WelcomeEmrSettingComponent
      }
    ]
  }
];


@NgModule({
  declarations: [
    EmrSettingHomeComponent,
    EmrSettingSideMenuComponent,
    WelcomeEmrSettingComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(settingsRoute),
  ]
})
export class EmrSettingsModule { }
