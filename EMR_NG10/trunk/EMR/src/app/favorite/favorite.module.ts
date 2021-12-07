import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavoriteHomeComponent } from './components/favorite-home/favorite-home.component';
import { MedicineComponent } from './components/medicine/medicine.component';
import { DiagnosisComponent } from './components/diagnosis/diagnosis.component';
import { ComplaintsComponent } from './components/complaints/complaints.component';
import { RadioInvestigationComponent } from './components/radio-investigation/radio-investigation.component';
import { LabInvestigationComponent } from './components/lab-investigation/lab-investigation.component';
import { Routes, RouterModule } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from './../config/PermissionsConstants';
import { CommonService } from './../public/services/common.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { EmrSharedModule } from '../emr-shared/emr-shared.module';
import { NursingComponent } from './components/nursing/nursing.component';
import { DietComponent } from './components/diet/diet.component';

const favRoutes: Routes = [
  {
    path: '', component: FavoriteHomeComponent,
    children: [
      {
        path: '', redirectTo: 'medicine', pathMatch: 'full'
      },
      {
        path: 'medicine',
        component: MedicineComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: {},
          permissions: {
            only: PermissionsConstants.Medicine_Favorite_View,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
      {
        path: 'diagnosis',
        component: DiagnosisComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: {},
          permissions: {
            only: PermissionsConstants.Diagnosis_Favorite_View,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
      {
        path: 'complaints',
        component: ComplaintsComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: {},
          permissions: {
            only: PermissionsConstants.Complaint_Favorite_View,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
      {
        path: 'radioInvestigation',
        component: RadioInvestigationComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: {},
          permissions: {
            only: PermissionsConstants.Radio_Investigation_Favorite_View,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
      {
        path: 'labInvestigation',
        component: LabInvestigationComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: {},
          permissions: {
            only: PermissionsConstants.Lab_Investigation_Favorite_View,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
      {
        path: 'nursing',
        component: NursingComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: {},
          permissions: {
            only: PermissionsConstants.Nursing_Favorite_View,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
      {
        path: 'diet',
        component: DietComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: {},
          permissions: {
            only: PermissionsConstants.Diet_favorite_View,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
    ]
  }
];

@NgModule({
  declarations: [
    FavoriteHomeComponent,
    MedicineComponent,
    DiagnosisComponent,
    ComplaintsComponent,
    RadioInvestigationComponent,
    LabInvestigationComponent,
    NursingComponent,
    DietComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(favRoutes),
    SharedModule,
    EmrSharedModule,
  ]
})
export class FavoriteModule { }
