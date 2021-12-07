import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateHomeComponent } from './components/template-home/template-home.component';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { EmrSharedModule } from '../emr-shared/emr-shared.module';
import { TemplateListComponent } from './components/template-list/template-list.component';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { FaqService } from './faq.service';
import { AddFaqTemplateComponent } from './components/add-faq-template/add-faq-template.component';
import { FormBuilderComponent } from './components/form-builder/form-builder.component';
import { FormListComponent } from './components/form-list/form-list.component';
import { FormRenderComponent } from './components/form-render/form-render.component';
import { DndModule } from 'ngx-drag-drop';
import { FormControlSettingComponent } from './components/form-control-setting/form-control-setting.component';
import { PermissionsConstants } from '../config/PermissionsConstants';
import { CommonService } from '../public/services/common.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FormsModule } from '@angular/forms';

const templateRoutes: Routes = [
  {
    path: '', component: TemplateHomeComponent,
    children: [
      {
        path: '', redirectTo: 'list', pathMatch: 'full'
      },
      {
        path: 'list',
        component: TemplateListComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'FAQ Templates List',
          breadCrumInfo: {
            display: 'FAQ Templates List', route: '/emr/faqTemplates/list', redirectTo: '',
            btntext: 'ADD', isFilter: false, isAddPopup: true
          },
          permissions: {
            only: PermissionsConstants.FAQ_Template_View,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      },
      {
        path: 'create-template/:id',
        component: FormBuilderComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Add FAQ Template',
          breadCrumInfo: {
            display: 'Add FAQ Template', route: '/emr/faqTemplates/create-template/:id', redirectTo: '',
            btntext: 'ADD', isFilter: false, isAddPopup: false
          },
          permissions: {
            only: PermissionsConstants.FAQ_Template_Add,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      },
      {
        path: 'form-list',
        component: FormListComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Form List',
          breadCrumInfo: {
            display: 'Form List', route: '/emr/faqTemplates/form-list', redirectTo: '',
            btntext: 'ADD', isFilter: false, isAddPopup: true
          },
          permissions: {
            only: PermissionsConstants.FAQ_Template_View,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      },
      {
        path: 'createform/:id',
        component: FormBuilderComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Add FAQ Template',
          breadCrumInfo: {
            display: 'Add FAQ Template', route: '/emr/faqTemplates/create-template/:id', redirectTo: '',
            btntext: 'ADD', isFilter: false, isAddPopup: false
          },
          permissions: {
            only: PermissionsConstants.FAQ_Template_Add,
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
    TemplateHomeComponent,
    TemplateListComponent,
    AddFaqTemplateComponent,
    FormBuilderComponent,
    FormRenderComponent,
    FormControlSettingComponent,
    FormListComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(templateRoutes),
    SharedModule,
    EmrSharedModule,
    DndModule,
    NgxDatatableModule,
    FormsModule
  ],
  entryComponents: [
    FormControlSettingComponent,
    AddFaqTemplateComponent
  ]
})
export class GereratefaqtemplatesModule { }
