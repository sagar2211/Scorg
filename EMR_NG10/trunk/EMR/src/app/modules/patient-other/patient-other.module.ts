import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OtherHomeComponent } from './components/other-home/other-home.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { EmrSharedModule } from 'src/app/emr-shared/emr-shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { ServiceOrderComponent } from 'src/app/orders/components/service-order/service-order.component';
import { NursingNotesComponent } from './components/nursing-notes/nursing-notes.component';

const otherRoute: Routes = [
  {
    path: '', component: OtherHomeComponent,
    children: [
      {
        path: '', redirectTo: 'nursingNotes'
      },
      {
        path: 'nursingNotes/:patientId',
        component: NursingNotesComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: {},
          permissions: {
            only: PermissionsConstants.Doctor_Dashboard_View,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
      {
        path: 'service-order/:patientId',
        component: ServiceOrderComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: {},
          permissions: {
            only: PermissionsConstants.Doctor_Dashboard_View,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        }
      },
    ]
  }
];

@NgModule({
  declarations: [
    OtherHomeComponent,
    NursingNotesComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    EmrSharedModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    RouterModule.forChild(otherRoute),
  ]
})
export class PatientOtherModule { }
