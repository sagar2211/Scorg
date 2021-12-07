import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientDocumentHomeComponent } from './components/patient-document-home/patient-document-home.component';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { DocumentsComponent } from './components/documents/documents.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { EmrSharedModule } from 'src/app/emr-shared/emr-shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DisplayImagesComponent } from './components/display-images/display-images.component';
import { FileAttachmentsComponent } from './components/file-attachments/file-attachments.component';

const documentRoute: Routes = [
  {
    path: '', component: PatientDocumentHomeComponent,
    children: [
      {
        path: '', redirectTo: 'documents'
      },
      {
        path: 'documents/:type/:patientId',
        component: DocumentsComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: {},
          permissions: {
            only: PermissionsConstants.Doctor_Dashboard_View,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
    ]
  }
];

@NgModule({
  declarations: [
    PatientDocumentHomeComponent,
    DocumentsComponent,
    DisplayImagesComponent,
    FileAttachmentsComponent,
  ],
  exports: [
    FileAttachmentsComponent
  ],
  entryComponents: [
    FileAttachmentsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    EmrSharedModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    RouterModule.forChild(documentRoute),
  ]
})
export class PatientDocumentsModule { }
