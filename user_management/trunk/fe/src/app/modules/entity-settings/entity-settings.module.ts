import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntitySettingsHomeComponent } from './components/entity-settings-home/entity-settings-home.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { CommonService } from 'src/app/services/common.service';
import { EntitySettingsComponent } from './components/entity-settings/entity-settings.component';

const settingRoute: Routes = [
  {
    path: '', component: EntitySettingsHomeComponent,
    children: [
      {
        path: '', redirectTo: 'entitySettings'
      },
      {
        path: 'entitySettings',
        component: EntitySettingsComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Manage Calendar', route: 'appointmentApp/appointments/entitySettings', isFilter: false, isAddPopup: true },
          permissions: {
            only: PermissionsConstants.View_Manage_Calendar,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: [
            {
              displayName: 'Doctor Dashboard',
              routeLink: 'app/qms/dashboard/doctor',
              permission: PermissionsConstants.View_DoctorDashboard
            }
          ]
        },
      },
    ]
  }
];

@NgModule({
  declarations: [
    EntitySettingsHomeComponent,
    EntitySettingsComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    RouterModule.forChild(settingRoute),
  ],
  exports: [
    EntitySettingsComponent
  ]
})
export class EntitySettingsModule { }
