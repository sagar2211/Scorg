import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OtScheduleHomeComponent } from './component/ot-schedule-home/ot-schedule-home.component';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OtPatientAppointmentAddUpdateComponent } from './component/ot-patient-appointment-add-update/ot-patient-appointment-add-update.component';
import { OtSchedulerComponent } from './component/ot-scheduler/ot-scheduler.component';
import { DxSchedulerModule, DxTemplateModule, DxButtonModule  } from 'devextreme-angular';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from 'src/app/shared/shared.module';
import { PatientModule } from '../patient/patient.module';

const scheduleRoute: Routes = [
  {
    path: '', component: OtScheduleHomeComponent,
    children: [
      {
        path: '', redirectTo: 'ot-scheduler', pathMatch: 'full'
      },
      // {
      //   path: 'patientSchedule',
      //   component: OtScheduleComponent,
      //   canActivate: [NgxPermissionsGuard],
      //   data: {
      //     displayName: 'OT Scheduling',
      //     breadCrumInfo: {
      //       display: 'OT Scheduling', route: '/otApp/ot/schedule/patientSchedule', redirectTo: '',
      //       isFilter: false, isAddPopup: true
      //     },
      //     permissions: {
      //       // only: PermissionsConstants.VIEW_ITEM_TYPE,
      //       // redirectTo: CommonService.redirectToIfNoPermission
      //     },
      //     relatedLinks: []
      //   }
      // },
      {
        path: 'ot-scheduler', component:OtSchedulerComponent
      }
    ]
  }
];

@NgModule({
  declarations: [
    OtScheduleHomeComponent,
    OtPatientAppointmentAddUpdateComponent,
    OtSchedulerComponent,
  ],
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(scheduleRoute),
    DxSchedulerModule,
    DxTemplateModule,
    NgSelectModule,
    SharedModule,
    PatientModule
  ]
})
export class OtScheduleModule { }
