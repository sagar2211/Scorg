import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CertificateMasterComponent } from './components/certificate-master/certificate-master.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { CopyTemplateComponent } from './components/copy-template/copy-template.component';
import { CKEditorModule } from 'ng2-ckeditor';

const certificateRoute: Routes = [
  {
    path: 'templates',
    component: CertificateMasterComponent,
    data: {
      displayName: 'Certificate Master',
      breadCrumInfo: {
        display: 'Certificate Master', route: '/emr/ot/master/roomMasterList', redirectTo: '',
        isFilter: false, isAddPopup: false
      },
      permissions: {
        only: PermissionsConstants.UserMaster_Force_Logout,
        redirectTo: CommonService.redirectToIfNoPermission
      },
      relatedLinks: []
    }
  }
];

@NgModule({
  declarations: [
    CertificateMasterComponent,
    CopyTemplateComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(certificateRoute),
    AngularEditorModule,
    CKEditorModule
  ]
})
export class CertificateMasterModule { }
