import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MtpAndMlcHomeComponent } from './components/mtp-and-mlc-home/mtp-and-mlc-home.component';
import { MtpMlcListComponent } from './components/mtp-mlc-list/mtp-mlc-list.component';
import { MtpMlcAddUpdateComponent } from './components/mtp-mlc-add-update/mtp-mlc-add-update.component';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MtpMlcService } from './services/mtp-mlc.service';
import { PatientDeathService } from '../death-register/services/patient-death.service';
import { EMRService } from 'src/app/public/services/emr-service';

const MlcRoute: Routes = [
  {
    path: '', component: MtpAndMlcHomeComponent,
    children: [
      {
        path: '', redirectTo: 'list', pathMatch: 'full'
      },
      {
        path: 'list',
        component: MtpMlcListComponent,
        // canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'MLC List',
          breadCrumInfo: {
            display: 'MLC List', route: '/inventory/masters/item/itemType', redirectTo: '',
            isFilter: false, isAddPopup: false
          },
          // permissions: {
          //   only: PermissionsConstants.QMS_APP_MENU,
          //   redirectTo: CommonService.redirectToIfNoPermission
          // },
          relatedLinks: []
        }
      },
      {
        path: 'list/:token/:loadAs',
        component: MtpMlcListComponent,
        // canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'MLC List',
          breadCrumInfo: {
            display: 'MLC List', route: '/inventory/masters/item/itemType', redirectTo: '',
            isFilter: false, isAddPopup: false
          },
          // permissions: {
          //   only: PermissionsConstants.QMS_APP_MENU,
          //   redirectTo: CommonService.redirectToIfNoPermission
          // },
          relatedLinks: []
        }
      },
      {
        path: 'addPatient',
        component: MtpMlcAddUpdateComponent,
        // canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Add MLC',
          breadCrumInfo: {
            display: 'Add MLC', route: '/inventory/masters/item/itemType', redirectTo: '',
            isFilter: false, isAddPopup: false
          },
          // permissions: {
          //   only: PermissionsConstants.QMS_APP_MENU,
          //   redirectTo: CommonService.redirectToIfNoPermission
          // },
          relatedLinks: []
        }
      },
      {
        path: 'updatePatient/:id',
        component: MtpMlcAddUpdateComponent,
        // canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Update MLC',
          breadCrumInfo: {
            display: 'Add MLC', route: '/inventory/masters/item/itemType', redirectTo: '',
            isFilter: false, isAddPopup: false
          },
          // permissions: {
          //   only: PermissionsConstants.QMS_APP_MENU,
          //   redirectTo: CommonService.redirectToIfNoPermission
          // },
          relatedLinks: []
        }
      },
      {
        path: 'updatePatient/:id/:token/:loadAs',
        component: MtpMlcAddUpdateComponent,
        // canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Update MLC',
          breadCrumInfo: {
            display: 'Add MLC', route: '/inventory/masters/item/itemType', redirectTo: '',
            isFilter: false, isAddPopup: false
          },
          // permissions: {
          //   only: PermissionsConstants.QMS_APP_MENU,
          //   redirectTo: CommonService.redirectToIfNoPermission
          // },
          relatedLinks: []
        }
      }
    ]
  }
];


@NgModule({
  declarations: [
    MtpAndMlcHomeComponent,
    MtpMlcListComponent,
    MtpMlcAddUpdateComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule.forChild(MlcRoute),
    SharedModule,
    NgxDatatableModule
  ],
  providers: [
    MtpMlcService,
    PatientDeathService,
    EMRService
  ],
  exports: [
    MtpMlcAddUpdateComponent
  ]
})
export class MtpAndMlcModule { }
