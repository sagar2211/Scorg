import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExaminationLabelHomeComponent } from './components/examination-label-home/examination-label-home.component';
import { ExaminationLabelListComponent } from './components/examination-label-list/examination-label-list.component';
import { ExaminationLabelAddUpdateComponent } from './components/examination-label-add-update/examination-label-add-update.component';
import { Routes, RouterModule } from '@angular/router';
import { PermissionsConstants } from './../config/PermissionsConstants';
import { CommonService } from './../public/services/common.service';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { SharedModule } from 'src/app/shared/shared.module';
import { EmrSharedModule } from '../emr-shared/emr-shared.module';

const examinationRoutes: Routes = [
  {
    path: '', component: ExaminationLabelHomeComponent,
    children: [
      {
        path: '', redirectTo: 'list', pathMatch: 'full'
      },
      {
        path: 'list',
        component: ExaminationLabelListComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Examination Label List',
          breadCrumInfo: {
            display: 'Examination Label List  ', route: '/emr/examinationLabel/list', redirectTo: '',
            btntext: 'ADD', isFilter: true, isAddPopup: true
          },
          permissions: {
            only: PermissionsConstants.Examination_Label_View,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      },
    ]
  }
];

@NgModule({
  declarations: [
    ExaminationLabelHomeComponent,
    ExaminationLabelListComponent,
    ExaminationLabelAddUpdateComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(examinationRoutes),
    SharedModule,
    EmrSharedModule,
    NgxDatatableModule,
    ReactiveFormsModule,
    FormsModule
  ],
  entryComponents: [
    ExaminationLabelAddUpdateComponent
  ]
})
export class ExaminationLabelModule { }
