import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommunicationTemplateHomeComponent } from './components/communication-template-home/communication-template-home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TemplateMasterComponent } from './components/template-master/template-master.component';
import { TemplateMappingComponent } from './components/template-mapping/template-mapping.component';
import { SetFeedbackDefaultTemplateComponent } from './components/set-feedback-default-template/set-feedback-default-template.component';

const communicationRoute: Routes = [
  {
    path: '', component: CommunicationTemplateHomeComponent,
    children: [
      {
        path: '', redirectTo: 'master', pathMatch: 'full'
      },
      {
        path: 'master',
        component: TemplateMasterComponent,
        // canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Templates',
          breadCrumInfo: {
            display: 'Bulk SMS Notification',
            route: 'app/qms/communication/patientbulksms',
            isAddPopup: true, btntext: 'Add Template'
          },
          // permissions: {
          //   only: PermissionsConstants.Add_PatientMaster,
          //   redirectTo: CommonService.redirectToIfNoPermission
          // },
        }
      },
      {
        path: 'mapping',
        component: TemplateMappingComponent,
        // canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Templates Mapping',
          breadCrumInfo: {
            display: 'Templates Mapping', route: '/app/qms/communication/templateMapping',
            isAddPopup: true, btntext: 'Add Template Mapping'
          },
          // permissions: {
          //   only: PermissionsConstants.Add_PatientMaster,
          //   redirectTo: CommonService.redirectToIfNoPermission
          // },
        }
      },
      {
        path: 'feedback',
        component: SetFeedbackDefaultTemplateComponent,
        // canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Set Feedback Template',
          breadCrumInfo: { display: 'Set Feedback Template', route: 'app/qms/communication/feedbackTemplate' },
          // permissions: {
          //   only: PermissionsConstants.Add_PatientMaster,
          //   redirectTo: CommonService.redirectToIfNoPermission
          // },
        }
      },
    ],
  }
];

@NgModule({
  declarations: [
    CommunicationTemplateHomeComponent,
    TemplateMasterComponent,
    TemplateMappingComponent,
    SetFeedbackDefaultTemplateComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(communicationRoute),
    NgxDatatableModule
  ]
})
export class CommunicationTemplatesModule { }
