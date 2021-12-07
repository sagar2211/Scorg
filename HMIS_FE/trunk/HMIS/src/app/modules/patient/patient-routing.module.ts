import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddPatientComponent } from './components/add-patient/add-patient.component';
import { PatientHomeComponent } from './components/patient-home/patient-home.component';
import { PatientListComponent } from './components/patient-list/patient-list.component';
import { UnknownPatientRegistrationComponent } from './components/unknown-patient-registration/unknown-patient-registration.component';

const routes: Routes = [
  {
    path : '',
    component : PatientHomeComponent,
    children : [
      {
        path : 'unknownPatientRegistration',
        component : UnknownPatientRegistrationComponent
      },
      {
        path : 'patientRegistration/:formType',
        component : AddPatientComponent
      },
      {
        path : 'patientRegistration/:formType/:uhid',
        component : AddPatientComponent
      },
      {
        path : 'patientRegistration/:formType/:token/:appKey/:uhid',
        component : AddPatientComponent
      },
      {
        path : 'patientRegistration/:formType/:token/:appKey/:uhid/:patType',
        component : AddPatientComponent
      },
      {
        path : 'unknownPatientRegistration/:token/:appKey',
        component : UnknownPatientRegistrationComponent
      },
      {
        path : 'unknownPatientRegistration/:token/:appKey/:uhid',
        component : UnknownPatientRegistrationComponent
      },
    ]
  },
  {
    path : '',
    component : PatientHomeComponent,
    children : [
      {
        path : 'patientList',
        component : PatientListComponent
      },
      {
        path : 'patientList/:token/:appKey',
        component : PatientListComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PatientRoutingModule { }
