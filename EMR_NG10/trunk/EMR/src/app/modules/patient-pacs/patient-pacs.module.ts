import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientPacsHomeComponent } from './components/patient-pacs-home/patient-pacs-home.component';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { EmrSharedModule } from 'src/app/emr-shared/emr-shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PacsComponent } from './components/pacs/pacs.component';

const pacsRoute: Routes = [
  {
    path: '', component: PatientPacsHomeComponent,
    children: [
      {
        path: '', redirectTo: 'pacs'
      },
      { // -- working
        path: 'pacs/:patientId',
        component: PacsComponent,
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
    PatientPacsHomeComponent,
    PacsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    EmrSharedModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    RouterModule.forChild(pacsRoute),
  ]
})
export class PatientPacsModule { }
