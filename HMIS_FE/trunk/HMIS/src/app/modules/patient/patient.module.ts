import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PatientRoutingModule } from './patient-routing.module';
import { PatientHomeComponent } from './components/patient-home/patient-home.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WebcamModule } from "ngx-webcam";
import { ModalModule } from 'ngb-modal';
import { PhotoCapturePopupComponent } from './components/photo-capture-popup/photo-capture-popup.component';
import { PatientListComponent } from './components/patient-list/patient-list.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { DxDataGridModule } from 'devextreme-angular';
import { PatientDetailComponent } from './components/patient-detail/patient-detail.component';
import { UnknownPatientRegistrationComponent } from './components/unknown-patient-registration/unknown-patient-registration.component';
import { AddPatientComponent } from './components/add-patient/add-patient.component';

@NgModule({
  declarations: [
    PatientHomeComponent, 
    AddPatientComponent,
    PhotoCapturePopupComponent,
    PatientListComponent,
    PatientDetailComponent,
    UnknownPatientRegistrationComponent
  ],
  imports: [
    CommonModule,
    PatientRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    WebcamModule,
    DxDataGridModule,
    NgxDatatableModule
  ]
})
export class PatientModule { }
