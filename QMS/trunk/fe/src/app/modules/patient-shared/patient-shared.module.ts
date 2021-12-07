import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BulkCancelationComponent } from './component/bulk-cancelation/bulk-cancelation.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { PrintReportsModule } from '../print-reports/print-reports.module';
import { PatientInfoComponent } from './component/patient-info/patient-info.component';
import { PatientHistoryComponent } from './component/patient-history/patient-history.component';
import { SearchAppointmentsComponent } from './component/search-appointments/search-appointments.component';
import { AddPatientComponent } from './component/add-patient/add-patient.component';
import { ListPatientComponent } from './component/list-patient/list-patient.component';
@NgModule({
  declarations: [
    BulkCancelationComponent,
    PatientInfoComponent,
    PatientHistoryComponent,
    SearchAppointmentsComponent,
    AddPatientComponent,
    ListPatientComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    PrintReportsModule
  ],
  exports: [
    BulkCancelationComponent,
    PatientInfoComponent,
    PatientHistoryComponent,
    SearchAppointmentsComponent,
    AddPatientComponent,
    ListPatientComponent
  ],
  entryComponents: [
    AddPatientComponent
  ],
})
export class PatientSharedModule { }
