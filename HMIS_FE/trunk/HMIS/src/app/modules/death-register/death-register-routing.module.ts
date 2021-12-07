import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DeathPatientAddUpdateComponent } from './components/death-patient-add-update/death-patient-add-update.component';
import { DeathPatientListComponent } from './components/death-patient-list/death-patient-list.component';
import { DeathRegisterHomeComponent } from './components/death-register-home/death-register-home.component';

const routes: Routes = [
  {
    path: '', component: DeathRegisterHomeComponent,
    children: [
      {
        path: '', redirectTo: 'deathPatientRegistration', pathMatch: 'full'
      },
      {
        path: 'deathPatientList',
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
        path: 'deathPatientList/:token/:appKey',
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
        path: 'deathPatientRegistration',
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
        path: 'updateDeathPatient/:id/:token',
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
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DeathRegisterRoutingModule { }
