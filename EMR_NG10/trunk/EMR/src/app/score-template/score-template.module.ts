import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScoreTemplateHomeComponent } from './components/score-template-home/score-template-home.component';
import { ScoreTemplateListComponent } from './components/score-template-list/score-template-list.component';
import { ScoreTemplateAddUpdateComponent } from './components/score-template-add-update/score-template-add-update.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { EmrSharedModule } from '../emr-shared/emr-shared.module';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from './../config/PermissionsConstants';
import { CommonService } from './../public/services/common.service';
import { DndModule } from 'ngx-drag-drop';

const scoreTemplateRoutes: Routes = [
  {
    path: '', component: ScoreTemplateHomeComponent,
    children: [
      {
        path: '', redirectTo: 'list', pathMatch: 'full'
      },
      {
        path: 'list',
        component: ScoreTemplateListComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Score Templates List',
          breadCrumInfo: {
            display: 'Score Templates List', route: '/emr/scoreTemplate/list', redirectTo: '',
            btntext: 'ADD', isFilter: false, isAddPopup: true
          },
          permissions: {
            only: PermissionsConstants.Score_Template_View,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      },
      {
        path: 'template/add',
        component: ScoreTemplateAddUpdateComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Add Score Template',
          breadCrumInfo: {
            display: 'Add Score Template', route: '/emr/scoreTemplate/template/add', redirectTo: '',
            btntext: 'ADD', isFilter: false, isAddPopup: false
          },
          permissions: {
            only: PermissionsConstants.Score_Template_Add,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      },
      {
        path: 'template/add/:id',
        component: ScoreTemplateAddUpdateComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Update Score Template',
          breadCrumInfo: {
            display: 'Update Score Template', route: '/emr/scoreTemplate/template/add/:id', redirectTo: '',
            btntext: 'ADD', isFilter: false, isAddPopup: false
          },
          permissions: {
            only: PermissionsConstants.Score_Template_Update,
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
    ScoreTemplateHomeComponent,
    ScoreTemplateListComponent,
    ScoreTemplateAddUpdateComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(scoreTemplateRoutes),
    SharedModule,
    EmrSharedModule,
    DndModule,
    FormsModule, ReactiveFormsModule,
    NgxDatatableModule
  ]
})
export class ScoreTemplateModule { }
