import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { PatientListComponent } from './components/patient-list/patient-list.component';
import { PatientAddComponent } from './components/patient-add/patient-add.component';
import { PatientHomeComponentComponent } from './components/patient-home-component/patient-home-component.component';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { AddPatientComponent } from './components/add-patient/add-patient.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TemplatesService } from 'src/app/public/services/templates.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

const patientRoutes: Routes = [
  {
    path: '', component: PatientHomeComponentComponent,
    children: [
      {
        path: '', redirectTo: 'patientList', pathMatch: 'full'
      },
      {
        path: 'addPatient',
        component: AddPatientComponent,
      },
      {
        path: 'addPatient/:id',
        component: AddPatientComponent,
        
      },
      {
        path: 'patientList',
        component: PatientListComponent,
        // canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Patient List', route: 'app/qms/patient/patientList', isFilter: true, isAddPopup: true, btntext: 'ADD PATIENT' },
          relatedLinks: []
        },
      },
      {
        path: 'patientList/:uhId',
        component: PatientListComponent,
        // canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Patient List', route: 'app/qms/patient/patientList', isFilter: true, isAddPopup: true, btntext: 'ADD PATIENT' },
          relatedLinks: []
        },
      },
    ]
  }
];

@NgModule({
  declarations: [
    PatientHomeComponentComponent,
    PatientListComponent,
    PatientAddComponent,
    AddPatientComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(patientRoutes),
    SharedModule,
    NgxDatatableModule
    // ChartModule
  ],
  providers: [
    TemplatesService,
    NgbActiveModal
  ]
})
export class PatientModule { }
