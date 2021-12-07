import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { PatientBillComponent } from './components/patient-bill/patient-bill.component';
import { BillingHomeComponent } from './components/billing-home/billing-home.component';

const billingRoutes: Routes = [
  {
    path: '', component: BillingHomeComponent,
    children: [
      {
        path: '', redirectTo: 'patientbill', pathMatch: 'full'
      },
      {
        path: 'patientbill',
        component: PatientBillComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Add Patient Bill',
          breadCrumInfo: {
            display: 'Add Patient Bill', route: '/billing/patientbill', redirectTo: '',
            isFilter: false, isAddPopup: false
          },
          permissions: {
            only: PermissionsConstants.QMS_APP_MENU,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      },
      {
        path: 'changepatientclass',
        component: PatientBillComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Change Patient Billing Class',
          breadCrumInfo: {
            display: 'Change Patient Billing Class', route: '/billing/changepatientclass', redirectTo: '',
            isFilter: false, isAddPopup: false
          },
          permissions: {
            only: PermissionsConstants.QMS_APP_MENU,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      },
      {
        path: 'PatientPaymentDetails',
        component: PatientBillComponent,
        canActivate: [NgxPermissionsGuard]
      },
      { path: 'changepatientclass/:token/:appKey', component: PatientBillComponent },
      { path: 'changepatientclass/:token/:appKey/:uhid/:penId', component: PatientBillComponent },
      { path: 'changepatientclass/:token/:appKey/:uhid/:penId/:billMainId', component: PatientBillComponent },
      { path: 'patientbill/:token/:appKey', component: PatientBillComponent },
      { path: 'patientbill/:token/:appKey/:uhid/:penId', component: PatientBillComponent },
      { path: 'patientbill/:token/:appKey/:uhid/:penId/:billMainId', component: PatientBillComponent },
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(billingRoutes),
  ],
  exports: [RouterModule]
})
export class BillingRouteModule { }
