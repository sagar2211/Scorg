import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OtRegisterHomeComponent } from './components/ot-register-home/ot-register-home.component';
import { OtRegisterListComponent } from './components/ot-register-list/ot-register-list.component';
import { OtRegisterComponent } from './components/ot-register/ot-register.component';
import { Routes, RouterModule } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

const otRegisterRoute: Routes = [
  {
    path: '', component: OtRegisterHomeComponent,
    children: [
      {
        path: '', redirectTo: 'list', pathMatch: 'full'
      },
      {
        path: 'list',
        component: OtRegisterListComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'OT Register List',
          breadCrumInfo: {
            display: 'OT Register List', route: '/otApp/ot/register/list', redirectTo: '',
            isFilter: false, isAddPopup: false
          },
          permissions: {
            only: PermissionsConstants.OT_Register_View,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      },
      {
        path: 'registerPatient/:id/:type',
        component: OtRegisterComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'OT Register',
          breadCrumInfo: {
            display: 'OT Register', route: '/otApp/ot/register/registerPatient', redirectTo: '',
            isFilter: false, isAddPopup: false
          },
          permissions: {
            only: PermissionsConstants.OT_Register_Add,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      },
    ]
  }
];

@NgModule({
  declarations: [
    OtRegisterHomeComponent,
    OtRegisterListComponent,
    OtRegisterComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    NgbModule,
    SharedModule,
    //EmrSharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(otRegisterRoute),
    NgxDatatableModule
  ]
})
export class OtRegisterModule { }
