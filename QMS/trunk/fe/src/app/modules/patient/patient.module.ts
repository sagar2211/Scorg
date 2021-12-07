import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { PatientListComponent } from './components/patient-list/patient-list.component';
import { PatientAddComponent } from './components/patient-add/patient-add.component';
import { PatientHomeComponentComponent } from './components/patient-home-component/patient-home-component.component';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { CommonService } from './../../services/common.service';
import { ChartModule } from 'angular-highcharts';
import { ReferPateintListComponent } from './refer-pateint-list/refer-pateint-list.component';
import { PatientSharedModule } from '../patient-shared/patient-shared.module';

const patientRoutes: Routes = [
  {
    path: '', component: PatientHomeComponentComponent,
    children: [
      {
        path: 'addPatient',
        component: PatientAddComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Add Patient', route: 'app/qms/patient/addPatient' },
          permissions: {
            only: PermissionsConstants.Add_PatientMaster,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: [
            {
              displayName: 'Patient List',
              routeLink: 'app/qms/patient/patientList',
              permission: PermissionsConstants.View_PatientMaster
            },
            {
              displayName: 'Calendar View',
              routeLink: 'appointmentApp/appointments/calendar',
              permission: PermissionsConstants.View_Calendar_View
            }
          ]
        },
      },
      {
        path: 'addPatient/:id',
        component: PatientAddComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Edit Patient', route: 'app/qms/patient/addPatient' },
          permissions: {
            only: PermissionsConstants.Add_PatientMaster,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
      {
        path: 'patientList',
        component: PatientListComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Patient List', route: 'app/qms/patient/patientList', isFilter: true, isAddPopup: true, btntext: 'ADD PATIENT' },
          permissions: {
            only: PermissionsConstants.View_PatientMaster,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks:[
            {
              displayName: 'Call center view',
              routeLink: 'appointmentApp/appointments/searchAppointment',
              permission: PermissionsConstants.View_Call_Center_View
            },
            {
              displayName: 'FrontDesk Dashboard',
              routeLink: 'app/qms/dashboard/frontDesk',
              permission: PermissionsConstants.View_Front_Desk
            },
            {
              displayName: 'Add Patient',
              routeLink: 'app/qms/patient/addPatient',
              permission: PermissionsConstants.Add_PatientMaster
            },
          ]
        },
      },
      {
        path: 'referpatientList',
        component: ReferPateintListComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Refer Patient List', route: 'app/qms/patient/referpatientList', isFilter: false, isAddPopup: false, btntext: '' },
          permissions: {
            only: PermissionsConstants.View_PatientMaster,
            redirectTo: CommonService.redirectToIfNoPermission
          }
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
    ReferPateintListComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(patientRoutes),
    SharedModule,
    PatientSharedModule
  ]
})
export class PatientModule { }
