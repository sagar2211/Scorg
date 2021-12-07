import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SummeryHomeComponent } from './component/summery-home/summery-home.component';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PatientDischargeComponent } from './component/patient-discharge/patient-discharge.component';
import { PatientAdmitDischargeListComponent } from 'src/app/shared/patient-admit-discharge-list/patient-admit-discharge-list.component';

const dischargeRoute: Routes = [
  {
    path: '', component: SummeryHomeComponent,
    children: [
      {
        path: '', redirectTo: 'patientDischarge', pathMatch: 'full'
      },
      {
        path: 'patientDischarge',
        component: PatientAdmitDischargeListComponent,
        data: {
          displayName: 'Patient Discharge',
          breadCrumInfo: {
            display: 'Patient Discharge', route: '/emr/discharge/summery/patientDischarge', redirectTo: '',
            isFilter: false, isAddPopup: true
          },
          relatedLinks: []
        }
      },
      {
        path: 'patientDischargeList',
        component: PatientDischargeComponent,
        data: {
          displayName: 'Patient Discharge',
          breadCrumInfo: {
            display: 'Patient Discharge', route: '/emr/discharge/summery/patientDischarge', redirectTo: '',
            isFilter: false, isAddPopup: true
          },
          relatedLinks: []
        }
      }
    ]
  }
];

@NgModule({
  declarations: [
    SummeryHomeComponent,
    PatientDischargeComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(dischargeRoute),
    NgxDatatableModule
  ]
})
export class DischargeSummeryModule { }
