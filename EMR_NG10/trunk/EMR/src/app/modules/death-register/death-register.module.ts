import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeathRegisterHomeComponent } from './components/death-register-home/death-register-home.component';
import { RouterModule, Routes } from '@angular/router';
import { DeathPatientListComponent } from './components/death-patient-list/death-patient-list.component';
import { DeathPatientAddUpdateComponent } from './components/death-patient-add-update/death-patient-add-update.component';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { PatientDeathService } from './services/patient-death.service';

const deathRegisterRoute: Routes = [
  {
    path: '', component: DeathRegisterHomeComponent,
    children: [
      {
        path: '', redirectTo: 'addPatient', pathMatch: 'full'
      },
      {
        path: 'list',
        component: DeathPatientListComponent,
        // canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Death Patient List',
          breadCrumInfo: {
            display: 'Death Patient List', route: '/inventory/masters/item/itemType', redirectTo: '',
            isFilter: false, isAddPopup: false
          },
          relatedLinks: []
        }
      },
      {
        path: 'list/:token/:appKey',
        component: DeathPatientListComponent,
        // canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Death Patient List',
          breadCrumInfo: {
            display: 'Death Patient List', route: '/inventory/masters/item/itemType', redirectTo: '',
            isFilter: false, isAddPopup: false
          },
          relatedLinks: []
        }
      },
      {
        path: 'addPatient',
        component: DeathPatientAddUpdateComponent,
        data: {
          displayName: 'Add Death Patient',
          breadCrumInfo: {
            display: 'Add Death Patient', route: '/inventory/masters/item/itemType', redirectTo: '',
            isFilter: false, isAddPopup: false
          },
          relatedLinks: []
        }
      },
      {
        path : 'addPatient/:token/:appKey/:encounterId',
        component : DeathPatientAddUpdateComponent,
        data: {
          displayName: 'Add Death Patient',
          breadCrumInfo: {
            display: 'Add Death Patient', route: '/inventory/masters/item/itemType', redirectTo: '',
            isFilter: false, isAddPopup: false
          },
          relatedLinks: []
        }
      },
      {
        path: 'addPatient/:token/:appKey',
        component: DeathPatientAddUpdateComponent,
        data: {
          displayName: 'Add Death Patient',
          breadCrumInfo: {
            display: 'Add Death Patient', route: '/inventory/masters/item/itemType', redirectTo: '',
            isFilter: false, isAddPopup: false
          },
          relatedLinks: []
        }
      },
      {
        path: 'updatePatient/:encounterId',
        component: DeathPatientAddUpdateComponent,
        // canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Update Death Patient',
          breadCrumInfo: {
            display: 'Update Death Patient', route: '/inventory/masters/item/itemType', redirectTo: '',
            isFilter: false, isAddPopup: false
          },
          // permissions: {
          //   only: PermissionsConstants.QMS_APP_MENU,
          //   redirectTo: CommonService.redirectToIfNoPermission
          // },
          relatedLinks: []
        }
      },
      {
        path: 'updatePatient/:encounterId/:token',
        component: DeathPatientAddUpdateComponent,
        data: {
          displayName: 'Add Death Patient',
          breadCrumInfo: {
            display: 'Add Death Patient', route: '/inventory/masters/item/itemType', redirectTo: '',
            isFilter: false, isAddPopup: false
          },
          relatedLinks: []
        }
      }
    ]
  }
];

@NgModule({
  declarations: [
    DeathRegisterHomeComponent,
    DeathPatientListComponent,
    DeathPatientAddUpdateComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule.forChild(deathRegisterRoute),
    SharedModule,
    NgxDatatableModule
  ],
  providers: [
    PatientDeathService
  ]
})
export class DeathRegisterModule { }
