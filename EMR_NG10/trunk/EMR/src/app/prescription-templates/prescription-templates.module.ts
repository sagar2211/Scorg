import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrescriptionTemplateHomeComponent } from './components/prescription-template-home/prescription-template-home.component';
import { PrescriptionTemplateListComponent } from './components/prescription-template-list/prescription-template-list.component';
import { PrescriptionTemplateAddUpdateComponent } from './components/prescription-template-add-update/prescription-template-add-update.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { EmrSharedModule } from '../emr-shared/emr-shared.module';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from './../config/PermissionsConstants';
import { CommonService } from './../public/services/common.service';

const mappingRoutes: Routes = [
  {
    path: '', component: PrescriptionTemplateHomeComponent,
    children: [
      {
        path: '', redirectTo: 'list', pathMatch: 'full'
      },
      {
        path: 'list',
        component: PrescriptionTemplateListComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: {},
          permissions: {
            only: PermissionsConstants.Prescription_Template_View,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
      {
        path: 'template/:type',
        component: PrescriptionTemplateAddUpdateComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: {},
          permissions: {
            only: PermissionsConstants.Prescription_Template_View,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
    ]
  }
];

@NgModule({
  declarations: [
    PrescriptionTemplateHomeComponent,
    PrescriptionTemplateListComponent,
    PrescriptionTemplateAddUpdateComponent

  ],
  imports: [
    CommonModule,
    RouterModule.forChild(mappingRoutes),
    SharedModule,
    EmrSharedModule,
  ]
})
export class PrescriptionTemplatesModule { }
