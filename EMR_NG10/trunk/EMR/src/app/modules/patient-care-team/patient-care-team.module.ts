import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientCareTeamHomeComponent } from './components/patient-care-team-home/patient-care-team-home.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { EmrSharedModule } from 'src/app/emr-shared/emr-shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { CareTeamComponent } from './components/care-team/care-team.component';

const teamRoute: Routes = [
  {
    path: '', component: PatientCareTeamHomeComponent,
    children: [
      {
        path: '', redirectTo: 'care_team'
      },
      { // -- working
        path: 'care_team/:patientId',
        component: CareTeamComponent,
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
    PatientCareTeamHomeComponent,
    CareTeamComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    EmrSharedModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    RouterModule.forChild(teamRoute),
  ]
})
export class PatientCareTeamModule { }
